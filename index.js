require('dotenv').config(); // Loads environment variables from a .env file
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// --- CORS PERMISSION CODE (Stays the same) ---
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

// --- GET YOUR API KEY ---
// This line fetches the API key from your environment variables.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;


// --- THE SYSTEM PROMPT FOR THE AI (Stays the same) ---
const systemPrompt = `You are 'Mitra,' a warm, empathetic, and supportive friend for young adults in India...`; // Your full prompt goes here


// --- THE MAIN CHAT ROUTE (Completely new logic) ---
app.post('/', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured.' });
  }

  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: 'No message provided.' });
    }

    // This is the new request format for the Gemini API
    const requestPayload = {
      contents: [{
        parts: [{
          text: systemPrompt + "\n\nUser: " + userMessage
        }]
      }]
    };

    // Use axios to send the request to the Gemini API
    const apiResponse = await axios.post(GEMINI_API_URL, requestPayload);

    const botReply = apiResponse.data.candidates[0].content.parts[0].text;
    res.json({ reply: botReply });

  } catch (error) {
    console.error("FATAL ERROR during AI call:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to generate response from AI.' });
  }
});


// --- START THE SERVER (Stays the same) ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});