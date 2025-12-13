import * as app from "./handlers/app";
import * as form from "./handlers/form";
import * as user from "./handlers/user";

export const rpcRouter = {
  app,
  user,
  form,
};
