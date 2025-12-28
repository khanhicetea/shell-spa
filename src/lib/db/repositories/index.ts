import type { DB } from "../init";
import { UserRepository } from "./user.repo";
import { TodoCategoryRepository } from "./todoCategory.repo";
import { TodoItemRepository } from "./todoItem.repo";

export type Repositories = ReturnType<typeof createRepos>;

export function createRepos(db: DB) {
  const repos = {
    user: new UserRepository(db),
    todoCategory: new TodoCategoryRepository(db),
    todoItem: new TodoItemRepository(db),
  };

  // Inject repos reference into each repository for cross-repository access
  Object.values(repos).forEach((repo) => {
    repo.setRepos(repos);
  });

  return repos;
}

export { UserRepository } from "./user.repo";
export { TodoCategoryRepository } from "./todoCategory.repo";
export { TodoItemRepository } from "./todoItem.repo";
export {
  NotFoundError,
  type BaseRepository,
  type SelectQueryCondition,
  type DeleteQueryCondition,
  type UpdateQueryCondition,
} from "./base";
export { Repository } from "./base";
