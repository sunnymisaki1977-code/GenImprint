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

    const prompt = `你現在是一位專精於生成式 AI 圖像提示詞（Prompt）的設計專家，特別擅長將「傳統水墨融合現代奇幻光影、高動態分割構圖與能量流動」的設計（即新國風/國潮）視覺風格。

請根據以下【Step 1 基礎背景研究】的史料精華，為主題「${theme}」擷取 高光時刻，並融合在同一張圖中。
背景史料：
${step1Content}

一、核心指令公式 (需全部包含，請根據主題進行細節變化)：
1. 傳統材質底蘊：colorful ink wash (多彩水墨), rice paper texture (宣紙紋理).
2. 現代奇幻特效：energy flow (能量流動), golden particles (金色粒子), neon ink.
3. 高動態構圖：dynamic segmented layout (動態分割構圖), shattered glass effect (碎玻璃分割效果).
4. 極致光影渲染：cinematic lighting (電影級光影), strong chiaroscuro (強烈明暗對比).

二、格式絕對鎖定指令（禁止開場白與結語，直接輸出以下格式）：
### 【${theme}】
設計構想：[請簡短用中文解釋你如何安排高光時刻的分鏡，以及如何運用碎玻璃效果與水墨能量流動串連畫面]
English：[請填入完整、可供 Midjourney 使用的英文 Prompt，包含角色、分鏡的環境細節、動態構圖、材質、光影關鍵字，結尾加上 --ar 16:9 --v 6.0 --style raw]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error("Gemini API Error (Image Prompt):", error);
    return NextResponse.json({ error: error.message || "AI Generation failed" }, { status: 500 });
  }
}
