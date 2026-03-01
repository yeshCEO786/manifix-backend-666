// src/controllers/vibe.controller.js
const VibeService = require("../services/vibe.service.js");
const { authMiddleware } = require("../middleware/authMiddleware.js");

// Get current user vibes
exports.getUserVibes = async (req, res) => {
  try {
    const userId = req.user.id;
    const vibes = await VibeService.getVibesByUser(userId);
    res.json(vibes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load user vibes." });
  }
};

// Search public vibes
exports.searchPublicVibes = async (req, res) => {
  try {
    const { q } = req.query;
    const vibes = await VibeService.searchPublicVibes(q);
    res.json(vibes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to search public vibes." });
  }
};

// Create a vibe
exports.createVibe = async (req, res) => {
  try {
    const { text, privacy, font, music } = req.body;
    const userId = req.user.id;

    if (!text || text.trim() === "")
      return res.status(400).json({ message: "Text is required" });

    const newVibe = await VibeService.createVibe({
      userId,
      text,
      privacy,
      font,
      music,
    });

    res.status(201).json(newVibe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create vibe." });
  }
};