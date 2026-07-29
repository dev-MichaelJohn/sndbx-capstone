import { CourseCurriculums, Courses } from "@/schemas/institution.schema.js";
import {
  CurriculumSchema,
  CurriculumSearchSchema,
  type CurriculumInsert,
  type CurriculumSearch,
  type CurriculumSelect,
  type CurriculumUpdate,
  type CurriculumWithDetails,
} from "@/types/curriculum.type.js";
import { and, asc, desc, eq, getColumns, ilike, isNull, or, sql } from "drizzle-orm";
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

export interface ICurriculumService {
  getCurriculums(searchQuery: CurriculumSearch): Promise<PaginatedData<CurriculumWithDetails[]>>;
  getCurriculum(id: number, tx?: PgTransaction): Promise<CurriculumWithDetails>;
  createCurriculum(data: CurriculumInsert): Promise<CurriculumSelect>;
  updateCurriculum(data: CurriculumUpdate & { curriculum_id: number }): Promise<CurriculumSelect>;
  deleteCurriculum(id: number): Promise<void>;
}

export class curriculumService implements ICurriculumService {
  constructor() {}

  private getSearchConditions(search: string | undefined) {
    if (!search) return undefined;

    return or(ilike(Courses.name, `%${search}%`), ilike(Courses.initialism, `%${search}%`));
  }

  async getCurriculums(searchQuery: CurriculumSearch) {
    searchQuery.orderBy = searchQuery.orderBy ?? "id";
    searchQuery.orderDir = searchQuery.orderDir ?? "asc";

    const validation = await CurriculumSearchSchema.safeParseAsync(searchQuery);
    if (!validation.success) throw validation.error;

    const { program_id, course_id, year_level, semester_term, search, orderBy, orderDir, page } =
      validation.data;

    const PAGE_SIZE = 10;
    const searchConditions = this.getSearchConditions(search);
    const columns = getColumns(CourseCurriculums);
    const orderColumn = columns[orderBy as keyof typeof columns] ?? CourseCurriculums.id;
    const orderFn = orderDir === "asc" ? asc : desc;

    const rows = await GetRecords<
      "CourseCurriculums",
      CurriculumWithDetails & { totalItems: number }
    >("CourseCurriculums", {
      select: (CourseCurriculums) => ({
        ...getColumns(CourseCurriculums),
        name: Courses.name,
        initialism: Courses.initialism,
        totalItems: sql<number>`count(*) over()::int`.as("totalItems"),
      }),
      join: (query) =>
        query
          .innerJoin(Courses, eq(Courses.id, CourseCurriculums.course_id))
          .orderBy(orderFn(orderColumn))
          .limit(PAGE_SIZE)
          .offset((page - 1) * PAGE_SIZE),
      where: () =>
        and(
          searchConditions,
          course_id ? eq(CourseCurriculums.course_id, course_id) : undefined,
          program_id ? eq(CourseCurriculums.program_id, program_id) : undefined,
          year_level ? eq(CourseCurriculums.year_level, year_level) : undefined,
          semester_term ? eq(CourseCurriculums.semester_term, semester_term) : undefined,
          isNull(CourseCurriculums.deleted_at),
        ),
    });

    const totalItems = rows[0]?.totalItems ?? 0;
    const data = rows.map(({ totalItems, ...rest }) => rest);

    return createPaginatedData<CurriculumWithDetails[]>({
      data,
      currentPage: page,
      pageSize: PAGE_SIZE,
      totalItems,
    });
  }

  async getCurriculum(id: number, tx?: PgTransaction) {
    const validation = await z.coerce.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;

    const data = await GetRecord<"CourseCurriculums", CurriculumWithDetails>("CourseCurriculums", {
      select: (CourseCurriculums) => ({
        ...getColumns(CourseCurriculums),
        name: Courses.name,
        initialism: Courses.initialism,
      }),
      join: (query) => query.innerJoin(Courses, eq(Courses.id, CourseCurriculums.course_id)),
      where: () => and(eq(CourseCurriculums.id, parsedId), isNull(CourseCurriculums.deleted_at)),
      ...(tx && { tx }),
    });
    if (!data) throw new AppError(404, "No curriculum record found.");

    return data;
  }

  async createCurriculum(data: CurriculumInsert) {
    const validation = await CurriculumSchema.insert.safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const parsedData = validation.data;

    return await db.transaction(async (tx) => {
      const course = await GetRecord<"Courses">("Courses", {
        select: (Courses) => ({ ...getColumns(Courses) }),
        where: (Courses) => and(eq(Courses.id, parsedData.course_id), isNull(Courses.deleted_at)),
        tx,
      });
      if (!course) throw new AppError(404, "Selected course was not found.");

      const program = await GetRecord<"Programs">("Programs", {
        select: (Programs) => ({ ...getColumns(Programs) }),
        where: (Programs) =>
          and(eq(Programs.id, parsedData.program_id), isNull(Programs.deleted_at)),
        tx,
      });
      if (!program) throw new AppError(404, "Selected program was not found.");

      const result = await CreateRecord<"CourseCurriculums">(
        "CourseCurriculums",
        { ...parsedData, course_id: course.id, program_id: program.id },
        tx,
      );
      if (!result) throw new AppError(500, "Failed to create curriculum entry.");

      return result;
    });
  }

  async updateCurriculum(data: CurriculumUpdate & { curriculum_id: number }) {
    const validation = await CurriculumSchema.update
      .extend({
        curriculum_id: z.number().int().positive(),
      })
      .safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const { curriculum_id, ...parsedData } = validation.data;

    return await db.transaction(async (tx) => {
      const existing = await this.getCurriculum(curriculum_id, tx);

      if (parsedData.course_id !== undefined) {
        const courseId = parsedData.course_id;
        const course = await GetRecord<"Courses">("Courses", {
          select: (Courses) => ({ ...getColumns(Courses) }),
          where: (Courses) => and(eq(Courses.id, courseId), isNull(Courses.deleted_at)),
          tx,
        });
        if (!course) throw new AppError(404, "Selected course was not found.");
      }

      if (parsedData.program_id !== undefined) {
        const programId = parsedData.program_id;
        const program = await GetRecord<"Programs">("Programs", {
          select: (Programs) => ({ ...getColumns(Programs) }),
          where: (Programs) => and(eq(Programs.id, programId), isNull(Programs.deleted_at)),
          tx,
        });
        if (!program) throw new AppError(404, "Selected program was not found.");
      }

      const updated = await UpdateRecord<"CourseCurriculums">(
        "CourseCurriculums",
        existing.id,
        parsedData,
        CourseCurriculums.id,
        tx,
      );
      if (!updated) throw new AppError(500, "Failed to update curriculum entry.");

      return updated;
    });
  }

  async deleteCurriculum(id: number) {
    const validation = await z.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;

    return await db.transaction(async (tx) => {
      const existing = await this.getCurriculum(parsedId, tx);
      const deleted = await SoftDeleteRecord<"CourseCurriculums">(
        "CourseCurriculums",
        existing.id,
        CourseCurriculums.id,
        tx,
      );
      if (!deleted) throw new AppError(500, "Failed to delete curriculum entry.");
    });
  }
}

const CurriculumService = new curriculumService();
export default CurriculumService;
