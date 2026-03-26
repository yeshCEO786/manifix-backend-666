// /src/routes/premium.routes.js
import express from "express";
import requirePremium from "../middleware/requirePremium.js";
import { createRazorpayOrder } from "../services/razorpay.js";

const router = express.Router();

/**
 * GET /premium-content
 * Premium-only content route
 */
router.get("/premium-content", requirePremium, async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Welcome premium user! 🎉",
      data: { secretTips: "Here is some premium AI content..." },
    });
  } catch (err) {
    console.error("Premium content error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /create-order
 * Create Razorpay order for premium users
 */
router.post("/create-order", requirePremium, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount required" });
    }

    const order = await createRazorpayOrder(amount);
    res.json({ success: true, order });
  } catch (err) {
    console.error("Razorpay order error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
