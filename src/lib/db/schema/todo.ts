import type { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";

export interface TodoCategoryTable {
  id: Generated<string>;
  userId: string;
  name: string;
  createdAt: ColumnType<Date, Date | undefined, never>;
  updatedAt: Date;
}

export type TodoCategory = Selectable<TodoCategoryTable>;
export type TodoCategoryInsert = Insertable<TodoCategoryTable>;
export type TodoCategoryUpdate = Updateable<TodoCategoryTable>;

export interface TodoItemTable {
  id: Generated<string>;
  userId: string;
  categoryId: string;
  content: string;
  completedAt: Date | null;
  createdAt: ColumnType<Date, Date | undefined, never>;
  updatedAt: Date;
}

export type TodoItem = Selectable<TodoItemTable>;
export type TodoItemInsert = Insertable<TodoItemTable>;
export type TodoItemUpdate = Updateable<TodoItemTable>;
