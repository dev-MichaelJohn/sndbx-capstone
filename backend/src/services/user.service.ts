import { AccountRoles, Accounts, PersonalDetails, Roles } from "@/schemas/auth.schema.js";
import { and, asc, desc, eq, getColumns, ilike, isNull, or, sql } from "drizzle-orm";
import {
  CreateRecord,
  GetRecord,
  GetRecords,
  SoftDeleteRecord,
  UpdateRecord,
} from "./db.service.js";
import bcrypt from "bcryptjs";
import { AppError } from "@/utils/error.util.js";
import crypto from "node:crypto";
import db, { type PgTransaction } from "@/configs/db.config.js";
import {
  CreateUserReqSchema,
  UpdateUserReqSchema,
  UserSearchSchema,
  type AccountRecordWithRole,
  type AccountSelect,
  type SystemRole,
  type PersonalDetailsSelect,
  type AccountRoleSelect,
  type AccountInsert,
  type CreateUserReqType,
  type UpdateUserReqType,
  type UserSearchType,
  type UserWithDetails,
  AccountSchema,
  type RoleSelect,
  type UserType,
} from "@/types/user.type.js";
import z from "zod";
import EmailService, { type IEmailService } from "./email.service.js";
import {
  GenerateWelcomeHtmlTemplate,
  GenerateWelcomeTextTemplate,
  GenerateAccountUpdateHtmlTemplate,
  GenerateAccountUpdateTextTemplate,
  type UserUpdateEmailData,
} from "@/utils/email.util.js";
import { createPaginatedData, type PaginatedData } from "@/utils/response.util.js";
import { generateInstitutionalId } from "@/utils/institutional-id.util.js";

/** Result of {@link userService.createUser} — `credentials` has the password stripped. */
type CreateUserResult = {
  credentials: Omit<AccountSelect, "password">;
  details: PersonalDetailsSelect;
  role: AccountRoleSelect;
};

/** Public surface of {@link userService}, for dependency injection/mocking. */
export interface IUserService {
  getUsers(searchQuery: UserSearchType): Promise<PaginatedData<UserWithDetails[]>>;
  getUser(credentials: Pick<AccountSelect, "id" | "email">): Promise<UserType>;
  createUser(info: CreateUserReqType): Promise<CreateUserResult>;
  createUserRecordViaExistingTx(
    info: CreateUserReqType,
    tx: PgTransaction,
  ): Promise<CreateUserResult>;
  updateUser(id: number, data: UpdateUserReqType): Promise<UserType>;
  deleteUser(id: number): Promise<void>;
  grantRole(accountId: number, role: SystemRole, tx?: PgTransaction): Promise<void>;
  revokeRole(accountId: number, role: SystemRole, tx?: PgTransaction): Promise<void>;
}

/**
 * Handles user account CRUD, spanning PersonalDetails, Accounts,
 * and AccountRoles tables. All multi-step operations run as single atomic transactions.
 */
class userService implements IUserService {
  constructor(private emailService: IEmailService = EmailService) {}

  // ─── Private helpers: Security & Formatting ──────────────────────────────────

  private async accountHasRole(accountId: number, role: SystemRole, tx?: PgTransaction) {
    const accountRecords = await GetRecords<"Accounts", AccountRecordWithRole>("Accounts", {
      select: (Accounts) => ({
        ...getColumns(Accounts),
        system_role: Roles.system_role,
      }),
      where: (Accounts) => and(eq(Accounts.id, accountId), isNull(Accounts.deleted_at)),
      join: (query) =>
        query
          .leftJoin(
            AccountRoles,
            and(eq(AccountRoles.account_id, Accounts.id), isNull(AccountRoles.deleted_at)),
          )
          .leftJoin(Roles, and(eq(Roles.id, AccountRoles.role_id), isNull(Roles.deleted_at))),
      ...(tx && { tx }),
    });
    if (accountRecords.length === 0) throw new AppError(404, "Account not found.");

    const roles = accountRecords.map((r) => r.system_role);
    return roles.includes(role);
  }

  private stripPassword(data: AccountSelect) {
    const { password, ...user } = data;
    return user;
  }

  private generatePassword(length: number = 12) {
    const minLength = Math.max(8, length);

    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
    const allChars = uppercase + lowercase + numbers + symbols;

    const passwordArray: string[] = [
      uppercase[crypto.randomInt(0, uppercase.length)]!,
      lowercase[crypto.randomInt(0, lowercase.length)]!,
      numbers[crypto.randomInt(0, numbers.length)]!,
      symbols[crypto.randomInt(0, symbols.length)]!,
    ];

    for (let i = passwordArray.length; i < minLength; i++) {
      passwordArray.push(allChars[crypto.randomInt(0, allChars.length)]!);
    }

    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      const charI = passwordArray[i]!;
      const charJ = passwordArray[j]!;
      passwordArray[i] = charJ;
      passwordArray[j] = charI;
    }

    return passwordArray.join("");
  }

  private buildChangedFields(
    oldValues: Record<string, string | null | undefined>,
    newValues: Record<string, string | null | undefined>,
    labelMap: Record<string, string>,
  ): UserUpdateEmailData["updatedFields"] {
    return Object.entries(newValues)
      .filter(([key, val]) => val !== undefined && val !== oldValues[key])
      .map(([key, val]) => ({
        label: labelMap[key] ?? key,
        oldValue: oldValues[key] ?? "—",
        newValue: val ?? "—",
      }));
  }

  // ─── Private helpers: Deletion Guard Rules ────────────────────────────────────

  /**
   * Assesses active assignments across domain entities and throws an error if deletion is blocked.
   */
  private async validateAndDeleteRoleDependencies(
    accountId: number,
    roles: SystemRole[],
    tx: PgTransaction,
  ) {
    // 1. FACULTY Blocking Check
    if (roles.includes("FACULTY")) {
      const activeOfferings = await GetRecords("CourseOfferings", {
        where: (CourseOfferings) =>
          and(eq(CourseOfferings.faculty_id, accountId), isNull(CourseOfferings.deleted_at)),
        tx,
      });
      if (activeOfferings.length > 0) {
        throw new AppError(
          400,
          "Cannot delete user account: Active course offerings are linked to this faculty member.",
        );
      }
    }

    // 2. SUPERVISOR Blocking Check
    if (roles.includes("SUPERVISOR")) {
      const activeProgramChairs = await GetRecords("ProgramChairs", {
        where: (ProgramChairs) =>
          and(eq(ProgramChairs.chair_id, accountId), isNull(ProgramChairs.deleted_at)),
        tx,
      });
      if (activeProgramChairs.length > 0) {
        throw new AppError(
          400,
          "Cannot delete user account: Active program chair roles are linked to this supervisor.",
        );
      }

      const activeCollegeDeans = await GetRecords("CollegeDeans", {
        where: (CollegeDeans) =>
          and(eq(CollegeDeans.dean_id, accountId), isNull(CollegeDeans.deleted_at)),
        tx,
      });
      if (activeCollegeDeans.length > 0) {
        throw new AppError(
          400,
          "Cannot delete user account: Active college dean roles are linked to this supervisor.",
        );
      }
    }

    // 3. STUDENT Blocking Check
    if (roles.includes("STUDENT")) {
      const activeClassStudents = await GetRecords("ClassStudents", {
        where: (ClassStudents) =>
          and(eq(ClassStudents.student_account_id, accountId), isNull(ClassStudents.deleted_at)),
        tx,
      });
      if (activeClassStudents.length > 0) {
        throw new AppError(
          400,
          "Cannot delete user account: Student is linked to active class rosters.",
        );
      }

      const activeStudentClasses = await GetRecords("StudentClasses", {
        where: (StudentClasses) =>
          and(eq(StudentClasses.student_account_id, accountId), isNull(StudentClasses.deleted_at)),
        tx,
      });
      if (activeStudentClasses.length > 0) {
        throw new AppError(
          400,
          "Cannot delete user account: Student has active class enrollments.",
        );
      }
    }
  }

  // ─── Public methods ──────────────────────────────────────────────────────────

  async getUsers(searchQuery: UserSearchType): Promise<PaginatedData<UserWithDetails[]>> {
    searchQuery.orderBy = searchQuery.orderBy ?? "id";
    searchQuery.orderDir = searchQuery.orderDir ?? "asc";

    const validation = await UserSearchSchema.safeParseAsync(searchQuery);
    if (!validation.success) throw validation.error;

    const { search, role, page, orderBy, orderDir } = validation.data;

    const PAGE_SIZE = 10;
    const columns = getColumns(Accounts);
    const orderColumn = columns[orderBy as keyof typeof columns] ?? Accounts.id;
    const orderFn = orderDir === "asc" ? asc : desc;

    const searchCondition = search
      ? or(
          ilike(PersonalDetails.first_name, `%${search}%`),
          ilike(PersonalDetails.last_name, `%${search}%`),
          ilike(PersonalDetails.institutional_id, `%${search}%`),
        )
      : undefined;

    const rows = await GetRecords<
      "Accounts",
      Omit<AccountSelect, "password"> & {
        institutional_id: string;
        first_name: string;
        last_name: string;
        middle_name: string | null;
        suffix: string | null;
        system_role: SystemRole | null;
        totalItems: number;
      }
    >("Accounts", {
      select: (Accounts) => ({
        ...Object.fromEntries(
          Object.entries(getColumns(Accounts)).filter(([k]) => k !== "password"),
        ),
        institutional_id: PersonalDetails.institutional_id,
        first_name: PersonalDetails.first_name,
        last_name: PersonalDetails.last_name,
        middle_name: PersonalDetails.middle_name,
        suffix: PersonalDetails.suffix,
        system_role: Roles.system_role,
        totalItems: sql<number>`count(*) over()::int`.as("totalItems"),
      }),
      join: (query) =>
        query
          .innerJoin(
            PersonalDetails,
            and(
              eq(PersonalDetails.id, Accounts.personal_details_id),
              isNull(PersonalDetails.deleted_at),
            ),
          )
          .leftJoin(
            AccountRoles,
            and(eq(AccountRoles.account_id, Accounts.id), isNull(AccountRoles.deleted_at)),
          )
          .leftJoin(Roles, and(eq(Roles.id, AccountRoles.role_id), isNull(Roles.deleted_at)))
          .orderBy(orderFn(orderColumn))
          .limit(PAGE_SIZE)
          .offset((page - 1) * PAGE_SIZE),
      where: () =>
        and(
          isNull(Accounts.deleted_at),
          searchCondition,
          role ? eq(Roles.system_role, role) : undefined,
        ),
    });

    const totalItems = rows[0]?.totalItems ?? 0;

    const accountMap = new Map<number, UserWithDetails>();
    for (const row of rows) {
      const { system_role, totalItems, ...rest } = row;
      if (!accountMap.has(rest.id)) {
        accountMap.set(rest.id, { ...rest, roles: [] });
      }
      if (system_role) {
        accountMap.get(rest.id)!.roles.push(system_role);
      }
    }

    const data = Array.from(accountMap.values());

    return createPaginatedData<UserWithDetails[]>({
      data,
      currentPage: page,
      pageSize: PAGE_SIZE,
      totalItems,
    });
  }

  async getUser(credentials: Pick<AccountSelect, "id" | "email">) {
    const validation = await AccountSchema.select
      .pick({ id: true, email: true })
      .extend({ id: z.coerce.number().int().positive().nonoptional() })
      .safeParseAsync(credentials);
    if (!validation.success) throw validation.error;

    const { id, email } = validation.data;

    const existingUser = await GetRecord<"Accounts">("Accounts", {
      where: (Accounts) =>
        and(eq(Accounts.id, id), eq(Accounts.email, email), isNull(Accounts.deleted_at)),
    });
    if (!existingUser) throw new AppError(404, "No user account found.");

    const personalDetails = await GetRecord<"PersonalDetails">("PersonalDetails", {
      where: (PersonalDetails) =>
        and(
          eq(PersonalDetails.id, existingUser.personal_details_id),
          isNull(PersonalDetails.deleted_at),
        ),
    });
    if (!personalDetails) throw new AppError(404, "No user details found.");

    const roleRecords = await GetRecords<"AccountRoles", Pick<RoleSelect, "system_role">>(
      "AccountRoles",
      {
        select: () => ({ system_role: Roles.system_role }),
        where: (AccountRoles) =>
          and(eq(AccountRoles.account_id, id), isNull(AccountRoles.deleted_at)),
        join: (query) =>
          query.innerJoin(Roles, and(eq(Roles.id, AccountRoles.role_id), isNull(Roles.deleted_at))),
      },
    );
    if (roleRecords.length === 0) throw new AppError(404, "No role associated with this account.");

    const roles = roleRecords.map((r) => r.system_role);
    const { password, ...user } = existingUser;

    return { user, personalDetails, roles };
  }

  async createUser({
    credentials,
    personalDetails,
    role,
  }: CreateUserReqType): Promise<CreateUserResult> {
    const validation = await CreateUserReqSchema.safeParseAsync({
      credentials,
      personalDetails,
      role,
    });
    if (!validation.success) throw validation.error;

    let plainPassword = credentials.password;
    let wasPasswordGenerated = false;

    if (!personalDetails.institutional_id || !personalDetails.institutional_id.trim()) {
      personalDetails.institutional_id = generateInstitutionalId(role);
    }

    if (!plainPassword || plainPassword.trim().length === 0) {
      plainPassword = this.generatePassword();
      wasPasswordGenerated = true;
    }

    const result = await db.transaction(async (tx) => {
      const userDetails = await CreateRecord("PersonalDetails", personalDetails, tx);
      if (!userDetails)
        throw new AppError(
          500,
          "Failed to create personal details record while registering user. User account was not created.",
        );

      const hash = await bcrypt.hash(plainPassword, 10);
      const userCredentials: AccountInsert = {
        ...credentials,
        password: hash,
        personal_details_id: userDetails.id,
      };
      const userAccount = await CreateRecord("Accounts", userCredentials, tx);
      if (!userAccount)
        throw new AppError(
          500,
          "Failed to create account record while registering user. Personal details record was rolled back.",
        );

      const systemRole = await GetRecord("Roles", {
        where: (Roles) => eq(Roles.system_role, role),
        tx,
      });
      if (!systemRole)
        throw new AppError(
          400,
          "Given role has not been found. Changes during account creation were rolled back.",
        );

      const userRole = await CreateRecord(
        "AccountRoles",
        { account_id: userAccount.id, role_id: systemRole.id },
        tx,
      );
      if (!userRole)
        throw new AppError(
          400,
          "Failed to map account record to a role. Changes during account creation were rolled back.",
        );

      return {
        credentials: this.stripPassword(userAccount),
        details: userDetails,
        role: userRole,
      };
    });

    if (wasPasswordGenerated && result.credentials.email) {
      const fullName = [result.details.first_name, result.details.last_name]
        .filter(Boolean)
        .join(" ");

      const emailPayload = {
        recipientName: fullName || "User",
        email: result.credentials.email,
        generatedPassword: plainPassword,
      };

      try {
        await this.emailService.sendEmail({
          to: result.credentials.email,
          options: {
            subject: "PIT-FES Account Credentials & Security Notice",
            text: GenerateWelcomeTextTemplate(emailPayload),
            html: GenerateWelcomeHtmlTemplate(emailPayload),
          },
        });
      } catch {
        throw new AppError(
          500,
          "Account created successfully, but failed to send the welcome email containing credentials.",
        );
      }
    }

    return result;
  }

  async createUserRecordViaExistingTx(
    { credentials, personalDetails, role }: CreateUserReqType,
    tx: PgTransaction,
  ): Promise<CreateUserResult> {
    const validation = await CreateUserReqSchema.safeParseAsync({
      credentials,
      personalDetails,
      role,
    });
    if (!validation.success) throw validation.error;

    if (!personalDetails.institutional_id || !personalDetails.institutional_id.trim()) {
      personalDetails.institutional_id = generateInstitutionalId(role);
    }

    const userDetails = await CreateRecord<"PersonalDetails">(
      "PersonalDetails",
      personalDetails,
      tx,
    );
    if (!userDetails)
      throw new AppError(
        500,
        "Failed to create personal details record while registering user. User account was not created.",
      );

    if (!credentials.password || credentials.password.trim().length === 0)
      credentials.password = this.generatePassword();

    const hash = await bcrypt.hash(credentials.password, 10);
    const userCredentials: AccountInsert = {
      ...credentials,
      password: hash,
      personal_details_id: userDetails.id,
    };
    const userAccount = await CreateRecord("Accounts", userCredentials, tx);
    if (!userAccount)
      throw new AppError(
        500,
        "Failed to create account record while registering user. Personal details record was rolled back.",
      );

    const systemRole = await GetRecord("Roles", {
      where: (Roles) => eq(Roles.system_role, role),
      tx,
    });
    if (!systemRole)
      throw new AppError(
        400,
        "Given role has not been found. Changes during account creation were rolled back.",
      );

    const userRole = await CreateRecord(
      "AccountRoles",
      { account_id: userAccount.id, role_id: systemRole.id },
      tx,
    );
    if (!userRole)
      throw new AppError(
        400,
        "Failed to map account record to a role. Changes during account creation were rolled back.",
      );

    return {
      credentials: this.stripPassword(userAccount),
      details: userDetails,
      role: userRole,
    };
  }

  async updateUser(id: number, data: UpdateUserReqType): Promise<UserType> {
    const idValidation = await z.coerce.number().int().positive().safeParseAsync(id);
    if (!idValidation.success) throw idValidation.error;

    const parsedId = idValidation.data;

    const validation = await UpdateUserReqSchema.safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const { credentials, personalDetails } = validation.data;

    const hasCredentials = credentials && Object.keys(credentials).length > 0;
    const hasPersonalDetails = personalDetails && Object.keys(personalDetails).length > 0;

    if (!hasCredentials && !hasPersonalDetails)
      throw new AppError(400, "No update parameters were provided.");

    const result = await db.transaction(async (tx) => {
      const existingAccount = await GetRecord<"Accounts">("Accounts", {
        where: (Accounts) => and(eq(Accounts.id, parsedId), isNull(Accounts.deleted_at)),
        tx,
      });
      if (!existingAccount) throw new AppError(404, "No user account found.");

      const existingDetails = await GetRecord<"PersonalDetails">("PersonalDetails", {
        where: (PersonalDetails) =>
          and(
            eq(PersonalDetails.id, existingAccount.personal_details_id),
            isNull(PersonalDetails.deleted_at),
          ),
        tx,
      });
      if (!existingDetails) throw new AppError(404, "No user details found.");

      let updatedAccount = existingAccount;
      let updatedDetails = existingDetails;

      if (hasCredentials) {
        const result = await UpdateRecord<"Accounts">(
          "Accounts",
          parsedId,
          credentials,
          Accounts.id,
          tx,
        );
        if (!result) throw new AppError(500, "Failed to update account record.");
        updatedAccount = result;
      }

      if (hasPersonalDetails) {
        const result = await UpdateRecord<"PersonalDetails">(
          "PersonalDetails",
          existingDetails.id,
          personalDetails,
          PersonalDetails.id,
          tx,
        );
        if (!result) throw new AppError(500, "Failed to update personal details record.");
        updatedDetails = result;
      }

      return { updatedAccount, updatedDetails, existingAccount, existingDetails };
    });

    const { updatedAccount, updatedDetails, existingAccount, existingDetails } = result;

    const credentialLabelMap: Record<string, string> = { email: "Email" };
    const detailsLabelMap: Record<string, string> = {
      institutional_id: "Institutional ID",
      first_name: "First Name",
      last_name: "Last Name",
      middle_name: "Middle Name",
      suffix: "Suffix",
    };

    const changedFields = [
      ...this.buildChangedFields(
        { email: existingAccount.email },
        { email: updatedAccount.email },
        credentialLabelMap,
      ),
      ...this.buildChangedFields(
        {
          institutional_id: existingDetails.institutional_id,
          first_name: existingDetails.first_name,
          last_name: existingDetails.last_name,
          middle_name: existingDetails.middle_name,
          suffix: existingDetails.suffix,
        },
        {
          institutional_id: updatedDetails.institutional_id,
          first_name: updatedDetails.first_name,
          last_name: updatedDetails.last_name,
          middle_name: updatedDetails.middle_name,
          suffix: updatedDetails.suffix,
        },
        detailsLabelMap,
      ),
    ];

    if (changedFields.length > 0) {
      const fullName = [updatedDetails.first_name, updatedDetails.last_name]
        .filter(Boolean)
        .join(" ");

      const emailPayload: UserUpdateEmailData = {
        recipientName: fullName || "User",
        updatedFields: changedFields,
        updatedAt: new Date(),
      };

      const emailOptions = {
        subject: "PIT-FES Account Update Notice",
        text: GenerateAccountUpdateTextTemplate(emailPayload),
        html: GenerateAccountUpdateHtmlTemplate(emailPayload),
      };

      try {
        await this.emailService.sendEmail({
          to: updatedAccount.email,
          options: emailOptions,
        });

        const emailChanged = existingAccount.email !== updatedAccount.email;
        if (emailChanged) {
          await this.emailService.sendEmail({
            to: existingAccount.email,
            options: {
              ...emailOptions,
              subject: "PIT-FES Account Update Notice — Your Email Has Changed",
            },
          });
        }
      } catch {
        throw new AppError(
          500,
          "Account updated successfully, but failed to send the update notification email.",
        );
      }
    }

    const roleRecords = await GetRecords<"AccountRoles", Pick<RoleSelect, "system_role">>(
      "AccountRoles",
      {
        select: () => ({ system_role: Roles.system_role }),
        where: (AccountRoles) =>
          and(eq(AccountRoles.account_id, parsedId), isNull(AccountRoles.deleted_at)),
        join: (query) =>
          query.innerJoin(Roles, and(eq(Roles.id, AccountRoles.role_id), isNull(Roles.deleted_at))),
      },
    );

    const { password, ...user } = updatedAccount;

    return {
      user,
      personalDetails: updatedDetails,
      roles: roleRecords.map((r) => r.system_role),
    };
  }

  /**
   * Soft-deletes a user account, cascading to PersonalDetails and all AccountRoles rows.
   * Performs dependency safety checks before performing soft-deletion.
   */
  async deleteUser(id: number): Promise<void> {
    const validation = await z.coerce.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const parsedId = validation.data;

    return await db.transaction(async (tx) => {
      const existingAccount = await GetRecord<"Accounts">("Accounts", {
        where: (Accounts) => and(eq(Accounts.id, parsedId), isNull(Accounts.deleted_at)),
        tx,
      });
      if (!existingAccount) throw new AppError(404, "No user account found.");

      const existingDetails = await GetRecord<"PersonalDetails">("PersonalDetails", {
        where: (PersonalDetails) =>
          and(
            eq(PersonalDetails.id, existingAccount.personal_details_id),
            isNull(PersonalDetails.deleted_at),
          ),
        tx,
      });
      if (!existingDetails) throw new AppError(404, "No user details found.");

      const roleRows = await GetRecords<"AccountRoles", { id: number; system_role: SystemRole }>(
        "AccountRoles",
        {
          select: (AccountRoles) => ({
            id: AccountRoles.id,
            system_role: Roles.system_role,
          }),
          where: (AccountRoles) =>
            and(eq(AccountRoles.account_id, parsedId), isNull(AccountRoles.deleted_at)),
          join: (query) =>
            query.innerJoin(
              Roles,
              and(eq(Roles.id, AccountRoles.role_id), isNull(Roles.deleted_at)),
            ),
          tx,
        },
      );

      const roles = roleRows.map((r) => r.system_role);

      // Validate blockers across domain entities
      await this.validateAndDeleteRoleDependencies(parsedId, roles, tx);

      // 1. Cascade soft-delete all role assignments
      for (const roleRow of roleRows) {
        const deleted = await SoftDeleteRecord<"AccountRoles">(
          "AccountRoles",
          roleRow.id,
          AccountRoles.id,
          tx,
        );
        if (!deleted)
          throw new AppError(500, "Failed to remove account role records during user deletion.");
      }

      // 2. Soft-delete personal details
      const deletedDetails = await SoftDeleteRecord<"PersonalDetails">(
        "PersonalDetails",
        existingDetails.id,
        PersonalDetails.id,
        tx,
      );
      if (!deletedDetails)
        throw new AppError(500, "Failed to remove personal details record during user deletion.");

      // 3. Soft-delete the account itself
      const deletedAccount = await SoftDeleteRecord<"Accounts">(
        "Accounts",
        parsedId,
        Accounts.id,
        tx,
      );
      if (!deletedAccount)
        throw new AppError(500, "Failed to remove user account record during user deletion.");
    });
  }

  async grantRole(accountId: number, role: SystemRole, tx?: PgTransaction): Promise<void> {
    if (!(await this.accountHasRole(accountId, role, tx))) {
      const systemRole = await GetRecord("Roles", {
        where: (Roles) => eq(Roles.system_role, role),
        ...(tx && { tx }),
      });
      if (!systemRole) throw new AppError(404, "Given role has not been found.");

      const newRole = await CreateRecord(
        "AccountRoles",
        { account_id: accountId, role_id: systemRole.id },
        tx,
      );
      if (!newRole) throw new AppError(500, "Failed to grant new role.");
    }
  }

  async revokeRole(accountId: number, role: SystemRole, tx?: PgTransaction): Promise<void> {
    const roleRecord = await GetRecord("Roles", {
      where: (Roles) => and(eq(Roles.system_role, role), isNull(Roles.deleted_at)),
      ...(tx && { tx }),
    });
    if (!roleRecord) return;

    const accountRole = await GetRecord("AccountRoles", {
      where: (AccountRoles) =>
        and(
          eq(AccountRoles.account_id, accountId),
          eq(AccountRoles.role_id, roleRecord.id),
          isNull(AccountRoles.deleted_at),
        ),
      ...(tx && { tx }),
    });

    if (accountRole) {
      const revokedRole = await SoftDeleteRecord(
        "AccountRoles",
        accountRole.id,
        AccountRoles.id,
        tx,
      );
      if (!revokedRole) throw new AppError(500, "Failed to revoke role.");
    }
  }
}

const UserService = new userService();
export default UserService;
export { userService };
