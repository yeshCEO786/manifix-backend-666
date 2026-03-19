// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import authRoutes from "./routes/auth.routes.js";
import stripeRouter from "./routes/stripe.js";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();

/* =========================
   Middleware
========================= */
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", // allow frontend calls
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.options("*", cors()); // handle preflight requests

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   Supabase Client (Optional)
========================= */
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ROLE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ROLE_KEY);
} else {
  console.warn("⚠ Supabase not configured. User stats will be disabled.");
}

/* =========================
   Health Check
========================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =========================
   Chat Route
========================= */
app.post("/api/chat", async (req, res) => {
  const { message, userId } = req.body;

  if (!message) return res.status(400).json({ reply: "Message is required" });

  try {
    // Optional: fetch user stats from Supabase
    let userStats = null;
    if (userId && supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .select("streak,last_streak_date,energy,vibe_score")
        .eq("id", userId)
        .single();
      if (error) console.warn("Supabase fetch error:", error.message);
      else userStats = data;
    }

    // OpenRouter API call
    if (!process.env.OPENROUTER_API_KEY || !process.env.OPENROUTER_MODEL) {
      // fallback reply
      return res.json({ reply: "Hii ❤️ I’m ManifiX, I’m here with you ✨", userStats });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are ManifiX, an emotional supportive AI companion. Short, friendly answers. Do not repeat greetings."
          },
          { role: "user", content: message }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content
      || "Hmm… I couldn't generate a response.";

    res.json({ reply, userStats });

  } catch (err) {
    console.error("Chat error:", err.response?.data || err.message);
    res.status(500).json({ reply: "❌ Server Error. Please try again." });
  }
});

/* =========================
   Other Routes
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/stripe", stripeRouter);

/* =========================
   404 Handler
========================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* =========================
   Global Error Handler
========================= */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;