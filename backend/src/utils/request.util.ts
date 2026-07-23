import * as schema from "@/schemas/index.schema.js";
import z from "zod";
import { type TableNames } from "@/services/db.service.js";
import { getColumns } from "drizzle-orm";
import { type Request } from "express";

export const createSearchSchema = <T extends TableNames>(tablename: T) => {
  const table = schema[tablename];
  type ColumnKeys = Extract<keyof (typeof table)["_"]["columns"], string>;

  const columns = Object.keys(getColumns(table)) as [ColumnKeys, ...ColumnKeys[]];
  const defaultOrderBy = (columns.includes("id" as ColumnKeys) ? "id" : columns[0]) as ColumnKeys;

  return z.object({
    search: z
      .string()
      .optional()
      .transform((s) => (s?.trim() ? s.trim() : undefined)),
    page: z.coerce.number().int().positive().default(1),
    orderBy: z.enum(columns).optional().default(defaultOrderBy),
    orderDir: z.enum(["asc", "desc"]).optional().default("asc"),
  });
};

export const extractSearchParams = async <T extends TableNames>(tablename: T, req: Request) => {
  const rawData = {
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    page: req.query.page,
    orderBy: typeof req.query.orderBy === "string" ? req.query.orderBy.toLowerCase() : undefined,
    orderDir: typeof req.query.orderDir === "string" ? req.query.orderDir.toLowerCase() : undefined,
  };

  const parsed = await createSearchSchema(tablename).safeParseAsync(rawData);
  if (!parsed.success) throw parsed.error;

  return parsed.data;
};
