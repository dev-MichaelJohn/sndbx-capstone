import type { PgTable } from "drizzle-orm/pg-core";
import type * as schema from "../schemas/index.schema.js";

export type TableNames = {
  [K in keyof typeof schema]: (typeof schema)[K] extends PgTable ? K : never;
}[keyof typeof schema];
