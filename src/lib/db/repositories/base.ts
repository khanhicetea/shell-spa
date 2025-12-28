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

export type SelectQueryCondition<T> =
  | Partial<T>
  | ((
      qb: SelectQueryBuilder<DB, any, any>,
    ) => SelectQueryBuilder<DB, any, any>);

export type DeleteQueryCondition<T> =
  | Partial<T>
  | ((
      qb: DeleteQueryBuilder<DB, any, any>,
    ) => DeleteQueryBuilder<DB, any, any>);

export type UpdateQueryCondition<T> =
  | Partial<T>
  | ((
      qb: UpdateQueryBuilder<DB, any, any, any>,
    ) => UpdateQueryBuilder<DB, any, any, any>);

export interface BaseRepository<TTable extends keyof Database> {
  find<T extends {}>(
    conditions?: SelectQueryCondition<T>,
  ): Promise<Selectable<Database[TTable]>[]>;
  findById(id: unknown): Promise<Selectable<Database[TTable]> | undefined>;
  findOne<T extends {}>(
    conditions: SelectQueryCondition<T>,
  ): Promise<Selectable<Database[TTable]> | undefined>;
  findAll(): Promise<Selectable<Database[TTable]>[]>;
  findPaginated<T extends {}>(
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
  count<T extends {}>(conditions?: SelectQueryCondition<T>): Promise<number>;
  exists(id: unknown): Promise<boolean>;
  existsBy<T extends {}>(conditions: SelectQueryCondition<T>): Promise<boolean>;
  deleteById(id: unknown): Promise<DeleteResult[]>;
  deleteMany<T extends {}>(
    conditions: DeleteQueryCondition<T>,
  ): Promise<DeleteResult[]>;
  updateById(
    id: unknown,
    data: Updateable<Database[TTable]>,
  ): Promise<Selectable<Database[TTable]> | undefined>;
  updateMany<T extends {}>(
    conditions: UpdateQueryCondition<T>,
    data: Updateable<Database[TTable]>,
  ): Promise<Selectable<Database[TTable]>[]>;
  insertReturn(
    data: Insertable<Database[TTable]>,
  ): Promise<Selectable<Database[TTable]> | undefined>;
  insertMany(
    data: Insertable<Database[TTable]>[],
  ): Promise<Selectable<Database[TTable]>[]>;
}

export class Repository<TTable extends keyof Database>
  implements BaseRepository<TTable>
{
  constructor(
    protected db: DB,
    protected tableName: TTable,
  ) {}

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

  async find<T extends {}>(
    conditions?: SelectQueryCondition<T>,
  ): Promise<Selectable<Database[TTable]>[]> {
    let query = this.db.selectFrom(this.tableName as TTable);
    query = this.applyConditions(query, conditions);

    return query
      .selectAll()
      .execute()
      .then((rows) => rows as Selectable<Database[TTable]>[]);
  }

  async findById(
    id: unknown,
  ): Promise<Selectable<Database[TTable]> | undefined> {
    const row = await this.db
      .selectFrom(this.tableName as any)
      .where("id" as any, "=", id)
      .selectAll()
      .executeTakeFirst();

    return row as Selectable<Database[TTable]> | undefined;
  }

  async findOne<T extends {}>(
    conditions: SelectQueryCondition<T>,
  ): Promise<Selectable<Database[TTable]> | undefined> {
    let query = this.db.selectFrom(this.tableName as any);
    query = this.applyConditions(query, conditions);

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

  async findPaginated<T extends {}>(
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
    const [items, totalCount] = await Promise.all([
      this.find(conditions),
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

  async count<T extends {}>(
    conditions?: SelectQueryCondition<T>,
  ): Promise<number> {
    let query = this.db
      .selectFrom(this.tableName as any)
      .select((eb) => eb.fn.count<number>("id").as("count"));
    query = this.applyConditions(query, conditions);

    const [{ count }] = await query.execute();
    return Number(count) ?? 0;
  }

  async exists(id: unknown): Promise<boolean> {
    const [{ count }] = await this.db
      .selectFrom(this.tableName as any)
      .select((eb) => eb.fn.count<number>("id").as("count"))
      .where("id" as any, "=", id)
      .execute();

    return (Number(count) ?? 0) > 0;
  }

  async existsBy<T extends {}>(
    conditions: SelectQueryCondition<T>,
  ): Promise<boolean> {
    const count = await this.count(conditions);
    return count > 0;
  }

  async deleteById(id: unknown): Promise<DeleteResult[]> {
    const result = await this.db
      .deleteFrom(this.tableName as any)
      .where("id" as any, "=", id)
      .execute();

    return result;
  }

  async deleteMany<T extends {}>(
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

  async updateMany<T extends {}>(
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
}
