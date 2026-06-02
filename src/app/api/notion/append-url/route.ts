import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function POST(req: Request) {
  try {
    const { pageId, url, stepName } = await req.json();

    if (!pageId || !url) {
      return NextResponse.json({ error: "Missing pageId or url" }, { status: 400 });
    }

    const isImage = /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(url);

    const children: any[] = [
      {
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ type: "text", text: { content: `${stepName} - 生成圖像 / 分享連結` } }]
        }
      }
    ];

    if (isImage) {
      children.push({
        object: "block",
        type: "image",
        image: {
          type: "external",
          external: { url }
        }
      });
    } else {
      children.push({
        object: "block",
        type: "bookmark",
        bookmark: { url }
      });
    }

    await notion.blocks.children.append({
      block_id: pageId,
      children: children,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Notion API Error (Append URL):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
