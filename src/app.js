import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import stripeRouter from "./routes/stripe.js";
import axios from "axios";

dotenv.config();

const app = express();

/* =========================
   Middleware
========================= */
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(stripeRouter);

/* =========================
   Health Check
========================= */
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

/* =========================
   Chat Route
========================= */
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Message is required" });

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are ManifiX, an emotional supportive AI." },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ reply: "Something went wrong 🤍" });
  }
});

/* =========================
   Other Routes
========================= */
app.use("/api/auth", authRoutes);

/* =========================
   404 Handler
========================= */
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

/* =========================
   Global Error Handler
========================= */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app; 
