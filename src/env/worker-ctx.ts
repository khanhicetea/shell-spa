import type { ServerAuth, ServerAuthSession } from "@/lib/auth/init";
import { DB } from "@/lib/db/init";
import { AsyncLocalStorage } from "node:async_hooks";

export type WorkerContext = {
  headers: Headers;
  auth: ServerAuth;
  session: ServerAuthSession;
  db: DB;
};

export const workerCtx = new AsyncLocalStorage<WorkerContext>();

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
