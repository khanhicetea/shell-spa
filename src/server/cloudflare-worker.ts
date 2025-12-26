import type { ServerEntry } from "@tanstack/react-start/server-entry";
import { getAuthConfig } from "@/lib/auth/init";
import { getDatabase } from "@/lib/db/init";
import { workerCtx } from "./context";

// Uncomment to enable Cloudflare Worker integration
// export type CfRequestContext = {
//   env: Env;
//   waitUntil: (promise: Promise<unknown>) => void;
//   passThroughOnException: () => void;
// };
// declare module "@tanstack/react-start" {
//   interface Register {
//     server: {
//       requestContext: CfRequestContext;
//     };
//   }
// }

export function createCloudflareHandler(serverEntry: ServerEntry) {
  return {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
      const db = getDatabase(env.HYPERDRIVE.connectionString);
      const auth = getAuthConfig(db);
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
          return serverEntry.fetch(request, {
            context: {
              env,
              waitUntil: ctx.waitUntil.bind(ctx),
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
