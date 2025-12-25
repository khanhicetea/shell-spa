import { queryOptions } from "@tanstack/react-query";
import { rpcClient } from "@/lib/orpc";
import type { Outputs } from "@/rpc/types";

export const QUERY_KEYS = {
  shell: ["shell"] as const,
  auth: ["user"] as const,
} as const;

export const authQueryOptions = () =>
  queryOptions({
    queryKey: QUERY_KEYS.auth,
    queryFn: async ({ signal }) => {
      const user = await rpcClient.auth.getCurrentUser(
        {},
        {
          signal,
        },
      );
      return user;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  });

export const shellQueryOptions = () =>
  queryOptions({
    queryKey: QUERY_KEYS.shell,
    queryFn: async ({ signal }) => {
      const shellData = await rpcClient.app.shellData(
        {},
        {
          signal,
        },
      );
      return shellData;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export type AuthQueryResult = Outputs["auth"]["getCurrentUser"];
export type ShellQueryResult = Outputs["app"]["shellData"];
