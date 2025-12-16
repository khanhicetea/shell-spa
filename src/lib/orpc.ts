import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { BatchLinkPlugin } from "@orpc/client/plugins";
import type { RouterClient } from "@orpc/server";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { rpcRouter } from "@/rpc/router";
import {
  getCurrentAuth,
  getCurrentDB,
  getCurrentSession,
  getRequestHeaders,
} from "@/server/context";

export type RPCClient = RouterClient<typeof rpcRouter>;

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(rpcRouter, {
      context: async () => ({
        headers: getRequestHeaders(),
        db: getCurrentDB(),
        session: getCurrentSession(),
        auth: getCurrentAuth(),
      }),
    }),
  )
  .client((): RPCClient => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
      plugins: [
        new BatchLinkPlugin({
          mode: "buffered",
          groups: [
            {
              condition: (_options) => true,
              context: {},
            },
          ],
        }),
      ],
    });

    return createORPCClient(link);
  });

export const rpcClient: RPCClient = getORPCClient();
export const orpc = createTanstackQueryUtils(rpcClient);
