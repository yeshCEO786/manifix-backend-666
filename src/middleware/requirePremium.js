// /src/middleware/requirePremium.js

/**
 * Middleware to check if a user has an active premium subscription
 * Usage: import requirePremium from "../middleware/requirePremium.js";
 */

export default async function requirePremium(req, res, next) {
  try {
    // Ensure user info exists (set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required. Please log in first.",
      });
    }

    // Check if user has a premium subscription
    // Assuming your user object has a boolean 'isPremium' or subscription status
    if (!req.user.isPremium) {
      return res.status(403).json({
        error: "Premium access required. Upgrade to premium to continue.",
      });
    }

    // User is premium, proceed
    next();
  } catch (err) {
    console.error("RequirePremium Middleware Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
