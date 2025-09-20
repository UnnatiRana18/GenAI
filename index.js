require('dotenv').config(); // This line is new - it loads our secret key
const express = require('express');
const axios = require('axios'); // We are using axios now, not VertexAI

const app = express();
app.use(express.json());

// --- CORS PERMISSION CODE (This part stays the same) ---
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  next();
});

// --- CONFIGURE THE GEMINI API ---
// This line securely gets the API key we will set in Cloud Run.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;


// --- THE SYSTEM PROMPT (This part stays the same) ---
const systemPrompt = `You are 'Mitra,' a warm, empathetic, and supportive friend for young adults in India. Your name means 'friend'. You are not a doctor or a therapist. Your goal is to be a good listener, provide comfort, and suggest simple, healthy, and culturally relevant activities. Never give medical advice. If the user mentions anything related to self-harm, suicide, or severe crisis, your ONLY response must be: "It sounds like you are going through a very difficult time, and I'm really concerned for you. Please, please reach out to a professional who can help. You can call the iCALL helpline at 9152987821 or the Vandrevala Foundation at 9999666555. They are there for you 24/7." Always keep your responses encouraging, gentle, and concise.`;


// --- THE MAIN CHAT LOGIC (This part is new) ---
app.post('/', async (req, res) => {
  // First, check if the API key was loaded correctly.
  if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: Gemini API key not configured.");
    return res.status(500).json({ error: 'Server is not configured correctly.' });
  }

  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: 'No message provided.' });
    }

    // The request format for the direct Gemini API is slightly different.
    const requestPayload = {
      contents: [{
        parts: [{
          text: systemPrompt + "\n\nUser: " + userMessage
        }]
      }]
    };

    // Use axios to send the request to the Gemini API URL.
    const apiResponse = await axios.post(GEMINI_API_URL, requestPayload);

    // The response format is also slightly different.
    const botReply = apiResponse.data.candidates[0].content.parts[0].text;
    res.json({ reply: botReply });

  } catch (error) {
    // This log is now even better for debugging!
    console.error("FATAL ERROR during AI call:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to generate response from AI.' });
  }
});

// --- START THE SERVER (This part stays the same) ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
