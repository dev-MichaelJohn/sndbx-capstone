import { AccountRoles, Accounts, Roles } from "@/schemas/auth.schema.js";
import { and, eq, getColumns, isNull } from "drizzle-orm";
import { CreateRecord, GetRecord, GetRecords, SoftDeleteRecord } from "./db.service.js";
import bcrypt from "bcryptjs";
import { AppError } from "@/utils/error.util.js";
import crypto from "node:crypto";
import db, { type PgTransaction } from "@/configs/db.config.js";
import {
  CreateUserReqSchema,
  type AccountRecordWithRole,
  type AccountSelect,
  type SystemRole,
  type PersonalDetailsSelect,
  type AccountRoleSelect,
  type AccountInsert,
  type CreateUserReqType,
} from "@/types/user.type.js";

/** Result of {@link userService.createUser} — `credentials` has the password stripped. */
type CreateUserResult = {
  credentials: Omit<AccountSelect, "password">;
  details: PersonalDetailsSelect;
  role: AccountRoleSelect;
};

/** Public surface of {@link userService}, for dependency injection/mocking. */
export interface IUserService {
  createUser(info: CreateUserReqType): Promise<CreateUserResult>;
  createUserRecordViaExistingTx(
    info: CreateUserReqType,
    tx: PgTransaction,
  ): Promise<CreateUserResult>;
  grantRole(accountId: number, role: SystemRole, tx?: PgTransaction): Promise<void>;
  revokeRole(accountId: number, role: SystemRole, tx?: PgTransaction): Promise<void>;
}

/**
 * Handles user account creation, spanning the PersonalDetails, Accounts,
 * and AccountRoles tables as a single atomic operation.
 */
class userService implements IUserService {
  constructor() {}

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

      // Non-null assertions added to array indexing
      const charI = passwordArray[i]!;
      const charJ = passwordArray[j]!;

      passwordArray[i] = charJ;
      passwordArray[j] = charI;
    }

    return passwordArray.join("");
  }

  /**
   * Creates a new user account: inserts personal details, hashes the
   * password and creates the account record, then maps the account to the
   * given system role. All steps run in a single transaction — if any step
   * fails, all prior inserts in this call are rolled back.
   *
   * @param credentials - login credentials (email/password), excluding `personal_details_id`
   * @param personalDetails - the account holder's personal details
   * @param role - the system role to assign to the new account
   * @returns the created account record as `credentials` (password stripped,
   *   including its generated id), the created personal-details record as
   *   `details`, and the role-mapping record as `role`
   * @throws {AppError} 500 if the personal details or account record fails to create
   * @throws {AppError} 400 if the given role doesn't exist, or the account-role mapping fails
   */
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

    return await db.transaction(async (tx) => {
      const userDetails = await CreateRecord("PersonalDetails", personalDetails, tx);
      if (!userDetails)
        throw new AppError(
          500,
          "Failed to create personal details record while registering user. User account was not created.",
        );

      if (!credentials.password || credentials.password?.trim().length === 0)
        credentials.password = this.generatePassword();

      const hash = await bcrypt.hash(credentials.password, 10);
      const userCredentials: AccountInsert = {
        ...credentials,
        password: hash,
        personal_details_id: userDetails?.id,
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
        {
          account_id: userAccount.id,
          role_id: systemRole.id,
        },
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
  }

  /**
   * Same steps as {@link createUser} — inserts personal details, hashes the
   * password, creates the account record, and maps it to the given system
   * role — but runs within a transaction the caller already owns instead of
   * opening its own. Used when user creation is one step of a larger atomic
   * operation (e.g. creating a college along with a brand-new dean account).
   *
   * @param credentials - login credentials (email/password), excluding `personal_details_id`
   * @param personalDetails - the account holder's personal details
   * @param role - the system role to assign to the new account
   * @param tx - the transaction to run the inserts within
   * @returns the created account record as `credentials` (password stripped,
   *   including its generated id), the created personal-details record as
   *   `details`, and the role-mapping record as `role`
   * @throws {AppError} 500 if the personal details or account record fails to create
   * @throws {AppError} 400 if the given role doesn't exist, or the account-role mapping fails
   */
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

    if (!credentials.password || credentials.password?.trim().length === 0)
      credentials.password = this.generatePassword();

    const hash = await bcrypt.hash(credentials.password, 10);
    const userCredentials: AccountInsert = {
      ...credentials,
      password: hash,
      personal_details_id: userDetails?.id,
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
      {
        account_id: userAccount.id,
        role_id: systemRole.id,
      },
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

  /**
   * Grants a system role to an account, if it doesn't already have it.
   * No-ops if the account already holds the given role.
   *
   * @param accountId - the account to grant the role to
   * @param role - the system role to grant
   * @param tx - optional transaction to run the insert within
   * @throws {AppError} 404 if the given role has not been found
   * @throws {AppError} 500 if the role grant fails
   */
  async grantRole(accountId: number, role: SystemRole, tx?: PgTransaction): Promise<void> {
    if (!(await this.accountHasRole(accountId, role, tx))) {
      const systemRole = await GetRecord("Roles", {
        where: (Roles) => eq(Roles.system_role, role),
        ...(tx && { tx }),
      });
      if (!systemRole) throw new AppError(404, "Given role has not been found.");

      const newRole = await CreateRecord(
        "AccountRoles",
        {
          account_id: accountId,
          role_id: systemRole.id,
        },
        tx,
      );
      if (!newRole) throw new AppError(500, "Failed to grant new role.");
    }
  }

  /**
   * Revokes a system role from an account, if it currently has it.
   * No-ops if the account doesn't hold the given role.
   *
   * @param accountId - the account to revoke the role from
   * @param role - the system role to revoke
   * @param tx - optional transaction to run the soft-delete within
   * @throws {AppError} 500 if the role revocation fails
   */
  async revokeRole(accountId: number, role: SystemRole, tx?: PgTransaction): Promise<void> {
    if (await this.accountHasRole(accountId, role, tx)) {
      const revokedRole = await SoftDeleteRecord(
        "AccountRoles",
        accountId,
        AccountRoles.account_id,
        tx,
      );
      if (!revokedRole) throw new AppError(500, "Failed to revoke role.");
    }
  }
}

const UserService = new userService();
export default UserService;
