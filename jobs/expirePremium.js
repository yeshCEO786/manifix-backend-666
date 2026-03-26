import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ROLE_KEY
);

// ⏰ Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Running premium expiry job...");

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("premium")
    .update({ subscription_status: "expired" })
    .lt("expires_at", now)
    .eq("subscription_status", "active");

  if (error) {
    console.error("❌ Expiry job failed:", error);
  } else {
    console.log("✅ Expired users updated");
  }
});
