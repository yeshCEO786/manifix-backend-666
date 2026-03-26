import express from "express";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// ✅ Create ONCE (outside route)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ROLE_KEY
);

// ⚠️ RAW BODY REQUIRED
router.post(
  "/razorpay-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers["x-razorpay-signature"];

      // 🔐 verify signature
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.body)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("❌ Invalid webhook signature");
        return res.status(400).send("Invalid signature");
      }

      const body = JSON.parse(req.body.toString());

      // ✅ handle only success
      if (body.event === "payment.captured") {
        const payment = body.payload.payment.entity;
        const user_id = payment.notes?.user_id;

        if (!user_id) {
          console.log("⚠️ No user_id in notes");
          return res.status(200).send("ok");
        }

        // 📅 expiry
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);

        // 💾 DB SAVE
        const { error } = await supabase.from("premium").upsert([
          {
            user_id,
            payment_id: payment.id,
            plan: "premium",
            subscription_status: "active",
            expires_at: expiry,
          },
        ]);

        if (error) {
          console.error("❌ DB Error:", error);
          return res.status(500).send("DB error");
        }

        console.log("✅ Premium activated via webhook:", user_id);
      }

      return res.status(200).send("ok");

    } catch (err) {
      console.error("❌ Webhook error:", err);
      return res.status(500).send("error");
    }
  }
);

export default router;
