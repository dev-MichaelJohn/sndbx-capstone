import {
  StudentClasses,
  CourseOfferings,
  CourseCurriculums,
  Courses,
} from "@/schemas/institution.schema.js";
import { AccountRoles, Accounts, PersonalDetails, Roles } from "@/schemas/auth.schema.js";
import {
  StudentClassSchema,
  StudentClassSearchSchema,
  type StudentClassInsert,
  type StudentClassSearch,
  type StudentClassSelect,
} from "@/types/student-class.type.js";
import { and, asc, desc, eq, getColumns, isNull, sql } from "drizzle-orm";
import { CreateRecord, GetRecord, GetRecords, SoftDeleteRecord } from "./db.service.js";
import { createPaginatedData, type PaginatedData } from "@/utils/response.util.js";
import type { PgTransaction } from "@/configs/db.config.js";
import { AppError } from "@/utils/error.util.js";
import z from "zod";
import db from "@/configs/db.config.js";

export type StudentClassWithDetails = StudentClassSelect & {
  course_name: string;
  course_initialism: string;
  year_level: string;
  semester_term: string;
  student_name: string;
};

export interface IStudentClassService {
  getStudentClasses(
    searchQuery: StudentClassSearch,
  ): Promise<PaginatedData<StudentClassWithDetails[]>>;
  getStudentClass(id: number, tx?: PgTransaction): Promise<StudentClassWithDetails>;
  createStudentClass(data: StudentClassInsert): Promise<StudentClassSelect>;
  deleteStudentClass(id: number): Promise<void>;
}

export class studentClassService implements IStudentClassService {
  constructor() {}

  async getStudentClasses(searchQuery: StudentClassSearch) {
    searchQuery.orderBy = searchQuery.orderBy ?? "id";
    searchQuery.orderDir = searchQuery.orderDir ?? "asc";

    const validation = await StudentClassSearchSchema.safeParseAsync(searchQuery);
    if (!validation.success) throw validation.error;

    const { student_account_id, course_offering_id, page, orderBy, orderDir } = validation.data;

    const PAGE_SIZE = 10;
    const columns = getColumns(StudentClasses);
    const orderColumn = columns[orderBy as keyof typeof columns] ?? StudentClasses.id;
    const orderFn = orderDir === "asc" ? asc : desc;

    const rows = await GetRecords<
      "StudentClasses",
      StudentClassWithDetails & { totalItems: number }
    >("StudentClasses", {
      select: (StudentClasses) => ({
        ...getColumns(StudentClasses),
        course_name: Courses.name,
        course_initialism: Courses.initialism,
        year_level: CourseCurriculums.year_level,
        semester_term: CourseCurriculums.semester_term,
        student_name: sql<string>`concat(
          ${PersonalDetails.first_name}, ' ',
          ${PersonalDetails.last_name}
        )`.as("student_name"),
        totalItems: sql<number>`count(*) over()::int`.as("totalItems"),
      }),
      join: (query) =>
        query
          .innerJoin(CourseOfferings, eq(CourseOfferings.id, StudentClasses.course_offering_id))
          .innerJoin(
            CourseCurriculums,
            eq(CourseCurriculums.id, CourseOfferings.course_curriculum_id),
          )
          .innerJoin(Courses, eq(Courses.id, CourseCurriculums.course_id))
          .innerJoin(Accounts, eq(Accounts.id, StudentClasses.student_account_id))
          .innerJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id))
          .orderBy(orderFn(orderColumn))
          .limit(PAGE_SIZE)
          .offset((page - 1) * PAGE_SIZE),
      where: () =>
        and(
          student_account_id
            ? eq(StudentClasses.student_account_id, student_account_id)
            : undefined,
          course_offering_id
            ? eq(StudentClasses.course_offering_id, course_offering_id)
            : undefined,
          isNull(StudentClasses.deleted_at),
        ),
    });

    const totalItems = rows[0]?.totalItems ?? 0;
    const data = rows.map(({ totalItems, ...rest }) => rest);

    return createPaginatedData<StudentClassWithDetails[]>({
      data,
      currentPage: page,
      pageSize: PAGE_SIZE,
      totalItems,
    });
  }

  async getStudentClass(id: number, tx?: PgTransaction) {
    const validation = await z.coerce.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;

    const data = await GetRecord<"StudentClasses", StudentClassWithDetails>("StudentClasses", {
      select: (StudentClasses) => ({
        ...getColumns(StudentClasses),
        course_name: Courses.name,
        course_initialism: Courses.initialism,
        year_level: CourseCurriculums.year_level,
        semester_term: CourseCurriculums.semester_term,
        student_name: sql<string>`concat(
          ${PersonalDetails.first_name}, ' ',
          ${PersonalDetails.last_name}
        )`.as("student_name"),
      }),
      join: (query) =>
        query
          .innerJoin(CourseOfferings, eq(CourseOfferings.id, StudentClasses.course_offering_id))
          .innerJoin(
            CourseCurriculums,
            eq(CourseCurriculums.id, CourseOfferings.course_curriculum_id),
          )
          .innerJoin(Courses, eq(Courses.id, CourseCurriculums.course_id))
          .innerJoin(Accounts, eq(Accounts.id, StudentClasses.student_account_id))
          .innerJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id)),
      where: () => and(eq(StudentClasses.id, parsedId), isNull(StudentClasses.deleted_at)),
      ...(tx && { tx }),
    });
    if (!data) throw new AppError(404, "No student class record found.");

    return data;
  }

  async createStudentClass(data: StudentClassInsert) {
    const validation = await StudentClassSchema.insert.safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const parsedData = validation.data;

    return await db.transaction(async (tx) => {
      // Verify account exists, is not deleted, and carries the STUDENT role
      const student = await GetRecord<"Accounts">("Accounts", {
        select: (Accounts) => ({ id: Accounts.id }),
        join: (query) =>
          query
            .innerJoin(AccountRoles, eq(AccountRoles.account_id, Accounts.id))
            .innerJoin(Roles, eq(Roles.id, AccountRoles.role_id)),
        where: (Accounts) =>
          and(
            eq(Accounts.id, parsedData.student_account_id),
            isNull(Accounts.deleted_at),
            isNull(AccountRoles.deleted_at),
            isNull(Roles.deleted_at),
            eq(Roles.system_role, "STUDENT"),
          ),
        tx,
      });
      if (!student) throw new AppError(404, "Selected account is not a valid active student.");

      const offering = await GetRecord<"CourseOfferings">("CourseOfferings", {
        select: (CourseOfferings) => ({ id: CourseOfferings.id }),
        where: (CourseOfferings) =>
          and(
            eq(CourseOfferings.id, parsedData.course_offering_id),
            isNull(CourseOfferings.deleted_at),
          ),
        tx,
      });
      if (!offering) throw new AppError(404, "Selected course offering was not found.");

      const result = await CreateRecord<"StudentClasses">("StudentClasses", parsedData, tx);
      if (!result) throw new AppError(500, "Failed to enroll student.");

      return result;
    });
  }

  async deleteStudentClass(id: number) {
    const validation = await z.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;

    return await db.transaction(async (tx) => {
      const existing = await this.getStudentClass(parsedId, tx);
      const deleted = await SoftDeleteRecord<"StudentClasses">(
        "StudentClasses",
        existing.id,
        StudentClasses.id,
        tx,
      );
      if (!deleted) throw new AppError(500, "Failed to drop student from class.");
    });
  }
}

const StudentClassService = new studentClassService();
export default StudentClassService;
