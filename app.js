// backend/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

// Load env variables
dotenv.config();

const app = express();

// -------- MIDDLEWARE --------
app.use(cors()); // For dev, allow all origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------- HEALTH CHECK --------
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// -------- AI CHAT ROUTE --------
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Message is required" });

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are ManifiX, an emotional supportive AI." },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("Chat error:", error.response?.data || error.message);
    res.status(500).json({ reply: "Something went wrong 🤍" });
  }
});

export default app;