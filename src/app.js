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

/* ================= CORS ================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= SUPABASE ================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ROLE_KEY
);

/* ================= FILE UPLOAD ================= */
const storage = multer.diskStorage({
  destination: "src/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
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

    // Fetch user data for AI personalization
    if (userId) {
      const { data } = await supabase
        .from("profiles")
        .select("streak, energy, vibe_score")
        .eq("id", userId)
        .single();

      user = data;
    }

    const systemPrompt = `
You are ManifiX AI — a motivational, emotionally supportive AI.

User stats:
- Streak: ${user?.streak || 0}
- Energy: ${user?.energy || 0}
- Score: ${user?.vibe_score || 0}

Keep responses short, powerful, and motivating.
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "No response";

    res.json({ reply, user });

  } catch (err) {
    console.error("Chat error:", err.response?.data || err.message);
    res.status(500).json({ reply: "❌ Server error" });
  }
});

/* ================= MAGIC16 COMPLETE ================= */
app.post("/api/magic16-complete", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID required" });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    const { data: user } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    let newStreak = user?.streak || 0;

    if (user?.last_streak_date === today) {
      return res.json({ message: "Already completed today", user });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().split("T")[0];

    if (user?.last_streak_date === yDate) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    const updatedEnergy = Math.min((user?.energy || 0) + 10, 100);
    const updatedScore = (user?.vibe_score || 0) + 5;

    const { data: updatedUser } = await supabase
      .from("profiles")
      .update({
        streak: newStreak,
        last_streak_date: today,
        energy: updatedEnergy,
        vibe_score: updatedScore
      })
      .eq("id", userId)
      .select()
      .single();

    res.json({ success: true, user: updatedUser });

  } catch (err) {
    console.error("Magic16 error:", err.message);
    res.status(500).json({ error: "Magic16 update failed" });
  }
});

/* ================= IMAGE UPLOAD ================= */
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
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
  res.status(404).json({ error: "Route not found" });
});

/* ================= ERROR ================= */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
