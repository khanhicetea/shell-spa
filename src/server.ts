import handler from "@tanstack/react-start/server-entry";
// import { createNodeHandler } from "./server/node-server";
import { createCloudflareHandler } from "./server/cloudflare-worker";

export default {
  fetch: createCloudflareHandler(handler).fetch,
  // fetch: createNodeHandler(handler).fetch,
};
