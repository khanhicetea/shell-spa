import { createServerOnlyFn } from "@tanstack/react-start";
import { drizzle } from "drizzle-orm/node-postgres";
// import { env } from "@/env/server";
import * as schema from "@/lib/db/schema";
// import { env } from "cloudflare:workers";

export const getDatabase = createServerOnlyFn((connectionString: string) => {
  // const pool = new Pool({
  //   connectionString: env.DATABASE_URL,
  //   max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || "2", 10),
  // });
  // if (process.env.SQL_LOGGING !== undefined) {
  //   registerQueryTimeLogging(pool);
  // }
  // return drizzle({ client: pool, schema, casing: "snake_case" });
  // const connectionString = env.HYPERDRIVE.connectionString;
  // const connectionString = env.DATABASE_URL;
  console.log({ connectionString });
  return drizzle(connectionString, { schema, casing: "snake_case" });
});

export type DB = ReturnType<typeof getDatabase>;
