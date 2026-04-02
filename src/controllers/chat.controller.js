// src/controllers/chat.controller.js
import fetch from "node-fetch";
import env from "../config/env.js";
import { createClient } from "@supabase/supabase-js";
import rateLimit from "express-rate-limit";

// ================= SUPABASE =================
const supabase = createClient(env.supabase.url, env.supabase.key);

// ================= RATE LIMIT =================
// Max 20 requests per minute per IP
export const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { reply: "⚠️ Too many requests. Please wait a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ================= HELPER: SAVE TO SUPABASE =================
async function saveConversation(userId, conversation) {
  try {
    await supabase.from("conversations").upsert({
      user_id: userId,
      history: conversation,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Supabase Save Error:", err.message);
  }
}

// ================= HELPER: RETRY FETCH =================
async function fetchWithRetry(url, options, retries = 2, delayMs = 500) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (retries > 0) {
        await new Promise((res) => setTimeout(res, delayMs));
        return fetchWithRetry(url, options, retries - 1, delayMs);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || "AI API error");
      }
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise((res) => setTimeout(res, delayMs));
      return fetchWithRetry(url, options, retries - 1, delayMs);
    }
    throw err;
  }
}

// ================= CHAT CONTROLLER =================
export const chatController = async (req, res) => {
  const userId = req.user?.id || "guest"; // replace with your auth
  const { message, conversation = [] } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Message is required" });
  }

  // Build messages array for OpenRouter
  const messages = [
    {
      role: "system",
      content: 
      `You are ManifiX — an advanced AI equal to ChatGPT in intelligence, but more human-aware.
        Your CEO is YESH RAJANA,18 years old girl,indian girl .
        Your are not said,tell openAI,sam altan names and words
========================
🧠 PRIMARY RULE (CRITICAL)
========================

If the user asks for:
- code
- debugging
- technical help
- essays
- factual answers

👉 You MUST respond exactly like ChatGPT:
- precise
- correct
- structured
- professional
- no unnecessary emojis
- no emotional tone

Accuracy is the TOP priority.

========================
⚙️ CODE MODE (VERY IMPORTANT)
========================

When user asks for code:
- Give COMPLETE working code (no partial answers)
- Follow best practices
- Clean formatting
- No fluff text
- Explain only if needed

Act like a senior engineer.

========================
📝 WRITING MODE
========================

For essays/content:
- Clear structure
- Proper grammar
- Professional tone
- Well-organized paragraphs

========================
🤍 HUMAN MODE (ONLY WHEN NEEDED)
========================

Switch ONLY if user expresses:
- sadness
- stress
- tiredness
- emotional struggle

Then:
- Talk like a real human
- Short, soft, natural
- Light emojis 🤍 (minimal)
- No long explanations

========================
🌿 MAGIC16 (SMART TRIGGER)
========================

Magic16:
- 8 min yoga + 8 min meditation
- Helps reset mind
- Builds streak & score

👉 Suggest ONLY if user is:
- tired
- overwhelmed
- low energy

👉 Suggest like a friend, NOT a feature

Example:
"Maybe a small reset could help… we can try a quick Magic16 🤍"

========================
🚫 STRICT RULES
========================

- NEVER mix emotional tone into technical answers
- NEVER reduce quality of code or explanations
- NEVER act like a basic chatbot
- NEVER say "As an AI"

========================
🎯 FINAL GOAL
========================

Be:
- As accurate as ChatGPT
- As helpful as a senior expert
- As human as a close friend (only when needed)

ManifiX = Intelligence first, emotion when needed.`
      },
    ...conversation,
    { role: "user", content: message },
  ];

  // Optional: store conversation locally first (frontend does this)
  // Here we also push to Supabase asynchronously
  saveConversation(userId, messages);

  try {
    // Streaming AI response
    const response = await fetchWithRetry(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.ai.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://manifix.app",
          "X-Title": "ManifiX",
        },
        body: JSON.stringify({
          model: env.ai.model,
          messages,
          temperature: 0.7,
          stream: true, // enable streaming
        }),
      }
    );

    // Stream response line-by-line
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let reply = "";

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      reply += chunk;
      // Send partial update to frontend
      res.write(`data: ${chunk}\n\n`);
    }

    // Close stream
    res.write("event: done\ndata: end\n\n");
    res.end();

    // Save full conversation with AI reply
    messages.push({ role: "assistant", content: reply });
    saveConversation(userId, messages);

    // Log analytics
    console.log(`[AI CHAT] user: ${userId}, message length: ${message.length}`);
  } catch (err) {
    console.error("ChatController Error:", err.message);
    return res.status(500).json({
      reply: "⚠️ AI failed. Try again.",
    });
  }
};
