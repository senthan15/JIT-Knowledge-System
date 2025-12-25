const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const modelsToTry = [
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.0-flash",
];

async function checkModels() {
    console.log("Checking available models with provided API Key...");

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            console.log(`✅ SUCCESS: ${modelName} is working.`);
            // If we find a working one, we can stop or list all working ones.
        } catch (error) {
            if (error.message.includes("404") || error.message.includes("not found")) {
                console.log(`❌ FAILED: ${modelName} (Not Found)`);
            } else if (error.message.includes("API key not valid")) {
                console.log(`❌ FAILED: ${modelName} (Invalid API Key)`);
                // If key is invalid, no model will work.
                return;
            } else {
                console.log(`❌ FAILED: ${modelName} (${error.message.split('\n')[0]})`);
            }
        }
    }
}

checkModels();
