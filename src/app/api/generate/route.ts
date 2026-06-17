import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { WORKFLOW_STEPS } from "@/utils/promptConfigs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { stepId, context } = await req.json();

    const step = WORKFLOW_STEPS.find((s) => s.id === stepId);
    if (!step) {
      return NextResponse.json({ error: "Invalid step ID" }, { status: 1500 });
    }

    const MODELS = [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite"
    ];

    // 取得原始 prompt
    let prompt = step.prompt(context);

    // 🚨 修正 1：在這裡強制加上「選擇 A」的最嚴厲格式警告！
    // 這樣就算你在 utils 裡面的 prompt 忘記寫，API 層也會確保送出這段約束。
    prompt += `\n\n⚠️極度重要：請直接輸出純 JSON 字串，前後【絕對不要】使用 Markdown 的 \`\`\`json 與 \`\`\` 標記包裝，也不要有任何其他文字說明！`;

    const MAX_RETRIES = 5;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const modelName = MODELS[attempt - 1] || MODELS[0];
      
      // 🛠️ 1. 初始化模型參數物件
      const modelParams: any = { model: modelName };

      // 🛠️ 2. 動態判斷是否為步驟 1 
      const isStep1 = stepId === "step1" || stepId === 1 || String(stepId).toLowerCase().includes("step1");
      
      if (isStep1) {
        modelParams.tools = [{ googleSearch: {} }];
        // 確保這裡維持註解或刪除，絕對不傳入 responseMimeType
        // modelParams.generationConfig = { responseMimeType: "application/json" };
      }
      
      const model = genAI.getGenerativeModel(modelParams);

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // 🚨 修正 2：使用 Regex 清理模型不聽話硬加的 Markdown 代碼區塊標記
        // 這是「選擇 A」最重要的保險絲，確保前端拿到的是乾淨的 JSON 字串
        text = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();

        return NextResponse.json({ text, modelUsed: modelName });
      } catch (err: any) {
        const errorMsg = err.message || "";
        const shouldRetry = errorMsg.includes("503") || errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("not found");
        
        if (shouldRetry && attempt < MAX_RETRIES) {
          console.warn(`[Gemini API] Error (${errorMsg}) on single generate with model ${modelName}. Retrying attempt ${attempt + 1}...`);
          const delay = Math.pow(2, attempt) * 1500;
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
        throw err;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("quota")) {
      return NextResponse.json({ error: "Google API 免費額度已達上限 (429 Too Many Requests)。請等待約 1 分鐘後再重新嘗試！" }, { status: 429 });
    }
    return NextResponse.json({ error: errorMsg || "AI Generation failed" }, { status: 500 });
  }
}