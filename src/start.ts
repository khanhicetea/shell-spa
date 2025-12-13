import { isRedirect } from "@tanstack/react-router";
import { createMiddleware, createStart } from "@tanstack/react-start";

const $catchZodValidator = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    try {
      const result = await next();
      if ("error" in result && isRedirect(result.error)) {
        throw result.error;
      }
      return result;
    } catch (error: any) {
      if ("stack" in error && error.stack.includes("execValidator")) {
        throw new Error(`data:zod/json,${error.message}`);
      } else {
        throw error;
      }
    }
  },
);

export const startInstance = createStart(() => {
  return {
    functionMiddleware: [$catchZodValidator],
  };
});
