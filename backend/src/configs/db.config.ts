import env from "./env.config.js";
import { drizzle } from "drizzle-orm/node-postgres";
import type { EmptyRelations } from "drizzle-orm";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgAsyncTransaction } from "drizzle-orm/pg-core";

const db = drizzle(env.DATABASE_URL!);
export type PgDatabase = typeof db;
export type PgTransaction = PgAsyncTransaction<NodePgQueryResultHKT, EmptyRelations>;

export default db;
