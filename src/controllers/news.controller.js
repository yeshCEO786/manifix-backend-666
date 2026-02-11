import fetch from "node-fetch";
import { env } from "../config/env.js";

export async function newsController(req, res) {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?language=en&apiKey=${env.newsKey}`
    );

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("News error:", error);
    res.status(500).json({ error: "News service failed" });
  }
}
