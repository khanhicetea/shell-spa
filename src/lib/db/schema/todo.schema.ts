import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const todoCategory = pgTable(
  "todo_category",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("todoCategory_userId_idx").on(table.userId)],
);

export const todoItem = pgTable(
  "todo_item",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => todoCategory.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("todoItem_userId_idx").on(table.userId),
    index("todoItem_categoryId_idx").on(table.categoryId),
  ],
);

export const todoCategoryRelations = relations(todoCategory, ({ one, many }) => ({
  user: one(user, {
    fields: [todoCategory.userId],
    references: [user.id],
  }),
  todoItems: many(todoItem),
}));

export const todoItemRelations = relations(todoItem, ({ one }) => ({
  user: one(user, {
    fields: [todoItem.userId],
    references: [user.id],
  }),
  todoCategory: one(todoCategory, {
    fields: [todoItem.categoryId],
    references: [todoCategory.id],
  }),
}));
