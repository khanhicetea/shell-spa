import { createServerOnlyFn } from "@tanstack/react-start";
import { getAuthConfig } from "./init";
import { getRequest } from "@tanstack/react-start/server";
import { getDatabase } from "../db/init";
import { getCurrentSession } from "@/env/worker-ctx";

// export const auth = getAuthConfig(getDatabase());

export const getServerSession = createServerOnlyFn(async () => {
  return getCurrentSession();
  // const session = await auth.api.getSession({
  //   headers: getRequest().headers,
  //   query: {
  //     // ensure session is fresh
  //     // https://www.better-auth.com/docs/concepts/session-management#session-caching
  //     disableCookieCache: true,
  //   },
  // });

  // return session;
});
export type AuthSession = Awaited<ReturnType<typeof getServerSession>>;
