import z from "zod";
export type { LogEntry } from "../utils/log-stream.util.js";

export const SystemLogQuerySchema = z.object({
  file: z.enum(["combined", "error"]).default("combined"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export type SystemLogQuery = z.infer<typeof SystemLogQuerySchema>;
