import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import { env } from "./config";

export default {
  schema: "./schema/index.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL || "",
    ssl: true
  },
} satisfies Config;
