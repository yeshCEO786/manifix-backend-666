// /src/config/env.js
import dotenv from "dotenv";

// Load .env only in local development
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

/**
 * Helper functions to safely read env vars at runtime
 */
function required(name) {
  const value = process.env[name];
  if (!value) {
    console.warn(`❌ WARNING: ENV variable ${name} is not set`);
  }
  return value;
}

function optional(name, defaultValue = null) {
  return process.env[name] ?? defaultValue;
}

/**
 * CONFIG
 * Lazy load values to prevent build-time errors
 */
const config = {
  env: optional("NODE_ENV", "development"),

  port: Number(optional("PORT", 5000)),

  corsOrigin: isProd
    ? optional("CORS_ORIGIN", "https://manifixai.com")
    : optional("CORS_ORIGIN", "http://localhost:3000"),

  // ============================
  // AI
  // ============================
  ai: {
    apiKey: optional("OPENROUTER_API_KEY"),
    model: optional("OPENROUTER_MODEL", "openai/gpt-4o-mini"),
    streaming: optional("ENABLE_STREAMING", "true") === "true",
  },

  // ============================
  // Supabase
  // ============================
  supabase: {
    url: optional("SUPABASE_URL"),
    serviceRoleKey: optional("SUPABASE_ROLE_KEY"),
  },

  // ============================
  // Razorpay
  // ============================
  razorpay: {
    keyId: optional("RAZORPAY_KEY_ID"),
    keySecret: optional("RAZORPAY_KEY_SECRET"),
    webhookSecret: optional("RAZORPAY_WEBHOOK_SECRET"),
  },

  // ============================
  // Security / JWT
  // ============================
  security: {
    jwtSecret: optional("JWT_SECRET"),
    jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),
    rateLimit: Number(optional("RATE_LIMIT_PER_MIN", 30)),
  },

  // ============================
  // Redis (optional)
  // ============================
  redis: {
    url: optional("REDIS_URL"),
  },

  // ============================
  // Logging
  // ============================
  logging: {
    level: optional("LOG_LEVEL", isProd ? "warn" : "debug"),
  },
};

export default config;
