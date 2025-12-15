// src/start.ts
import { createMiddleware, createStart } from "@tanstack/react-start";

const myGlobalMiddleware = createMiddleware().server(async (ctx) => {
  return ctx.next({
    context: {
      abc: 123,
    },
  });
});

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [myGlobalMiddleware],
  };
});
