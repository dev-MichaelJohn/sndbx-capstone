import type { PgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/zod";
import type z from "zod";

type GeneratedShape<TTable extends PgTable<any>> = ReturnType<
  typeof createInsertSchema<TTable>
>["shape"];

type Refinements<TTable extends PgTable<any>> = {
  [K in keyof GeneratedShape<TTable>]?: (schema: GeneratedShape<TTable>[K]) => z.ZodTypeAny;
};

const schemaCache = new Map<PgTable<any>, { select: any; insert: any; update: any }>();

/**
 * Generates a matched set of Zod schemas (select/insert/update) for a given
 * Drizzle table. Unrefined base table schemas are cached globally.
 */
export const GenerateZodSchemas = <TTable extends PgTable<any>>(
  table: TTable,
  refinements?: Refinements<TTable>,
) => {
  if (!refinements && schemaCache.has(table)) {
    return schemaCache.get(table)!;
  }

  const select = createSelectSchema(table, refinements as any);
  const insert = createInsertSchema(table, refinements as any);
  const update = createUpdateSchema(table, refinements as any);

  const result = { select, insert, update };
  if (!refinements) {
    schemaCache.set(table, result);
  }

  return result;
};
