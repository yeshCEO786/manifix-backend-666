import express from "express";
import Razorpay from "razorpay";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= CREATE ORDER ================= */
router.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: 199900, // ₹1999 in paise
      currency: "INR",
      receipt: "manifix_receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (err) {
    console.error("Razorpay Error:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

export default router;
