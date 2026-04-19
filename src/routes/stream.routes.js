import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const message = req.query.message;

    if (!message) {
      return res.status(400).end();
    }

    // ✅ SSE HEADERS
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    // ✅ CALL OPENROUTER WITH STREAM
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // or your model
        stream: true, // 🔥 IMPORTANT
        messages: [
          { role: "user", content: message }
        ],
      }),
    });

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);

      // OpenRouter sends multiple lines
      const lines = chunk.split("\n");

      for (let line of lines) {
        if (!line.startsWith("data:")) continue;

        const data = line.replace("data: ", "").trim();

        if (data === "[DONE]") {
          res.write("data: [DONE]\n\n");
          res.end();
          return;
        }

        try {
          const json = JSON.parse(data);
          const token = json.choices?.[0]?.delta?.content;

          if (token) {
            res.write(`data: ${token}\n\n`);
          }
        } catch (err) {
          // ignore parsing errors
        }
      }
    }

    res.end();

  } catch (err) {
    console.error("STREAM ERROR:", err);

    try {
      res.write(`data: error\n\n`);
      res.end();
    } catch {}
  }
});

export default router;
