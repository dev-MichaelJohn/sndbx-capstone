import type { PgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/zod";

/**
 * Generates a matched set of Zod schemas (select/insert/update) for a given
 * Drizzle table, so validation schemas stay in sync with the DB schema
 * automatically instead of being hand-written and duplicated.
 *
 * @param table - the Drizzle table to generate schemas for
 * @returns `{ select, insert, update }` Zod schemas matching the table's
 *   select model, insert model (required columns enforced), and update
 *   model (all columns optional) respectively
 */
export const GenerateZodSchemas = <TTable extends PgTable<any>>(table: TTable) => {
  const select = createSelectSchema(table);
  const insert = createInsertSchema(table);
  const update = createUpdateSchema(table);

  return { select, insert, update }
};
