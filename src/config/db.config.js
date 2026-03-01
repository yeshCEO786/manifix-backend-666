// src/config/db.config.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// PostgreSQL Pool
export const pgPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  max: 20,                   // max clients in pool
  idleTimeoutMillis: 30000,  // close idle clients after 30s
  connectionTimeoutMillis: 2000,
});

// Test connection
pgPool.connect()
  .then(client => {
    console.log("✅ PostgreSQL connected");
    client.release();
  })
  .catch(err => {
    console.error("❌ PostgreSQL connection error:", err.stack);
  });

// Optional Supabase client
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ROLE_KEY
);

// Test Supabase
(async () => {
  const { data, error } = await supabase.from("vibes").select("*").limit(1);
  if (error) console.error("❌ Supabase test error:", error);
  else console.log("✅ Supabase connected, sample data:", data);
})();