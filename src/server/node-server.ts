import type { RequestOptions } from "@tanstack/react-start/server";
import type { ServerEntry } from "@tanstack/react-start/server-entry";
import { env } from "@/env/server";
import { getAuthConfig } from "@/lib/auth/init";
import { getDatabase } from "@/lib/db/init";
import { workerCtx } from "./context";

export function createNodeHandler(serverEntry: ServerEntry) {
  // Singleton DB, Auth
  const db = getDatabase(env.DATABASE_URL);
  const auth = getAuthConfig(db);

  return {
    async fetch(request: Request, opts?: RequestOptions<undefined>) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      const reqCtx = {
        headers: request.headers,
        db,
        auth,
        session,
      };

      return workerCtx.run(reqCtx, async () => {
        try {
          return serverEntry.fetch(request);
        } catch (error) {
          console.error(error);
          return new Response("Node Server Error", { status: 500 });
        }
      });
    },
  };
}
