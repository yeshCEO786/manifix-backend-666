// src/app.js
import express from "express";
import cors from "cors";
import path from "path";

// Routes
import chatRouter from "./routes/chat.routes.js";
import weatherRouter from "./routes/weather.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();

/* ======================
   Middleware
====================== */
app.use(cors());
app.use(express.json());

/* ======================
   Static files (uploads)
====================== */
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "src/uploads"))
);

/* ======================
   API Routes
====================== */
app.use("/api", chatRouter);              // POST /api/chat
app.use("/api/weather", weatherRouter);   // GET /api/weather
app.use("/api", uploadRoutes);            // POST /api/upload

/* ======================
   Health check
====================== */
app.get("/", (req, res) => {
  res.send("🚀 ManifiX backend is running");
});

export default app;
