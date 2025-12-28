import type { DB } from "../init";
import { Repository } from "./base";

export class TodoItemRepository extends Repository<"todoItem"> {
  constructor(db: DB) {
    super(db, "todoItem");
  }

  async findByUserId(userId: string) {
    return this.find({ userId });
  }

  async findByCategoryId(categoryId: string) {
    return this.find({ categoryId });
  }
}
