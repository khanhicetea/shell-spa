import { rpcRouter } from "@/rpc/router";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { BatchLinkPlugin } from "@orpc/client/plugins";
import type { RouterClient } from "@orpc/server";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getServerSession } from "./auth/auth";

export type RPCClient = RouterClient<typeof rpcRouter>;

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(rpcRouter, {
      context: async () => ({
        headers: getRequestHeaders(),
        session: await getServerSession(),
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
