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

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = step.prompt(context);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "AI Generation failed" }, { status: 500 });
  }
}
