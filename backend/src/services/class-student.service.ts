import {
  ClassStudents,
  Classes,
  StudentClasses,
  CourseOfferings,
  Programs,
  Semesters,
} from "@/schemas/institution.schema.js";
import { Accounts, AccountRoles, Roles, PersonalDetails } from "@/schemas/auth.schema.js";
import {
  ClassStudentSchema,
  ClassStudentSearchSchema,
  type ClassStudentInsert,
  type ClassStudentSearch,
  type ClassStudentSelect,
  type ClassStudentWithDetails,
} from "@/types/class-student.type.js";
import { and, asc, desc, eq, getColumns, isNull, sql } from "drizzle-orm";
import { CreateRecord, GetRecord, GetRecords, SoftDeleteRecord } from "./db.service.js";
import { createPaginatedData, type PaginatedData } from "@/utils/response.util.js";
import type { PgTransaction } from "@/configs/db.config.js";
import { AppError } from "@/utils/error.util.js";
import z from "zod";
import db from "@/configs/db.config.js";

export interface IClassStudentService {
  getClassStudents(
    searchQuery: ClassStudentSearch,
  ): Promise<PaginatedData<ClassStudentWithDetails[]>>;
  getClassStudent(id: number, tx?: PgTransaction): Promise<ClassStudentWithDetails>;
  enrollStudent(data: ClassStudentInsert): Promise<ClassStudentSelect>;
  dropStudent(id: number): Promise<void>;
}

export class classStudentService implements IClassStudentService {
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

  private async validateClass(classId: number, tx: PgTransaction) {
    const cls = await GetRecord<"Classes">("Classes", {
      select: (Classes) => ({ ...getColumns(Classes) }),
      where: (Classes) => and(eq(Classes.id, classId), isNull(Classes.deleted_at)),
      tx,
    });
    if (!cls) throw new AppError(404, "Selected class was not found.");
    return cls;
  }

  async getClassStudents(searchQuery: ClassStudentSearch) {
    searchQuery.orderBy = searchQuery.orderBy ?? "id";
    searchQuery.orderDir = searchQuery.orderDir ?? "asc";

    const validation = await ClassStudentSearchSchema.safeParseAsync(searchQuery);
    if (!validation.success) throw validation.error;

    const { class_id, semester_id, student_account_id, page, orderBy, orderDir } = validation.data;

    const PAGE_SIZE = 10;
    const columns = getColumns(ClassStudents);
    const orderColumn = columns[orderBy as keyof typeof columns] ?? ClassStudents.id;
    const orderFn = orderDir === "asc" ? asc : desc;

    const rows = await GetRecords<
      "ClassStudents",
      ClassStudentWithDetails & { totalItems: number }
    >("ClassStudents", {
      select: (ClassStudents) => ({
        ...getColumns(ClassStudents),
        institutional_id: PersonalDetails.institutional_id,
        student_name:
          sql<string>`concat(${PersonalDetails.last_name}, ', ', ${PersonalDetails.first_name}, ' ', COALESCE(${PersonalDetails.middle_name}, ''))`.as(
            "student_name",
          ),
        program_name: Programs.name,
        year_level: Classes.year_level,
        section: Classes.section,
        totalItems: sql<number>`count(*) over()::int`.as("totalItems"),
      }),
      join: (query) =>
        query
          .innerJoin(Classes, eq(Classes.id, ClassStudents.class_id))
          .innerJoin(Programs, eq(Programs.id, Classes.program_id))
          .innerJoin(Accounts, eq(Accounts.id, ClassStudents.student_account_id))
          .innerJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id))
          .orderBy(orderFn(orderColumn))
          .limit(PAGE_SIZE)
          .offset((page - 1) * PAGE_SIZE),
      where: () =>
        and(
          class_id ? eq(ClassStudents.class_id, class_id) : undefined,
          semester_id ? eq(ClassStudents.semester_id, semester_id) : undefined,
          student_account_id ? eq(ClassStudents.student_account_id, student_account_id) : undefined,
          isNull(ClassStudents.deleted_at),
        ),
    });

    const totalItems = rows[0]?.totalItems ?? 0;
    const data = rows.map(({ totalItems, ...rest }) => rest);

    return createPaginatedData<ClassStudentWithDetails[]>({
      data,
      currentPage: page,
      pageSize: PAGE_SIZE,
      totalItems,
    });
  }

  async getClassStudent(id: number, tx?: PgTransaction) {
    const validation = await z.coerce.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;

    const data = await GetRecord<"ClassStudents", ClassStudentWithDetails>("ClassStudents", {
      select: (ClassStudents) => ({
        ...getColumns(ClassStudents),
        institutional_id: PersonalDetails.institutional_id,
        student_name:
          sql<string>`concat(${PersonalDetails.last_name}, ', ', ${PersonalDetails.first_name}, ' ', COALESCE(${PersonalDetails.middle_name}, ''))`.as(
            "student_name",
          ),
        program_name: Programs.name,
        year_level: Classes.year_level,
        section: Classes.section,
      }),
      join: (query) =>
        query
          .innerJoin(Classes, eq(Classes.id, ClassStudents.class_id))
          .innerJoin(Programs, eq(Programs.id, Classes.program_id))
          .innerJoin(Accounts, eq(Accounts.id, ClassStudents.student_account_id))
          .innerJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id)),
      where: () => and(eq(ClassStudents.id, parsedId), isNull(ClassStudents.deleted_at)),
      ...(tx && { tx }),
    });
    if (!data) throw new AppError(404, "No class student record found.");

    return data;
  }

  async enrollStudent(data: ClassStudentInsert) {
    const validation = await ClassStudentSchema.insert.safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const parsedData = validation.data;

    return await db.transaction(async (tx) => {
      await this.validateStudent(parsedData.student_account_id, tx);
      await this.validateClass(parsedData.class_id, tx);

      let semesterId = parsedData.semester_id;

      // Auto-resolve current active semester if semester_id is not passed
      if (!semesterId) {
        const activeSemester = await GetRecord("Semesters", {
          where: (s) => isNull(s.deleted_at),
          join: (q) => q.orderBy(desc(Semesters.id)),
          tx,
        });

        if (!activeSemester) {
          throw new AppError(404, "No active semester record found for enrollment.");
        }
        semesterId = activeSemester.id;
      }

      const classStudent = await CreateRecord<"ClassStudents">(
        "ClassStudents",
        { ...parsedData, semester_id: semesterId },
        tx,
      );
      if (!classStudent) throw new AppError(500, "Failed to enroll student in class.");

      // Bulk-insert StudentClasses for all active offerings under this class
      const offerings = await GetRecords<"CourseOfferings", { id: number }>("CourseOfferings", {
        select: (CourseOfferings) => ({ id: CourseOfferings.id }),
        where: () =>
          and(
            eq(CourseOfferings.class_id, parsedData.class_id),
            eq(CourseOfferings.semester_id, semesterId),
            isNull(CourseOfferings.deleted_at),
          ),
      });

      for (const offering of offerings) {
        await CreateRecord<"StudentClasses">(
          "StudentClasses",
          {
            student_account_id: parsedData.student_account_id,
            course_offering_id: offering.id,
          },
          tx,
        );
      }

      return classStudent;
    });
  }

  async dropStudent(id: number) {
    const validation = await z.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;

    return await db.transaction(async (tx) => {
      const existing = await this.getClassStudent(parsedId, tx);

      // Soft-delete all StudentClasses for this student under this class's offerings
      const offerings = await GetRecords<"CourseOfferings", { id: number }>("CourseOfferings", {
        select: (CourseOfferings) => ({ id: CourseOfferings.id }),
        where: () =>
          and(eq(CourseOfferings.class_id, existing.class_id), isNull(CourseOfferings.deleted_at)),
      });

      for (const offering of offerings) {
        const studentClass = await GetRecord<"StudentClasses">("StudentClasses", {
          select: (StudentClasses) => ({ id: StudentClasses.id }),
          where: (StudentClasses) =>
            and(
              eq(StudentClasses.student_account_id, existing.student_account_id),
              eq(StudentClasses.course_offering_id, offering.id),
              isNull(StudentClasses.deleted_at),
            ),
          tx,
        });
        if (studentClass) {
          await SoftDeleteRecord<"StudentClasses">(
            "StudentClasses",
            studentClass.id,
            StudentClasses.id,
            tx,
          );
        }
      }

      const deleted = await SoftDeleteRecord<"ClassStudents">(
        "ClassStudents",
        existing.id,
        ClassStudents.id,
        tx,
      );
      if (!deleted) throw new AppError(500, "Failed to drop student from class.");
    });
  }
}

const ClassStudentService = new classStudentService();
export default ClassStudentService;
