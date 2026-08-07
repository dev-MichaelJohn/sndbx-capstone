import type { Request, Response, NextFunction } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { GetRecords } from "@/services/db.service.js";
import { CollegeDeans, ProgramChairs } from "@/schemas/institution.schema.js";
import { AppError } from "@/utils/error.util.js";
import type { SupervisorScope } from "@/types/supervisor.type.js";
import { SYSTEM_ROLES } from "@/types/seeder.type.js";

export const resolveSupervisorScope = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "Authentication required.");

    const roles = req.user?.roles;
    if (!roles || roles.length === 0)
      throw new AppError(403, "Access denied: no roles assigned to this account.");

    const isGlobalAdmin = roles.some((role) =>
      [SYSTEM_ROLES.SYS_ADMIN, SYSTEM_ROLES.ADMIN].includes(role),
    );

    if (isGlobalAdmin) {
      req.supervisorScope = null;
      return next();
    }

    const [deanships, chairships] = await Promise.all([
      GetRecords<"CollegeDeans", { college_id: number }>("CollegeDeans", {
        select: (t) => ({ college_id: t.college_id }),
        where: () => and(eq(CollegeDeans.dean_id, userId), isNull(CollegeDeans.deleted_at)),
      }),
      GetRecords<"ProgramChairs", { program_id: number }>("ProgramChairs", {
        select: (t) => ({ program_id: t.program_id }),
        where: () => and(eq(ProgramChairs.chair_id, userId), isNull(ProgramChairs.deleted_at)),
      }),
    ]);

    const scope: SupervisorScope = {
      collegeIds: deanships.map((d) => d.college_id),
      programIds: chairships.map((c) => c.program_id),
    };

    req.supervisorScope = scope;
    next();
  } catch (error) {
    next(error);
  }
};
