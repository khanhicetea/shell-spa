import * as app from "./handlers/app";
import * as auth from "./handlers/auth";
import * as todoCategory from "./handlers/todoCategory";
import * as form from "./handlers/form";
import * as todoItem from "./handlers/todoItem";
import * as user from "./handlers/user";

export const rpcRouter = {
  app,
  auth,
  user,
  form,
  todoItem,
  todoCategory,
};
