import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../server.js";

const router = express.Router();

const DEFAULT_SETTINGS = {
  categories: {
    alcohol: true,
    gambling: true,
    shopping: true,
    food_delivery: false,
    nicotine: false,
    gaming: false,
    adult: false,
    supplements: false,
    caffeine: false
  },
  categoryModes: {
    alcohol: "friction",
    gambling: "block",
    shopping: "warn"
  },
  frictionPercent: 100,
  cooldownHours: 24,
  accountabilityEmail: ""
};

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const hashed = await bcrypt.hash(password, 10);
    const userResult = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [email.toLowerCase(), hashed]
    );

    const user = userResult.rows[0];
    await pool.query(
      "INSERT INTO settings (user_id, settings_json) VALUES ($1, $2)",
      [user.id, DEFAULT_SETTINGS]
    );

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "30d"
    });

    res.json({ token, user });
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const userResult = await pool.query("SELECT id, email, password_hash FROM users WHERE email=$1", [
      email.toLowerCase()
    ]);

    const user = userResult.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "30d"
    });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

export default router;
