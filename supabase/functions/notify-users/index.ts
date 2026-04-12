import { serve } from "https://deno.land/std/http/server.ts";

serve(async () => {
  const now = new Date();
  const hour = now.getHours();

  // 🔥 Fetch users
  const res = await fetch("YOUR_SUPABASE_REST_URL/user_preferences");
  const users = await res.json();

  for (const user of users) {
    if (!user.push_enabled) continue;

    if (hour >= user.notif_start && hour < user.notif_end) {
      console.log("Send notification to:", user.user_id);

      // 👉 call push logic here
    }
  }

  return new Response("done");
});
