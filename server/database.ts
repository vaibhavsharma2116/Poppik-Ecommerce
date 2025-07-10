import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Use the neon function to create a connection
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);