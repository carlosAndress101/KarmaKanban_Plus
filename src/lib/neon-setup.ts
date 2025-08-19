"use server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    return { success: true, result: result.rows };
  } catch (error) {
    console.error("Database connection failed:", error);
    return { success: false, error };
  }
}

export async function createTasksTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT false
      )
    `);
  } finally {
    client.release();
  }
}

export async function createTask(title: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [title]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}
