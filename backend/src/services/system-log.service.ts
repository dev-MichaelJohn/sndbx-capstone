import fs from "node:fs/promises";
import path from "node:path";
import { AppError } from "@/utils/error.util.js";
import { createPaginatedData, type PaginatedData } from "@/utils/response.util.js";
import {
  SystemLogQuerySchema,
  type LogEntry,
  type SystemLogQuery,
} from "@/types/system-log.type.js";

export interface ISystemLogService {
  getLogs(query: SystemLogQuery): Promise<PaginatedData<LogEntry[]>>;
}

export class systemLogService implements ISystemLogService {
  async getLogs(query: SystemLogQuery): Promise<PaginatedData<LogEntry[]>> {
    const validation = await SystemLogQuerySchema.safeParseAsync(query);
    if (!validation.success) throw validation.error;

    const { file, page, limit, search } = validation.data;
    const logFilePath = path.join(process.cwd(), "logs", `${file}.txt`);

    try {
      await fs.access(logFilePath);
    } catch {
      throw new AppError(404, `Log file '${file}.txt' does not exist yet.`);
    }

    const fileContent = await fs.readFile(logFilePath, "utf-8");
    const lines = fileContent.split("\n").filter((line) => line.trim().length > 0);

    const logRegex = /^\[(.*?)\]\s+\[(.*?)\]:\s+(.*)$/;
    let entries: LogEntry[] = [];

    for (const line of lines) {
      const match = line.match(logRegex);
      if (match) {
        entries.push({
          timestamp: match[1]!,
          level: match[2]!,
          message: match[3]!,
        });
      }
    }

    entries.reverse();

    if (search && search.trim().length > 0) {
      const term = search.toLowerCase();
      entries = entries.filter(
        (entry) =>
          entry.message.toLowerCase().includes(term) ||
          entry.level.toLowerCase().includes(term) ||
          entry.timestamp.toLowerCase().includes(term),
      );
    }

    const totalItems = entries.length;
    const startIndex = (page - 1) * limit;
    const paginatedEntries = entries.slice(startIndex, startIndex + limit);

    return createPaginatedData<LogEntry[]>({
      data: paginatedEntries,
      currentPage: page,
      pageSize: limit,
      totalItems,
    });
  }
}

const SystemLogService = new systemLogService();
export default SystemLogService;
