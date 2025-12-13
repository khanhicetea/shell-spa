import { createServerOnlyFn } from "@tanstack/react-start";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/lib/db/schema";
import { registerQueryTimeLogging } from "./debug";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || "2", 10),
});

if (process.env.SQL_LOGGING !== undefined) {
  registerQueryTimeLogging(pool);
}

const getDatabase = createServerOnlyFn(() =>
  drizzle({ client: pool, schema, casing: "snake_case" }),
);

export const db = getDatabase();
