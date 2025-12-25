const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
console.log("API Key being used:", process.env.GOOGLE_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Model works:", result.response.text());
    } catch (error) {
        console.error("Model Error:", error);
    }
}

listModels();
