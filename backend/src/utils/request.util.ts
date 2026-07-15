import * as schema from "@/schemas/index.schema.js";
import z from "zod";
import { type TableNames } from "@/services/db.service.js";
import { getColumns } from "drizzle-orm";

export const createSearchSchema = <T extends TableNames>(tablename: T) => {
  const table = schema[tablename];
  type ColumnKeys = Extract<keyof (typeof table)["_"]["columns"], string>;

  const columns = Object.keys(getColumns(table)) as [
    ColumnKeys,
    ...ColumnKeys[]
  ];

  return z.object({
    search: z.string().trim().nonempty(),
    page: z.coerce.number().positive(),
    orderBy: z.enum(columns).optional(),
    orderDir: z.enum(["asc", "desc"]).optional().default("asc"),
  });
};
