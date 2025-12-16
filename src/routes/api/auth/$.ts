import { getCurrentAuth } from "@/server/context";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    // middleware: [betterAuthMiddleware],
    handlers: {
      GET: ({ request, context }) => {
        const auth = getCurrentAuth();
        return auth.handler(request);
      },
      POST: ({ request, context }) => {
        const auth = getCurrentAuth();
        return auth.handler(request);
      },
    },
  },
});
