import express from "express";
import auth from "../middleware/auth.js";
import { pool } from "../server.js";

const router = express.Router();

router.post("/", auth, async (req, res, next) => {
  try {
    const {
      timestamp,
      category,
      domain,
      mode,
      action,
      frictionPercent = null,
      amount = null
    } = req.body || {};

    if (!timestamp || !category || !action) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      "INSERT INTO events (user_id, timestamp, category, domain, mode, action, friction_percent, amount) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
      [req.user.userId, timestamp, category, domain || null, mode || null, action, frictionPercent, amount]
    );

    res.json({ id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

router.get("/dashboard", auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT timestamp, category, action, amount FROM events WHERE user_id=$1 AND timestamp >= NOW() - INTERVAL '7 days' ORDER BY timestamp DESC",
      [req.user.userId]
    );

    const events = result.rows;
    const blocks = events.filter((e) => e.action === "blocked").length;
    const continued = events.filter((e) => e.action === "continued").length;
    const cooldowns = events.filter((e) => e.action === "cooldown").length;
    const estimatedSaved = events
      .filter((e) => e.action === "blocked")
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const lastEvent = events[0] || null;

    res.json({
      stats: {
        blocks,
        continued,
        cooldowns,
        estimatedSaved,
        streakDays: lastEvent ? Math.floor((Date.now() - new Date(lastEvent.timestamp)) / 86400000) : 0
      },
      recent: events.slice(0, 10)
    });
  } catch (err) {
    next(err);
  }
});

export default router;
