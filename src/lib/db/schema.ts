import type {
  UserTable,
  SessionTable,
  AccountTable,
  VerificationTable,
} from "./schema/auth";
import type { TodoCategoryTable, TodoItemTable } from "./schema/todo";

export interface Database {
  user: UserTable;
  session: SessionTable;
  account: AccountTable;
  verification: VerificationTable;
  todoCategory: TodoCategoryTable;
  todoItem: TodoItemTable;
}
