import type { Table } from "drizzle-orm";
import type { BuildRefine, BuildSchema } from "drizzle-orm/zod";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/zod";

const schemaCache = new Map<Table, any>();

export const GenerateZodSchemas = <TTable extends Table>(
  table: TTable,
  refinements?: BuildRefine<TTable["_"]["columns"], undefined>,
): {
  select: BuildSchema<"select", TTable["_"]["columns"], undefined, undefined>;
  insert: BuildSchema<"insert", TTable["_"]["columns"], undefined, undefined>;
  update: BuildSchema<"update", TTable["_"]["columns"], undefined, undefined>;
} => {
  if (!refinements && schemaCache.has(table)) {
    return schemaCache.get(table);
  }

  const select = (createSelectSchema as any)(table, refinements);
  const insert = (createInsertSchema as any)(table, refinements);
  const update = (createUpdateSchema as any)(table, refinements);

  const result = { select, insert, update };

  if (!refinements) {
    schemaCache.set(table, result);
  }

  return result;
};
