// routes/feedback.routes.js
import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

router.post("/", async (req, res) => {
  try {
    const { user_id, message, rating } = req.body;

    const { error } = await supabase
      .from("user_feedback")
      .insert([{ user_id, message, rating }]);

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

export default router;
