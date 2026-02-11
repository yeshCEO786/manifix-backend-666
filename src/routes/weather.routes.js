import express from "express";
import fetch from "node-fetch";
import { env } from "../config/env.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const city = req.query.city || "London";

  const url = `https://api.weatherapi.com/v1/current.json?key=${ENV.WEATHER_KEY}&q=${city}`;

  const response = await fetch(url);
  const data = await response.json();

  res.json(data);
});

export default router;
