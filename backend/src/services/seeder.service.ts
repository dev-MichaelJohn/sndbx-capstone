import { and, eq, isNull } from "drizzle-orm";
import type z from "zod";
import db from "@/configs/db.config.js";
import { AccountRoles, Roles, SystemRoles } from "@/schemas/auth.schema.js";
import {
  PERMISSIONS,
  ROLE_PERMISSION_MATRIX,
  type Permission,
  type RoleName,
} from "@/types/seeder.type.js";
import { CreateUserReqSchema } from "@/types/user.type.js";
import { AppError } from "@/utils/error.util.js";
import { logger } from "@/utils/logger.util.js";
import { CreateRecord, GetRecord, GetRecords } from "./db.service.js";
import UserService, { type IUserService } from "./user.service.js";
import { invalidateRolePermissionsCache } from "@/middlewares/rbac.middleware.js";

export const SuperAdminSchema = CreateUserReqSchema.omit({
  role: true,
});
export type SuperAdminType = z.infer<typeof SuperAdminSchema>;

export interface ISeederService {
  seedRolesAndPermissions(): Promise<{ message: string }>;
  seedSuperAdmin(
    userData: SuperAdminType,
  ): Promise<Awaited<ReturnType<IUserService["createUser"]>>>;
}

class seederService implements ISeederService {
  constructor(
    private client = db,
    private userService: IUserService = UserService,
  ) {}

  private async isSuperAdminEmpty() {
    const result = await GetRecord("AccountRoles", {
      where: (AccountRoles) =>
        and(eq(Roles.system_role, "SYS_ADMIN"), isNull(AccountRoles.deleted_at)),
      join: (query) => query.innerJoin(Roles, eq(AccountRoles.role_id, Roles.id)),
    });
    return !result;
  }

  /**
   * Idempotently syncs system roles, permissions, and role-permission matrices.
   * Inserts missing records without overwriting or duplicating existing ones.
   */
  async seedRolesAndPermissions() {
    try {
      await this.client.transaction(async (tx) => {
        // 1. Fetch current DB state
        const existingRoles = await GetRecords("Roles", { tx });
        const existingPermissions = await GetRecords("Permissions", { tx });
        const existingRolePermissions = await GetRecords("RolePermissions", { tx });

        // Maps for quick lookup
        const roleMap = new Map<string, number>(existingRoles.map((r) => [r.system_role, r.id]));
        const permissionMap = new Map<string, number>(
          existingPermissions.map((p) => [p.permission_key, p.id]),
        );

        // 2. Sync Missing System Roles
        for (const role of SystemRoles.enumValues) {
          if (!roleMap.has(role)) {
            const created = await CreateRecord("Roles", { system_role: role }, tx);
            roleMap.set(role, created.id);
          }
        }

        // 3. Sync Missing Permissions
        for (const permission of Object.values(PERMISSIONS)) {
          if (!permissionMap.has(permission)) {
            const created = await CreateRecord("Permissions", { permission_key: permission }, tx);
            permissionMap.set(permission, created.id);
          }
        }

        // 4. Sync Missing Role-Permission Mappings
        const existingRPSet = new Set(
          existingRolePermissions.map((rp) => `${rp.role_id}:${rp.permission_id}`),
        );

        for (const [roleName, permissions] of Object.entries(ROLE_PERMISSION_MATRIX) as [
          RoleName,
          Permission[],
        ][]) {
          const roleId = roleMap.get(roleName);
          if (!roleId) continue;

          for (const permissionKey of permissions) {
            const permissionId = permissionMap.get(permissionKey);
            if (!permissionId) continue;

            const key = `${roleId}:${permissionId}`;
            if (!existingRPSet.has(key)) {
              await CreateRecord(
                "RolePermissions",
                { role_id: roleId, permission_id: permissionId },
                tx,
              );
              existingRPSet.add(key);
            }
          }
        }
      });

      invalidateRolePermissionsCache();

      return { message: "Roles, permissions, and matrix synced successfully!" };
    } catch (error) {
      logger.error(`Seeding transaction failed: ${error instanceof Error ? error.message : error}`);
      throw new AppError(500, "An unexpected database error occurred during syncing permissions.");
    }
  }

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
export { seederService };
