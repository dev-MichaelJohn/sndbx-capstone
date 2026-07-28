import { Semesters } from "@/schemas/institution.schema.js";
import {
  SemesterInsertSchema,
  SemesterSearchSchema,
  SemesterUpdateSchema,
  type SemesterInsert,
  type SemesterSearch,
  type SemesterSelect,
  type SemesterUpdate,
} from "@/types/semester.type.js";
import { createPaginatedData, type PaginatedData } from "@/utils/response.util.js";
import { and, asc, desc, eq, getColumns, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import {
  CreateRecord,
  GetRecord,
  GetRecords,
  SoftDeleteRecord,
  UpdateRecord,
} from "./db.service.js";
import type { PgTransaction } from "@/configs/db.config.js";
import z from "zod";
import { AppError } from "@/utils/error.util.js";
import db from "@/configs/db.config.js";

export interface ISemesterService {
  getSemesters(searchQuery: SemesterSearch): Promise<PaginatedData<SemesterSelect[]>>;
  getSemester(id: number, tx?: PgTransaction): Promise<SemesterSelect>;
  createSemester(params: SemesterInsert): Promise<SemesterSelect>;
  updateSemester(
    params: SemesterUpdate & {
      semester_id: number;
    },
  ): Promise<SemesterSelect>;
  deleteSemester(id: number): Promise<void>;
}

export class semesterService implements ISemesterService {
  constructor() {}

  private getSearchConditions(search: string | undefined) {
    if (!search) return undefined;

    return or(
      ilike(sql<string>`${Semesters.semester_term}::text`, `%${search}%`),
      ilike(sql<string>`${Semesters.school_year_start}::text`, `%${search}%`),
      ilike(sql<string>`${Semesters.school_year_end}::text`, `%${search}%`),
    );
  }

  async getSemesters(searchQuery: SemesterSearch) {
    searchQuery.orderBy = searchQuery.orderBy ?? "id";
    searchQuery.orderDir = searchQuery.orderDir ?? "asc";

    const validation = await SemesterSearchSchema.safeParseAsync(searchQuery);
    if (!validation.success) throw validation.error;

    const { search, page, orderBy, orderDir, school_year_start_from, school_year_start_to } =
      validation.data;

    const PAGE_SIZE = 10;
    const searchConditions = this.getSearchConditions(search);
    const columns = getColumns(Semesters);
    const orderColumn = columns[orderBy as keyof typeof columns] ?? Semesters.id;
    const orderFn = orderDir === "asc" ? asc : desc;

    const rows = await GetRecords<"Semesters", SemesterSelect & { totalItems: number }>(
      "Semesters",
      {
        select: (Semesters) => ({
          ...getColumns(Semesters),
          totalItems: sql<number>`count(*) over()::int`.as("totalItems"),
        }),
        where: () =>
          and(
            searchConditions,
            isNull(Semesters.deleted_at),
            school_year_start_from !== undefined
              ? gte(Semesters.school_year_start, school_year_start_from)
              : undefined,
            school_year_start_to !== undefined
              ? lte(Semesters.school_year_start, school_year_start_to)
              : undefined,
          ),
        join: (query) =>
          query
            .orderBy(orderFn(orderColumn))
            .limit(PAGE_SIZE)
            .offset((page - 1) * PAGE_SIZE),
      },
    );

    const totalItems = rows[0]?.totalItems ?? 0;
    const data = rows.map(({ totalItems, ...rest }) => rest);

    return createPaginatedData<SemesterSelect[]>({
      data,
      currentPage: page,
      pageSize: PAGE_SIZE,
      totalItems,
    });
  }

  async getSemester(id: number, tx?: PgTransaction) {
    const validation = await z.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;
    const result = await GetRecord<"Semesters", SemesterSelect>("Semesters", {
      select: (Semesters) => ({
        ...getColumns(Semesters),
      }),
      where: () => and(eq(Semesters.id, parsedId), isNull(Semesters.deleted_at)),
      ...(tx && { tx }),
    });
    if (!result) throw new AppError(404, "No semester record found");

    return result;
  }

  async createSemester(params: SemesterInsert) {
    const validation = await SemesterInsertSchema.safeParseAsync(params);
    if (!validation.success) throw validation.error;

    const parsedData = validation.data;

    const result = await CreateRecord<"Semesters">("Semesters", parsedData);
    if (!result) throw new AppError(500, "Failed to create semester record.");

    return result;
  }

  async updateSemester(params: SemesterUpdate & { semester_id: number }) {
    const validation = await SemesterUpdateSchema.extend({
      semester_id: z.number().int().positive(),
    }).safeParseAsync(params);
    if (!validation.success) throw validation.error;

    const { semester_id, ...parsedData } = validation.data;

    return await db.transaction(async (tx) => {
      const existing = await this.getSemester(semester_id, tx);
      const updated = await UpdateRecord<"Semesters", SemesterSelect>(
        "Semesters",
        existing.id,
        parsedData,
        Semesters.id,
        tx,
      );
      if (!updated) throw new AppError(500, "Failed to update semester record.");
      return updated;
    });
  }

  async deleteSemester(id: number) {
    const validation = await z.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    return await db.transaction(async (tx) => {
      const existing = await this.getSemester(id, tx);
      const deleted = await SoftDeleteRecord<"Semesters">(
        "Semesters",
        existing.id,
        Semesters.id,
        tx,
      );
      if (!deleted) throw new AppError(500, "Failed to delete semester record.");
    });
  }
}

const SemesterService = new semesterService();
export default SemesterService;
