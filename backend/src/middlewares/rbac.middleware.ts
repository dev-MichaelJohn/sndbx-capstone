import { GetRecords } from "@/services/db.service.js";
import type { Permission } from "@/types/seeder.type.js";
import { AppError } from "@/utils/error.util.js";
import type { RequestHandler } from "express";
import { Permissions, RolePermissions, Roles } from "@/schemas/auth.schema.js";
import { and, eq, isNull } from "drizzle-orm";

let rolePermissionsCache: Map<string, Set<string>> | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export const invalidateRolePermissionsCache = () => {
  rolePermissionsCache = null;
  lastCacheTime = 0;
};

async function getRolePermissionsMap(): Promise<Map<string, Set<string>>> {
  const now = Date.now();
  if (rolePermissionsCache && now - lastCacheTime < CACHE_TTL_MS) {
    return rolePermissionsCache;
  }

  const grants = await GetRecords<"RolePermissions", { role_name: string; key: string }>(
    "RolePermissions",
    {
      select: () => ({
        role_name: Roles.system_role,
        key: Permissions.permission_key,
      }),
      join: (query) =>
        query
          .innerJoin(Permissions, eq(RolePermissions.permission_id, Permissions.id))
          .innerJoin(Roles, eq(RolePermissions.role_id, Roles.id)),
      where: (table) =>
        and(isNull(table.deleted_at), isNull(Roles.deleted_at), isNull(Permissions.deleted_at)),
    },
  );

  const map = new Map<string, Set<string>>();
  for (const g of grants) {
    if (!map.has(g.role_name)) {
      map.set(g.role_name, new Set());
    }
    map.get(g.role_name)!.add(g.key);
  }

  rolePermissionsCache = map;
  lastCacheTime = now;
  return map;
}

export const requirePermission = (...requiredPermissions: Permission[]): RequestHandler => {
  return async (req, _res, next) => {
    try {
      const user = req.user;
      if (!user) throw new AppError(401, "Authentication required.");

      const roles = user.roles ?? [];
      if (roles.length === 0) {
        throw new AppError(403, "Missing required permission(s): no roles assigned.");
      }

      const permissionsMap = await getRolePermissionsMap();

      const missing = requiredPermissions.filter((required) => {
        return !roles.some((role) => permissionsMap.get(role)?.has(required));
      });

      if (missing.length > 0) {
        throw new AppError(403, `Missing required permission(s): ${missing.join(", ")}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAnyPermission = (...allowedPermissions: Permission[]): RequestHandler => {
  return async (req, _res, next) => {
    try {
      const user = req.user;
      if (!user) throw new AppError(401, "Authentication required.");

      const roles = user.roles ?? [];
      if (roles.length === 0) {
        throw new AppError(403, "Access denied: no roles assigned.");
      }

      const permissionsMap = await getRolePermissionsMap();

      const hasAny = allowedPermissions.some((allowed) => {
        return roles.some((role) => permissionsMap.get(role)?.has(allowed));
      });

      if (!hasAny) {
        throw new AppError(
          403,
          `Access denied: requires at least one permission from [${allowedPermissions.join(", ")}]`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
