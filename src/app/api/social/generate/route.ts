import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { theme, step1Content } = await req.json();

    if (!theme || !step1Content) {
      return NextResponse.json({ error: "Missing theme or step1Content" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `你現在是首席視覺藝術總監與頂級社群文案主編。
你的任務是根據下方的【基礎背景史料】，為主題「${theme}」打造一組「新國風彩墨」社群圖文懶人包。

【基礎背景史料】：
${step1Content}

請嚴格遵循以下三大任務與格式要求：

---
### 任務一：生成動態視覺 Prompt (Midjourney / Imagen)
請從史料中萃取 4 到 5 個最震撼的「歷史高光時刻 / 核心傳說」，將其轉化為畫面描述。
**視覺公式（必須包含）**：
- 傳統底蘊：colorful ink wash, rice paper texture.
- 現代奇幻：energy flow, golden particles, neon ink.
- 史詩構圖：documentary style layout, dynamic segmented composition (將你萃取的4-5個場景分割在同一畫面中).
- 極致光影：cinematic lighting, strong chiaroscuro.

### 任務二：提煉圖卡排版字卡
字卡必須精簡有力，適合直接壓印在圖片的留白處，不要冗長。

### 任務三：撰寫社群發布正文
使用生動、能引起現代人共鳴的語氣。將史料轉化為 3~5 點易讀的亮點解析，並以提問開場，以祈福導流收尾。

---
【格式絕對鎖定指令】（請直接輸出以下格式，禁止任何問候與結語）：

### 🎨 第一部分：【視覺 Prompt 16:9】
English: A masterpiece neo-Chinese fantasy illustration of ${theme}, documentary style layout, dynamic segmented composition with distinct epic panels. In the center, [請填入主角的威武/神聖姿態描述，加上發光氣場]. The background is divided into panels: [請根據史料，填入4-5個高光時刻的英文畫面描述]. Traditional Texture: colorful ink wash, thick impasto ink, rice paper texture. Modern Fantasy Effects: energy flow, golden particles crossing between panels. Cinematic Render: cinematic lighting, strong chiaroscuro, 8k, ultra-detailed --ar 16:9 --v 6.0 --style raw

### 🎨 第一部分：【視覺 Prompt 9:16】
English: A masterpiece neo-Chinese fantasy illustration of ${theme}, vertical scroll format, documentary style layout, dynamic segmented composition stacked vertically. The central focal point is [主角描述]. The background is divided by shattered glass effects into epic scenes: [請根據史料，填入4-5個高光時刻的英文畫面描述]. Traditional Texture: colorful ink wash, rice paper texture. Modern Fantasy Effects: neon ink, golden particles flowing upwards. Cinematic Render: dramatic backlighting, 8k, ultra-detailed --ar 9:16 --v 6.0 --style raw

### 📝 第二部分：【圖卡排版字卡】
主標題：[15字以內，包含主題名稱]
副標題：[20字以內，點出核心精神]
金句：[20字以內，極具情感張力的視覺引導句]

### 📱 第三部分：【社群發布正文】
[請填入帶有 Emoji 的 Hook 開場白，製造懸念或情感共鳴]

[請條列 3-5 點核心亮點解析，每點包含一個小標題與兩句精簡解說，必須基於史料]

[互動提問：請邀請粉絲留言分享經驗]
祈福點燈、消災延壽，讓神明的靈光持續護佑您的日常 ➔ [此處自動帶入廟方數位功德箱/點燈連結]

#世代銘印 #${theme} [請再補充 3-5 個相關的 Hashtags]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error("Gemini API Error (Social):", error);
    return NextResponse.json({ error: error.message || "AI Generation failed" }, { status: 500 });
  }
}
