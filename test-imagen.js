const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

async function testEndpoint(method) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:${method}?key=${apiKey}`;
  
  const body = method === 'predict' ? {
    instances: [{ prompt: "test" }],
    parameters: { sampleCount: 1, aspectRatio: "16:9" }
  } : {
    // For generateImages, usually it's prompt, number_of_images, etc.
    prompt: "test"
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log(`Method: ${method}, Status: ${res.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Error with ${method}:`, e.message);
  }
}

testEndpoint('predict');
testEndpoint('generateImages');
testEndpoint('generateContent');
