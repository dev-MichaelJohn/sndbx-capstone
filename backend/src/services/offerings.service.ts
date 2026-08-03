import {
  CourseOfferings,
  CourseCurriculums,
  Courses,
  Classes,
  Semesters,
} from "@/schemas/institution.schema.js";
import {
  CourseOfferingSchema,
  CourseOfferingSearchSchema,
  type CourseOfferingInsert,
  type CourseOfferingSearch,
  type CourseOfferingSelect,
  type CourseOfferingUpdate,
  type CourseOfferingWithDetails,
} from "@/types/offerings.type.js";
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

export interface ICourseOfferingService {
  getCourseOfferings(
    searchQuery: CourseOfferingSearch,
  ): Promise<PaginatedData<CourseOfferingWithDetails[]>>;
  getCourseOffering(id: number, tx?: PgTransaction): Promise<CourseOfferingWithDetails>;
  createCourseOffering(data: CourseOfferingInsert): Promise<CourseOfferingSelect>;
  updateCourseOffering(
    data: CourseOfferingUpdate & { course_offering_id: number },
  ): Promise<CourseOfferingSelect>;
  deleteCourseOffering(id: number): Promise<void>;
}

export class courseOfferingService implements ICourseOfferingService {
  constructor() {}

  private async validateEligibility(
    courseCurriculumId: number,
    classId: number,
    semesterId: number,
    tx: PgTransaction,
  ) {
    const curriculum = await GetRecord<"CourseCurriculums">("CourseCurriculums", {
      select: (CourseCurriculums) => ({ ...getColumns(CourseCurriculums) }),
      where: (CourseCurriculums) =>
        and(eq(CourseCurriculums.id, courseCurriculumId), isNull(CourseCurriculums.deleted_at)),
      tx,
    });
    if (!curriculum) throw new AppError(404, "Selected curriculum entry was not found.");

    const classInfo = await GetRecord<"Classes">("Classes", {
      select: (Classes) => ({ ...getColumns(Classes) }),
      where: (Classes) => and(eq(Classes.id, classId), isNull(Classes.deleted_at)),
      tx,
    });
    if (!classInfo) throw new AppError(404, "Selected class was not found.");

    const semester = await GetRecord<"Semesters">("Semesters", {
      select: (Semesters) => ({ ...getColumns(Semesters) }),
      where: (Semesters) => and(eq(Semesters.id, semesterId), isNull(Semesters.deleted_at)),
      tx,
    });
    if (!semester) throw new AppError(404, "Selected semester was not found.");

    const mismatch =
      curriculum.program_id !== classInfo.program_id ||
      curriculum.year_level !== classInfo.year_level ||
      curriculum.semester_term !== semester.semester_term;

    if (mismatch) {
      throw new AppError(
        400,
        "This course is not part of the curriculum for the selected class's program, year level, and term.",
      );
    }

    return { curriculum, classInfo, semester };
  }

  async getCourseOfferings(searchQuery: CourseOfferingSearch) {
    searchQuery.orderBy = searchQuery.orderBy ?? "id";
    searchQuery.orderDir = searchQuery.orderDir ?? "asc";

    const validation = await CourseOfferingSearchSchema.safeParseAsync(searchQuery);
    if (!validation.success) throw validation.error;

    const { class_id, semester_id, faculty_id, page, orderBy, orderDir } = validation.data;

    const PAGE_SIZE = 10;
    const columns = getColumns(CourseOfferings);
    const orderColumn = columns[orderBy as keyof typeof columns] ?? CourseOfferings.id;
    const orderFn = orderDir === "asc" ? asc : desc;

    const rows = await GetRecords<
      "CourseOfferings",
      CourseOfferingWithDetails & { totalItems: number }
    >("CourseOfferings", {
      select: (CourseOfferings) => ({
        ...getColumns(CourseOfferings),
        course_name: Courses.name,
        course_initialism: Courses.initialism,
        year_level: CourseCurriculums.year_level,
        semester_term: CourseCurriculums.semester_term,
        totalItems: sql<number>`count(*) over()::int`.as("totalItems"),
      }),
      join: (query) =>
        query
          .innerJoin(
            CourseCurriculums,
            eq(CourseCurriculums.id, CourseOfferings.course_curriculum_id),
          )
          .innerJoin(Courses, eq(Courses.id, CourseCurriculums.course_id))
          .orderBy(orderFn(orderColumn))
          .limit(PAGE_SIZE)
          .offset((page - 1) * PAGE_SIZE),
      where: () =>
        and(
          class_id ? eq(CourseOfferings.class_id, class_id) : undefined,
          semester_id ? eq(CourseOfferings.semester_id, semester_id) : undefined,
          faculty_id ? eq(CourseOfferings.faculty_id, faculty_id) : undefined,
          isNull(CourseOfferings.deleted_at),
        ),
    });

    const totalItems = rows[0]?.totalItems ?? 0;
    const data = rows.map(({ totalItems, ...rest }) => rest);

    return createPaginatedData<CourseOfferingWithDetails[]>({
      data,
      currentPage: page,
      pageSize: PAGE_SIZE,
      totalItems,
    });
  }

  async getCourseOffering(id: number, tx?: PgTransaction) {
    const validation = await z.coerce.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;

    const data = await GetRecord<"CourseOfferings", CourseOfferingWithDetails>("CourseOfferings", {
      select: (CourseOfferings) => ({
        ...getColumns(CourseOfferings),
        course_name: Courses.name,
        course_initialism: Courses.initialism,
        year_level: CourseCurriculums.year_level,
        semester_term: CourseCurriculums.semester_term,
      }),
      join: (query) =>
        query
          .innerJoin(
            CourseCurriculums,
            eq(CourseCurriculums.id, CourseOfferings.course_curriculum_id),
          )
          .innerJoin(Courses, eq(Courses.id, CourseCurriculums.course_id)),
      where: () => and(eq(CourseOfferings.id, parsedId), isNull(CourseOfferings.deleted_at)),
      ...(tx && { tx }),
    });
    if (!data) throw new AppError(404, "No course offering found.");

    return data;
  }

  async createCourseOffering(data: CourseOfferingInsert) {
    const validation = await CourseOfferingSchema.insert.safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const parsedData = validation.data;

    return await db.transaction(async (tx) => {
      await this.validateEligibility(
        parsedData.course_curriculum_id,
        parsedData.class_id,
        parsedData.semester_id,
        tx,
      );

      const faculty = await GetRecord<"Accounts">("Accounts", {
        select: (Accounts) => ({ ...getColumns(Accounts) }),
        where: (Accounts) =>
          and(eq(Accounts.id, parsedData.faculty_id), isNull(Accounts.deleted_at)),
        tx,
      });
      if (!faculty) throw new AppError(404, "Selected faculty member was not found.");

      const result = await CreateRecord<"CourseOfferings">("CourseOfferings", parsedData, tx);
      if (!result) throw new AppError(500, "Failed to create course offering.");

      return result;
    });
  }

  async updateCourseOffering(data: CourseOfferingUpdate & { course_offering_id: number }) {
    const validation = await CourseOfferingSchema.update
      .extend({
        course_offering_id: z.number().int().positive(),
      })
      .safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const { course_offering_id, ...parsedData } = validation.data;

    return await db.transaction(async (tx) => {
      const existing = await this.getCourseOffering(course_offering_id, tx);

      // Only re-check eligibility if any of the three linked fields changed —
      // reuse existing values for whichever weren't part of this update.
      const touchesEligibility =
        parsedData.course_curriculum_id !== undefined ||
        parsedData.class_id !== undefined ||
        parsedData.semester_id !== undefined;

      if (touchesEligibility) {
        const courseCurriculumId = parsedData.course_curriculum_id ?? existing.course_curriculum_id;
        const classId = parsedData.class_id ?? existing.class_id;
        const semesterId = parsedData.semester_id ?? existing.semester_id;
        await this.validateEligibility(courseCurriculumId, classId, semesterId, tx);
      }

      if (parsedData.faculty_id !== undefined) {
        const facultyId = parsedData.faculty_id;
        const faculty = await GetRecord<"Accounts">("Accounts", {
          select: (Accounts) => ({ ...getColumns(Accounts) }),
          where: (Accounts) => and(eq(Accounts.id, facultyId), isNull(Accounts.deleted_at)),
          tx,
        });
        if (!faculty) throw new AppError(404, "Selected faculty member was not found.");
      }

      const updated = await UpdateRecord<"CourseOfferings">(
        "CourseOfferings",
        existing.id,
        parsedData,
        CourseOfferings.id,
        tx,
      );
      if (!updated) throw new AppError(500, "Failed to update course offering.");

      return updated;
    });
  }

  async deleteCourseOffering(id: number) {
    const validation = await z.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;

    return await db.transaction(async (tx) => {
      const existing = await this.getCourseOffering(parsedId, tx);
      const deleted = await SoftDeleteRecord<"CourseOfferings">(
        "CourseOfferings",
        existing.id,
        CourseOfferings.id,
        tx,
      );
      if (!deleted) throw new AppError(500, "Failed to delete course offering.");
    });
  }
}

const CourseOfferingService = new courseOfferingService();
export default CourseOfferingService;
