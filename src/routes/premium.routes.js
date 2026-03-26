import express from "express";
import requirePremium from "../middleware/requirePremium.js"; // ✅ import middleware

const router = express.Router();

// Example premium-only route
router.get("/premium-content", requirePremium, async (req, res) => {
  res.json({
    success: true,
    message: "Welcome premium user! 🎉",
    data: {
      secretTips: "Here is some premium AI content..."
    }
  });
});

export default router;
