"use server";
import { neon } from "@neondatabase/serverless";

export async function testConnection() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const result = await sql`SELECT NOW()`;
    return { success: true, result };
  } catch (error) {
    console.error("Database connection failed:", error);
    return { success: false, error };
  }
}

export async function createTasksTable() {
  const sql = neon(process.env.DATABASE_URL!);

  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT false
    )
  `;
}

export async function createTask(title: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const result = await sql`
    INSERT INTO tasks (title) VALUES (${title}) RETURNING *
  `;
  return result;
}
