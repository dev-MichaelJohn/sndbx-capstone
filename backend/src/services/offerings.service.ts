import { CourseOfferings, CourseCurriculums, Courses } from "@/schemas/institution.schema.js";
import { AccountRoles, Accounts, PersonalDetails, Roles } from "@/schemas/auth.schema.js";
import {
  CourseOfferingSchema,
  CourseOfferingSearchSchema,
  CreateFacultySchema,
  type CourseOfferingInsert,
  type CourseOfferingSearch,
  type CourseOfferingSelect,
  type CourseOfferingWithDetails,
  type CreateCourseOfferingParams,
  type CreateFaculty,
  type UpdateCourseOfferingParams,
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
import UserService, { type IUserService } from "./user.service.js";

export interface ICourseOfferingService {
  getCourseOfferings(
    searchQuery: CourseOfferingSearch,
  ): Promise<PaginatedData<CourseOfferingWithDetails[]>>;
  getCourseOffering(id: number, tx?: PgTransaction): Promise<CourseOfferingWithDetails>;
  createCourseOffering(
    params: CreateCourseOfferingParams,
  ): Promise<{ courseOffering: CourseOfferingSelect }>;
  updateCourseOffering(
    params: UpdateCourseOfferingParams,
  ): Promise<{ courseOffering: CourseOfferingSelect }>;
  deleteCourseOffering(id: number): Promise<void>;
}

export class courseOfferingService implements ICourseOfferingService {
  constructor(private userService: IUserService = UserService) {}

  /**
   * Validates and normalizes the optional faculty input payload into a discriminated union.
   */
  private async parseFacultyInfo(info?: CreateFaculty) {
    if (!info || Object.keys(info).length === 0) return undefined;
    const parsed = await CreateFacultySchema.safeParseAsync(info);
    if (!parsed.success) throw parsed.error;
    return parsed.data;
  }

  /**
   * Validates that an existing account is active and eligible to be assigned as faculty.
   */
  private async validateFacultyCandidate(accountId: number, tx?: PgTransaction) {
    const account = await GetRecord("Accounts", {
      where: (Accounts) => and(eq(Accounts.id, accountId), isNull(Accounts.deleted_at)),
      ...(tx && { tx }),
    });
    if (!account) throw new AppError(404, "Faculty account not found.");

    const roleRecords = await GetRecords<"AccountRoles", { system_role: string }>("AccountRoles", {
      select: () => ({ system_role: Roles.system_role }),
      where: (AccountRoles) =>
        and(eq(AccountRoles.account_id, accountId), isNull(AccountRoles.deleted_at)),
      join: (query) =>
        query.innerJoin(Roles, and(eq(Roles.id, AccountRoles.role_id), isNull(Roles.deleted_at))),
      ...(tx && { tx }),
    });

    const disallowedRoles = ["STUDENT"];
    if (roleRecords.some((r) => disallowedRoles.includes(r.system_role))) {
      throw new AppError(400, "This account's role is not eligible to be assigned as faculty.");
    }
  }

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
        account_id: Accounts.id,
        institutional_id: PersonalDetails.institutional_id,
        first_name: PersonalDetails.first_name,
        last_name: PersonalDetails.last_name,
        middle_name: PersonalDetails.middle_name,
        suffix: PersonalDetails.suffix,
        totalItems: sql<number>`count(*) over()::int`.as("totalItems"),
      }),
      join: (query) =>
        query
          .innerJoin(
            CourseCurriculums,
            eq(CourseCurriculums.id, CourseOfferings.course_curriculum_id),
          )
          .innerJoin(Courses, eq(Courses.id, CourseCurriculums.course_id))
          .leftJoin(
            Accounts,
            and(eq(Accounts.id, CourseOfferings.faculty_id), isNull(Accounts.deleted_at)),
          )
          .leftJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id))
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
        account_id: Accounts.id,
        institutional_id: PersonalDetails.institutional_id,
        first_name: PersonalDetails.first_name,
        last_name: PersonalDetails.last_name,
        middle_name: PersonalDetails.middle_name,
        suffix: PersonalDetails.suffix,
      }),
      join: (query) =>
        query
          .innerJoin(
            CourseCurriculums,
            eq(CourseCurriculums.id, CourseOfferings.course_curriculum_id),
          )
          .innerJoin(Courses, eq(Courses.id, CourseCurriculums.course_id))
          .leftJoin(
            Accounts,
            and(eq(Accounts.id, CourseOfferings.faculty_id), isNull(Accounts.deleted_at)),
          )
          .leftJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id)),
      where: () => and(eq(CourseOfferings.id, parsedId), isNull(CourseOfferings.deleted_at)),
      ...(tx && { tx }),
    });
    if (!data) throw new AppError(404, "No course offering found.");

    return data;
  }

  async createCourseOffering({ offering, faculty }: CreateCourseOfferingParams) {
    const facultyInfo = await this.parseFacultyInfo(faculty);

    return await db.transaction(async (tx) => {
      await this.validateEligibility(
        offering.course_curriculum_id,
        offering.class_id,
        offering.semester_id,
        tx,
      );

      let facultyId: number | undefined;

      if (facultyInfo) {
        if (facultyInfo.type === "existing") {
          await this.validateFacultyCandidate(facultyInfo.id, tx);
          facultyId = facultyInfo.id;
        } else {
          const { credentials, personalDetails } = facultyInfo.details;
          const accountRecord = await this.userService.createUserRecordViaExistingTx(
            {
              credentials,
              personalDetails,
              role: "FACULTY",
            },
            tx,
          );
          if (!accountRecord) {
            throw new AppError(
              500,
              "Failed to create faculty account. Changes during course offering creation were rolled back.",
            );
          }
          facultyId = accountRecord.credentials.id;
        }
      }

      if (!facultyId) {
        throw new AppError(400, "Faculty details or an existing faculty ID must be provided.");
      }

      const offeringData: CourseOfferingInsert = {
        ...offering,
        faculty_id: facultyId,
      };

      const validation = await CourseOfferingSchema.insert.safeParseAsync(offeringData);
      if (!validation.success) throw validation.error;

      const result = await CreateRecord<"CourseOfferings">("CourseOfferings", validation.data, tx);
      if (!result) throw new AppError(500, "Failed to create course offering.");

      return { courseOffering: result };
    });
  }

  async updateCourseOffering({
    course_offering_id,
    offering,
    faculty,
  }: UpdateCourseOfferingParams) {
    const facultyInfo = await this.parseFacultyInfo(faculty);

    return await db.transaction(async (tx) => {
      const existing = await this.getCourseOffering(course_offering_id, tx);

      const touchesEligibility =
        offering?.course_curriculum_id !== undefined ||
        offering?.class_id !== undefined ||
        offering?.semester_id !== undefined;

      if (touchesEligibility) {
        const courseCurriculumId = offering?.course_curriculum_id ?? existing.course_curriculum_id;
        const classId = offering?.class_id ?? existing.class_id;
        const semesterId = offering?.semester_id ?? existing.semester_id;
        await this.validateEligibility(courseCurriculumId, classId, semesterId, tx);
      }

      let facultyId: number | undefined;

      if (facultyInfo) {
        if (facultyInfo.type === "existing") {
          await this.validateFacultyCandidate(facultyInfo.id, tx);
          facultyId = facultyInfo.id;
        } else {
          const { credentials, personalDetails } = facultyInfo.details;
          const accountRecord = await this.userService.createUserRecordViaExistingTx(
            {
              credentials,
              personalDetails,
              role: "FACULTY",
            },
            tx,
          );
          if (!accountRecord) {
            throw new AppError(
              500,
              "Failed to create faculty account. Changes during course offering update were rolled back.",
            );
          }
          facultyId = accountRecord.credentials.id;
        }
      }

      const updateData = {
        ...offering,
        ...(facultyId !== undefined && { faculty_id: facultyId }),
      };

      const updated = await UpdateRecord<"CourseOfferings">(
        "CourseOfferings",
        existing.id,
        updateData,
        CourseOfferings.id,
        tx,
      );
      if (!updated) throw new AppError(500, "Failed to update course offering.");

      return { courseOffering: updated };
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
