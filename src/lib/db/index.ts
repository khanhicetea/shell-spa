import { createServerOnlyFn } from "@tanstack/react-start";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/env/server";
import * as schema from "@/lib/db/schema";
import { registerQueryTimeLogging } from "./debug";

const getDatabase = createServerOnlyFn(() => {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || "2", 10),
  });

  if (process.env.SQL_LOGGING !== undefined) {
    registerQueryTimeLogging(pool);
  }

  return drizzle({ client: pool, schema, casing: "snake_case" });
});

export const db = getDatabase();
