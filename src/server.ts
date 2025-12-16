import handler from "@tanstack/react-start/server-entry";
import { workerCtx } from "./env/worker-ctx";
import { getDatabase } from "./lib/db/init";
import { getAuthConfig } from "./lib/auth/init";

export type RequestContext = {
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
};
declare module "@tanstack/react-start" {
  interface Register {
    server: {
      requestContext: RequestContext;
    };
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const db = getDatabase(env.HYPERDRIVE.connectionString);
    const auth = getAuthConfig(db);
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const wctx = {
      headers: request.headers,
      db,
      auth,
      session,
    };

    return workerCtx.run(wctx, async () => {
      try {
        return handler.fetch(request, {
          context: {
            env,
            waitUntil: ctx.waitUntil.bind(ctx),
            passThroughOnException: ctx.passThroughOnException.bind(ctx),
          },
        });
      } catch (error) {
        console.error(error);
        return new Response("Internal Server Error", { status: 500 });
      }
    });
  },
};
