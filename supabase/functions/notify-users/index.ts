import { serve } from "https://deno.land/std/http/server.ts";

serve(async () => {
  try {
    const now = new Date();
    const hour = now.getHours();

    console.log("⏰ Running at:", hour);

    /* ✅ SAFE RESPONSE (NO CRASH) */
    return new Response(
      JSON.stringify({
        success: true,
        hour,
        message: "Backend working ✅",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (err) {
    console.error("❌ ERROR:", err);

    return new Response(
      JSON.stringify({ error: "Function crashed" }),
      { status: 500 }
    );
  }
});
