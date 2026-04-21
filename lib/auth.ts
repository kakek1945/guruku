import { config } from "dotenv";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

config({ path: ".env.local" });
config();

const secret = process.env.BETTER_AUTH_SECRET;

if (!secret) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

export const auth = betterAuth({
  appName: "Guruku",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
