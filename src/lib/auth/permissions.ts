import { createAccessControl } from "better-auth/plugins/access";

const ac = createAccessControl({});

export const admin = ac.newRole({
  user: [
    "create",
    "list",
    "get",
    "setRole",
    "ban",
    "impersonate",
    "delete",
    "setPassword",
    "update",
  ],
  session: ["create", "list", "revoke"],
} as any);

export const user = ac.newRole({} as any);

export { ac };
