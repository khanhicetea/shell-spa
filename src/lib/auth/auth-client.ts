import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  // baseURL: env.VITE_BASE_URL,
});

export default authClient;
