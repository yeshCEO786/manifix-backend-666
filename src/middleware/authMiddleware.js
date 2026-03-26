// /src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import config from "../config/env.js";

/**
 * Middleware to verify JWT token
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token exists and starts with Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided or malformed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token using JWT secret from config
    const decoded = jwt.verify(token, config.security.jwtSecret);
    req.user = decoded; // attach decoded user to request
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(403).json({ message: "Invalid token" });
  }
};
