// /src/routes/premium.routes.js
import express from "express";
import requirePremium from "../middleware/requirePremium.js"; // ✅ premium middleware
import { createRazorpayOrder } from "../services/razorpay.js";

const router = express.Router();

/**
 * Premium-only content route
 */
router.get("/premium-content", requirePremium, async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Welcome premium user! 🎉",
      data: {
        secretTips: "Here is some premium AI content..."
      }
    });
  } catch (err) {
    console.error("Error in premium-content route:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * Create Razorpay order (example)
 */
router.post("/create-order", requirePremium, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const order = await createRazorpayOrder(amount);
    res.json({ success: true, order });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
