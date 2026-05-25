const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyCsO-4Iw_E1XpiagsdfN0F_yPQbIBcnIug");

async function list() {
  try {
    // We can't use genAI.listModels() because it's not in the simple SDK usually,
    // but we can use the fetch API with the key.
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCsO-4Iw_E1XpiagsdfN0F_yPQbIBcnIug");
    const data = await response.json();
    if (data.models) {
      console.log(data.models.map(m => m.name));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error(error);
  }
}

list();
