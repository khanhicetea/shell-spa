import { createFileRoute } from "@tanstack/react-router";
import { getCurrentAuth } from "@/server/context";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const auth = getCurrentAuth();
        return auth.handler(request);
      },
      POST: ({ request }) => {
        const auth = getCurrentAuth();
        return auth.handler(request);
      },
    },
  },
});
