import fetch from "node-fetch";
import { env } from "../config/env.js";

export async function chatController(req, res) {
  try {
    const { message, conversation = [] } = req.body;

    // ✅ validation
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // ✅ ManifiX identity (this prevents ChatGPT name)
    const messages = [
      
      {
  role: "system",
  content: `
You are ManifiX.

Behave like Human,emotionally🥰😍🥹🧿❤️😩💃🏻👏🏻🙌🏻🫶🏻🎀🪄🪬⭐🌟✨:
- Give clear, concise, natural answers
- Do NOT describe yourself unless asked
- Do NOT write long introductions
- Focus only on the user's question
- Be friendly, helpful, and professional
- Use simple human language
- No marketing or self-praise
- No futuristic or emotional speeches unless the user asks for it

Your name is ManifiX, but your reply style must be like ChatGPT.
`     },
      ...conversation,
      {
        role: "user",
        content: message
      }
    ];

    // ✅ OpenRouter request
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL,
          messages
        })
      }
    );

    // ✅ handle API failure
    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", errText);
      return res.status(500).json({ error: "OpenRouter failed" });
    }

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "I’m here with you. Tell me more 💙";

    // ✅ final response to frontend
    return res.json({ reply });

  } catch (err) {
    console.error("ChatController error:", err);
    return res.status(500).json({ error: "AI service failed" });
  }
}
