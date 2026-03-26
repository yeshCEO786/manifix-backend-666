import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// ✅ Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ROLE_KEY
);

/* ================= CREATE ORDER ================= */
router.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: 1999 * 100,
      currency: "INR",
      receipt: "manifix_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);

  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});


/* ================= VERIFY PAYMENT + SAVE ================= */
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id
    } = req.body;

    // ✅ validate
    if (!user_id) {
      return res.status(400).json({ error: "User ID missing" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // ✅ expiry (30 days)
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    // ✅ save to DB
    const { error } = await supabase
      .from("premium")
      .upsert([
        {
          user_id,
          payment_id: razorpay_payment_id,
          plan: "premium",
          subscription_status: "active",
          expires_at: expiry,
        }
      ]);

    if (error) {
      console.error("DB Error:", error);
      return res.status(500).json({
        success: false,
        message: "DB update failed",
      });
    }

    // ✅ success
    return res.status(200).json({
      success: true,
      message: "Premium activated",
    });

  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
