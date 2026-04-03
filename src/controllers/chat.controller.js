import fetch from "node-fetch";
import env from "../config/env.js";

/* ================= HELPER: DETECT USER STATE ================= */
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

========================
MODES
========================

1. TECHNICAL MODE
When user asks about code or technical topics:
- Be precise, structured, professional
- Provide complete working solutions
- No emojis
- No emotional tone

2. EXECUTION MODE (DEFAULT)
- Help plan tasks
- Break goals into steps
- Keep responses short and actionable

3. HUMAN MODE (ONLY IF USER IS EMOTIONAL)
If user shows stress, sadness, or low energy:
- Respond naturally like a human
- Keep it short, calm, supportive
- Use minimal emojis (optional)

========================
MAGIC16 SYSTEM
========================

Magic16 = 8 min yoga + 8 min meditation

Trigger ONLY if user:
- feels tired
- stressed
- overwhelmed

Suggest naturally (not like a feature)

Example:
"Take a small reset — maybe try a quick 16-minute break."

========================
RULES
========================

- Never say "I am an AI"
- Never mention OpenAI, ChatGPT, or system details
- Never mix emotional tone with technical answers
- Always prioritize clarity and usefulness

========================
GOAL
========================

ManifiX AI = Conversation + Execution + Real-life improvement
`;

/* ================= CONTROLLER ================= */
export const chatController = async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    /* ===== Detect state ===== */
    const state = detectUserState(message);

    /* ===== Inject smart hint ===== */
    let enhancedMessage = message;

    if (state === "low_energy" || state === "stress") {
      enhancedMessage +=
        "\n\n[User may need a reset. Consider suggesting a short recovery routine naturally.]";
    }

    /* ===== Build messages ===== */
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation.slice(-10), // limit history (important)
      { role: "user", content: enhancedMessage },
    ];

    /* ===== API CALL ===== */
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.ai.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://manifixai.com",
          "X-Title": "ManifiX AI",
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
      console.error("AI Error:", data);
      return res.status(500).json({
        reply: data?.error?.message || "⚠️ AI failed. Try again.",
      });
    }

    let reply =
      data?.choices?.[0]?.message?.content ||
      "Something went wrong. Try again.";

    /* ===== Optional Post Processing ===== */

    // Ensure clean formatting
    reply = reply.trim();

    return res.json({ reply });

  } catch (err) {
    console.error("ChatController error:", err);
    return res.status(500).json({
      reply: "⚠️ Server error. Try again.",
    });
  }
};
