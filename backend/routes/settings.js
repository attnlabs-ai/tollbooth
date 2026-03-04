import express from "express";
import auth from "../middleware/auth.js";
import { pool } from "../server.js";

const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const result = await pool.query("SELECT settings_json FROM settings WHERE user_id=$1", [
      req.user.userId
    ]);
    if (!result.rows[0]) return res.status(404).json({ error: "Settings not found" });
    res.json({ settings: result.rows[0].settings_json });
  } catch (err) {
    next(err);
  }
});

router.put("/", auth, async (req, res, next) => {
  try {
    const settings = req.body?.settings;
    if (!settings) return res.status(400).json({ error: "Settings required" });

    await pool.query(
      "INSERT INTO settings (user_id, settings_json) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET settings_json = EXCLUDED.settings_json",
      [req.user.userId, settings]
    );

    res.json({ settings });
  } catch (err) {
    next(err);
  }
});

export default router;
