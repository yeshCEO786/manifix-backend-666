// src/config/env.js

import dotenv from "dotenv";

dotenv.config();

/**
 * Throws error if required env variable is missing
 */
function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  // ======================
  // Server
  // ======================
  NODE_ENV: process.env.NODE_ENV || "production",
  PORT: Number(process.env.PORT) || 5000,
  CORS_ORIGIN: required("CORS_ORIGIN"),

  // ======================
  // AI
  // ======================
  OPENROUTER_API_KEY: required("OPENROUTER_API_KEY"),
  OPENROUTER_MODEL: required("OPENROUTER_MODEL"),
  ENABLE_STREAMING: process.env.ENABLE_STREAMING === "true",

  // ======================
  // Voice
  // ======================
  COQUI_TTS_URL: required("COQUI_TTS_URL"),
  WHISPER_MODEL: required("WHISPER_MODEL"),
  FRONTEND_URL: required("FRONTEND_URL"),

  // ======================
  // Files
  // ======================
  MAX_UPLOAD_SIZE_MB: Number(process.env.MAX_UPLOAD_SIZE_MB) || 20,
  FILE_STORAGE_PATH: required("FILE_STORAGE_PATH"),

  // ======================
  // Weather
  // ======================
  WEATHER_API_KEY: required("WEATHER_API_KEY"),

  // ======================
  // News
  // ======================
  NEWS_API_KEY: required("NEWS_API_KEY"),
  GNEWS_API_KEY: required("GNEWS_API_KEY"),

  // ======================
  // Finance
  // ======================
  ALPHA_VANTAGE_KEY: required("ALPHA_VANTAGE_KEY"),

  // ======================
  // Database
  // ======================
  DB_USER: required("DB_USER"),
  DB_PASSWORD: required("DB_PASSWORD"),
  DB_HOST: required("DB_HOST"),
  DB_PORT: Number(process.env.DB_PORT) || 5432,
  DB_NAME: required("DB_NAME"),

  // ======================
  // Supabase
  // ======================
  SUPABASE_URL: required("SUPABASE_URL"),
  SUPABASE_ROLE_KEY: required("SUPABASE_ROLE_KEY"),

  // ======================
  // Stripe
  // ======================
  STRIPE_SECRET_KEY: required("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: required("STRIPE_WEBHOOK_SECRET"),

  // ======================
  // Security
  // ======================
  RATE_LIMIT_PER_MIN: Number(process.env.RATE_LIMIT_PER_MIN) || 30,
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // ======================
  // Redis & Logging
  // ======================
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  REDIS_URL: required("REDIS_URL"),
  STREAM_TIMEOUT_MS: Number(process.env.STREAM_TIMEOUT_MS) || 30000,
  WS_ALLOWED_ORIGINS: required("WS_ALLOWED_ORIGINS")
    .split(",")
    .map(origin => origin.trim()),
};
