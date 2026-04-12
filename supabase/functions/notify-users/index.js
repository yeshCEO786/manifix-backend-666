import { serve } from "https://deno.land/std/http/server.ts";

serve(async () => {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Function is now properly connected 🚀",
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
});
