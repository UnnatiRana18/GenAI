const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');

const app = express();
app.use(express.json());

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

const vertex_ai = new VertexAI({ 
  project:'wellness-bot-project-472312', 
  location:'asia-south1' 
});

const generativeModel = vertex_ai.getGenerativeModel({
  model: "gemini-1.0-pro",
});

const systemPrompt = `You are 'Mitra,' a warm, empathetic, and supportive friend for young adults in India...`; // Your full prompt here

app.post('/', async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: 'No message provided.' });
    }
    const request = {
      contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\nUser: " + userMessage }] }],
    };
    const resp = await generativeModel.generateContent(request);
    if (!resp.response || !resp.response.candidates || !resp.response.candidates.length === 0) {
      throw new Error("Invalid AI Response");
    }
    const botReply = resp.response.candidates[0].content.parts[0].text;
    res.json({ reply: botReply });
  } catch (error) {
    console.error("FATAL ERROR during AI call:", error);
    res.status(500).json({ error: 'Failed to generate response from AI.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});