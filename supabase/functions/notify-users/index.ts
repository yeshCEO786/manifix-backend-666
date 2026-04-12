import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  return new Response(
    JSON.stringify({ success: true, message: "Function working 🚀" }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
});
