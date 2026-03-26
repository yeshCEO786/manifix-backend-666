// src/app.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import webhookRoutes from "./routes/webhook.routes.js";
/* ✅ ROUTES */
import authRoutes from "./routes/auth.routes.js";
import razorpayRoutes from "./routes/razorpay.js";
import chatRoutes from "./routes/chat.routes.js";

dotenv.config();
const app = express();

/* ================= SECURITY ================= */

// Helmet (secure headers)
app.use(helmet());

// Rate limiting (protect API)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP
});
app.use(limiter);
import webhookRoutes from "./routes/webhook.routes.js";
/* ================= CONFIG CHECK ================= */

if (!process.env.OPENROUTER_API_KEY) {
  console.warn("⚠️ Missing OPENROUTER_API_KEY");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ Missing SUPABASE_ROLE_KEY");
}

/* ================= CORS ================= */

app.use(cors({
  origin: process.env.FRONTEND_URL || "*", // 🔥 set domain in prod
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));

/* ================= FILE UPLOAD ================= */

const uploadPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

app.use("/uploads", express.static(uploadPath));

/* ================= HEALTH ================= */

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ================= ROUTES ================= */

// 🔥 AI Chat (CLEAN)
app.use("/api/chat", chatRoutes);

// Auth
app.use("/api/auth", authRoutes);

// Payments
app.use("/api", razorpayRoutes);

/* ================= MAGIC16 ================= */

app.post("/api/magic16-complete", async (req, res) => {
  return res.json({
    success: true,
    message: "Magic16 tracking coming soon",
  });
});

/* ================= UPLOAD ================= */

app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed" });
  }
});

/* ================= 404 ================= */

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ================= GLOBAL ERROR ================= */

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

export default app;
