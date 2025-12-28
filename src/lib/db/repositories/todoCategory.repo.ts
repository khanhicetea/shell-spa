import type { DB } from "../init";
import { Repository } from "./base";

export class TodoCategoryRepository extends Repository<"todoCategory"> {
  constructor(db: DB) {
    super(db, "todoCategory");
  }
}
