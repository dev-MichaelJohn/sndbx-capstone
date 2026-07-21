import { CollegeDeans, Colleges } from "@/schemas/institution.schema.js";
import {
  and,
  ilike,
  isNull,
  or,
  getColumns,
  sql,
  eq,
  asc,
  desc,
  notExists,
  inArray,
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
import { AccountRoles, Accounts, PersonalDetails, Roles } from "@/schemas/auth.schema.js";
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
import UserService, { type IUserService } from "./user.service.js";

export interface ICollegeService {
  /** Creates a CollegeDeans link record tying an account to a college. */
  createCollegeDeanRecord(dean: CollegeDeanInsert, tx?: PgTransaction): Promise<CollegeDeanSelect>;

  /** Retrieves a paginated, searchable, sortable list of colleges, each joined with its current dean. */
  getColleges(
    params: CollegeSearchQuery,
  ): Promise<ReturnType<typeof createPaginatedData<CollegeWithDean[]>>>;

  /** Retrieves a single college by id, joined with its current dean's account and personal details. */
  getCollege(id: number, tx?: PgTransaction): Promise<CollegeWithDean>;

  /** Searches accounts eligible to be a dean, flagging each as already assigned or not. */
  searchAvailableDeanCandidates(
    search: string | undefined,
    tx?: PgTransaction,
  ): Promise<DeanCandidate[]>;

  /** Creates a new college, optionally assigning a dean (existing or brand-new account) in the same transaction. */
  createCollegeRecord(
    params: CreateCollegeRecordType,
  ): Promise<{ college: CollegeSelect; dean?: CollegeDeanSelect }>;

  /** Updates a college's fields and/or reassigns its dean, handling the old dean's role/link cleanup. */
  updateCollegeRecord(
    params: UpdateCollegeRecordType,
  ): Promise<{ college?: CollegeSelect; dean?: CollegeDeanSelect }>;

  /** Soft-deletes a college and its current dean link, revoking the dean's role if appropriate. */
  deleteCollegeRecord(collegeId: number): Promise<void>;
}

/**
 * Handles college CRUD and college-dean assignment. A dean is an account
 * linked to a college via `CollegeDeans` and granted the SUPERVISOR role;
 * assigning, reassigning, or removing a dean keeps that role grant and
 * link record in sync as a side effect of the college operation.
 */
class CollegeService implements ICollegeService {
  constructor(private userService: IUserService = UserService) {}

  /**
   * Builds the WHERE-clause fragment for a college name/initialism search.
   *
   * @param search - the raw search term, if any
   * @returns an `or(ilike(...), ilike(...))` condition, or `undefined` if
   *   `search` is empty/whitespace-only (i.e. no filtering should apply)
   */
  private getSearchConditions(search: string | undefined) {
    if (!search || search.trim().length === 0) return undefined;
    return or(ilike(Colleges.name, `%${search}%`), ilike(Colleges.initialism, `%${search}%`));
  }

  /**
   * Validates and normalizes the raw `dean` input from a create/update
   * request into a discriminated `{ type: "existing" | "new", ... }` shape.
   *
   * @param info - the raw dean assignment payload, if any
   * @returns the parsed dean info, or `undefined` if no dean info was given
   * @throws {ZodError} if `info` fails schema validation
   */
  private async parseDeanInfo(info?: CreateCollegeDean) {
    if (!info || Object.keys(info).length === 0) return undefined;
    const parsed = await CreateCollegeDeanSchema.safeParseAsync(info);
    if (!parsed.success) throw parsed.error;
    return parsed.data;
  }

  /**
   * Checks whether a proposed dean assignment refers to the college's
   * current dean, so callers can skip re-running the reassignment steps
   * (role grant/revoke, link soft-delete/insert) when nothing would
   * actually change.
   *
   * @param info - the parsed dean info from the request, if any
   * @param existingDean - the college's current dean account id / institutional id
   * @returns `true` if `info` is absent, or if it identifies the same
   *   account (by id for an "existing" dean, by institutional id for a
   *   "new" one — matching against the same person re-submitted)
   */
  private sameDeanInfo(
    info: CreateCollegeDean | undefined,
    existingDean: Pick<DeanCandidate, "account_id" | "institutional_id">,
  ) {
    if (!info) return true;

    if (info.type === "existing") return info.id === existingDean.account_id;
    else return info.details.personalDetails.institutional_id === existingDean.institutional_id;
  }

  /**
   * Checks whether an account currently chairs any active program, used to
   * decide whether their SUPERVISOR role should survive being unassigned
   * as a college dean (a program chair still needs it).
   *
   * @param accountId - the account to check
   * @param tx - optional transaction to run the query within
   * @returns `true` if the account chairs at least one non-deleted program
   */
  private async hasProgramsHandled(accountId: number, tx?: PgTransaction) {
    const existingPrograms = await GetRecords("ProgramChairs", {
      where: (ProgramChairs) =>
        and(eq(ProgramChairs.chair_id, accountId), isNull(ProgramChairs.deleted_at)),
      ...(tx && { tx }),
    });

    return existingPrograms.length > 0;
  }

  /**
   * Validates that an account is eligible to be assigned as a college dean:
   *  - the account exists and isn't soft-deleted
   *  - it doesn't hold a SYS_ADMIN, ADMIN, or STUDENT role
   *  - it isn't already linked as the current dean of another college
   *
   * Only relevant for the "existing account" dean path — a brand-new
   * account created via {@link IUserService.createUserRecordViaExistingTx}
   * satisfies all three by construction, so this isn't (and shouldn't be)
   * called for that branch.
   *
   * @param accountId - the account id being proposed as a dean
   * @param tx - optional transaction to run the checks within
   * @throws {AppError} 404 if the account doesn't exist or is deleted
   * @throws {AppError} 400 if the account holds a disallowed role
   * @throws {AppError} 409 if the account is already assigned as a dean
   */
  private async validateDeanCandidate(accountId: number, tx?: PgTransaction) {
    const account = await GetRecord("Accounts", {
      where: (Accounts) => and(eq(Accounts.id, accountId), isNull(Accounts.deleted_at)),
      ...(tx && { tx }),
    });
    if (!account) throw new AppError(404, "Dean account not found.");

    const roleRecords = await GetRecords<"AccountRoles", { system_role: string }>("AccountRoles", {
      select: () => ({ system_role: Roles.system_role }),
      where: (AccountRoles) =>
        and(eq(AccountRoles.account_id, accountId), isNull(AccountRoles.deleted_at)),
      join: (query) =>
        query.innerJoin(Roles, and(eq(Roles.id, AccountRoles.role_id), isNull(Roles.deleted_at))),
      ...(tx && { tx }),
    });
    const disallowedRoles = ["SYS_ADMIN", "ADMIN", "STUDENT"];
    if (roleRecords.some((r) => disallowedRoles.includes(r.system_role)))
      throw new AppError(400, "This account's role is not eligible to be assigned as a dean.");

    const existingDeanLink = await GetRecord("CollegeDeans", {
      where: (CollegeDeans) =>
        and(eq(CollegeDeans.dean_id, accountId), isNull(CollegeDeans.deleted_at)),
      ...(tx && { tx }),
    });
    if (existingDeanLink)
      throw new AppError(409, "This account is already assigned as the dean of a college.");
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

    return createPaginatedData<CollegeWithDean[]>({
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
   * @returns the matching college record
   * @throws {AppError} 404 if the no record found
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
    if (!data) throw new AppError(404, "No college record found.");

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
  async searchAvailableDeanCandidates(search: string | undefined, tx?: PgTransaction) {
    const deans = await GetRecords<"Accounts", DeanCandidate>("Accounts", {
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
            and(eq(CollegeDeans.dean_id, Accounts.id), isNull(CollegeDeans.deleted_at)),
          ),
      where: (Accounts) =>
        and(
          isNull(Accounts.deleted_at),

          // 🚫 Exclude SYS_ADMIN, ADMIN, and STUDENT via subquery
          notExists(
            db
              .select({ id: AccountRoles.id })
              .from(AccountRoles)
              .innerJoin(Roles, eq(Roles.id, AccountRoles.role_id))
              .where(
                and(
                  eq(AccountRoles.account_id, Accounts.id),
                  isNull(AccountRoles.deleted_at),
                  isNull(Roles.deleted_at),
                  inArray(Roles.system_role, ["SYS_ADMIN", "ADMIN", "STUDENT"]),
                ),
              ),
          ),

          // 🔍 Search filter
          search
            ? or(
                ilike(PersonalDetails.first_name, `%${search}%`),
                ilike(PersonalDetails.last_name, `%${search}%`),
                ilike(PersonalDetails.institutional_id, `%${search}%`),
              )
            : undefined,
        ),
      ...(tx && { tx }),
    });

    return deans;
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

        if (deanInfo.type === "existing") {
          await this.validateDeanCandidate(deanInfo.id, tx);
          accountId = deanInfo.id;
        } else {
          const { credentials, personalDetails } = deanInfo.details;
          const accountRecord = await this.userService.createUserRecordViaExistingTx(
            {
              credentials,
              personalDetails,
              role: "FACULTY",
            },
            tx,
          );
          if (!accountRecord)
            throw new AppError(
              500,
              "Failed to create college dean account. Changes during college record creation were rolled back.",
            );

          accountId = accountRecord.credentials.id;
        }

        await this.userService.grantRole(accountId, "SUPERVISOR", tx);
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

        if (deanInfo.type === "existing") {
          await this.validateDeanCandidate(deanInfo.id, tx);
          accountId = deanInfo.id;
        } else {
          const { credentials, personalDetails } = deanInfo.details;
          const accountRecord = await this.userService.createUserRecordViaExistingTx(
            { credentials, personalDetails, role: "FACULTY" },
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
            await this.userService.revokeRole(existingCollegeRecord.account_id, "SUPERVISOR", tx);

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

        await this.userService.grantRole(accountId, "SUPERVISOR", tx);
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

      if (existingCollegeRecord.account_id) {
        if (!(await this.hasProgramsHandled(existingCollegeRecord.account_id, tx)))
          await this.userService.revokeRole(existingCollegeRecord.account_id, "SUPERVISOR", tx);

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
      }

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

const collegeService = new CollegeService();
export default collegeService;
