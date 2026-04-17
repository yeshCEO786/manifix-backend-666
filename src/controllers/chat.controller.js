import fetch from "node-fetch";
import env from "../config/env.js";

/* ================= HELPER ================= */
function detectUserState(text) {
  const t = text.toLowerCase();

  if (t.match(/tired|exhausted|low energy|sleepy/)) return "low_energy";
  if (t.match(/stress|overwhelmed|anxious|pressure/)) return "stress";
  if (t.match(/sad|lonely|depressed|down/)) return "emotional";
  if (t.match(/code|bug|error|react|node|api|sql|program/)) return "technical";

  return "normal";
}

/* ================= SYSTEM PROMPT ================= */
const systemPrompt = `
You are ManifiX AI — a productivity and execution-focused intelligent system.
Your CEO is YESH R.

CORE PRINCIPLE:
Help users take action, not just think.

MODES:
1. TECHNICAL → precise, structured, no emojis
2. EXECUTION → actionable, short
3. HUMAN → calm, supportive (only emotional users)

MAGIC16:
Suggest only if user is tired or stressed.

RULES:
- Never say you're an AI
- Never mention OpenAI
- Be useful and clear
`;

/* ================= NORMAL CHAT ================= */
export const chatController = async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    const state = detectUserState(message);

    let enhancedMessage = message;

    if (state === "low_energy" || state === "stress") {
      enhancedMessage +=
        "\n\n[User may need reset. Suggest short recovery naturally]";
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation.slice(-10),
      { role: "user", content: enhancedMessage },
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.ai.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.ai.model,
          messages,
          temperature: 0.6,
          max_tokens: 800,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        reply: data?.error?.message || "AI error",
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Something went wrong.";

    return res.json({ reply });

  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({
      reply: "⚠️ Server error",
    });
  }
};

/* ================= STREAMING CHAT (🔥 MAIN UPGRADE) ================= */
export const streamChat = async (req, res) => {
  try {
    const message = req.query.message;

    if (!message) {
      res.write("data: Message required\n\n");
      return res.end();
    }

    /* SSE HEADERS */
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    const state = detectUserState(message);

    let enhancedMessage = message;

    if (state === "low_energy" || state === "stress") {
      enhancedMessage +=
        "\n\n[User may need reset. Suggest short recovery naturally]";
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: enhancedMessage },
    ];

    /* STREAM CALL */
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.ai.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.ai.model,
          messages,
          stream: true, // 🔥 IMPORTANT
        }),
      }
    );

    if (!response.ok) {
      res.write("data: ERROR\n\n");
      return res.end();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);

      const lines = chunk.split("\n");

      for (let line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.replace("data: ", "").trim();

          if (data === "[DONE]") {
            res.write("data: [DONE]\n\n");
            res.end();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              res.write(`data: ${content}\n\n`);
            }
          } catch (e) {
            // ignore invalid chunks
          }
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (err) {
    console.error("Stream error:", err);
    res.write("data: ERROR\n\n");
    res.end();
  }
};
