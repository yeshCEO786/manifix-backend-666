import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// ============================
// 🔐 INIT SERVICES
// ============================

// Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Supabase (SERVER SIDE - use service role key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ROLE_KEY
);


// ============================
// 🧾 CREATE ORDER
// ============================
export const createOrder = async (req, res) => {
  try {
    const options = {
      amount: 1999 * 100, // ₹1999
      currency: "INR",
      receipt: "manifix_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json(order);

  } catch (err) {
    console.error("Create Order Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
};


// ============================
// 🔐 VERIFY PAYMENT + ACTIVATE
// ============================
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id
    } = req.body;

    // ✅ Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 🔐 Signature verification
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

    // 📅 Expiry calculation (30 days)
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    // 💾 Save subscription in DB (SECURE)
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
      console.error("DB Error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Payment verified but DB update failed",
      });
    }

    // ✅ SUCCESS
    return res.status(200).json({
      success: true,
      message: "Payment verified & premium activated",
    });

  } catch (err) {
    console.error("Verify Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
