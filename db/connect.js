import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../schema/index.js";
import { env } from "../config/env.config.js";


// WebSocket is configured automatically by Neon

// Get database URL from environment
const DATABASE_URL = env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

console.log("Initializing database connection...");

// Create pool
const pool = new Pool({ connectionString: DATABASE_URL });

// Create Drizzle instance
export const db = drizzle({ client: pool, schema });

console.log("Database connection initialized.");

export default db;
