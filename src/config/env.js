// config/env.js

import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

// ============================
// Helper Function
// ============================

function required(name) {
  const value = process.env[name];

  if (!value) {
    console.error(`❌ Missing required ENV variable: ${name}`);
    process.exit(1);
  }

  return value;
}

function optional(name, defaultValue = null) {
  return process.env[name] || defaultValue;
}

// ============================
// ENV CONFIG
// ============================

const config = {
  env: optional("NODE_ENV", "development"),

  port: optional("PORT", 5000),

  corsOrigin: isProd
    ? required("CORS_ORIGIN")
    : optional("CORS_ORIGIN", "manifixai.com"),

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
    url: required("SUPABASE_URL"),
    roleKey: optional("SUPABASE_ROLE_KEY"),
  },

  // ============================
  // Database
  // ============================

  db: {
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    host: required("DB_HOST"),
    port: optional("DB_PORT", 5432),
    name: required("DB_NAME"),
  },

  // ============================
  // Stripe
  // ============================

  stripe: {
    secretKey: optional("STRIPE_SECRET_KEY"),
    webhookSecret: optional("STRIPE_WEBHOOK_SECRET"),
  },

  // ============================
  // Security
  // ============================

  security: {
    jwtSecret: required("JWT_SECRET"),
    jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),
    rateLimit: optional("RATE_LIMIT_PER_MIN", 30),
  },

  // ============================
  // Redis
  // ============================

  redis: {
    url: optional("REDIS_URL"),
  },

  // ============================
  // Logging
  // ============================

  logging: {
    level: optional("LOG_LEVEL", "info"),
  },
};

export default config;