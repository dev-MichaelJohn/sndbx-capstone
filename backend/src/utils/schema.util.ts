import type { PgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/zod";

export const GenerateZodSchemas = <TTable extends PgTable<any>>(table: TTable) => {
  const select = createSelectSchema(table);
  const insert = createInsertSchema(table);
  const update = createUpdateSchema(table);

  return { select, insert, update }
};
