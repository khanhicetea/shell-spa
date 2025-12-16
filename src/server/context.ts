import { getAuthConfig, type ServerAuth, type ServerAuthSession } from "@/lib/auth/init";
import { getDatabase, type DB } from "@/lib/db/init";
import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContext = {
  headers: Headers;
  auth: ServerAuth;
  session: ServerAuthSession;
  db: DB;
};

// For Cloudflare Workers
export const workerCtx = new AsyncLocalStorage<RequestContext>();

export function getCurrentDB() {
  const store = workerCtx.getStore();
  if (!store) throw new Error("No worker context");
  return store.db;
}

export function getCurrentAuth() {
  const store = workerCtx.getStore();
  if (!store) throw new Error("No worker context");
  return store.auth;
}

export function getCurrentSession() {
  const store = workerCtx.getStore();
  if (!store) throw new Error("No worker context");
  return store.session;
}
