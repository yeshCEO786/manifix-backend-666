// config/env.js

import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),

  PORT: Joi.number().default(5000),

  // ======================
  // CORS
  // ======================
  CORS_ORIGIN: Joi.string().uri().required(),

  // ======================
  // AI
  // ======================
  OPENROUTER_API_KEY: isProd
    ? Joi.string().required()
    : Joi.string().optional(),

  OPENROUTER_MODEL: Joi.string().required(),

  ENABLE_STREAMING: Joi.boolean().default(true),

  // ======================
  // Supabase
  // ======================
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ROLE_KEY: Joi.string().required(),

  // ======================
  // Database
  // ======================
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),

  // ======================
  // Stripe
  // ======================
  STRIPE_SECRET_KEY: isProd
    ? Joi.string().required()
    : Joi.string().optional(),

  STRIPE_WEBHOOK_SECRET: isProd
    ? Joi.string().required()
    : Joi.string().optional(),

  // ======================
  // Security
  // ======================
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default("7d"),
  RATE_LIMIT_PER_MIN: Joi.number().default(30),

  // ======================
  // Redis
  // ======================
  REDIS_URL: Joi.string().required(),

  // ======================
  // Logging
  // ======================
  LOG_LEVEL: Joi.string()
    .valid("error", "warn", "info", "debug")
    .default("info"),
})
  .unknown()
  .required();

const { error, value } = schema.validate(process.env);

if (error) {
  console.error("❌ ENV Validation Error:", error.message);
  process.exit(1);
}

const config = {
  env: value.NODE_ENV,
  port: value.PORT,
  corsOrigin: value.CORS_ORIGIN,

  ai: {
    apiKey: value.OPENROUTER_API_KEY,
    model: value.OPENROUTER_MODEL,
    streaming: value.ENABLE_STREAMING,
  },

  supabase: {
    url: value.SUPABASE_URL,
    roleKey: value.SUPABASE_ROLE_KEY,
  },

  db: {
    user: value.DB_USER,
    password: value.DB_PASSWORD,
    host: value.DB_HOST,
    port: value.DB_PORT,
    name: value.DB_NAME,
  },

  stripe: {
    secretKey: value.STRIPE_SECRET_KEY,
    webhookSecret: value.STRIPE_WEBHOOK_SECRET,
  },

  security: {
    jwtSecret: value.JWT_SECRET,
    jwtExpiresIn: value.JWT_EXPIRES_IN,
    rateLimit: value.RATE_LIMIT_PER_MIN,
  },

  redis: {
    url: value.REDIS_URL,
  },

  logging: {
    level: value.LOG_LEVEL,
  },
};

export default config;