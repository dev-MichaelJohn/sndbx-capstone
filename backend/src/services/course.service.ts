import {
  CourseSchema,
  CourseSearchSchema,
  type CourseInsert,
  type CourseSearch,
  type CourseSelect,
  type CourseUpdate,
} from "@/types/course.type.js";
import {
  CreateRecord,
  GetRecord,
  GetRecords,
  SoftDeleteRecord,
  UpdateRecord,
} from "./db.service.js";
import { and, asc, desc, eq, getColumns, ilike, isNull, or, sql } from "drizzle-orm";
import { Courses } from "@/schemas/institution.schema.js";
import { createPaginatedData, type PaginatedData } from "@/utils/response.util.js";
import type { PgTransaction } from "@/configs/db.config.js";
import z from "zod";
import { AppError } from "@/utils/error.util.js";
import db from "@/configs/db.config.js";

export interface ICourseService {
  getCourses(searchQuery: CourseSearch): Promise<PaginatedData<CourseSelect[]>>;
  getCourse(id: number, tx?: PgTransaction): Promise<CourseSelect>;
  createCourse(data: CourseInsert): Promise<CourseSelect>;
  updateCourse(data: CourseUpdate & { course_id: number }): Promise<CourseSelect>;
  deleteCourse(id: number): Promise<void>;
}

export class courseService implements ICourseService {
  private getSearchConditions(search: string | undefined) {
    if (!search) return undefined;

    return or(ilike(Courses.name, `%${search}%`), ilike(Courses.initialism, `%${search}%`));
  }

  async getCourses(searchQuery: CourseSearch) {
    searchQuery.orderBy = searchQuery.orderBy ?? "id";
    searchQuery.orderDir = searchQuery.orderDir ?? "asc";

    const validation = await CourseSearchSchema.safeParseAsync(searchQuery);
    if (!validation.success) throw validation.error;

    const { program_id, search, orderBy, orderDir, page } = validation.data;

    const PAGE_SIZE = 10;
    const searchConditions = this.getSearchConditions(search);
    const columns = getColumns(Courses);
    const orderColumn = columns[orderBy as keyof typeof columns] ?? Courses.id;
    const orderFn = orderDir === "asc" ? asc : desc;

    const rows = await GetRecords<"Courses", CourseSelect & { totalItems: number }>("Courses", {
      select: (Courses) => ({
        ...getColumns(Courses),
        totalItems: sql<number>`count(*) over()::int`.as("totalItems"),
      }),
      where: () =>
        and(
          searchConditions,
          program_id ? eq(Courses.program_id, program_id) : undefined,
          isNull(Courses.deleted_at),
        ),
      join: (query) =>
        query
          .orderBy(orderFn(orderColumn))
          .limit(PAGE_SIZE)
          .offset((page - 1) * PAGE_SIZE),
    });

    const totalItems = rows[0]?.totalItems ?? 0;
    const data = rows.map(({ totalItems, ...rest }) => rest);

    return createPaginatedData<CourseSelect[]>({
      data,
      currentPage: page,
      pageSize: PAGE_SIZE,
      totalItems,
    });
  }

  async getCourse(id: number, tx?: PgTransaction) {
    const validation = await z.coerce.number().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;
    const data = await GetRecord<"Courses">("Courses", {
      select: (Courses) => ({ ...getColumns(Courses) }),
      where: () => and(eq(Courses.id, parsedId), isNull(Courses.deleted_at)),
      ...(tx && { tx }),
    });
    if (!data) throw new AppError(404, "No course record found.");

    return data;
  }

  async createCourse(data: CourseInsert) {
    const validation = await CourseSchema.insert.safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const parsedData = validation.data;
    const result = await CreateRecord<"Courses">("Courses", parsedData);
    if (!result) throw new AppError(500, "Failed to create course record.");

    return result;
  }

  async updateCourse(data: CourseUpdate & { course_id: number }) {
    const validation = await CourseSchema.update
      .extend({
        course_id: z.number().int().positive(),
      })
      .safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const { course_id, ...parsedData } = validation.data;
    return await db.transaction(async (tx) => {
      const existing = await this.getCourse(course_id, tx);
      const updated = await UpdateRecord<"Courses">(
        "Courses",
        existing.id,
        parsedData,
        Courses.id,
        tx,
      );
      if (!updated) throw new AppError(500, "Failed to update course record");

      return updated;
    });
  }

  async deleteCourse(id: number) {
    const validation = await z.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;
    return await db.transaction(async (tx) => {
      const existing = await this.getCourse(parsedId, tx);
      const deleted = await SoftDeleteRecord<"Courses">("Courses", existing.id, Courses.id, tx);
      if (!deleted) throw new AppError(500, "Failed to delete semester record.");
    });
  }
}

const CourseService = new courseService();
export default CourseService;
