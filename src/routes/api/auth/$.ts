import { betterAuthMiddleware } from "@/lib/middlewares";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    middleware: [betterAuthMiddleware],
    handlers: {
      GET: ({ request, context }) => {
        return context.auth.handler(request);
      },
      POST: ({ request, context }) => {
        return context.auth.handler(request);
      },
    },
  },
});
