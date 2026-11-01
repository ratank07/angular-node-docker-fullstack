
const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "appdb",
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD,
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.get("/developers", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, role FROM developers ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Could not fetch developers:", error.message);
    res.status(500).json({ error: "Failed to fetch developers" });
  }
});

app.post("/developers", async (req, res) => {
  const { name, role } = req.body;

  if (
    typeof name !== "string" ||
    typeof role !== "string" ||
    !name.trim() ||
    !role.trim()
  ) {
    return res.status(400).json({
      error: "Name and role are required",
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO developers (name, role) VALUES ($1, $2) RETURNING id, name, role",
      [name.trim(), role.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Could not create developer:", error.message);
    res.status(500).json({ error: "Failed to create developer" });
  }
});

async function start() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS developers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(100) NOT NULL
    )
  `);

  app.listen(port, "0.0.0.0", () => {
    console.log(`API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error("API startup failed:", error);
  process.exit(1);
});
