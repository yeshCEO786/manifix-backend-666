// /src/services/razorpay.js
import Razorpay from "razorpay";

/**
 * Create and return a Razorpay client
 * ⚠️ Always call inside a function or server start
 */
export function createRazorpayClient() {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("❌ Missing ENV: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

/**
 * Example function to create an order
 * @param {number} amount - Amount in smallest currency unit (paise)
 * @param {string} currency - Currency code (INR, USD, etc.)
 */
export async function createRazorpayOrder(amount, currency = "INR") {
  const client = createRazorpayClient();

  const options = {
    amount,
    currency,
    payment_capture: 1, // auto-capture
  };

  return await client.orders.create(options);
}

/**
 * Example function to fetch a payment by ID
 * @param {string} paymentId
 */
export async function fetchPayment(paymentId) {
  const client = createRazorpayClient();
  return await client.payments.fetch(paymentId);
}
