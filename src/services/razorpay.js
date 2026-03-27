import Razorpay from "razorpay";
import config from "../config/env.js";

/**
 * Create Razorpay client
 */
export function createRazorpayClient() {
  const { keyId, keySecret } = config.razorpay;

  if (!keyId || !keySecret) {
    throw new Error("❌ Missing ENV: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/**
 * Create Razorpay order
 * @param {number} amount - in paise
 * @param {string} currency - default INR
 */
export async function createRazorpayOrder(amount, currency = "INR") {
  const client = createRazorpayClient();

  const options = { amount, currency, payment_capture: 1 };

  try {
    return await client.orders.create(options);
  } catch (err) {
    console.error("Razorpay order creation failed:", err.message);
    throw err;
  }
}

/**
 * Fetch payment by ID
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
