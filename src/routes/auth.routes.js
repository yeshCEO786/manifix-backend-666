import express from "express";
import { generateToken } from "../services/authService.js";

const router = express.Router();

// Example login route
router.post("/login", async (req, res) => {
  const { email } = req.body;

  // Normally you verify user from Supabase here
  const user = {
    id: "12345",
    email: email
  };

  const token = generateToken(user);

  res.json({
    message: "Login successful",
    token
  });
});

export default router;
