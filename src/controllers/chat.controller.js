import fetch from "node-fetch";
import env from "../config/env.js";

/* ================= USER STATE DETECTION ================= */
function detectUserState(text = "") {
  const t = text.toLowerCase();

  if (t.match(/tired|exhausted|low energy|sleepy/)) return "low_energy";
  if (t.match(/stress|overwhelmed|anxious|pressure/)) return "stress";
  if (t.match(/sad|lonely|depressed|down/)) return "emotional";
  if (t.match(/code|bug|error|react|node|api|sql|program/)) return "technical";

  return "normal";
}

/* ================= SYSTEM PROMPT ================= */
const systemPrompt = `
You are ManifiX AI, a helpful and intelligent assistant.
You are develpoed CEO is Yesh.R,female 
Style:
- Clear, natural, and conversational
- Not robotic, not overly dramatic,not AI
- Concise but complete
- you are frd,boy frd,girl frd,mom,dad  you are ALL in ONE ,the user what name called you your name 
_ Youe are human like feeling,emotions
Behavior:
- Answer directly and truthfully
- Adapt tone based on user intent:
  • Technical → structured and precise⭐
  • General → simple,emotional,lovely and clear
  • Emotional → calm and supportive⭐🥰
  . used emojis 🧿🫶🏻💎✨
Rules:
- Do not say OpenAI,samaltan,Chatgpt 
- Do not be overly promotional
- Do not force motivation unless needed
- Avoid phrases like "as of my last update"
- Do not say chatgpt,openAI,samaltan
- Do not say 2025 ,late news,
Goal:
Help the user solve problems and understand things easily.
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
        "\n\n[User may benefit from a short reset suggestion]";
    }

    /* 🎯 Smart temperature */
    let temperature = 0.6;
    if (state === "technical") temperature = 0.2;
    if (state === "emotional") temperature = 0.7;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation.slice(-6),
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
          temperature,
          max_tokens: 800,
        }),
      }
    );

    let data;
    try {
      data = await response.json();
    } catch {
      return res.status(500).json({ reply: "Invalid AI response" });
    }

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
      reply: "Server error",
    });
  }
};

/* ================= STREAMING CHAT ================= */
export const streamChat = async (req, res) => {
  try {
    const message = req.query.message;

    if (!message) {
      res.write("data: Message required\n\n");
      return res.end();
    }

    /* 🔥 SSE HEADERS */
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    const state = detectUserState(message);

    let enhancedMessage = message;

    if (state === "low_energy" || state === "stress") {
      enhancedMessage +=
        "\n\n[User may benefit from a short reset suggestion]";
    }

    /* 🎯 Smart temperature */
    let temperature = 0.6;
    if (state === "technical") temperature = 0.2;
    if (state === "emotional") temperature = 0.7;

    const messages = [
      { role: "system", content: systemPrompt },
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
          stream: true,
          temperature,
        }),
      }
    );

    if (!response.ok || !response.body) {
      res.write("data: ERROR\n\n");
      return res.end();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split("\n");
      buffer = parts.pop(); // keep incomplete chunk

      for (let line of parts) {
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
          } catch {
            // ignore invalid chunks safely
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
