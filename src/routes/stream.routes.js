import express from "express";
import fetch from "node-fetch";
import env from "../config/env.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { message } = req.query;

  if (!message) {
    return res.status(400).end();
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.ai.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.ai.model,
          messages: [{ role: "user", content: message }],
          stream: true,
        }),
      }
    );

    response.body.on("data", (chunk) => {
      const lines = chunk.toString().split("\n");

      for (let line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.replace("data: ", "");

          if (data === "[DONE]") {
            res.write(`data: [DONE]\n\n`);
            res.end();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              res.write(`data: ${content}\n\n`);
            }
          } catch {}
        }
      }
    });

  } catch (err) {
    console.error(err);
    res.end();
  }
});

export default router;
