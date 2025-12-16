import { createServerOnlyFn } from "@tanstack/react-start";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/lib/db/schema";

// For pooling where using node-server
// import { Pool } from "pg";
// import { registerQueryTimeLogging } from "./debug";
// export const getDatabasePooling = createServerOnlyFn((connectionString: string) => {
// const pool = new Pool({
//   connectionString,
//   max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || "2", 10),
// });
// if (process.env.SQL_LOGGING !== undefined) {
//   registerQueryTimeLogging(pool);
// }
// return drizzle({ client: pool, schema, casing: "snake_case" });
// });

export const getDatabase = createServerOnlyFn((connectionString: string) => {
  // For pooling where using node-server
  // return getDatabasePooling(connectionString);

  return drizzle(connectionString, { schema, casing: "snake_case" });
});

export type DB = ReturnType<typeof getDatabase>;
