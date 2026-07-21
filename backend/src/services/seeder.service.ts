import db from "@/configs/db.config.js";
import { CreateRecord, GetRecords, GetRecord } from "./db.service.js";
import UserService, { type IUserService } from "./user.service.js";
import { AppError } from "@/utils/error.util.js";
import { AccountRoles, Roles, SystemRoles } from "@/schemas/auth.schema.js";
import { logger } from "@/utils/logger.util.js";
import { CreateUserReqSchema } from "@/types/user.type.js";
import type z from "zod";
import { and, eq, isNull } from "drizzle-orm";

/** Payload for seeding the initial super admin account — same shape as
 * a normal user-creation request, minus `role` (always forced to `SYS_ADMIN`). */
export const SuperAdminSchema = CreateUserReqSchema.omit({
  role: true,
});
export type SuperAdminType = z.infer<typeof SuperAdminSchema>;

/** Public surface of {@link SeederService}, for dependency injection/mocking. */
export interface ISeederService {
  seedRoles(): Promise<{ message: string }>;
  seedSuperAdmin(
    userData: SuperAdminType,
  ): Promise<Awaited<ReturnType<IUserService["createUser"]>>>;
}

/**
 * One-time setup operations run against a fresh database: seeding the
 * fixed set of system roles, and creating the initial super admin account.
 * Both operations are idempotent-safe — they refuse to run again once
 * already seeded, rather than creating duplicates.
 */
class seederService implements ISeederService {
  constructor(
    private client = db,
    private userService: IUserService = UserService,
  ) {}

  /** Checks whether the Roles table has no rows yet. */
  private async isRolesEmpty() {
    const result = await GetRecords("Roles");
    return result.length === 0;
  }

  /** Checks whether any active (non-deleted) account currently holds the SYS_ADMIN role. */
  private async isSuperAdminEmpty() {
    const result = await GetRecord("AccountRoles", {
      where: (AccountRoles) =>
        and(eq(Roles.system_role, "SYS_ADMIN"), isNull(AccountRoles.deleted_at)),
      join: (query) => query.innerJoin(Roles, eq(AccountRoles.role_id, Roles.id)),
    });
    return !result;
  }

  /**
   * Seeds the system's fixed set of roles, if they haven't been seeded yet.
   * All inserts run in a single transaction — if any insert fails, none are
   * committed.
   *
   * @returns a success message once seeding completes
   * @throws {AppError} 409 if roles have already been seeded
   * @throws {AppError} 500 if the seeding transaction fails
   */
  async seedRoles() {
    if (!(await this.isRolesEmpty())) {
      throw new AppError(409, "System roles are already seeded.");
    }

    try {
      await this.client.transaction(async (tx) => {
        for (const role of SystemRoles.enumValues) {
          await CreateRecord("Roles", { system_role: role }, tx);
        }
      });

      return { message: "System roles seeded successfully!" };
    } catch (error) {
      logger.error(`Seeding transaction failed: ${error instanceof Error ? error.message : error}`);
      throw new AppError(500, "An unexpected database error occurred during seeding roles.");
    }
  }

  /**
   * Creates the initial super admin account, if one doesn't already exist.
   *
   * @param userData - credentials and personal details for the super admin
   * @returns the created account, personal details, and role-mapping records
   * @throws {ZodError} if `userData` fails schema validation
   * @throws {AppError} 409 if a super admin account already exists
   */
  async seedSuperAdmin(userData: SuperAdminType) {
    const validation = await SuperAdminSchema.safeParseAsync(userData);
    if (!validation.success) throw validation.error;
    if (!(await this.isSuperAdminEmpty()))
      throw new AppError(409, "A super admin account already exists.");

    return await this.userService.createUser({
      credentials: userData.credentials,
      personalDetails: userData.personalDetails,
      role: "SYS_ADMIN",
    });
  }
}

const SeederService = new seederService();
export default SeederService;
