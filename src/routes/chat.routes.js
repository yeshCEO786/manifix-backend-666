// /src/routes/chat.routes.js
import express from "express";
import { chatController } from "../controllers/chat.controller.js";

const router = express.Router();

// POST /api/chat
router.post("/", async (req, res, next) => {
  try {
    await chatController(req, res);
  } catch (err) {
    console.error("Chat route error:", err);
    next(err); // Will be handled by your global error handler in app.js
  }
});

export default router;
