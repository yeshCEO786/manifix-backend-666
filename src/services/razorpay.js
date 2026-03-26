// /src/services/razorpay.js
import Razorpay from "razorpay";
import config from "../config/env.js";

/**
 * Create and return a Razorpay client
 * ⚠️ Always call inside a function or server start
 */
export function createRazorpayClient() {
  const { keyId, keySecret } = config.razorpay;

  if (!keyId || !keySecret) {
    throw new Error(
      "❌ Missing ENV: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET"
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in smallest currency unit (paise)
 * @param {string} currency - Currency code (default: INR)
 */
export async function createRazorpayOrder(amount, currency = "INR") {
  const client = createRazorpayClient();

  const options = {
    amount,
    currency,
    payment_capture: 1, // auto-capture
  };

  try {
    return await client.orders.create(options);
  } catch (err) {
    console.error("Razorpay order creation failed:", err.message);
    throw err;
  }
}

/**
 * Fetch a payment by ID
 * @param {string} paymentId
 */
export async function fetchPayment(paymentId) {
  const client = createRazorpayClient();

  try {
    return await client.payments.fetch(paymentId);
  } catch (err) {
    console.error("Razorpay fetch payment failed:", err.message);
    throw err;
  }
}
