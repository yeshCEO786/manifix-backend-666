import dotenv from "dotenv";
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.warn(`❌ WARNING: ENV variable ${name} is not set`);
  }
  return value || "";
}

function optional(name, defaultValue = null) {
  return process.env[name] ?? defaultValue;
}

const config = {
  env: optional("NODE_ENV", "development"),
  port: Number(optional("PORT", 5000)),

  corsOrigin: isProd
    ? optional("FRONTEND_URL", "https://manifixai.com")
    : optional("FRONTEND_URL", "http://localhost:3000"),

  ai: {
    apiKey: required("OPENROUTER_API_KEY"),
    model: optional("OPENROUTER_MODEL", "openai/gpt-4o-mini"),
    streaming: optional("ENABLE_STREAMING", "true") === "true",
  },

  supabase: {
    url: required("SUPABASE_URL"),
    serviceRoleKey: required("SUPABASE_ROLE_KEY"),
  },

  razorpay: {
    keyId: required("RAZORPAY_KEY_ID"),
    keySecret: required("RAZORPAY_KEY_SECRET"),
    webhookSecret: optional("RAZORPAY_WEBHOOK_SECRET"),
  },

  security: {
    jwtSecret: required("JWT_SECRET"),
    jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),
    rateLimit: Number(optional("RATE_LIMIT_PER_MIN", 30)),
  },

  redis: {
    url: optional("REDIS_URL"),
  },

  logging: {
    level: optional("LOG_LEVEL", isProd ? "warn" : "debug"),
  },
};

export default config;
