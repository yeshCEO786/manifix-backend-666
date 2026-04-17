// /src/routes/chat.routes.js

import express from "express";
import {
  chatController,
  streamChat
} from "../controllers/chat.controller.js";

const router = express.Router();

/* ================= NORMAL CHAT ================= */
// POST /api/chat
router.post("/", chatController);

/* ================= STREAMING CHAT ================= */
// GET /api/chat/stream?message=hello
router.get("/stream", streamChat);

/* ================= HEALTH CHECK ================= */
// GET /api/chat/health
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ManifiX AI Chat",
    time: new Date().toISOString()
  });
});

export default router;
