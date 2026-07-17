import { CollegeDeans, Colleges } from "@/schemas/institution.schema.js";
import {
  and,
  ilike,
  isNull,
  or,
  getColumns,
  sql,
  type InferSelectModel,
  eq,
  asc,
  desc,
} from "drizzle-orm";
import z from "zod";
import {
  CreateRecord,
  GetRecord,
  GetRecords,
  UpdateRecord,
  SoftDeleteRecord,
} from "./db.service.js";
import { createPaginatedData } from "@/utils/response.util.js";
import { Accounts, PersonalDetails } from "@/schemas/auth.schema.js";
import {
  CollegeDeanSchema,
  CreateCollegeDeanSchema,
  CollegeSearchQuerySchema,
  CreateCollegeRecord,
  UpdateCollegeRecord,
  type CollegeSelect,
  type CollegeDeanInsert,
  type CollegeDeanSelect,
  type CreateCollegeDean,
  type CollegeSearchQuery,
  type CollegeWithDean,
  type CollegeWithDeanAndTotal,
  type CreateCollegeRecordType,
  type DeanCandidate,
  type UpdateCollegeRecordType,
  CollegeSchema,
} from "@/types/college.types.js";
import db, { type PgTransaction } from "@/configs/db.config.js";
import { AppError } from "@/utils/error.util.js";
import UserService from "./user.service.js";

class collegeService {
  constructor() {}
  private getSearchConditions(search: string) {
    return or(ilike(Colleges.name, `%${search}%`), ilike(Colleges.initialism, `%${search}%`));
  }

  private async parseDeanInfo(info?: CreateCollegeDean) {
    if (!info) return undefined;
    const parsed = await CreateCollegeDeanSchema.safeParseAsync(info);
    if (!parsed.success) throw parsed.error;
    return parsed.data;
  }

  private sameDeanInfo(
    info: CreateCollegeDean | undefined,
    existingDean: Pick<DeanCandidate, "account_id" | "institutional_id">,
  ) {
    if (!info) return true;

    if (info.type === "existing") return info.id === existingDean.account_id;
    else return info.details.personalDetails.institutional_id === existingDean.institutional_id;
  }

  private async hasProgramsHandled(accountId: number, tx?: PgTransaction) {
    const existingPrograms = await GetRecords("ProgramChairs", {
      where: (ProgramChairs) =>
        and(eq(ProgramChairs.chair_id, accountId), isNull(ProgramChairs.deleted_at)),
      ...(tx && { tx }),
    });

    return existingPrograms.length > 0;
  }

  /**
   * Creates a CollegeDeans link record tying an account to a college.
   *
   * @param dean - the dean_id/college_id pair to link
   * @param tx - optional transaction to run the insert within
   * @returns the created CollegeDeans record
   * @throws {AppError} 500 if the link record fails to create
   */
  async createCollegeDeanRecord(dean: CollegeDeanInsert, tx?: PgTransaction) {
    const validation = await CollegeDeanSchema.insert.safeParseAsync(dean);
    if (!validation.success) throw validation.error;

    const parsed = validation.data;

    const result = await CreateRecord<"CollegeDeans">("CollegeDeans", parsed, tx);
    if (!result)
      throw new AppError(
        500,
        "Failed to link college and dean account record. Changes during college record creation were rolled back.",
      );

    return result;
  }

  /**
   * Retrieves a paginated, searchable, sortable list of colleges, each
   * joined with its current dean's account and personal details (if any).
   *
   * @param params - search term, page number, and optional sort column/direction
   * @returns a paginated response containing the matching college records
   */
  async getColleges({ search, page, orderBy = "id", orderDir = "asc" }: CollegeSearchQuery) {
    const validation = await CollegeSearchQuerySchema.safeParseAsync({ search, page });
    if (!validation.success) throw validation.error;

    const PAGE_SIZE = 10;
    const searchConditions = this.getSearchConditions(search);

    const columns = getColumns(Colleges);
    const orderColumn = columns[orderBy as keyof typeof columns] ?? Colleges.id;
    const orderFn = orderDir === "asc" ? asc : desc;

    const rows = await GetRecords<"Colleges", CollegeWithDeanAndTotal>("Colleges", {
      select: (Colleges) => ({
        ...getColumns(Colleges),
        account_id: Accounts.id,
        institutional_id: PersonalDetails.institutional_id,
        first_name: PersonalDetails.first_name,
        last_name: PersonalDetails.last_name,
        middle_name: PersonalDetails.middle_name,
        suffix: PersonalDetails.suffix,
        totalItems: sql<number>`count(*) over()::int`.as("totalItems"),
      }),
      where: () => and(searchConditions, isNull(Colleges.deleted_at)),
      join: (query) =>
        query
          .leftJoin(
            CollegeDeans,
            and(eq(CollegeDeans.college_id, Colleges.id), isNull(CollegeDeans.deleted_at)),
          )
          .leftJoin(
            Accounts,
            and(eq(Accounts.id, CollegeDeans.dean_id), isNull(Accounts.deleted_at)),
          )
          .leftJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id))
          .orderBy(orderFn(orderColumn))
          .limit(PAGE_SIZE)
          .offset((page - 1) * PAGE_SIZE),
    });

    const totalItems = rows[0]?.totalItems ?? 0;
    const data = rows.map(({ totalItems, ...rest }) => rest);

    return createPaginatedData<InferSelectModel<typeof Colleges>[]>({
      data,
      currentPage: page,
      pageSize: PAGE_SIZE,
      totalItems,
    });
  }

  /**
   * Retrieves a single college record by id, joined with its current
   * dean's account and personal details (if any).
   *
   * @param id - the college id to look up
   * @param tx - optional transaction to run the query within
   * @returns the matching college record, or undefined if not found
   */
  async getCollege(id: number, tx?: PgTransaction) {
    const validation = await z.coerce.number().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const data = await GetRecord<"Colleges", CollegeWithDean>("Colleges", {
      select: (Colleges) => ({
        ...getColumns(Colleges),
        account_id: Accounts.id,
        institutional_id: PersonalDetails.institutional_id,
        first_name: PersonalDetails.first_name,
        last_name: PersonalDetails.last_name,
        middle_name: PersonalDetails.middle_name,
        suffix: PersonalDetails.suffix,
      }),
      where: () => and(eq(Colleges.id, id), isNull(Colleges.deleted_at)),
      join: (query) =>
        query
          .leftJoin(
            CollegeDeans,
            and(eq(CollegeDeans.college_id, Colleges.id), isNull(CollegeDeans.deleted_at)),
          )
          .leftJoin(
            Accounts,
            and(eq(Accounts.id, CollegeDeans.dean_id), isNull(Accounts.deleted_at)),
          )
          .leftJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id)),
      ...(tx && { tx }),
    });

    return data;
  }

  /**
   * Searches accounts by first name, last name, or institutional id,
   * flagging each result as already assigned as a college dean or not.
   *
   * @param search - the search term to match against name/institutional id
   * @param tx - optional transaction to run the query within
   * @returns the matching account records with an `is_college_dean` flag
   */
  async searchAvailableDeanCandidates(search: string, tx?: PgTransaction) {
    return await GetRecords<"Accounts", DeanCandidate>("Accounts", {
      select: (Accounts) => ({
        id: Accounts.id,
        first_name: PersonalDetails.first_name,
        last_name: PersonalDetails.last_name,
        middle_name: PersonalDetails.middle_name,
        suffix: PersonalDetails.suffix,
        is_college_dean: sql<boolean>`${CollegeDeans.id} IS NOT NULL`,
      }),
      join: (query) =>
        query
          .leftJoin(
            PersonalDetails,
            and(
              eq(PersonalDetails.id, Accounts.personal_details_id),
              isNull(PersonalDetails.deleted_at),
            ),
          )
          .leftJoin(
            CollegeDeans,
            and(eq(CollegeDeans.dean_id, Accounts.id), isNull(PersonalDetails.deleted_at)),
          ),
      where: () =>
        and(
          isNull(Accounts.deleted_at),
          or(
            ilike(PersonalDetails.first_name, `%${search}%`),
            ilike(PersonalDetails.last_name, `%${search}%`),
            ilike(PersonalDetails.institutional_id, `%${search}%`),
          ),
        ),
      ...(tx && { tx }),
    });
  }

  /**
   * Creates a new college, optionally assigning a dean in the same
   * transaction. The dean can be an existing account (granted the
   * SUPERVISOR role) or a brand-new account created on the fly. All steps
   * run in a single transaction — if any step fails, all prior inserts in
   * this call are rolled back.
   *
   * @param college - the college fields to insert
   * @param dean - optional dean assignment, either an existing account id or new-account details
   * @returns the created college record, and the dean link record if a dean was assigned
   * @throws {AppError} 500 if the college record, dean account, or dean link record fails to create
   */
  async createCollegeRecord({ college, dean }: CreateCollegeRecordType) {
    const validation = await CreateCollegeRecord.safeParseAsync({ college, dean });
    if (!validation.success) throw validation.error;

    const deanInfo = await this.parseDeanInfo(dean);

    return await db.transaction(async (tx) => {
      const collegeRecord = await CreateRecord("Colleges", college, tx);
      if (!collegeRecord) throw new AppError(500, "Failed to create college record.");

      let collegeDeanRecord: CollegeDeanSelect | undefined = undefined;

      if (deanInfo) {
        let accountId: number;

        if (deanInfo.type === "existing") accountId = deanInfo.id;
        else {
          const { credentials, personalDetails } = deanInfo.details;
          const accountRecord = await UserService.createUserRecordViaExistingTx(
            credentials,
            personalDetails,
            "FACULTY",
            tx,
          );
          if (!accountRecord)
            throw new AppError(
              500,
              "Failed to create college dean account. Changes during college record creation were rolled back.",
            );

          accountId = accountRecord.credentials.id;
        }

        await UserService.grantRole(accountId, "SUPERVISOR", tx);
        collegeDeanRecord = (await this.createCollegeDeanRecord(
          { dean_id: accountId, college_id: collegeRecord.id },
          tx,
        )) as CollegeDeanSelect;
        if (!collegeDeanRecord)
          throw new AppError(
            500,
            "Failed to link college and dean account record. Changes during college record creation were rolled back.",
          );
      }

      return {
        college: collegeRecord,
        ...(collegeDeanRecord && { dean: collegeDeanRecord }),
      };
    });
  }

  /**
   * Updates an existing college's fields and/or reassigns its dean. When
   * the dean changes, the old dean's CollegeDeans link is soft-deleted and
   * their SUPERVISOR role is revoked (unless they still chair a program),
   * then the new dean is linked and granted SUPERVISOR. All steps run in a
   * single transaction — if any step fails, all changes in this call are
   * rolled back.
   *
   * @param collegeId - the id of the college to update
   * @param college - partial college fields to update
   * @param dean - optional new dean assignment, either an existing account id or new-account details
   * @returns the updated college record, and the new dean link record if the dean changed
   * @throws {AppError} 400 if neither college nor dean update parameters were provided
   * @throws {AppError} 404 if no college record is found for the given id
   * @throws {AppError} 500 if the college record, dean account, old dean unlink, or new dean link fails
   */
  async updateCollegeRecord({ collegeId, college, dean }: UpdateCollegeRecordType) {
    const validation = await UpdateCollegeRecord.safeParseAsync({ collegeId, college, dean });
    if (!validation.success) throw validation.error;

    const deanInfo = await this.parseDeanInfo(dean);

    const hasCollegeInfo = college && Object.keys(college).length > 0;
    const hasDeanInfo = dean && Object.keys(dean).length > 0;

    if (!hasCollegeInfo && !hasDeanInfo)
      throw new AppError(400, "No update parameters were provided.");

    return await db.transaction(async (tx) => {
      const existingCollegeRecord = await this.getCollege(collegeId, tx);
      if (!existingCollegeRecord) throw new AppError(404, "No college record found.");

      let collegeRecord: CollegeSelect | undefined = undefined;
      let collegeDeanRecord: CollegeDeanSelect | undefined = undefined;

      if (hasCollegeInfo) {
        collegeRecord = (await UpdateRecord<"Colleges">(
          "Colleges",
          existingCollegeRecord.id,
          college,
          Colleges.id,
          tx,
        )) as CollegeSelect;
        if (!collegeRecord) throw new AppError(500, "Failed to update college record.");
      }

      if (
        deanInfo &&
        !this.sameDeanInfo(deanInfo, {
          account_id: existingCollegeRecord.account_id,
          institutional_id: existingCollegeRecord.institutional_id,
        })
      ) {
        let accountId: number;

        if (deanInfo.type === "existing") accountId = deanInfo.id;
        else {
          const { credentials, personalDetails } = deanInfo.details;
          const accountRecord = await UserService.createUserRecordViaExistingTx(
            credentials,
            personalDetails,
            "FACULTY",
            tx,
          );
          if (!accountRecord)
            throw new AppError(
              500,
              "Failed to create college dean account. Changes during this process were rolled back.",
            );

          accountId = accountRecord.credentials.id;
        }

        if (existingCollegeRecord.account_id) {
          if (!(await this.hasProgramsHandled(existingCollegeRecord.account_id, tx)))
            await UserService.revokeRole(existingCollegeRecord.account_id, "SUPERVISOR", tx);

          const deletedCollegeDeanRecord = await SoftDeleteRecord(
            "CollegeDeans",
            existingCollegeRecord.account_id,
            CollegeDeans.dean_id,
            tx,
          );
          if (!deletedCollegeDeanRecord)
            throw new AppError(
              500,
              "Failed to remove old college-dean record. Changes during this process were rolled back.",
            );
        }

        await UserService.grantRole(accountId, "SUPERVISOR", tx);
        collegeDeanRecord = (await this.createCollegeDeanRecord(
          { dean_id: accountId, college_id: existingCollegeRecord.id },
          tx,
        )) as CollegeDeanSelect;
        if (!collegeDeanRecord)
          throw new AppError(
            500,
            "Failed to link college and dean account record. Changes during college record creation were rolled back.",
          );
      }

      return {
        ...(collegeRecord && { college: collegeRecord }),
        ...(collegeDeanRecord && { dean: collegeDeanRecord }),
      };
    });
  }

  /**
   * Soft-deletes a college record along with its current CollegeDeans link
   * record, then, the old dean's CollegeDeans link is soft-deleted and
   * their SUPERVISOR role is revoked (unless they still chair a program),
   * Runs in a single transaction — if any step fails, all changes
   * in this call are rolled back.
   *
   * @param collegeId - the id of the college to delete
   * @throws {AppError} 404 if no college record is found for the given id
   * @throws {AppError} 500 if the dean link record or college record fails to soft-delete
   */
  async deleteCollegeRecord(collegeId: number) {
    const validation = await CollegeSchema.select.shape.id.safeParseAsync(collegeId);
    if (!validation.success) throw validation.error;

    const parsed = validation.data;

    return await db.transaction(async (tx) => {
      const existingCollegeRecord = await this.getCollege(parsed, tx);
      if (!existingCollegeRecord) throw new AppError(404, "No college record found.");

      if (
        existingCollegeRecord.account_id &&
        !(await this.hasProgramsHandled(existingCollegeRecord.account_id, tx))
      )
        await UserService.revokeRole(existingCollegeRecord.account_id, "SUPERVISOR", tx);

      const deletedCollegeDeanRecord = await SoftDeleteRecord(
        "CollegeDeans",
        existingCollegeRecord.id,
        CollegeDeans.college_id,
        tx,
      );
      if (!deletedCollegeDeanRecord)
        throw new AppError(
          500,
          "Failed to remove old college-dean record. Changes during this process were rolled back.",
        );

      const deletedCollegeRecord = await SoftDeleteRecord(
        "Colleges",
        existingCollegeRecord.id,
        Colleges.id,
        tx,
      );
      if (!deletedCollegeRecord)
        throw new AppError(
          500,
          "Failed to remove old college record. Changes during this process were rolled back.",
        );
    });
  }
}

const CollegeService = new collegeService();
export default CollegeService;
