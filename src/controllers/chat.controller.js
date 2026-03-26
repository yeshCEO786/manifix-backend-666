import fetch from "node-fetch";
import { env } from "../config/env.js";

export const chatController = async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const messages = [
      {
        role: "system",
        content: `YOUR FINAL SYSTEM PROMPT HERE`
      },
      ...conversation,
      { role: "user", content: message }
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages,
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "I’m here with you. Tell me more 🤍";

    return res.json({ reply });

  } catch (err) {
    console.error("ChatController error:", err);
    return res.status(500).json({ error: "AI failed" });
  }
};
