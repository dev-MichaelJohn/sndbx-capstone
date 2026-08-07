import { Classes, Colleges, Programs } from "@/schemas/institution.schema.js";
import {
  ClassSchema,
  ClassSearchSchema,
  type ClassInsert,
  type ClassSearch,
  type ClassSelect,
  type ClassUpdate,
} from "@/types/class.type.js";
import { and, asc, desc, eq, getColumns, isNull, sql } from "drizzle-orm";
import {
  CreateRecord,
  GetRecord,
  GetRecords,
  SoftDeleteRecord,
  UpdateRecord,
} from "./db.service.js";
import { createPaginatedData, type PaginatedData } from "@/utils/response.util.js";
import type { PgTransaction } from "@/configs/db.config.js";
import { AppError } from "@/utils/error.util.js";
import z from "zod";
import db from "@/configs/db.config.js";
import type { SupervisorScope } from "@/types/supervisor.type.js";
import { buildScopeFilter } from "@/utils/scope.util.js";

export interface IClassService {
  getClasses(
    searchQuery: ClassSearch,
    scope?: SupervisorScope | null,
  ): Promise<PaginatedData<ClassSelect[]>>;
  getClass(id: number, tx?: PgTransaction): Promise<ClassSelect>;
  createClass(data: ClassInsert): Promise<ClassSelect>;
  updateClass(data: ClassUpdate & { class_id: number }): Promise<ClassSelect>;
  deleteClass(id: number): Promise<void>;
}

export class classService implements IClassService {
  constructor() {}

  async getClasses(searchQuery: ClassSearch, scope?: SupervisorScope | null) {
    searchQuery.orderBy = searchQuery.orderBy ?? "id";
    searchQuery.orderDir = searchQuery.orderDir ?? "asc";

    const validation = await ClassSearchSchema.safeParseAsync(searchQuery);
    if (!validation.success) throw validation.error;

    const { program_id, year_level, section, page, orderBy, orderDir } = validation.data;

    const PAGE_SIZE = 10;
    const columns = getColumns(Classes);
    const orderColumn = columns[orderBy as keyof typeof columns] ?? Classes.id;
    const orderFn = orderDir === "asc" ? asc : desc;

    const scopeFilter = buildScopeFilter(scope, { collegeTable: Colleges, programTable: Programs });

    const rows = await GetRecords<"Classes", ClassSelect & { totalItems: number }>("Classes", {
      select: (Classes) => ({
        ...getColumns(Classes),
        totalItems: sql<number>`count(*) over()::int`.as("totalItems"),
      }),
      where: () =>
        and(
          program_id ? eq(Classes.program_id, program_id) : undefined,
          year_level ? eq(Classes.year_level, year_level) : undefined,
          section ? eq(Classes.section, section) : undefined,
          isNull(Classes.deleted_at),
          scopeFilter,
        ),
      join: (query) =>
        query
          .innerJoin(Programs, eq(Programs.id, Classes.program_id))
          .leftJoin(Colleges, eq(Colleges.id, Programs.college_id))
          .orderBy(orderFn(orderColumn))
          .limit(PAGE_SIZE)
          .offset((page - 1) * PAGE_SIZE),
    });

    const totalItems = rows[0]?.totalItems ?? 0;
    const data = rows.map(({ totalItems, ...rest }) => rest);

    return createPaginatedData<ClassSelect[]>({
      data,
      currentPage: page,
      pageSize: PAGE_SIZE,
      totalItems,
    });
  }

  async getClass(id: number, tx?: PgTransaction) {
    const validation = await z.coerce.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;

    const data = await GetRecord<"Classes">("Classes", {
      select: (Classes) => ({ ...getColumns(Classes) }),
      where: () => and(eq(Classes.id, parsedId), isNull(Classes.deleted_at)),
      ...(tx && { tx }),
    });
    if (!data) throw new AppError(404, "No class record found.");

    return data;
  }

  async createClass(data: ClassInsert) {
    const validation = await ClassSchema.insert.safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const parsedData = validation.data;

    return await db.transaction(async (tx) => {
      const program = await GetRecord<"Programs">("Programs", {
        select: (Programs) => ({ ...getColumns(Programs) }),
        where: (Programs) =>
          and(eq(Programs.id, parsedData.program_id), isNull(Programs.deleted_at)),
        tx,
      });
      if (!program) throw new AppError(404, "Selected program was not found.");

      const result = await CreateRecord<"Classes">(
        "Classes",
        { ...parsedData, program_id: program.id },
        tx,
      );
      if (!result) throw new AppError(500, "Failed to create class record.");

      return result;
    });
  }

  async updateClass(data: ClassUpdate & { class_id: number }) {
    const validation = await ClassSchema.update
      .extend({
        class_id: z.number().int().positive(),
      })
      .safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const { class_id, ...parsedData } = validation.data;

    return await db.transaction(async (tx) => {
      const existing = await this.getClass(class_id, tx);

      if (parsedData.program_id !== undefined) {
        const programId = parsedData.program_id;
        const program = await GetRecord<"Programs">("Programs", {
          select: (Programs) => ({ ...getColumns(Programs) }),
          where: (Programs) => and(eq(Programs.id, programId), isNull(Programs.deleted_at)),
          tx,
        });
        if (!program) throw new AppError(404, "Selected program was not found.");
      }

      const updated = await UpdateRecord<"Classes">(
        "Classes",
        existing.id,
        parsedData,
        Classes.id,
        tx,
      );
      if (!updated) throw new AppError(500, "Failed to update class record.");

      return updated;
    });
  }

  async deleteClass(id: number) {
    const validation = await z.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;

    return await db.transaction(async (tx) => {
      const existing = await this.getClass(parsedId, tx);
      const deleted = await SoftDeleteRecord<"Classes">("Classes", existing.id, Classes.id, tx);
      if (!deleted) throw new AppError(500, "Failed to delete class record.");
    });
  }
}

const ClassService = new classService();
export default ClassService;
