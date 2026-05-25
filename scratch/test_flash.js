const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyCsO-4Iw_E1XpiagsdfN0F_yPQbIBcnIug");

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log(response.text());
  } catch (error) {
    console.error(error);
  }
}

run();
