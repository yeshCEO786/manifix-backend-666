import { serve } from "https://deno.land/std/http/server.ts";

serve(async () => {
  try {
    const now = new Date();
    const hour = now.getHours();

    console.log("⏰ Running at hour:", hour);

    /* 🔥 FETCH USERS FROM SUPABASE */
    const res = await fetch(
      "https://YOUR_PROJECT_ID.supabase.co/rest/v1/user_preferences",
      {
        headers: {
          apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          Authorization: `Bearer ${Deno.env.get(
            "SUPABASE_SERVICE_ROLE_KEY"
          )}`,
        },
      }
    );

    const users = await res.json();

    for (const user of users) {
      if (!user.push_enabled) continue;

      if (hour >= user.notif_start && hour < user.notif_end) {
        console.log("🔥 Send notification to:", user.user_id);

        /* 🚀 TEMP TEST LOG */
        // later: real push here
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("❌ Error:", err);

    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500 }
    );
  }
});
