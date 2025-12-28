import type {
  DeleteResult,
  DeleteQueryBuilder,
  Insertable,
  Selectable,
  SelectQueryBuilder,
  Updateable,
  UpdateQueryBuilder,
} from "kysely";
import type { DB } from "../init";
import type { Database } from "../schema";
import type { Repositories } from ".";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export type SelectQueryCondition<T> =
  | Partial<T>
  | ((qb: SelectQueryBuilder<DB, any, any>) => SelectQueryBuilder<DB, any, any>);

export type DeleteQueryCondition<T> =
  | Partial<T>
  | ((qb: DeleteQueryBuilder<DB, any, any>) => DeleteQueryBuilder<DB, any, any>);

export type UpdateQueryCondition<T> =
  | Partial<T>
  | ((
      qb: UpdateQueryBuilder<DB, any, any, any>,
    ) => UpdateQueryBuilder<DB, any, any, any>);

export interface BaseRepository<TTable extends keyof Database> {
  find<T extends object>(
    conditions?: SelectQueryCondition<T>,
  ): Promise<Selectable<Database[TTable]>[]>;
  findSelect<T extends object, K extends keyof Selectable<Database[TTable]>>(
    columns: K[],
    conditions?: SelectQueryCondition<T>,
  ): Promise<Pick<Selectable<Database[TTable]>, K>[]>;
  findById(id: unknown): Promise<Selectable<Database[TTable]> | undefined>;
  findByIdOrFail(id: unknown): Promise<Selectable<Database[TTable]>>;
  findOne<T extends object>(
    conditions: SelectQueryCondition<T>,
  ): Promise<Selectable<Database[TTable]> | undefined>;
  findOneOrFail<T extends object>(
    conditions: SelectQueryCondition<T>,
  ): Promise<Selectable<Database[TTable]>>;
  findAll(): Promise<Selectable<Database[TTable]>[]>;
  findPaginated<T extends object>(
    page: number,
    pageSize: number,
    conditions?: SelectQueryCondition<T>,
  ): Promise<{
    items: Selectable<Database[TTable]>[];
    totalCount: number;
    pageCount: number;
    page: number;
    pageSize: number;
  }>;
  count<T extends object>(conditions?: SelectQueryCondition<T>): Promise<number>;
  exists(id: unknown): Promise<boolean>;
  existsBy<T extends object>(conditions: SelectQueryCondition<T>): Promise<boolean>;
  deleteById(id: unknown): Promise<DeleteResult[]>;
  deleteMany<T extends object>(
    conditions: DeleteQueryCondition<T>,
  ): Promise<DeleteResult[]>;
  updateById(
    id: unknown,
    data: Updateable<Database[TTable]>,
  ): Promise<Selectable<Database[TTable]> | undefined>;
  updateMany<T extends object>(
    conditions: UpdateQueryCondition<T>,
    data: Updateable<Database[TTable]>,
  ): Promise<Selectable<Database[TTable]>[]>;
  insertReturn(
    data: Insertable<Database[TTable]>,
  ): Promise<Selectable<Database[TTable]> | undefined>;
  insertMany(
    data: Insertable<Database[TTable]>[],
  ): Promise<Selectable<Database[TTable]>[]>;
  upsert(
    data: Insertable<Database[TTable]>,
    conflictColumns: (keyof Selectable<Database[TTable]>)[],
    updateData?: Partial<Insertable<Database[TTable]>>,
  ): Promise<Selectable<Database[TTable]> | undefined>;
}

export class Repository<TTable extends keyof Database> implements BaseRepository<TTable> {
  protected _repos: Repositories | null = null;

  constructor(
    protected db: DB,
    protected tableName: TTable,
  ) {}

  /**
   * Set the repos reference for cross-repository access.
   * Called by createRepos after all repositories are instantiated.
   */
  setRepos(repos: Repositories): void {
    this._repos = repos;
  }

  /**
   * Access other repositories. Throws if repos not yet initialized.
   */
  protected get repos(): Repositories {
    if (!this._repos) {
      throw new Error("Repos not initialized. Make sure createRepos() was called.");
    }
    return this._repos;
  }

  protected applyConditions<T>(
    query: any,
    conditions?:
      | SelectQueryCondition<T>
      | DeleteQueryCondition<T>
      | UpdateQueryCondition<T>,
  ): any {
    if (!conditions) return query;

    if (typeof conditions === "function") {
      return conditions(query);
    }

    if (Object.keys(conditions).length > 0) {
      for (const [key, value] of Object.entries(conditions)) {
        query = query.where(key as any, "=", value);
      }
    }

    return query;
  }

  async find<T extends object>(
    conditions?: SelectQueryCondition<T>,
  ): Promise<Selectable<Database[TTable]>[]> {
    let query = this.db.selectFrom(this.tableName as TTable);
    query = this.applyConditions(query, conditions);

    return query
      .selectAll()
      .execute()
      .then((rows) => rows as Selectable<Database[TTable]>[]);
  }

  async findSelect<T extends object, K extends keyof Selectable<Database[TTable]>>(
    columns: K[],
    conditions?: SelectQueryCondition<T>,
  ): Promise<Pick<Selectable<Database[TTable]>, K>[]> {
    let query = this.db.selectFrom(this.tableName as TTable);
    query = this.applyConditions(query, conditions);

    const rows = await (query as any).select(columns).execute();
    return rows as Pick<Selectable<Database[TTable]>, K>[];
  }

  async findById(id: unknown): Promise<Selectable<Database[TTable]> | undefined> {
    const row = await this.db
      .selectFrom(this.tableName as any)
      .where("id" as any, "=", id)
      .selectAll()
      .executeTakeFirst();

    return row as Selectable<Database[TTable]> | undefined;
  }

  async findByIdOrFail(id: unknown): Promise<Selectable<Database[TTable]>> {
    const record = await this.findById(id);
    if (!record) {
      throw new NotFoundError(
        `${String(this.tableName)} with id ${String(id)} not found`,
      );
    }
    return record;
  }

  async findOne<T extends object>(
    conditions: SelectQueryCondition<T>,
  ): Promise<Selectable<Database[TTable]> | undefined> {
    let query = this.db.selectFrom(this.tableName as any);
    query = this.applyConditions(query, conditions);

    const row = await query.selectAll().executeTakeFirst();
    return row as Selectable<Database[TTable]> | undefined;
  }

  async findOneOrFail<T extends object>(
    conditions: SelectQueryCondition<T>,
  ): Promise<Selectable<Database[TTable]>> {
    const record = await this.findOne(conditions);
    if (!record) {
      throw new NotFoundError(`${String(this.tableName)} record not found`);
    }
    return record;
  }

  async findAll(): Promise<Selectable<Database[TTable]>[]> {
    const rows = await this.db
      .selectFrom(this.tableName as any)
      .selectAll()
      .execute();
    return rows as Selectable<Database[TTable]>[];
  }

  async findPaginated<T extends object>(
    page: number,
    pageSize: number,
    conditions?: SelectQueryCondition<T>,
  ): Promise<{
    items: Selectable<Database[TTable]>[];
    totalCount: number;
    pageCount: number;
    page: number;
    pageSize: number;
  }> {
    const offset = (page - 1) * pageSize;

    let query = this.db.selectFrom(this.tableName as any);
    query = this.applyConditions(query, conditions);

    const [items, totalCount] = await Promise.all([
      query
        .selectAll()
        .limit(pageSize)
        .offset(offset)
        .execute()
        .then((rows) => rows as Selectable<Database[TTable]>[]),
      this.count(conditions),
    ]);

    const pageCount = Math.ceil(totalCount / pageSize);

    return {
      items,
      totalCount,
      pageCount,
      page,
      pageSize,
    };
  }

  async count<T extends object>(conditions?: SelectQueryCondition<T>): Promise<number> {
    let query = this.db
      .selectFrom(this.tableName as any)
      .select((eb) => eb.fn.count<number>("id").as("count"));
    query = this.applyConditions(query, conditions);

    const result = await query.executeTakeFirst();
    return Number(result?.count) ?? 0;
  }

  async exists(id: unknown): Promise<boolean> {
    const row = await this.db
      .selectFrom(this.tableName as any)
      .select(this.db.fn<number>("1").as("exists"))
      .where("id" as any, "=", id)
      .limit(1)
      .executeTakeFirst();

    return !!row;
  }

  async existsBy<T extends object>(
    conditions: SelectQueryCondition<T>,
  ): Promise<boolean> {
    let query = this.db.selectFrom(this.tableName as any);
    query = this.applyConditions(query, conditions);

    const row = await query
      .select(this.db.fn<number>("1").as("exists"))
      .limit(1)
      .executeTakeFirst();

    return !!row;
  }

  async deleteById(id: unknown): Promise<DeleteResult[]> {
    const result = await this.db
      .deleteFrom(this.tableName as any)
      .where("id" as any, "=", id)
      .execute();

    return result;
  }

  async deleteMany<T extends object>(
    conditions: DeleteQueryCondition<T>,
  ): Promise<DeleteResult[]> {
    let query = this.db.deleteFrom(this.tableName as any);
    query = this.applyConditions(query, conditions);

    return query.execute();
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

  async updateMany<T extends object>(
    conditions: UpdateQueryCondition<T>,
    data: Updateable<Database[TTable]>,
  ): Promise<Selectable<Database[TTable]>[]> {
    let query = this.db.updateTable(this.tableName as any).set(data);
    query = this.applyConditions(query, conditions);

    const rows = await query.returningAll().execute();
    return rows as Selectable<Database[TTable]>[];
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

  async insertMany(
    data: Insertable<Database[TTable]>[],
  ): Promise<Selectable<Database[TTable]>[]> {
    const rows = await this.db
      .insertInto(this.tableName as any)
      .values(data)
      .returningAll()
      .execute();

    return rows as Selectable<Database[TTable]>[];
  }

  async upsert(
    data: Insertable<Database[TTable]>,
    conflictColumns: (keyof Selectable<Database[TTable]>)[],
    updateData?: Partial<Insertable<Database[TTable]>>,
  ): Promise<Selectable<Database[TTable]> | undefined> {
    const dataToUpdate = updateData ?? data;

    const row = await this.db
      .insertInto(this.tableName as any)
      .values(data)
      .onConflict((oc) =>
        oc.columns(conflictColumns as any).doUpdateSet(dataToUpdate as any),
      )
      .returningAll()
      .executeTakeFirst();

    return row as Selectable<Database[TTable]> | undefined;
  }
}
