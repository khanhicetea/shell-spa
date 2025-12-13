import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { authQueryOptions, shellQueryOptions } from "../queries";

export function useShellData() {
  const { data } = useSuspenseQuery(shellQueryOptions());
  return data;
}

export function useSessionUser() {
  const { data } = useQuery(authQueryOptions());
  return data;
}
