import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { WORKFLOW_STEPS } from "@/utils/promptConfigs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { stepId, context } = await req.json();

    const step = WORKFLOW_STEPS.find((s) => s.id === stepId);
    if (!step) {
      return NextResponse.json({ error: "Invalid step ID" }, { status: 400 });
    }

    const MODELS = [
      "gemini-2.5-flash",
      "gemini-3.1-pro",
      "gemini-2.5-pro",
      "gemini-3.5-flash",
      "gemini-3.0-flash"
    ];

    const prompt = step.prompt(context);

    const MAX_RETRIES = 5;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const modelName = MODELS[attempt - 1] || MODELS[0];
      const model = genAI.getGenerativeModel({ model: modelName });

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return NextResponse.json({ text, modelUsed: modelName });
      } catch (err: any) {
        if ((err.message?.includes("503") || err.message?.includes("not found")) && attempt < MAX_RETRIES) {
          console.warn(`[Gemini API] Error (${err.message}) on single generate with model ${modelName}. Retrying attempt ${attempt + 1}...`);
          const delay = Math.pow(2, attempt) * 1500;
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
        throw err;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "AI Generation failed" }, { status: 500 });
  }
}
