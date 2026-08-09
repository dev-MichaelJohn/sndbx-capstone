import {
  StudentClasses,
  ClassStudents,
  CourseOfferings,
  CourseCurriculums,
  Courses,
  Classes,
  Programs,
} from "@/schemas/institution.schema.js";
import { Accounts, AccountRoles, Roles, PersonalDetails } from "@/schemas/auth.schema.js";
import {
  StudentClassSchema,
  StudentClassSearchSchema,
  type StudentClassInsert,
  type StudentClassSearch,
  type StudentClassSelect,
  type StudentClassWithDetails,
  type EligibleStudentOption,
} from "@/types/student-class.type.js";
import { and, asc, desc, eq, getColumns, ilike, isNull, notInArray, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { CreateRecord, GetRecord, GetRecords, SoftDeleteRecord } from "./db.service.js";
import { createPaginatedData, type PaginatedData } from "@/utils/response.util.js";
import type { PgTransaction } from "@/configs/db.config.js";
import { AppError } from "@/utils/error.util.js";
import z from "zod";
import db from "@/configs/db.config.js";

export interface IStudentClassService {
  getStudentClasses(
    searchQuery: StudentClassSearch,
  ): Promise<PaginatedData<StudentClassWithDetails[]>>;
  getStudentClass(id: number, tx?: PgTransaction): Promise<StudentClassWithDetails>;
  getEligibleStudentsForOffering(
    courseOfferingId: number,
    search?: string,
  ): Promise<EligibleStudentOption[]>;
  enrollStudentIrregular(data: StudentClassInsert): Promise<StudentClassSelect>;
  dropStudentFromOffering(id: number): Promise<void>;
}

export class studentClassService implements IStudentClassService {
  constructor() {}

  private async validateStudent(studentAccountId: number, tx: PgTransaction) {
    const student = await GetRecord<"Accounts">("Accounts", {
      select: (Accounts) => ({ id: Accounts.id }),
      join: (query) =>
        query
          .innerJoin(AccountRoles, eq(AccountRoles.account_id, Accounts.id))
          .innerJoin(Roles, eq(Roles.id, AccountRoles.role_id)),
      where: (Accounts) =>
        and(
          eq(Accounts.id, studentAccountId),
          isNull(Accounts.deleted_at),
          isNull(AccountRoles.deleted_at),
          isNull(Roles.deleted_at),
          eq(Roles.system_role, "STUDENT"),
        ),
      tx,
    });
    if (!student) throw new AppError(404, "Selected account is not a valid active student.");
    return student;
  }

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

    // Alias tables to join instructor details alongside student details
    const FacultyAccount = alias(Accounts, "faculty_account");
    const FacultyPersonalDetails = alias(PersonalDetails, "faculty_personal_details");

    const rows = await GetRecords<
      "StudentClasses",
      StudentClassWithDetails & { totalItems: number }
    >("StudentClasses", {
      select: (StudentClasses) => ({
        ...getColumns(StudentClasses),
        institutional_id: PersonalDetails.institutional_id,
        student_name:
          sql<string>`concat(${PersonalDetails.last_name}, ', ', ${PersonalDetails.first_name}, ' ', COALESCE(${PersonalDetails.middle_name}, ''))`.as(
            "student_name",
          ),
        course_name: Courses.name,
        course_initialism: Courses.initialism,
        year_level: CourseCurriculums.year_level,
        semester_term: CourseCurriculums.semester_term,
        program_name: Programs.name,
        class_year_level: Classes.year_level,
        class_section: Classes.section,
        faculty_name:
          sql<string>`concat(${FacultyPersonalDetails.first_name}, ' ', ${FacultyPersonalDetails.last_name})`.as(
            "faculty_name",
          ),
        totalItems: sql<number>`count(*) over()::int`.as("totalItems"),
      }),
      join: (query) =>
        query
          .innerJoin(CourseOfferings, eq(CourseOfferings.id, StudentClasses.course_offering_id))
          .innerJoin(Classes, eq(Classes.id, CourseOfferings.class_id))
          .innerJoin(Programs, eq(Programs.id, Classes.program_id))
          .innerJoin(
            CourseCurriculums,
            eq(CourseCurriculums.id, CourseOfferings.course_curriculum_id),
          )
          .innerJoin(Courses, eq(Courses.id, CourseCurriculums.course_id))
          .innerJoin(Accounts, eq(Accounts.id, StudentClasses.student_account_id))
          .innerJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id))
          .leftJoin(FacultyAccount, eq(FacultyAccount.id, CourseOfferings.faculty_id))
          .leftJoin(
            FacultyPersonalDetails,
            eq(FacultyPersonalDetails.id, FacultyAccount.personal_details_id),
          )
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
    const FacultyAccount = alias(Accounts, "faculty_account");
    const FacultyPersonalDetails = alias(PersonalDetails, "faculty_personal_details");

    const data = await GetRecord<"StudentClasses", StudentClassWithDetails>("StudentClasses", {
      select: (StudentClasses) => ({
        ...getColumns(StudentClasses),
        institutional_id: PersonalDetails.institutional_id,
        student_name:
          sql<string>`concat(${PersonalDetails.last_name}, ', ', ${PersonalDetails.first_name}, ' ', COALESCE(${PersonalDetails.middle_name}, ''))`.as(
            "student_name",
          ),
        course_name: Courses.name,
        course_initialism: Courses.initialism,
        year_level: CourseCurriculums.year_level,
        semester_term: CourseCurriculums.semester_term,
        program_name: Programs.name,
        class_year_level: Classes.year_level,
        class_section: Classes.section,
        faculty_name:
          sql<string>`concat(${FacultyPersonalDetails.first_name}, ' ', ${FacultyPersonalDetails.last_name})`.as(
            "faculty_name",
          ),
      }),
      join: (query) =>
        query
          .innerJoin(CourseOfferings, eq(CourseOfferings.id, StudentClasses.course_offering_id))
          .innerJoin(Classes, eq(Classes.id, CourseOfferings.class_id))
          .innerJoin(Programs, eq(Programs.id, Classes.program_id))
          .innerJoin(
            CourseCurriculums,
            eq(CourseCurriculums.id, CourseOfferings.course_curriculum_id),
          )
          .innerJoin(Courses, eq(Courses.id, CourseCurriculums.course_id))
          .innerJoin(Accounts, eq(Accounts.id, StudentClasses.student_account_id))
          .innerJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id))
          .leftJoin(FacultyAccount, eq(FacultyAccount.id, CourseOfferings.faculty_id))
          .leftJoin(
            FacultyPersonalDetails,
            eq(FacultyPersonalDetails.id, FacultyAccount.personal_details_id),
          ),
      where: () => and(eq(StudentClasses.id, parsedId), isNull(StudentClasses.deleted_at)),
      ...(tx && { tx }),
    });
    if (!data) throw new AppError(404, "No student class record found.");

    return data;
  }

  async getEligibleStudentsForOffering(courseOfferingId: number, search?: string) {
    const validation = await z.number().int().positive().safeParseAsync(courseOfferingId);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;

    const enrolledRecords = await GetRecords<"StudentClasses", { student_account_id: number }>(
      "StudentClasses",
      {
        select: (StudentClasses) => ({
          student_account_id: StudentClasses.student_account_id,
        }),
        where: (StudentClasses) =>
          and(eq(StudentClasses.course_offering_id, parsedId), isNull(StudentClasses.deleted_at)),
      },
    );
    const enrolledAccountIds = enrolledRecords.map((r) => r.student_account_id);

    return await GetRecords<"Accounts", EligibleStudentOption>("Accounts", {
      select: (Accounts) => ({
        student_account_id: Accounts.id,
        institutional_id: PersonalDetails.institutional_id,
        student_name:
          sql<string>`concat(${PersonalDetails.last_name}, ', ', ${PersonalDetails.first_name}, ' ', COALESCE(${PersonalDetails.middle_name}, ''))`.as(
            "student_name",
          ),
        program_name: Programs.name,
        class_year_level: Classes.year_level,
        class_section: Classes.section,
      }),
      join: (query) =>
        query
          .innerJoin(AccountRoles, eq(AccountRoles.account_id, Accounts.id))
          .innerJoin(Roles, eq(Roles.id, AccountRoles.role_id))
          .innerJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id))
          .leftJoin(
            ClassStudents,
            and(
              eq(ClassStudents.student_account_id, Accounts.id),
              isNull(ClassStudents.deleted_at),
            ),
          )
          .leftJoin(
            Classes,
            and(eq(Classes.id, ClassStudents.class_id), isNull(Classes.deleted_at)),
          )
          .leftJoin(
            Programs,
            and(eq(Programs.id, Classes.program_id), isNull(Programs.deleted_at)),
          ),
      where: (Accounts) =>
        and(
          isNull(Accounts.deleted_at),
          isNull(AccountRoles.deleted_at),
          isNull(Roles.deleted_at),
          eq(Roles.system_role, "STUDENT"),
          enrolledAccountIds.length > 0 ? notInArray(Accounts.id, enrolledAccountIds) : undefined,
          search
            ? or(
                ilike(PersonalDetails.institutional_id, `%${search}%`),
                ilike(PersonalDetails.first_name, `%${search}%`),
                ilike(PersonalDetails.last_name, `%${search}%`),
              )
            : undefined,
        ),
    });
  }

  async enrollStudentIrregular(data: StudentClassInsert) {
    const validation = await StudentClassSchema.insert.safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const parsedData = validation.data;

    return await db.transaction(async (tx) => {
      await this.validateStudent(parsedData.student_account_id, tx);

      const offering = await GetRecord<"CourseOfferings">("CourseOfferings", {
        select: (CourseOfferings) => ({
          id: CourseOfferings.id,
          class_id: CourseOfferings.class_id,
        }),
        where: (CourseOfferings) =>
          and(
            eq(CourseOfferings.id, parsedData.course_offering_id),
            isNull(CourseOfferings.deleted_at),
          ),
        tx,
      });
      if (!offering) throw new AppError(404, "Selected course offering was not found.");

      const result = await CreateRecord<"StudentClasses">("StudentClasses", parsedData, tx);
      if (!result) throw new AppError(500, "Failed to enroll student in course offering.");

      return result;
    });
  }

  async dropStudentFromOffering(id: number) {
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
      if (!deleted) throw new AppError(500, "Failed to drop student from course offering.");
    });
  }
}

const StudentClassService = new studentClassService();
export default StudentClassService;
