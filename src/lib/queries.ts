import { queryOptions } from "@tanstack/react-query";
import { rpcClient } from "@/lib/orpc";
import type { Outputs } from "@/rpc/types";

export const authQueryOptions = () =>
  queryOptions({
    queryKey: ["user"],
    queryFn: async ({ signal }) => {
      const user = await rpcClient.user.getCurrentUser(
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
    queryKey: ["shell"],
    queryFn: async ({ signal }) => {
      const shellData = await rpcClient.app.shellData(
        {},
        {
          signal,
        },
      );
      return shellData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - shell data doesn't change often
  });

export type AuthQueryResult = Outputs["user"]["getCurrentUser"];
export type ShellQueryResult = Outputs["app"]["shellData"];
