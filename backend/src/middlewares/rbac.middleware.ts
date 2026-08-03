import { GetRecords } from "@/services/db.service.js";
import type { Permission } from "@/types/seeder.type.js";
import { UserSchema } from "@/types/user.type.js";
import { AppError } from "@/utils/error.util.js";
import type { RequestHandler } from "express";
import { Permissions, RolePermissions, Roles } from "@/schemas/auth.schema.js";
import { and, eq, getColumns, inArray, isNull } from "drizzle-orm";

export const requirePermission = (...requiredPermissions: Permission[]): RequestHandler => {
  return async (req, _res, next) => {
    try {
      const user = req.user;
      if (!user) throw new AppError(401, "Authentication required.");

      const validation = await UserSchema.safeParseAsync(user);
      if (!validation.success) throw validation.error;
      const parsed = validation.data;

      if (parsed.roles.length === 0) {
        throw new AppError(403, "Missing required permission(s): no roles assigned.");
      }

      const grants = await GetRecords<
        "RolePermissions",
        typeof RolePermissions.$inferSelect & {
          key: string;
        }
      >("RolePermissions", {
        select: () => ({ ...getColumns(RolePermissions), key: Permissions.permission_key }),
        join: (query) =>
          query
            .innerJoin(Permissions, eq(RolePermissions.permission_id, Permissions.id))
            .innerJoin(Roles, eq(RolePermissions.role_id, Roles.id)),
        where: (table) =>
          and(
            inArray(Roles.system_role, parsed.roles),
            inArray(Permissions.permission_key, requiredPermissions),
            isNull(table.deleted_at),
            isNull(Roles.deleted_at),
            isNull(Permissions.deleted_at),
          ),
      });

      const grantedKeys = new Set(grants.map((g) => g.key));
      const missing = requiredPermissions.filter((p) => !grantedKeys.has(p));

      if (missing.length > 0) {
        throw new AppError(403, `Missing required permission(s): ${missing.join(", ")}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
