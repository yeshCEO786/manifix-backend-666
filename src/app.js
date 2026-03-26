// src/app.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import multer from "multer";
import path from "path";
import fs from "fs";

/* ✅ ROUTES */
import authRoutes from "./routes/auth.routes.js";
import razorpayRoutes from "./routes/razorpay.js";

dotenv.config();
const app = express();

/* ================= CONFIG CHECK ================= */
if (!process.env.OPENROUTER_API_KEY) {
  console.warn("⚠️ Missing OPENROUTER_API_KEY");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ Missing SUPABASE_ROLE_KEY");
}

/* ================= CORS ================= */
// ⚠️ Change this in production to your frontend domain
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

/* ================= FILE UPLOAD ================= */

// Ensure uploads folder exists
const uploadPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Serve uploaded files
app.use("/uploads", express.static(uploadPath));

/* ================= HEALTH ================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ================= CHAT ================= */
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Message required" });
  }

  try {
const systemPrompt = `
You are ManifiX — an advanced AI equal to ChatGPT in intelligence, but more human-aware.

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

ManifiX = Intelligence first, emotion when needed.
`;
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "Hmm… I couldn’t respond.";

    res.json({ reply });

  } catch (err) {
    console.error("❌ CHAT ERROR:", err.message);

    res.status(500).json({
      reply: "⚠️ Connection issue. Try again.",
    });
  }
});

/* ================= MAGIC16 ================= */
/* ⚠️ DB logic moved to controllers ideally */
/* Keeping minimal here */
app.post("/api/magic16-complete", async (req, res) => {
  return res.json({
    success: true,
    message: "Handled in future controller (recommended)",
  });
});

/* ================= UPLOAD ================= */
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed" });
  }
});

/* ================= ROUTES ================= */

// Auth
app.use("/api/auth", authRoutes);

// Razorpay (Payments)
app.use("/api", razorpayRoutes);

/* ================= 404 ================= */
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

/* ================= GLOBAL ERROR ================= */
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(500).json({ error: "Server error" });
});

export default app;
