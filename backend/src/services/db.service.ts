import type { PgTransaction } from "@/configs/db.config.js";
import db from "@/configs/db.config.js";
import * as schema from "@/schemas/index.schema.js";
import { AppError } from "@/utils/error.util.js";
import { GenerateZodSchemas } from "@/utils/schema.util.js";
import { eq, type InferInsertModel, type InferSelectModel, type SQL } from "drizzle-orm";
import type { PgColumn, PgSelect, PgTable } from "drizzle-orm/pg-core";

type TableNames = {
  [K in keyof typeof schema]: (typeof schema)[K] extends PgTable ? K : never;
}[keyof typeof schema];

type HasDeletedAt<TTable extends PgTable<any>> =
  InferSelectModel<TTable> extends { deleted_at: any } ? true : false;

export type SoftDeletableTables = {
  [K in TableNames]: HasDeletedAt<(typeof schema)[K]> extends true ? K : never;
}[TableNames];

export type HardDeletableTables = {
  [K in TableNames]: HasDeletedAt<(typeof schema)[K]> extends true ? never : K;
}[TableNames];

export const GetRecord = async <
  T extends TableNames,
  TSelection = InferSelectModel<(typeof schema)[T]>
>(tablename: T, options?: {
  select?: (table: (typeof schema)[T]) => any,
  where?: SQL | ((table: (typeof schema)[T]) => SQL | undefined),
  join?: (query: PgSelect) => PgSelect,
  tx?: PgTransaction,
}) => {
  const client = options?.tx || db;
  const table = schema[tablename];

  let query = (options?.select
    ? client.select(options.select(table)).from(table as any)
    : client.select().from(table as any)
  ).$dynamic();

  if (options?.join) query = options.join(query as any) as typeof query;

  if (options?.where) {
    const expr = typeof options.where === "function"
      ? options.where(table)
      : options.where;

    if (expr) query.where(expr);
  }

  const [result] = await query.limit(1);
  return result as TSelection;
};

export const GetRecords = async <
  T extends TableNames,
  TSelection = InferSelectModel<(typeof schema)[T]>
>(tablename: T, options?: {
  select?: (table: (typeof schema)[T]) => any,
  where?: SQL | ((table: (typeof schema)[T]) => SQL | undefined),
  join?: (query: PgSelect) => PgSelect,
  tx?: PgTransaction,
}) => {
  const client = options?.tx || db;
  const table = schema[tablename];

  let query = (options?.select
    ? client.select(options.select(table)).from(table as any)
    : client.select().from(table as any)
  ).$dynamic();

  if (options?.join) query = options.join(query as any) as typeof query;

  if (options?.where) {
    const expr = typeof options.where === "function"
      ? options.where(table)
      : options.where;

    if (expr) query.where(expr);
  }

  const result = await query.limit(1);
  return result as TSelection[];
};

export const CreateRecord = async <T extends TableNames>(
  tablename: T,
  data: InferInsertModel<(typeof schema)[T]>,
  tx?: PgTransaction,
) => {
  const table = schema[tablename];

  const { insert } = GenerateZodSchemas(table);
  const validation = insert.safeParse(data);
  if (!validation.success) throw new AppError(400, "Validation failed.", validation.error);

  let result;

  if (tx) {
    [result] = await tx.insert(table)
      .values(data as any)
      .returning();

    return result;
  } else {
    return await db.transaction(async tx => {
      const [nestedResult] = await tx.insert(table)
        .values(data as any)
        .returning();

      return nestedResult;
    });
  }
};

export const UpdateRecord = async <T extends TableNames>(
  tablename: T,
  id: unknown,
  data: Partial<InferInsertModel<(typeof schema)[T]>>,
  idColumn?: PgColumn,
  tx?: PgTransaction,
) => {
  const rawTable = schema[tablename];
  const column = (idColumn ?? rawTable["id"]) as PgColumn;
  const table = rawTable as PgTable<any>;

  const { update } = GenerateZodSchemas(table);
  const validation = update.safeParse(data);
  if (!validation.success) throw new AppError(400, "Validation failed.", validation.error);

  let result;
  if (tx) {
    [result] = await tx.update(table)
      .set(data as any)
      .where(eq(column, id))
      .returning();

    return result;
  } else {
    return await db.transaction(async tx => {
      const [nestedResult] = await tx.update(table)
        .set(data as any)
        .where(eq(column, id))
        .returning();

      return nestedResult;
    });
  }
};

export const SoftDeleteRecord = async <T extends SoftDeletableTables>(
  tablename: T,
  id: unknown,
  idColumn?: PgColumn,
  tx?: PgTransaction,
) => {
  const rawTable = schema[tablename];
  const column = (idColumn ?? rawTable["id"]) as PgColumn;
  const table = rawTable as PgTable<any>;

  let result;
  if (tx) {
    [result] = await tx.update(table)
      .set({ deleted_at: new Date() } as any)
      .where(eq(column, id))
      .returning();

    return result;
  } else {
    return await db.transaction(async tx => {
      const [nestedResult] = await tx.update(table)
        .set({ deleted_at: new Date() } as any)
        .where(eq(column, id))
        .returning();

      return nestedResult;
    });
  }
};

export const HardDeleteRecord = async <T extends HardDeletableTables>(
  tablename: T,
  id: unknown,
  idColumn?: PgColumn,
  tx?: PgTransaction,
) => {
  const rawTable = schema[tablename];
  const column = (idColumn ?? rawTable["id"]) as PgColumn;
  const table = rawTable as PgTable<any>;

  let result;
  if (tx) {
    [result] = await tx.delete(table)
      .where(eq(column, id))
      .returning();

    return result;
  } else {
    return await db.transaction(async tx => {
      const [nestedResult] = await tx.delete(table)
        .where(eq(column, id))
        .returning();

      return nestedResult;
    });
  }
};
