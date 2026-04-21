import { config } from "dotenv";

import type { Config } from "drizzle-kit";

config({ path: ".env.local" });
config();

const migrationDatabaseUrl = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;

if (!migrationDatabaseUrl) {
  throw new Error("MIGRATION_DATABASE_URL or DATABASE_URL is not set");
}

export default {
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationDatabaseUrl,
  },
  verbose: true,
  strict: true,
} satisfies Config;
