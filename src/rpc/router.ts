import * as app from "./handlers/app";
import * as auth from "./handlers/auth";
import * as category from "./handlers/category";
import * as form from "./handlers/form";
import * as todo from "./handlers/todo";
import * as user from "./handlers/user";

export const rpcRouter = {
  app,
  auth,
  user,
  form,
  todo,
  category,
};
