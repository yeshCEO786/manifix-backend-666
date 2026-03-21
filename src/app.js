// src/app.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import multer from "multer";
import path from "path";
import { createClient } from "@supabase/supabase-js";

import authRoutes from "./routes/auth.routes.js";
import stripeRouter from "./routes/stripe.js";

dotenv.config();
const app = express();

/* ================= CONFIG CHECK ================= */
if (!process.env.OPENROUTER_API_KEY) {
  console.warn("⚠️ Missing OPENROUTER_API_KEY");
}

/* ================= CORS (FIXED) ================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

/* ================= SUPABASE ================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ROLE_KEY
);

/* ================= FILE UPLOAD ================= */
const storage = multer.diskStorage({
  destination: "src/uploads",
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));

/* ================= HEALTH ================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ================= CHAT ================= */
app.post("/api/chat", async (req, res) => {
  const { message, userId } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Message required" });
  }

  try {
    let user = null;

    /* ===== Fetch user ===== */
    if (userId) {
      const { data } = await supabase
        .from("profiles")
        .select("streak, energy, vibe_score")
        .eq("id", userId)
        .single();

      user = data;
    }

    /* ===== SYSTEM PROMPT ===== */
    const systemPrompt = `
You are ManifiX — a deeply human, emotionally intelligent AI companion.

User:
- Streak: ${user?.streak || 0}
- Energy: ${user?.energy || 0}
- Score: ${user?.vibe_score || 0}

Speak like a real human:
- warm, natural, supportive
- short (2–4 lines)
- not robotic

Adapt tone:
- sad → calm & caring
- motivated → energetic 🔥
- confused → simple explanation

Goal:
Make the user feel understood and slightly better.
`;

    /* ===== AI CALL ===== */
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
        timeout: 30000, // ✅ FIXED (important)
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "Hmm… I couldn’t respond.";

    res.json({ reply, user });

  } catch (err) {

    /* ===== FIXED ERROR LOGGING ===== */
    console.error("❌ FULL ERROR:");
    console.error(err);

    res.status(500).json({
      reply: "⚠️ Connection issue. Try again.",
    });
  }
});

/* ================= MAGIC16 ================= */
app.post("/api/magic16-complete", async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "User ID required" });

  try {
    const today = new Date().toISOString().split("T")[0];

    const { data: user } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    let streak = user?.streak || 0;

    if (user?.last_streak_date === today) {
      return res.json({ message: "Already completed", user });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().split("T")[0];

    streak = user?.last_streak_date === yDate ? streak + 1 : 1;

    const { data: updatedUser } = await supabase
      .from("profiles")
      .update({
        streak,
        last_streak_date: today,
        energy: Math.min((user?.energy || 0) + 10, 100),
        vibe_score: (user?.vibe_score || 0) + 5
      })
      .eq("id", userId)
      .select()
      .single();

    res.json({ success: true, user: updatedUser });

  } catch (err) {
    console.error("Magic16 error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

/* ================= UPLOAD ================= */
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/stripe", stripeRouter);

/* ================= 404 ================= */
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

/* ================= ERROR ================= */
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ error: "Server error" });
});

export default app;
