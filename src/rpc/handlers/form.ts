import * as z from "zod";
import { baseProcedure } from "../base";
import { env } from "cloudflare:workers";
import { Client } from "pg";

export const hello = baseProcedure
  .input(
    z.object({
      name: z.string().min(2).max(100),
      email: z.email(),
    }),
  )
  .handler(async ({ input }) => {
    const connectionString = env.HYPERDRIVE.connectionString;
    const d = new Client({ connectionString });
    await d.connect();
    const result = await d.query("SELECT * FROM todo_item");
    await d.end();
    return {
      message: `Hello ${input.name}, your email is ${input.email}!`,
      cs: connectionString,
      rows: result.rows,
    };
  });
