// server/routes/payment.js
import express from "express";
import Stripe from "stripe";
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  const { priceId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        { price: priceId, quantity: 1 }
      ],
      success_url: "https://manifixai.com/billing?success=true",
      cancel_url: "https://manifixai.com/billing?success=false",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment session failed" });
  }
});

export default router;