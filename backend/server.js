const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Multer for temporary file storage
const upload = multer({ dest: 'uploads/' });

// Initialize Gemini API
// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY);

let model;
const MODEL_NAMES = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-pro", "gemini-1.5-pro"];

async function initializeModel() {
    for (const modelName of MODEL_NAMES) {
        try {
            console.log(`Attempting to connect to model: ${modelName}...`);
            const candidate = genAI.getGenerativeModel({ model: modelName });
            // Test the model with a simple prompt
            await candidate.generateContent("Test connection");
            console.log(`✅ Successfully connected to ${modelName}`);
            model = candidate;
            return;
        } catch (error) {
            console.warn(`⚠️ Failed to connect to ${modelName}: ${error.message.split('\n')[0]}`);
        }
    }
    console.error("❌ Could not connect to any Gemini model. Please check your API key.");
}

// Initialize on startup
initializeModel();

// In-memory store for chat history (for demo purposes)
// In production, use Redis or a database.
const chatSessions = {};

// Helper to upload file to Gemini
async function uploadToGemini(path, mimeType) {
    try {
        const uploadResult = await fileManager.uploadFile(path, {
            mimeType,
            displayName: path,
        });
        const file = uploadResult.file;
        console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
        return file;
    } catch (error) {
        console.error("Error uploading to Gemini:", error);
        throw error;
    }
}

// API: Upload Documents
app.post('/api/upload', upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No files uploaded.');
        }

        const uploadPromises = req.files.map(async (file) => {
            try {
                const mimeType = file.mimetype;
                const uploadedFile = await uploadToGemini(file.path, mimeType);
                return {
                    name: file.originalname,
                    uri: uploadedFile.uri,
                    mimeType: uploadedFile.mimeType
                };
            } finally {
                // Clean up local file
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        res.json({ files: uploadedFiles });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading files.');
    }
});

// API: Chat
app.post('/api/chat', async (req, res) => {
    const { message, context, files, sessionId } = req.body;
    // context: { claimType: "Auto", location: "CA", ... }
    // files: [{ uri, mimeType }, ...]

    if (!sessionId) {
        return res.status(400).send('Session ID required');
    }

    // Initialize history if new session
    if (!chatSessions[sessionId]) {
        chatSessions[sessionId] = [];
    }

    // Construct System Instruction / Context
    // We can't easily change system instruction per turn in standard chat, 
    // but we can prepend context to the first message or use it in the prompt.
    // For Gemini 1.5, we can pass system instructions at model initialization, 
    // but here we might want dynamic context.
    // We'll prepend the context to the user message for this turn to ensure it's considered.

    const contextString = `
    Context:
    Claim Type: ${context?.claimType || 'N/A'}
    Location: ${context?.location || 'N/A'}
    Role: Appian Agent
    
    Task: Answer the user query based strictly on the uploaded policy documents.
    
    Citation Rules:
    - You MUST cite the source for every claim.
    - Format: [Source: <filename>, Page: <number>]
    - If the info is not in the docs, state "Information not found in policy documents."
  `;

    try {
        if (!model) {
            await initializeModel();
            if (!model) throw new Error("No available Gemini model found. Check server logs.");
        }

        // Prepare the history for the chat model
        // Gemini Chat API expects history as { role: 'user'|'model', parts: [...] }
        const history = chatSessions[sessionId];

        const chat = model.startChat({
            history: history,
            generationConfig: {
                temperature: 0.2, // Low temp for factual accuracy
            },
        });

        // Prepare the current message parts
        // We include the text and any file references that haven't been added to history yet?
        // Actually, for Gemini 1.5, we can pass fileData in the message parts.
        // If files were just uploaded, we should include them in this turn.
        // However, usually files are part of the "Knowledge Base". 
        // For this demo, we'll assume files are passed with the message if they are relevant to this turn,
        // or we can add them to the history if they are "persistent".
        // Let's pass them in the current message parts.

        const parts = [{ text: contextString + "\n\nUser Query: " + message }];

        if (files && files.length > 0) {
            files.forEach(f => {
                parts.push({
                    fileData: {
                        mimeType: f.mimeType,
                        fileUri: f.uri
                    }
                });
            });
        }

        const result = await chat.sendMessage(parts);
        const responseText = result.response.text();

        // Update local history
        // Note: chat.sendMessage automatically updates the chat object's internal history,
        // but we need to save it to our store to persist across requests if we were re-initializing.
        // However, `chat` object is stateful. If we re-create `chat` every time, we need to pass `history`.
        // The `history` we passed to startChat doesn't include the new turn.
        // We need to append the new turn to our `chatSessions`.

        // User turn
        chatSessions[sessionId].push({
            role: "user",
            parts: parts
        });

        // Model turn
        chatSessions[sessionId].push({
            role: "model",
            parts: [{ text: responseText }]
        });

        res.json({ response: responseText });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: error.message || 'Error processing chat.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
