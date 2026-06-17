import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");


function salvagePartialJSON(text: string) {
  const result: Record<string, string> = {};
  const matches = text.matchAll(/"(\d+)"\s*:\s*"([\s\S]*?)(?="\d+"\s*:|"\s*}|$)/g);
  for (const match of Array.from(matches)) {
    let val = match[2];
    if (val.endsWith('",') || val.endsWith('"\n,')) {
      val = val.substring(0, val.lastIndexOf('"'));
    }
    // simple unescape for JSON strings (handle quotes and newlines)
    val = val.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    result[match[1]] = val;
  }
  return Object.keys(result).length > 0 ? result : null;
}

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { theme, customDocText, startFromStep = 1, existingData = {} } = await req.json();

    if (!theme) {
      return NextResponse.json({ error: "Missing theme" }, { status: 1500 });
    }

    const MODELS = [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite"
    ];

    
    let keysRequired = [];
    for (let i = startFromStep; i <= 10; i++) {
        keysRequired.push(`"${i}"`);
    }
    const keysString = keysRequired.join(", ");

    let prompt = "";
    let backgroundContext = customDocText ? `我們已經有一份關於「${theme}」的聖蹟文獻（基礎背景）如下：\n---\n${customDocText}\n---` : ``;

    prompt = `你是一位「世代銘印」頻道的專屬文化策展人與內容生成專家。現在我們要為主題「${theme}」進行一個 10 步驟的內容生產流程。\n${backgroundContext}\n`;

    if (startFromStep > 1) {
      prompt += `\n請注意，使用者已經確認了前 ${startFromStep - 1} 步的內容如下（作為後續步驟的背景參考）：\n---已確認內容---\n${JSON.stringify(existingData, null, 2)}\n------\n\n`;
      prompt += `現在請你基於上述已確認內容與背景，接續完成第 ${startFromStep} 到 10 步。\n`;
    }

    prompt += `請嚴格依照邏輯順序進行生成，後續步驟必須參考前面的產出。
你必須直接輸出 JSON 格式的結果，包含 ${11 - startFromStep} 個 key：${keysString}。每個 key 對應的 value **必須是純文字字串** (可用 Markdown 格式排版)，**絕對不可使用巢狀 JSON 物件或陣列**。
⚠️ **極度重要：所有的換行符號都必須使用 "\\n" (跳脫字元)，絕對不可在 JSON 字串中產生真實的換行，否則會導致 JSON 解析失敗 (Unterminated string)。**

【步驟的要求如下】：`;

    // Only include steps that are requested
    if (startFromStep <= 1 && !customDocText) {
      prompt += `\n步驟 1：針對主題「${theme}」進行1500字深入的背景研究。內容需包含：文化與歷史起源神明、生平/由來、核心精神與當代象徵意義、經典神話、民間傳說或歷史史料記載、獨特的台灣民俗科儀、藝術表徵。嚴禁任何無根據的鄉野奇談或 AI 隨意編造的情節。`;
    }
    if (startFromStep <= 2) {
      prompt += `\n步驟 2：根據${customDocText ? "上述文獻背景" : "步驟 1 的背景資料"}，撰寫一份 5-10 分鐘的 YouTube 長影片腳本。包含引人入勝的開場、深度內容解析、以及總結與互動引導。`;
    }
    if (startFromStep <= 3) {
      prompt += `\n步驟 3：根據步驟 2 的腳本，生成 5 個吸引人的標題、一組關鍵字標籤、以及一段包含時間軸建議的影片說明欄。`;
    }
    if (startFromStep <= 4) {
      prompt += `\n步驟 4：根據${customDocText ? "上述文獻背景" : "步驟 1 的背景資料"}，為主題撰寫 60 秒的 YouTube Shorts 短影片腳本。需求：節奏明快，前 3 秒必須有鉤子 (Hook)，內容精簡有力。`;
    }
    if (startFromStep <= 5) {
      prompt += `\n步驟 5：根據步驟 4 的短影音腳本，生成 3 個衝擊力強的短影片標題與 10 個 Hashtags。`;
    }
    if (startFromStep <= 6) {
      prompt += `\n步驟 6：根據步驟 2 的腳本，生成 3 組長影音 YouTube 縮圖設計 (16:9)。包含：縮圖名稱、高點擊文案、中英雙語 AI 繪圖提示詞 (風格必須包含 colorful ink wash, vivid diffusion, eastern fantasy, golden particles 等東方美學元素)。`;
    }
    if (startFromStep <= 7) {
      prompt += `\n步驟 7：生成 3 組短影音 YouTube 縮圖設計 (9:16)。包含與步驟 6 相似的內容，但針對直式螢幕構圖。`;
    }
    if (startFromStep <= 8) {
      prompt += `\n步驟 8：針對主題生成 3 組 16:9 彩墨風格意象圖的中英雙語繪圖提示詞，並各搭配一首七言四句詩詞。`;
    }
    if (startFromStep <= 9) {
      prompt += `\n步驟 9：針對主題生成 3 組 Suno AI 音樂生成提示詞 (1.史詩感、2.敘事感、3.活力感)，需包含 Music Style 等參數。`;
    }
    if (startFromStep <= 10) {
      prompt += `\n步驟 10：社群推播懶人包。請嚴格輸出三部分內容，務必以「### 🎨 視覺 Prompt」、「### 🖼️ 圖卡排版字卡」、「### 📱 社群發布正文」作為小標題：
(1) ### 🎨 視覺 Prompt：請【直接套用以下文字模板】，並根據史料將中括號內的變數替換為真實內容：
**16:9 動態分割構圖提示詞：**
以「${theme}」為核心主角，從前面的「步驟 1：背景研究」史料萃取五個【蒙太奇資訊】生成16:9 彩墨風格,五組畫格以【動態分割構圖（Dynamic Segmented Layout）】以及【美式漫畫跨頁插圖（Comic Book Splash Page with Insets）】組合併接成【蒙太奇資訊圖表（Montage Infographic）】

**主標題：**[請填入主標題]
1. **畫格 1：** [蒙太奇資訊名稱 1]
 **視覺描述：**[請填入視覺描述中文 Prompt]
2. **畫格 2：** [蒙太奇資訊名稱 2]
 **視覺描述：**[請填入視覺描述中文 Prompt]
3. **畫格 3：** [蒙太奇資訊名稱 3]
 **視覺描述：**[請填入視覺描述中文 Prompt]
4. **畫格 4：** [蒙太奇資訊名稱 4]
 **視覺描述：**[請填入視覺描述中文 Prompt]
5. **畫格 5：** [蒙太奇資訊名稱 5]
 **視覺描述：**[請填入視覺描述中文 Prompt]

**9:16 動態分割構圖提示詞：**
(內容與上方完全相同，但請替換為 9:16 的直式需求，並同樣根據史料填入變數)
(2) ### 🖼️ 圖卡排版字卡：為 4~5 個高光時刻設計適合放在圖片上的短標題與一句話說明；
(3) ### 📱 社群發布正文：包含 Hook 開場白、3-5點亮點解析、互動提問、祈福導流與 Hashtags。`;
    }

    prompt += `\n\n請現在開始生成，並只回傳嚴格的 JSON 物件。\n\n⚠️極度重要：所有的 value 必須都是【單一的純文字字串(String)】(可使用 Markdown 格式)，絕對不可在步驟 1~10 的 value 裡面建立巢狀的 JSON Object 或 Array！\n⛔⛔ 絕對禁止：請直接輸出純 JSON 字串，前後【絕對不要】使用 Markdown 的 \`\`\`json 與 \`\`\` 標記包裝，也不要有任何其他文字說明！⛔⛔`;

    let text = "";
    const MAX_RETRIES = 5;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const modelName = MODELS[attempt - 1] || MODELS[0];
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        tools: [
          {
            googleSearch: {} } as any
        ],
        // 🚨 修正 1：移除了 responseMimeType: "application/json"，避開 400 Bad Request
        generationConfig: {
          maxOutputTokens: 8192,
        }
      });

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        
        // 🚨 修正 2：加入防呆機制，清理模型不聽話硬加的 Markdown 代碼區塊標記
        const cleanedText = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
        
        const parsedData = JSON.parse(cleanedText);
        
        // Ensure all values are strings to prevent React rendering errors
        for (const key in parsedData) {
          if (typeof parsedData[key] === "object" && parsedData[key] !== null) {
            let markdown = "";
            const convertObjToMarkdown = (obj: any) => {
              for (const subKey in obj) {
                if (Array.isArray(obj[subKey])) {
                  markdown += "**" + subKey + "**:\n";
                  obj[subKey].forEach((item: any) => markdown += "- " + item + "\n");
                  markdown += "\n";
                } else if (typeof obj[subKey] === "object" && obj[subKey] !== null) {
                  markdown += "**" + subKey + "**:\n";
                  convertObjToMarkdown(obj[subKey]);
                } else {
                  markdown += "**" + subKey + "**:\n" + obj[subKey] + "\n\n";
                }
              }
            };
            convertObjToMarkdown(parsedData[key]);
            parsedData[key] = markdown;
          }
        }
        
        return NextResponse.json({ data: parsedData, modelUsed: modelName });
      } catch (err: any) {
        const errorMsg = err.message || "";
        // 將 JSON 解析錯誤 (SyntaxError) 也納入重試條件
        const shouldRetry = errorMsg.includes("503") || errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("not found") || err instanceof SyntaxError || err.name === 'SyntaxError';
        
        if (shouldRetry && attempt < MAX_RETRIES) {
          console.warn(`[Gemini API] Error (${errorMsg}) with model ${modelName}. Retrying attempt ${attempt + 1}...`);
          const delay = Math.pow(2, attempt) * 1500; // Exponential backoff: 3s, 6s, 12s, 24s
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
        if (attempt === MAX_RETRIES) {
          const partialData = salvagePartialJSON(text);
          if (partialData) {
            return NextResponse.json({ data: partialData, isPartial: true, modelUsed: modelName, error: "Generated data was partial due to API quota or syntax error." });
          }
        }
        throw err;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error (Batch):", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("quota")) {
      return NextResponse.json({ error: "Google API 免費額度已達上限 (429 Too Many Requests)。請等待約 1 分鐘後再重新嘗試！" }, { status: 429 });
    }
    return NextResponse.json({ error: errorMsg || "AI Batch Generation failed" }, { status: 500 });
  }
}
