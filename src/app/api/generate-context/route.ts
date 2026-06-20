import { NextResponse } from "next/server";
import { fetchWithModelFallback } from "@/utils/modelFallback";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { theme } = await req.json();

    if (!theme) {
      return NextResponse.json({ error: "Missing theme" }, { status: 400 });
    }

    const researchPrompt = `
你是一位嚴謹的台灣民俗與歷史學家。請使用 Google Search 徹底調查主題：「${theme}」。
請注意，這類名詞常有字面誤導（例如數字不代表數量，姓氏不代表特定歷史名人）。
請提供一份約 800 字的精確事實報告，必須涵蓋：
1. 該信仰/名詞的「真實定義」與「數量」（如：五年千歲實際上是幾位？五年代表什麼？）。
2. 該神祇的歷史起源、生平背景（切勿與民間小說人物混淆，若無明確文獻請說明「由來不可考或具多種說法」）。
3. 核心精神、獨特科儀（如：馬鳴山鎮安宮的吃飯擔、建醮，請確認是否真的有王船祭）。
4. 藝術表徵。
請絕對基於搜尋到的客觀事實撰寫，嚴禁任何 AI 腦補。`;
    
    console.log("[Stage 1] 開始查核文獻...");
    const { result: researchResult, modelUsed } = await fetchWithModelFallback(researchPrompt, { useSearch: true });
    const verifiedContext = researchResult.response.text();
    console.log("[Stage 1] 事實查核完成");

    return NextResponse.json({ 
      data: verifiedContext,
      modelUsed
    });

  } catch (error: any) {
    console.error("Context Generation API Error:", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("quota")) {
      return NextResponse.json({ error: "Google API 免費額度已達上限 (包含備用模型皆耗盡)。請稍後再試！" }, { status: 429 });
    }
    return NextResponse.json({ error: errorMsg || "Context Generation failed" }, { status: 500 });
  }
}
