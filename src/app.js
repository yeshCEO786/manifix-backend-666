import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import path from "path";
import fs from "fs";

/* ================= ROUTES ================= */
import chatRoutes from "./routes/chat.routes.js";
import authRoutes from "./routes/auth.routes.js";
import premiumRoutes from "./routes/premium.routes.js";
import razorpayRoutes from "./routes/razorpay.js";
import webhookRoutes from "./routes/webhook.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import requirePremium from "./middleware/requirePremium.js";
import streamRoutes from "./routes/stream.routes.js";


/* ================= CONFIG ================= */
import config from "./config/env.js";

const app = express();

/* ================= TRUST PROXY ================= */
app.set("trust proxy", 1);

/* ================= SECURITY ================= */
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.security?.rateLimit || 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ✅ FIXED CORS (IMPORTANT) */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://manifixai.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ================= BODY ================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================= UPLOAD ================= */
const uploadPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadPath),
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

app.use("/uploads", express.static(uploadPath));

/* ================= HEALTH ================= */
app.get("/api/health", (_, res) =>
  res.json({ status: "ok" })
);

/* ================= ROUTES ================= */
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api", razorpayRoutes);
app.use("/api", webhookRoutes);
app.use("/api/stream", streamRoutes);
/* ================= PREMIUM ================= */
app.use("/api/premium", requirePremium, premiumRoutes);

/* ================= MAGIC16 ================= */
app.post("/api/magic16-complete", async (req, res) => {
  res.json({
    success: true,
    message: "Magic16 tracking coming soon",
  });
});

/* ================= FILE UPLOAD ================= */
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

/* ================= 404 ================= */
app.use((req, res) =>
  res.status(404).json({ error: "Route not found" })
);

/* ================= GLOBAL ERROR ================= */
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

export default app;
