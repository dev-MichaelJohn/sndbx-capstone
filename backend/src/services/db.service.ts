import type { PgTransaction } from "@/configs/db.config.js";
import db from "@/configs/db.config.js";
import * as schema from "@/schemas/index.schema.js";
import { AppError } from "@/utils/error.util.js";
import { GenerateZodSchemas } from "@/utils/schema.util.js";
import { eq, type InferInsertModel, type InferSelectModel, type SQL } from "drizzle-orm";
import type { PgColumn, PgSelect, PgTable } from "drizzle-orm/pg-core";

/**
 * Generic helpers for querying and mutating any table defined in the schema,
 * so route/service code doesn't need to hand-write Drizzle queries for
 * common CRUD operations. `T` is constrained to keys of `schema` that are
 * actual Postgres tables (as opposed to relations, enums, etc.).
 */
export type TableNames = {
  [K in keyof typeof schema]: (typeof schema)[K] extends PgTable ? K : never;
}[keyof typeof schema];

/** True if a table's select model includes a `deleted_at` column (i.e. supports soft-delete). */
type HasDeletedAt<TTable extends PgTable<any>> =
  InferSelectModel<TTable> extends { deleted_at: any } ? true : false;

/** Tables that have a `deleted_at` column and can be soft-deleted. */
export type SoftDeletableTables = {
  [K in TableNames]: HasDeletedAt<(typeof schema)[K]> extends true ? K : never;
}[TableNames];

/** Tables without a `deleted_at` column, which must be hard-deleted instead. */
export type HardDeletableTables = {
  [K in TableNames]: HasDeletedAt<(typeof schema)[K]> extends true ? never : K;
}[TableNames];

// wherever your shared types live, e.g. types/drizzle-helpers.ts
export type PartialInsert<T> = {
  [K in keyof T]?: T[K] | undefined;
};
/**
 * Fetches a single row from the given table, optionally with a custom
 * column selection, join, and/or where clause. Returns `undefined` if no
 * row matches.
 *
 * @param tablename - the table to query, by schema key
 * @param options.select - narrow the returned columns; defaults to all columns
 * @param options.where - filter condition, either a SQL expression or a
 *   function receiving the table for building one (needed when the
 *   condition depends on a joined table)
 * @param options.join - attach a join to the underlying query before the
 *   where clause is applied
 * @param options.tx - run within an existing transaction instead of the
 *   default `db` client
 * @returns the first matching row, typed as `TSelection` (defaults to the
 *   table's full row shape, or override the generic when using `select`/`join`)
 */
export const GetRecord = async <
  T extends TableNames,
  TSelection = InferSelectModel<(typeof schema)[T]>,
>(
  tablename: T,
  options?: {
    select?: (table: (typeof schema)[T]) => any;
    where?: SQL | ((table: (typeof schema)[T]) => SQL | undefined);
    join?: (query: PgSelect) => PgSelect;
    tx?: PgTransaction;
  },
) => {
  const client = options?.tx || db;
  const table = schema[tablename];

  let query = (
    options?.select
      ? client.select(options.select(table)).from(table as any)
      : client.select().from(table as any)
  ).$dynamic();

  if (options?.join) query = options.join(query as any) as typeof query;

  if (options?.where) {
    const expr = typeof options.where === "function" ? options.where(table) : options.where;

    if (expr) query.where(expr);
  }

  const [result] = await query.limit(1);
  return result as TSelection;
};

/**
 * Same as {@link GetRecord}, but returns all matching rows instead of just
 * the first one.
 *
 * @param tablename - the table to query, by schema key
 * @param options.select - narrow the returned columns; defaults to all columns
 * @param options.where - filter condition, either a SQL expression or a
 *   function receiving the table for building one
 * @param options.join - attach a join to the underlying query before the
 *   where clause is applied
 * @param options.tx - run within an existing transaction instead of the
 *   default `db` client
 * @returns an array of matching rows, typed as `TSelection[]`
 */
export const GetRecords = async <
  T extends TableNames,
  TSelection = InferSelectModel<(typeof schema)[T]>,
>(
  tablename: T,
  options?: {
    select?: (table: (typeof schema)[T]) => any;
    where?: SQL | ((table: (typeof schema)[T]) => SQL | undefined);
    join?: (query: PgSelect) => PgSelect;
    tx?: PgTransaction;
  },
) => {
  const client = options?.tx || db;
  const table = schema[tablename];

  let query = (
    options?.select
      ? client.select(options.select(table)).from(table as any)
      : client.select().from(table as any)
  ).$dynamic();

  if (options?.join) query = options.join(query as any) as typeof query;

  if (options?.where) {
    const expr = typeof options.where === "function" ? options.where(table) : options.where;

    if (expr) query = query.where(expr) as typeof query;
  }

  const result = await query;
  return result as TSelection[];
};

/**
 * Validates and inserts a new row into the given table. Runs inside the
 * provided transaction if one is passed, otherwise wraps the insert in its
 * own transaction.
 *
 * @param tablename - the table to insert into, by schema key
 * @param data - the row data to insert, matching the table's insert model
 * @param tx - run within an existing transaction instead of creating one
 * @returns the newly inserted row
 * @throws {AppError} 400 if `data` fails the table's generated insert schema
 */
export const CreateRecord = async <
  T extends TableNames,
  TSelection = InferSelectModel<(typeof schema)[T]>,
>(
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
    [result] = await tx
      .insert(table)
      .values(data as any)
      .returning();

    return result as TSelection;
  } else {
    return await db.transaction(async (tx) => {
      const [nestedResult] = await tx
        .insert(table)
        .values(data as any)
        .returning();

      return nestedResult as TSelection;
    });
  }
};

/**
 * Validates and updates a row matched by its ID (or a custom column).
 *
 * @param tablename - the table to update, by schema key
 * @param id - the value to match against `idColumn` (defaults to the table's `id` column)
 * @param data - partial row data to update
 * @param idColumn - column to match `id` against, if not the default `id` column
 * @param tx - run within an existing transaction instead of creating one
 * @returns the updated row
 * @throws {AppError} 400 if `data` fails the table's generated update schema
 */
export const UpdateRecord = async <
  T extends TableNames,
  TSelection = InferSelectModel<(typeof schema)[T]>,
>(
  tablename: T,
  id: unknown,
  data: PartialInsert<InferInsertModel<(typeof schema)[T]>>,
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
    [result] = await tx
      .update(table)
      .set(data as any)
      .where(eq(column, id))
      .returning();

    return result as TSelection;
  } else {
    return await db.transaction(async (tx) => {
      const [nestedResult] = await tx
        .update(table)
        .set(data as any)
        .where(eq(column, id))
        .returning();

      return nestedResult as TSelection;
    });
  }
};

/**
 * Soft-deletes a row by setting its `deleted_at` timestamp. Only usable on
 * tables that have a `deleted_at` column ({@link SoftDeletableTables}).
 *
 * @param tablename - the table to soft-delete from, by schema key
 * @param id - the value to match against `idColumn` (defaults to the table's `id` column)
 * @param idColumn - column to match `id` against, if not the default `id` column
 * @param tx - run within an existing transaction instead of creating one
 * @returns the updated (soft-deleted) row
 */
export const SoftDeleteRecord = async <
  T extends SoftDeletableTables,
  TSelection = InferSelectModel<(typeof schema)[T]>,
>(
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
    [result] = await tx
      .update(table)
      .set({ deleted_at: new Date() } as any)
      .where(eq(column, id))
      .returning();

    return result as TSelection;
  } else {
    return await db.transaction(async (tx) => {
      const [nestedResult] = await tx
        .update(table)
        .set({ deleted_at: new Date() } as any)
        .where(eq(column, id))
        .returning();

      return nestedResult as TSelection;
    });
  }
};

/**
 * Permanently deletes a row from the given table. Only usable on tables
 * without a `deleted_at` column ({@link HardDeletableTables}) — tables that
 * support soft-delete should generally use {@link SoftDeleteRecord} instead.
 *
 * @param tablename - the table to delete from, by schema key
 * @param id - the value to match against `idColumn` (defaults to the table's `id` column)
 * @param idColumn - column to match `id` against, if not the default `id` column
 * @param tx - run within an existing transaction instead of creating one
 * @returns the deleted row
 */
export const HardDeleteRecord = async <
  T extends HardDeletableTables,
  TSelection = InferSelectModel<(typeof schema)[T]>,
>(
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
    [result] = await tx.delete(table).where(eq(column, id)).returning();

    return result as TSelection;
  } else {
    return await db.transaction(async (tx) => {
      const [nestedResult] = await tx.delete(table).where(eq(column, id)).returning();

      return nestedResult as TSelection;
    });
  }
};
