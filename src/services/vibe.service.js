// src/services/vibe.service.js
const db = require("./db.service.js"); // your existing db service

// Create vibe
exports.createVibe = async ({ userId, text, privacy, font, music }) => {
  const sql = `
    INSERT INTO vibes (user_id, text, privacy, font, music, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;
  const result = await db.query(sql, [userId, text, privacy, font, music]);
  return {
    id: result.insertId,
    user_id: userId,
    text,
    privacy,
    font,
    music,
    created_at: new Date(),
  };
};

// Get vibes by user
exports.getVibesByUser = async (userId) => {
  const sql = `SELECT * FROM vibes WHERE user_id = ? ORDER BY created_at DESC`;
  const rows = await db.query(sql, [userId]);
  return rows;
};

// Search public vibes
exports.searchPublicVibes = async (query) => {
  const sql = `
    SELECT v.*, u.name AS user_name
    FROM vibes v
    JOIN users u ON v.user_id = u.id
    WHERE v.privacy = 'public' AND (u.name LIKE ? OR u.email LIKE ?)
    ORDER BY v.created_at DESC
  `;
  const rows = await db.query(sql, [`%${query}%`, `%${query}%`]);
  return rows;
};