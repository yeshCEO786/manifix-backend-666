// src/routes/vibe.routes.js
const express = require("express");
const router = express.Router();
const VibeController = require("../controllers/vibe.controller.js");
const { authMiddleware } = require("../middleware/authMiddleware.js");

// Protected routes
router.use(authMiddleware);

// Get my vibes
router.get("/", VibeController.getUserVibes);

// Create vibe
router.post("/create", VibeController.createVibe);

// Search public vibes
router.get("/public", VibeController.searchPublicVibes);

module.exports = router;