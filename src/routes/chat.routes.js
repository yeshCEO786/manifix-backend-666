// src/routes/chat.routes.js
import express from "express";
import { chatController } from "../controllers/chat.controller.js";

const router = express.Router();

// POST /api/chat
router.post("/", chatController);

export default router;
