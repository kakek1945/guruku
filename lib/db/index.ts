import { config } from "dotenv";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/lib/db/schema";

config({ path: ".env.local" });
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

function shouldUseSsl(databaseUrl: string) {
  return !/localhost|127\.0\.0\.1/i.test(databaseUrl);
}

declare global {
  // eslint-disable-next-line no-var
  var __gurukuPool: Pool | undefined;
}

const pool =
  global.__gurukuPool ??
  new Pool({
    connectionString,
    ...(shouldUseSsl(connectionString)
      ? {
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : {}),
  });

if (process.env.NODE_ENV !== "production") {
  global.__gurukuPool = pool;
}

export const db = drizzle(pool, { schema });
export { pool };
