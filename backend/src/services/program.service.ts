import { ProgramChairs, Programs } from "@/schemas/institution.schema.js";
import {
  CreateProgram,
  CreateProgramChair,
  ProgramChairSchema,
  ProgramSearchQuery,
  UpdateProgram,
  type ChairCandidateType,
  type CreateProgramChairType,
  type CreateProgramType,
  type ProgramChairInsert,
  type ProgramChairSelect,
  type ProgramSearchQueryType,
  type ProgramSelect,
  type ProgramWithChairAndTotalType,
  type ProgramWithChairType,
  type UpdateProgramType,
} from "@/types/program.type.js";
import {
  and,
  asc,
  desc,
  eq,
  getColumns,
  ilike,
  inArray,
  isNull,
  notExists,
  or,
  sql,
} from "drizzle-orm";
import {
  GetRecords,
  GetRecord,
  CreateRecord,
  UpdateRecord,
  SoftDeleteRecord,
} from "./db.service.js";
import { AccountRoles, Accounts, PersonalDetails, Roles } from "@/schemas/auth.schema.js";
import { createPaginatedData, type PaginatedData } from "@/utils/response.util.js";
import type { PgTransaction } from "@/configs/db.config.js";
import z from "zod";
import { AppError } from "@/utils/error.util.js";
import db from "@/configs/db.config.js";
import type { IUserService } from "./user.service.js";
import UserService from "./user.service.js";

export interface IProgramService {
  getPrograms(searchQuery: ProgramSearchQueryType): Promise<PaginatedData<ProgramWithChairType[]>>;
  getProgram(id: number, tx?: PgTransaction): Promise<ProgramWithChairType>;
  searchAvailableChairCandidates(
    search: string | undefined,
    tx?: PgTransaction,
  ): Promise<ChairCandidateType[]>;
  createProgramRecord(
    params: CreateProgramType,
  ): Promise<{ program: ProgramSelect; chair?: ProgramChairSelect }>;
  updateProgramRecord(
    params: UpdateProgramType,
  ): Promise<{ program?: ProgramSelect; chair?: ProgramChairSelect }>;
  deleteProgramRecord(id: number): Promise<void>;
}

class programService implements IProgramService {
  constructor(private userService: IUserService = UserService) {}

  private getSearchConditions(search: string | undefined) {
    if (!search || search.trim().length === 0) return undefined;
    return or(ilike(Programs.name, `%${search}%`), ilike(Programs.initialism, `%${search}%`));
  }

  private async parseChairInfo(info?: CreateProgramChairType) {
    if (!info || Object.keys(info).length === 0) return undefined;
    const parsed = await CreateProgramChair.safeParseAsync(info);
    if (!parsed.success) throw parsed.error;
    return parsed.data;
  }

  private sameChairInfo(
    info: CreateProgramChairType,
    existingChair: Pick<ChairCandidateType, "account_id" | "institutional_id">,
  ) {
    if (!info) return true;

    if (info.type === "existing") return info.id === existingChair.account_id;
    else return (info.details.personalDetails.institutional_id = existingChair.institutional_id);
  }

  private async validateChairCandidate(accountId: number, tx?: PgTransaction) {
    const account = await GetRecord("Accounts", {
      where: (Accounts) => and(eq(Accounts.id, accountId), isNull(Accounts.deleted_at)),
      ...(tx && { tx }),
    });
    if (!account) throw new AppError(404, "Chair account not found.");

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
  }

  private async getAccountId(info: CreateProgramChairType, tx: PgTransaction) {
    let account_id: number;

    if (info.type === "existing") {
      await this.validateChairCandidate(info.id);
      account_id = info.id;
    } else {
      const { credentials, personalDetails } = info.details;
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
          "Failed to create program chair account. Changes during program record creation were rolled back.",
        );

      account_id = accountRecord.credentials.id;
    }

    return account_id;
  }

  private async grantRoleAndCreateProgramChair(data: ProgramChairInsert, tx: PgTransaction) {
    await this.userService.grantRole(data.chair_id, "SUPERVISOR", tx);
    const result = await this.createProgramChairRecord(data, tx);
    if (!result)
      throw new AppError(
        500,
        "Failed to create program chair account. Changes during program record creation were rolled back.",
      );
    return result;
  }

  private async hasProgramsHandled(accountId: number, tx?: PgTransaction) {
    const existingPrograms = await GetRecords("ProgramChairs", {
      where: (ProgramChairs) =>
        and(eq(ProgramChairs.chair_id, accountId), isNull(ProgramChairs.deleted_at)),
      ...(tx && { tx }),
    });

    return existingPrograms.length > 0;
  }

  private async hasCollegeHandled(accountId: number, tx?: PgTransaction) {
    const existingColleges = await GetRecords("CollegeDeans", {
      where: (CollegeDeans) =>
        and(eq(CollegeDeans.dean_id, accountId), isNull(CollegeDeans.deleted_at)),
      ...(tx && { tx }),
    });

    return existingColleges.length > 0;
  }

  async getPrograms(searhQuery: ProgramSearchQueryType) {
    searhQuery.orderBy = searhQuery.orderBy ?? "id";
    searhQuery.orderDir = searhQuery.orderDir ?? "asc";

    const validation = await ProgramSearchQuery.safeParseAsync(searhQuery);
    if (!validation.success) throw validation.error;

    const { college_id, search, page, orderBy, orderDir } = validation.data;

    const PAGE_SIZE = 10;
    const searchConditions = this.getSearchConditions(search);

    const columns = getColumns(Programs);
    const orderColumn = columns[orderBy as keyof typeof columns] ?? Programs.id;
    const orderFn = orderDir === "asc" ? asc : desc;

    const rows = await GetRecords<"Programs", ProgramWithChairAndTotalType>("Programs", {
      select: (Programs) => ({
        ...getColumns(Programs),
        account_id: Accounts.id,
        institutional_id: PersonalDetails.institutional_id,
        first_name: PersonalDetails.first_name,
        last_name: PersonalDetails.last_name,
        middle_name: PersonalDetails.middle_name,
        suffix: PersonalDetails.suffix,
        totalItems: sql<number>`count(*) over()::int`.as("totalItems"),
      }),
      where: () =>
        and(
          searchConditions,
          isNull(Programs.deleted_at),
          college_id ? eq(Programs.college_id, college_id) : undefined,
        ),
      join: (query) =>
        query
          .leftJoin(
            ProgramChairs,
            and(eq(ProgramChairs.program_id, Programs.id), isNull(ProgramChairs.deleted_at)),
          )
          .leftJoin(
            Accounts,
            and(eq(Accounts.id, ProgramChairs.chair_id), isNull(Accounts.deleted_at)),
          )
          .leftJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id))
          .orderBy(orderFn(orderColumn))
          .limit(PAGE_SIZE)
          .offset((page - 1) * PAGE_SIZE),
    });

    const totalItems = rows[0]?.totalItems ?? 0;
    const data = rows.map(({ totalItems, ...rest }) => rest);

    return createPaginatedData<ProgramWithChairType[]>({
      data,
      currentPage: page,
      pageSize: PAGE_SIZE,
      totalItems,
    });
  }

  async getProgram(id: number, tx?: PgTransaction) {
    const validation = await z.coerce.number().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const data = await GetRecord<"Programs", ProgramWithChairType>("Programs", {
      select: (Programs) => ({
        ...getColumns(Programs),
        account_id: Accounts.id,
        institutional_id: PersonalDetails.institutional_id,
        first_name: PersonalDetails.first_name,
        last_name: PersonalDetails.last_name,
        middle_name: PersonalDetails.middle_name,
        suffix: PersonalDetails.suffix,
      }),
      where: () => and(isNull(Programs.deleted_at), eq(Programs.id, id)),
      join: (query) =>
        query
          .leftJoin(
            ProgramChairs,
            and(eq(ProgramChairs.program_id, Programs.id), isNull(ProgramChairs.deleted_at)),
          )
          .leftJoin(
            Accounts,
            and(eq(Accounts.id, ProgramChairs.chair_id), isNull(Accounts.deleted_at)),
          )
          .leftJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id)),
      ...(tx && { tx }),
    });
    if (!data) throw new AppError(404, "No program record found.");

    return data;
  }

  async searchAvailableChairCandidates(search: string | undefined, tx?: PgTransaction) {
    const chairs = await GetRecords<"Accounts", ChairCandidateType>("Accounts", {
      select: (Accounts) => ({
        account_id: Accounts.id,
        first_name: PersonalDetails.first_name,
        last_name: PersonalDetails.last_name,
        middle_name: PersonalDetails.middle_name,
        suffix: PersonalDetails.suffix,
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
            ProgramChairs,
            and(eq(ProgramChairs.chair_id, Accounts.id), isNull(ProgramChairs.deleted_at)),
          ),
      where: (Accounts) =>
        and(
          isNull(Accounts.deleted_at),
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

    return chairs;
  }

  async createProgramChairRecord(chair: ProgramChairInsert, tx?: PgTransaction) {
    const validation = await ProgramChairSchema.insert.safeParseAsync(chair);
    if (!validation.success) throw validation.success;

    const parsed = validation.data;

    const result = await CreateRecord<"ProgramChairs">("ProgramChairs", parsed, tx);
    if (!result)
      throw new AppError(
        500,
        "Failed to link program and chair account record. Changes during program record creation were rolled back.",
      );

    return result;
  }

  async createProgramRecord(params: CreateProgramType) {
    const validation = await CreateProgram.safeParseAsync(params);
    if (!validation.success) throw validation.error;

    const { program, chair } = validation.data;

    const chairInfo = await this.parseChairInfo(chair);

    return await db.transaction(async (tx) => {
      const collegeExists = await GetRecord("Colleges", {
        where: (Colleges) => and(eq(Colleges.id, program.college_id), isNull(Colleges.deleted_at)),
        tx,
      });
      if (!collegeExists) throw new AppError(400, "Invalid College ID.");

      const programRecord = await CreateRecord("Programs", program);
      if (!programRecord) throw new AppError(500, "Failed to create program record.");

      let programChairRecord: ProgramChairSelect | undefined = undefined;

      if (chairInfo) {
        const account_id = await this.getAccountId(chairInfo, tx);
        programChairRecord = await this.grantRoleAndCreateProgramChair(
          { program_id: programRecord.id, chair_id: account_id },
          tx,
        );
      }

      return {
        program: programRecord,
        ...(programChairRecord && { chair: programChairRecord }),
      };
    });
  }

  async updateProgramRecord(params: UpdateProgramType) {
    const validation = await UpdateProgram.safeParseAsync(params);
    if (!validation.success) throw validation.error;

    const { program_id, program, chair } = validation.data;

    const chairInfo = await this.parseChairInfo(chair);
    const hasProgramInfo = program && Object.keys(program).length > 0;
    const hasChairInfo = chairInfo && Object.keys(chairInfo).length > 0;

    if (!hasProgramInfo && !hasChairInfo)
      throw new AppError(400, "No update parameters were provided.");

    return await db.transaction(async (tx) => {
      const existingProgram = await this.getProgram(program_id, tx);
      if (!existingProgram) throw new AppError(404, "No program record found.");

      let programRecord: ProgramSelect | undefined = undefined;
      let programChairRecord: ProgramChairSelect | undefined = undefined;

      if (hasProgramInfo) {
        programRecord = await UpdateRecord<"Programs">(
          "Programs",
          existingProgram.id,
          program,
          Programs.id,
          tx,
        );
        if (!programRecord) throw new AppError(500, "Failed to update program record.");
      }

      if (
        hasChairInfo &&
        !this.sameChairInfo(chairInfo, {
          account_id: existingProgram.account_id,
          institutional_id: existingProgram.institutional_id,
        })
      ) {
        const account_id = await this.getAccountId(chairInfo, tx);

        if (existingProgram.account_id) {
          if (
            !(await this.hasProgramsHandled(existingProgram.account_id, tx)) &&
            !(await this.hasCollegeHandled(existingProgram.account_id, tx))
          ) {
            await this.userService.revokeRole(existingProgram.account_id, "SUPERVISOR", tx);

            const deleteProgramChairRecord = await SoftDeleteRecord<"ProgramChairs">(
              "ProgramChairs",
              existingProgram.account_id,
              ProgramChairs.chair_id,
              tx,
            );
            if (!deleteProgramChairRecord)
              throw new AppError(
                500,
                "Failed to remove old program chair record. Changes during this process were rolled back.",
              );
          }
        }

        programChairRecord = await this.grantRoleAndCreateProgramChair(
          {
            chair_id: account_id,
            program_id: existingProgram.id,
          },
          tx,
        );
      }

      return {
        ...(programRecord && { program: programRecord }),
        ...(programChairRecord && { chair: programChairRecord }),
      };
    });
  }

  async deleteProgramRecord(id: number) {
    const validation = await z.coerce.number().int().positive().nonoptional().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsed = validation.data;

    return await db.transaction(async (tx) => {
      const existingProgram = await this.getProgram(parsed, tx);
      if (!existingProgram) throw new AppError(404, "No program record found.");

      if (existingProgram.account_id) {
        if (
          !(await this.hasProgramsHandled(existingProgram.account_id, tx)) &&
          !(await this.hasCollegeHandled(existingProgram.account_id, tx))
        ) {
          await this.userService.revokeRole(existingProgram.account_id, "SUPERVISOR", tx);

          const programChair = await GetRecord<"ProgramChairs">("ProgramChairs", {
            where: (ProgramChairs) =>
              and(
                eq(ProgramChairs.program_id, existingProgram.id),
                eq(ProgramChairs.chair_id, existingProgram.account_id),
                isNull(ProgramChairs.deleted_at),
              ),
          });
          if (!programChair) throw new AppError(404, "No college dean record found.");

          const deleteProgramChair = await SoftDeleteRecord<"ProgramChairs">(
            "ProgramChairs",
            programChair.id,
            ProgramChairs.id,
            tx,
          );
          if (!deleteProgramChair)
            throw new AppError(
              500,
              "Failed to remove old program chair record. Changes during this process were rolled back.",
            );
        }
      }

      const deletedProgram = await SoftDeleteRecord<"Programs">(
        "Programs",
        existingProgram.id,
        Programs.id,
        tx,
      );
      if (!deletedProgram)
        throw new AppError(
          500,
          "Failed to remove old program record. Changes during this process were rolled back.",
        );
    });
  }
}

const ProgramService = new programService();
export default ProgramService;
export { programService };
