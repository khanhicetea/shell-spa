import type { DB } from "../init";
import { Repository } from "./base";

export class TodoItemRepository extends Repository<"todoItem"> {
  constructor(db: DB) {
    super(db, "todoItem");
  }

  async findTodoItemsByUserId(userId: string) {
    const todoCategories = await this.repos.todoCategory.find({ userId });
    console.log({ todoCategories });
    return this.find((qb) =>
      qb.where(
        "categoryId",
        "in",
        todoCategories.map((tc) => tc.id),
      ),
    );
  }
}
