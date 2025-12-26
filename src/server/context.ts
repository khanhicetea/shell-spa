import { AsyncLocalStorage } from "node:async_hooks";
import type { ServerAuth, ServerAuthSession } from "@/lib/auth/init";
import type { DB } from "@/lib/db/init";

export type RequestContext = {
  headers: Headers;
  auth: ServerAuth;
  session: ServerAuthSession;
  db: DB;
};

// For Async Local Storage
export const workerCtx = new AsyncLocalStorage<RequestContext>();

export function getRequestHeaders() {
  const store = workerCtx.getStore();
  if (!store) throw new Error("No worker context");
  return store.headers;
}

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
