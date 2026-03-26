import express from "express";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// ⚠️ RAW BODY REQUIRED
router.post(
  "/razorpay-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

      const signature = req.headers["x-razorpay-signature"];

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.body)
        .digest("hex");

      if (expectedSignature !== signature) {
        return res.status(400).send("Invalid signature");
      }

      const body = JSON.parse(req.body.toString());

      // ✅ Only handle successful payment
      if (body.event === "payment.captured") {
        const payment = body.payload.payment.entity;

        const user_id = payment.notes?.user_id;

        if (!user_id) {
          console.log("No user_id in notes");
          return res.status(200).send("ok");
        }

        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ROLE_KEY
        );

        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);

        await supabase.from("premium").upsert([
          {
            user_id,
            payment_id: payment.id,
            plan: "premium",
            subscription_status: "active",
            expires_at: expiry,
          },
        ]);

        console.log("✅ Premium activated via webhook");
      }

      res.status(200).send("ok");

    } catch (err) {
      console.error("Webhook error:", err);
      res.status(500).send("error");
    }
  }
);

export default router;
