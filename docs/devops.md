## JS runtimes:
- NodeJS 24+ runtime : use copy `vite.config.node.ts` into `vite.config.ts` (can use vite^8)
- Cloudflare Worker runtime : use copy `vite.config.cf.ts` into `vite.config.ts` (use vite^7.3 for compatibility)

**Important** : modify `src/server.ts` to use `createCloudflareHandler` or `createNodeHandler`, and dive into the code for modify the how `RequestContext` is created, and passing global variables into a `AsyncLocalStorage` instance in `src/server/context.ts`
