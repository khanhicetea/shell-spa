import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac, admin, user } from "./permissions";

const authClient = createAuthClient({
  // baseURL: env.VITE_BASE_URL,
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        user,
      },
    }),
  ],
});

export default authClient;
