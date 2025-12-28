import type { DeleteResult, Insertable, Selectable, Updateable } from "kysely";
import type { DB } from "./init";
import type { Database } from "./schema";

export interface BaseRepository<TTable extends keyof Database> {
  find<T extends {}>(conditions?: Partial<T>): Promise<Selectable<Database[TTable]>[]>;
  findById(id: unknown): Promise<Selectable<Database[TTable]> | undefined>;
  findOne<T extends {}>(
    conditions: Partial<T>,
  ): Promise<Selectable<Database[TTable]> | undefined>;
  findAll(): Promise<Selectable<Database[TTable]>[]>;
  deleteById(id: unknown): Promise<DeleteResult[]>;
  updateById(
    id: unknown,
    data: Updateable<Database[TTable]>,
  ): Promise<Selectable<Database[TTable]> | undefined>;
  insertReturn(
    data: Insertable<Database[TTable]>,
  ): Promise<Selectable<Database[TTable]> | undefined>;
}

export class Repository<TTable extends keyof Database> implements BaseRepository<TTable> {
  constructor(
    protected db: DB,
    protected tableName: TTable,
  ) {}

  async find<T extends {}>(
    conditions?: Partial<T>,
  ): Promise<Selectable<Database[TTable]>[]> {
    let query = this.db.selectFrom(this.tableName as TTable);

    if (conditions && Object.keys(conditions).length > 0) {
      for (const [key, value] of Object.entries(conditions)) {
        query = query.where(key as any, "=", value) as any;
      }
    }

    return query
      .selectAll()
      .execute()
      .then((rows) => rows as Selectable<Database[TTable]>[]);
  }

  async findById(id: unknown): Promise<Selectable<Database[TTable]> | undefined> {
    const row = await this.db
      .selectFrom(this.tableName as any)
      .where("id" as any, "=", id)
      .selectAll()
      .executeTakeFirst();

    return row as Selectable<Database[TTable]> | undefined;
  }

  async findOne<T extends {}>(
    conditions: Partial<T>,
  ): Promise<Selectable<Database[TTable]> | undefined> {
    let query = this.db.selectFrom(this.tableName as any);

    if (conditions && Object.keys(conditions).length > 0) {
      for (const [key, value] of Object.entries(conditions)) {
        query = query.where(key as any, "=", value) as any;
      }
    }

    const row = await query.selectAll().executeTakeFirst();
    return row as Selectable<Database[TTable]> | undefined;
  }

  async findAll(): Promise<Selectable<Database[TTable]>[]> {
    const rows = await this.db
      .selectFrom(this.tableName as any)
      .selectAll()
      .execute();
    return rows as Selectable<Database[TTable]>[];
  }

  async deleteById(id: unknown): Promise<DeleteResult[]> {
    const result = await this.db
      .deleteFrom(this.tableName as any)
      .where("id" as any, "=", id)
      .execute();

    return result;
  }

  async updateById(
    id: unknown,
    data: Updateable<Database[TTable]>,
  ): Promise<Selectable<Database[TTable]> | undefined> {
    const row = await this.db
      .updateTable(this.tableName as any)
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    return row as Selectable<Database[TTable]> | undefined;
  }

  async insertReturn(
    data: Insertable<Database[TTable]>,
  ): Promise<Selectable<Database[TTable]> | undefined> {
    const row = await this.db
      .insertInto(this.tableName as any)
      .values(data)
      .returningAll()
      .executeTakeFirst();

    return row as Selectable<Database[TTable]> | undefined;
  }
}

export class UserRepository extends Repository<"user"> {
  constructor(db: DB) {
    super(db, "user");
  }

  async findByEmail(email: string) {
    return this.findOne({ email });
  }
}

export class TodoCategoryRepository extends Repository<"todoCategory"> {
  constructor(db: DB) {
    super(db, "todoCategory");
  }

  async findByUserId(userId: string) {
    return this.find({ userId });
  }
}

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

export function createRepos(db: DB) {
  return {
    user: new UserRepository(db),
    todoCategory: new TodoCategoryRepository(db),
    todoItem: new TodoItemRepository(db),
  };
}

export type Repositories = ReturnType<typeof createRepos>;
