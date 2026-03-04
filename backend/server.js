import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import authRoutes from "./routes/auth.js";
import settingsRoutes from "./routes/settings.js";
import eventsRoutes from "./routes/events.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "tollbooth-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/events", eventsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.listen(port, () => {
  console.log(`Tollbooth backend listening on ${port}`);
});
