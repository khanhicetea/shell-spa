import type { ServerEntry } from "@tanstack/react-start/server-entry";
import { getAuthConfig } from "@/lib/auth/init";
import { getDatabase } from "@/lib/db/init";
import { createRepos } from "@/lib/db/repositories";
import { workerCtx } from "./context";

export function createCloudflareHandler(serverEntry: ServerEntry) {
  return {
    // @ts-ignore
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
      const db = getDatabase(env.HYPERDRIVE.connectionString);
      const auth = getAuthConfig(db);
      const repos = createRepos(db);
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      const reqCtx = {
        headers: request.headers,
        db,
        auth,
        session,
        repos,
      };

      return workerCtx.run(reqCtx, async () => {
        try {
          return serverEntry.fetch(request, {
            context: {
              // @ts-ignore
              env,
              // @ts-ignore
              waitUntil: ctx.waitUntil.bind(ctx),
              // @ts-ignore
              passThroughOnException: ctx.passThroughOnException.bind(ctx),
            },
          });
        } catch (error) {
          console.error(error);
          return new Response("Cloudflare Worker Error", { status: 500 });
        }
      });
    },
  };
}
