import { Client } from "@notionhq/client";
import { google } from "googleapis";
import { NextResponse } from "next/server";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * Robust Google Auth Setup
 */
const getGoogleAuth = () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  
  if (!email || !rawKey) {
    throw new Error("Google Service Account credentials (EMAIL or PRIVATE_KEY) are missing in .env.local");
  }

  // Handle various line break formats in private key
  // 1. Replace literal \n with actual newlines
  // 2. Remove any double newlines that might have been created
  // 3. Trim any whitespace
  const privateKey = rawKey
    .replace(/\\n/g, "\n")
    .replace(/\n\s*\n/g, "\n")
    .trim();

  console.log("Processed Private Key length:", privateKey.length);
  console.log("Key starts with:", privateKey.substring(0, 30));
  console.log("Key ends with:", privateKey.substring(privateKey.length - 30));

  if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
    console.warn("Warning: Private key does not start with expected header.");
  }

  // Use the options object constructor for better reliability
  return new google.auth.JWT({
    email: email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/documents"],
  });
};

export async function POST(req: Request) {
  try {
    const { pageId } = await req.json();

    if (!pageId) {
      return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
    }

    const docId = process.env.GOOGLE_TARGET_DOC_ID;
    if (!docId) {
      return NextResponse.json({ error: "GOOGLE_TARGET_DOC_ID is not configured in .env.local" }, { status: 500 });
    }

    // Initialize Google Docs client
    console.log("Starting Google Auth...");
    const auth = getGoogleAuth();
    const docs = google.docs({ version: "v1", auth });

    // --- 1. Notion Block Extraction Algorithm ---
    console.log("Fetching blocks from Notion for page:", pageId);
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });

    const blocks = response.results;
    let step1Content = "";
    let isCapturing = false;

    console.log(`Processing ${blocks.length} blocks...`);
    for (const block of blocks as any[]) {
      const type = block.type;
      
      if (type === "heading_2") {
        const text = block.heading_2.rich_text.map((t: any) => t.plain_text).join("").trim();
        if (text.toLowerCase().includes("step 1")) {
          isCapturing = true;
          console.log("Found Step 1 heading, starting capture.");
          continue;
        } else if (isCapturing) {
          console.log("Found next H2, stopping capture.");
          break;
        }
      }

      if (isCapturing) {
        if (type === "paragraph") {
          const text = block.paragraph.rich_text.map((t: any) => t.plain_text).join("");
          if (text) {
            step1Content += text + "\n\n";
          }
        }
      }
    }

    const finalContent = step1Content.trim();
    console.log("Extracted content length:", finalContent.length);

    if (!finalContent) {
      return NextResponse.json({ 
        error: "找不到 Step 1 的內容。請確認 Notion 頁面中包含 'Step 1' 的標題二 (H2)。" 
      }, { status: 404 });
    }

    // --- 2. Google Docs Overwrite Mechanism ---
    
    // Test auth before proceeding
    try {
      console.log("Attempting to fetch Google access token...");
      const token = await auth.getAccessToken();
      if (!token.token) {
        throw new Error("Failed to retrieve access token (token is empty)");
      }
      console.log("Successfully fetched access token. Length:", token.token.length);

      console.log("Attempting to access Google Doc:", docId);
      const doc = await docs.documents.get({ documentId: docId });
      console.log("Successfully reached Google Doc:", doc.data.title);
      
      const content = doc.data.body?.content || [];
      const lastElement = content[content.length - 1];
      const endIndex = lastElement?.endIndex || 1;

      // Execute Batch Update
      console.log("Executing batchUpdate to overwrite content...");
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [
            ...(endIndex > 2 ? [{
              deleteContentRange: {
                range: {
                  startIndex: 1,
                  endIndex: endIndex - 1,
                },
              },
            }] : []),
            {
              insertText: {
                location: {
                  index: 1,
                },
                text: finalContent,
              },
            },
          ],
        },
      });

      console.log("Batch update successful.");
      return NextResponse.json({ 
        success: true, 
        message: "成功匯出純淨史料至 Google 雲端硬碟"
      });
    } catch (authErr: any) {
      console.error("Google API Detail Error:", authErr);
      const errorMessage = authErr.response?.data?.error_description || authErr.message;
      
      if (errorMessage.includes("not found")) {
        return NextResponse.json({ error: `找不到文件 ID: ${docId}。請確認網址正確。` }, { status: 404 });
      }
      return NextResponse.json({ 
        error: `Google 驗證失敗 (${errorMessage})。請確認已將 Service Account Email 設定為文件的「編輯者」。` 
      }, { status: 401 });
    }

  } catch (error: any) {
    console.error("Outer Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
