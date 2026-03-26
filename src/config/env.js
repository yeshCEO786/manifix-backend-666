// /src/config/env.js
import dotenv from "dotenv";

// Load .env immediately
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

/**
 * Helper functions to safely read env vars at runtime
 */
function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ ERROR: ENV variable ${name} is not set`);
    process.exit(1); // Stop server if missing critical env
  }
  return value;
}

function optional(name, defaultValue = null) {
  return process.env[name] ?? defaultValue;
}

/**
 * CONFIG
 */
const config = {
  env: optional("NODE_ENV", "development"),
  port: Number(optional("PORT", 5000)),

  corsOrigin: isProd
    ? required("FRONTEND_URL")  // must be exact frontend domain
    : optional("FRONTEND_URL", "http://localhost:3000"),

  // ============================
  // AI / GPT
  // ============================
  ai: {
    apiKey: required("OPENROUTER_API_KEY"),
    model: optional("OPENROUTER_MODEL", "openai/gpt-4o-mini"),
    streaming: optional("ENABLE_STREAMING", "true") === "true",
  },

  // ============================
  // Supabase
  // ============================
  supabase: {
    url: required("SUPABASE_URL"),
    serviceRoleKey: required("SUPABASE_ROLE_KEY"),
  },

  // ============================
  // Razorpay
  // ============================
  razorpay: {
    keyId: required("RAZORPAY_KEY_ID"),
    keySecret: required("RAZORPAY_KEY_SECRET"),
    webhookSecret: optional("RAZORPAY_WEBHOOK_SECRET"),
  },

  // ============================
  // Security / JWT
  // ============================
  security: {
    jwtSecret: required("JWT_SECRET"),
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
