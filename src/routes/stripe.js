import dotenv from "dotenv";
dotenv.config(); // ⚡ Must be first

import express from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// 🔹 Check env keys
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY missing in .env");
  process.exit(1);
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.error("❌ STRIPE_WEBHOOK_SECRET missing in .env");
  process.exit(1);
}

// Stripe and Supabase clients
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ======================
// CREATE CHECKOUT SESSION
// ======================
router.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { userId, priceId } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/billing`,
      metadata: { user_id: userId },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Stripe session failed" });
  }
});

// ======================
// STRIPE WEBHOOK
// ======================
router.post(
  "/api/webhook",
  express.raw({ type: "application/json" }), // ⚠ Required by Stripe
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.log("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await supabase
        .from("users")
        .update({
          is_premium: true,
          subscription_status: "active",
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
        })
        .eq("id", session.metadata.user_id);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      await supabase
        .from("users")
        .update({
          is_premium: false,
          subscription_status: "canceled",
        })
        .eq("stripe_subscription_id", subscription.id);
    }

    res.json({ received: true });
  }
);

export default router;
