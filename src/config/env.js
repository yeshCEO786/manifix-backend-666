// src/config/env.js
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

export const env = {
  // ======================
  // Server
  // ======================
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 6000,

  // ======================
  // Supabase (Auth + DB)
  // ======================
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY:
    process.env.SUPABASE_ROLE_KEY || "",

  // ======================
  // AI / LLM (OpenRouter)
  // ======================
  OPENROUTER_API_KEY:
    process.env.OPENROUTER_KEY || "",

  // ✅ MUST be a VALID OpenRouter model ID
  OPENROUTER_MODEL:
    process.env.OPENROUTER_MODEL ||
    "meta-llama/llama-3.1-70b-instruct",

  // ======================
  // Weather APIs
  // ======================
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || "",
  OPENWEATHER_API_KEY:
    process.env.OPENWEATHER_API_KEY || "",

  // ======================
  // News APIs
  // ======================
  NEWS_API_KEY: process.env.NEWS_API_KEY || "",
  GNEWS_API_KEY: process.env.GNEWS_API_KEY || "",

  // ======================
  // Finance / Crypto
  // ======================
  ALPHA_VANTAGE_KEY:
    process.env.ALPHA_VANTAGE_KEY || "",

  // ======================
  // Voice / Speech
  // ======================
  COQUI_TTS_URL:
    process.env.COQUI_TTS_URL || "http://localhost:5002",

  VOSK_MODEL_PATH:
    process.env.VOSK_MODEL_PATH || "",

  // ======================
  // Security
  // ======================
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "CHANGE_THIS_TO_A_STRONG_SECRET"
};
