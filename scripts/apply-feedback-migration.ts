import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

async function applyMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await pool.query(`
      ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "developer_feedback" text;
    `);
  } catch (error) {
    console.error("Error applying migration:", error);
  } finally {
    await pool.end();
  }
}

applyMigration();
