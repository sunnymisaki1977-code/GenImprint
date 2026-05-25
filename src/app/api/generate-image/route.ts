import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, aspectRatio } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const modelsToTry = [
      "gemini-3.1-flash-image-preview", // 1. 最新主力旗艦 (Nano Banana 2)
      "gemini-3-pro-image-preview",     // 2. 專業級 (Nano Banana Pro)
      "gemini-2.5-flash-image"          // 3. 高速低延遲版 (Nano Banana)
    ];

    let lastGoogleError = null;
    let base64Image = null;

    for (const modelName of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
        const body = {
          contents: [
            {
              role: "user",
              parts: [
                { text: `${prompt} Aspect ratio: ${aspectRatio || "16:9"}` }
              ]
            }
          ]
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(`Google API error (${modelName}): ${response.status} - ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0) {
          const parts = data.candidates[0].content?.parts || [];
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              base64Image = part.inlineData.data;
              break;
            }
          }
        }

        if (base64Image) {
          console.log(`Successfully generated image using ${modelName}`);
          return NextResponse.json({ 
            success: true, 
            image: `data:image/jpeg;base64,${base64Image}`,
            modelUsed: modelName
          });
        }
      } catch (err: any) {
        console.warn(`Failed to generate with ${modelName}:`, err.message);
        lastGoogleError = err;
        // Continue to the next model in the loop
      }
    }

    // If we reach here, all Google models failed.
    console.warn("All Google Gemini Image models failed. Falling back to free image generation. Last Error:", lastGoogleError?.message);
    
    // Fallback for free tier users or quota errors
    const width = aspectRatio === "16:9" ? 1024 : 576;
    const height = aspectRatio === "16:9" ? 576 : 1024;

    // Sanitize prompt for Pollinations
    let simplePrompt = prompt.replace(/[^a-zA-Z0-9\s,.-]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!simplePrompt || simplePrompt.length < 5) {
        simplePrompt = "Eastern fantasy ink wash painting, cinematic lighting, masterpiece";
    } else {
        simplePrompt = simplePrompt.substring(0, 500);
    }
    
    const seed = Math.floor(Math.random() * 1000000);
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(simplePrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
    
    try {
      const imgRes = await fetch(fallbackUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "image/jpeg,image/png,*/*"
        }
      });

      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Fallback = buffer.toString('base64');
        return NextResponse.json({ 
          success: true, 
          image: `data:image/jpeg;base64,${base64Fallback}`,
          modelUsed: "Pollinations.ai (Flux/SDXL)",
          isFallback: true
        });
      }
    } catch (err) {
      console.error("Fallback image generation failed:", err);
    }

    throw new Error(
      lastGoogleError?.message || "Failed to generate image with all available Google models and fallback engines."
    );
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 });
  }
}
