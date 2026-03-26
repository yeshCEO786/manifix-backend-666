//jobs/expirePremium.js
import { createClient } from "@supabase/supabase-js";
import cron from "node-cron";
import dotenv from "dotenv";

dotenv.config();

// 🔐 Initialize Supabase (server-side)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ROLE_KEY
);

/**
 * Expire premium subscriptions past their expiry date
 */
async function expirePremiumSubscriptions() {
  try {
    const now = new Date().toISOString();

    // Fetch all active premium users whose expiry is past
    const { data: expiredUsers, error } = await supabase
      .from("premium")
      .select("*")
      .eq("subscription_status", "active")
      .lt("expires_at", now);

    if (error) throw error;

    if (!expiredUsers || expiredUsers.length === 0) {
      console.log("🕒 No premium subscriptions to expire today");
      return;
    }

    // Update their subscription_status to "expired"
    const { error: updateError } = await supabase
      .from("premium")
      .update({ subscription_status: "expired" })
      .lt("expires_at", now)
      .eq("subscription_status", "active");

    if (updateError) throw updateError;

    console.log(
      `✅ Expired ${expiredUsers.length} premium subscription(s):`,
      expiredUsers.map((u) => u.user_id)
    );
  } catch (err) {
    console.error("❌ Expire Premium Job Error:", err.message || err);
  }
}

// ⏰ Schedule job: run every day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("🕒 Running daily expirePremium cron job...");
  expirePremiumSubscriptions();
});

// 🔥 Optional: run immediately on server start
expirePremiumSubscriptions();
