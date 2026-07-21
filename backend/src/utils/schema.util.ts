import type { PgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/zod";
import type z from "zod";

/** The Zod object shape drizzle-zod generates for `TTable` with no
 * refinements applied — i.e. each column's real, auto-inferred Zod type
 * (`ZodString`, `ZodNumber`, `ZodOptional<ZodString>`, etc). */
type GeneratedShape<TTable extends PgTable<any>> = ReturnType<
  typeof createInsertSchema<TTable>
>["shape"];

/** A refinement function per column of `TTable`. `schema` is typed as
 * whatever drizzle-zod actually generates for that column, so
 * type-specific methods (`.trim()`, `.min()`, etc.) are available directly
 * — no cast, no `instanceof` narrowing needed. */
type Refinements<TTable extends PgTable<any>> = {
  [K in keyof GeneratedShape<TTable>]?: (schema: GeneratedShape<TTable>[K]) => z.ZodTypeAny;
};

/**
 * Generates a matched set of Zod schemas (select/insert/update) for a given
 * Drizzle table, so validation schemas stay in sync with the DB schema
 * automatically instead of being hand-written and duplicated.
 *
 * @param table - the Drizzle table to generate schemas for
 * @param refinements - optional per-column overrides, keyed to `table`'s
 *   actual columns, e.g. `{ name: (s) => s.trim().min(1, "Required") }`
 * @returns `{ select, insert, update }` Zod schemas matching the table's
 *   select model, insert model (required columns enforced), and update
 *   model (all columns optional) respectively
 */
export const GenerateZodSchemas = <TTable extends PgTable<any>>(
  table: TTable,
  refinements?: Refinements<TTable>,
) => {
  const select = createSelectSchema(table, refinements as any);
  const insert = createInsertSchema(table, refinements as any);
  const update = createUpdateSchema(table, refinements as any);
  return { select, insert, update };
};
