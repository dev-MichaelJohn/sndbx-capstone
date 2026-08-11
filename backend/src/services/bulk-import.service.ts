import { isNull } from "drizzle-orm";
import db from "@/configs/db.config.js";
import { GetRecords } from "./db.service.js";
import UserService, { type IUserService } from "./user.service.js";
import { AppError } from "@/utils/error.util.js";
import { Colleges, Programs, Classes, Courses } from "@/schemas/institution.schema.js";
import {
  CollegeCsvRowSchema,
  ProgramCsvRowSchema,
  ClassCsvRowSchema,
  CourseCsvRowSchema,
  UserCsvRowSchema,
  type BulkEntity,
  type BulkImportResult,
} from "@/types/bulk-import.type.js";

export interface IBulkImportService {
  executeImport(entity: BulkEntity, rows: unknown[]): Promise<BulkImportResult>;
}

export class bulkImportService implements IBulkImportService {
  constructor(private userService: IUserService = UserService) {}

  async executeImport(entity: BulkEntity, rows: unknown[]): Promise<BulkImportResult> {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new AppError(400, "No CSV rows provided for import.");
    }

    const result: BulkImportResult = {
      totalRows: rows.length,
      successCount: 0,
      failedCount: 0,
      errors: [],
    };

    switch (entity) {
      case "colleges":
        await this.importColleges(rows, result);
        break;
      case "programs":
        await this.importPrograms(rows, result);
        break;
      case "classes":
        await this.importClasses(rows, result);
        break;
      case "courses":
        await this.importCourses(rows, result);
        break;
      case "users":
        await this.importUsers(rows, result);
        break;
      default:
        throw new AppError(400, `Unsupported import entity: ${entity}`);
    }

    return result;
  }

  private async importColleges(rows: unknown[], result: BulkImportResult) {
    await db.transaction(async (tx) => {
      const existingColleges = await GetRecords("Colleges", {
        where: (c) => isNull(c.deleted_at),
        tx,
      });
      const existingSet = new Set(existingColleges.map((c) => c.initialism.toUpperCase()));

      for (let i = 0; i < rows.length; i++) {
        const rowNum = i + 1;
        const validation = await CollegeCsvRowSchema.safeParseAsync(rows[i]);
        if (!validation.success) {
          result.failedCount++;
          result.errors.push({
            row: rowNum,
            message: validation.error.issues.map((j) => j.message).join(", "),
          });
          continue;
        }

        const data = validation.data;
        if (existingSet.has(data.initialism.toUpperCase())) {
          result.failedCount++;
          result.errors.push({
            row: rowNum,
            message: `College ${data.initialism} already exists.`,
          });
          continue;
        }

        try {
          await tx.insert(Colleges).values(data);
          existingSet.add(data.initialism.toUpperCase());
          result.successCount++;
        } catch (err) {
          result.failedCount++;
          result.errors.push({
            row: rowNum,
            message: err instanceof Error ? err.message : "Failed to import college row.",
          });
        }
      }
    });
  }

  private async importPrograms(rows: unknown[], result: BulkImportResult) {
    await db.transaction(async (tx) => {
      const existingColleges = await GetRecords("Colleges", {
        where: (c) => isNull(c.deleted_at),
        tx,
      });
      const collegeMap = new Map(existingColleges.map((c) => [c.initialism.toUpperCase(), c.id]));

      for (let i = 0; i < rows.length; i++) {
        const rowNum = i + 1;
        const validation = await ProgramCsvRowSchema.safeParseAsync(rows[i]);
        if (!validation.success) {
          result.failedCount++;
          result.errors.push({
            row: rowNum,
            message: validation.error.issues.map((j) => j.message).join(", "),
          });
          continue;
        }

        try {
          let collegeId = validation.data.college_id;

          if (!collegeId && validation.data.college_initialism) {
            collegeId = collegeMap.get(validation.data.college_initialism.toUpperCase());
            if (!collegeId) {
              throw new AppError(
                404,
                `Parent College '${validation.data.college_initialism}' not found.`,
              );
            }
          }

          if (!collegeId) throw new AppError(400, "Could not resolve parent College ID.");

          await tx.insert(Programs).values({
            college_id: collegeId,
            name: validation.data.name,
            initialism: validation.data.initialism,
          });
          result.successCount++;
        } catch (err) {
          result.failedCount++;
          result.errors.push({
            row: rowNum,
            message: err instanceof Error ? err.message : "Failed to import program row.",
          });
        }
      }
    });
  }

  private async importClasses(rows: unknown[], result: BulkImportResult) {
    await db.transaction(async (tx) => {
      const existingPrograms = await GetRecords("Programs", {
        where: (p) => isNull(p.deleted_at),
        tx,
      });
      const programMap = new Map(existingPrograms.map((p) => [p.initialism.toUpperCase(), p.id]));

      for (let i = 0; i < rows.length; i++) {
        const rowNum = i + 1;
        const validation = await ClassCsvRowSchema.safeParseAsync(rows[i]);
        if (!validation.success) {
          result.failedCount++;
          result.errors.push({
            row: rowNum,
            message: validation.error.issues.map((j) => j.message).join(", "),
          });
          continue;
        }

        try {
          let programId = validation.data.program_id;

          if (!programId && validation.data.program_initialism) {
            programId = programMap.get(validation.data.program_initialism.toUpperCase());
            if (!programId) {
              throw new AppError(404, `Program '${validation.data.program_initialism}' not found.`);
            }
          }

          if (!programId) throw new AppError(400, "Could not resolve parent Program ID.");

          await tx.insert(Classes).values({
            program_id: programId,
            year_level: validation.data.year_level,
            section: validation.data.section,
          });
          result.successCount++;
        } catch (err) {
          result.failedCount++;
          result.errors.push({
            row: rowNum,
            message: err instanceof Error ? err.message : "Failed to import class row.",
          });
        }
      }
    });
  }

  private async importCourses(rows: unknown[], result: BulkImportResult) {
    await db.transaction(async (tx) => {
      const existingPrograms = await GetRecords("Programs", {
        where: (p) => isNull(p.deleted_at),
        tx,
      });
      const programMap = new Map(existingPrograms.map((p) => [p.initialism.toUpperCase(), p.id]));

      for (let i = 0; i < rows.length; i++) {
        const rowNum = i + 1;
        const validation = await CourseCsvRowSchema.safeParseAsync(rows[i]);
        if (!validation.success) {
          result.failedCount++;
          result.errors.push({
            row: rowNum,
            message: validation.error.issues.map((j) => j.message).join(", "),
          });
          continue;
        }

        try {
          let programId = validation.data.program_id;

          if (!programId && validation.data.program_initialism) {
            programId = programMap.get(validation.data.program_initialism.toUpperCase());
            if (!programId) {
              throw new AppError(404, `Program '${validation.data.program_initialism}' not found.`);
            }
          }

          if (!programId) throw new AppError(400, "Could not resolve parent Program ID.");

          await tx.insert(Courses).values({
            program_id: programId,
            initialism: validation.data.initialism,
            name: validation.data.name,
          });
          result.successCount++;
        } catch (err) {
          result.failedCount++;
          result.errors.push({
            row: rowNum,
            message: err instanceof Error ? err.message : "Failed to import course row.",
          });
        }
      }
    });
  }

  private async importUsers(rows: unknown[], result: BulkImportResult) {
    await db.transaction(async (tx) => {
      for (let i = 0; i < rows.length; i++) {
        const rowNum = i + 1;
        const validation = await UserCsvRowSchema.safeParseAsync(rows[i]);
        if (!validation.success) {
          result.failedCount++;
          result.errors.push({
            row: rowNum,
            message: validation.error.issues.map((j) => j.message).join(", "),
          });
          continue;
        }

        const { email, institutional_id, first_name, last_name, middle_name, suffix, role } =
          validation.data;

        try {
          await this.userService.createUserRecordViaExistingTx(
            {
              credentials: { email },
              personalDetails: {
                institutional_id,
                first_name,
                last_name,
                middle_name,
                suffix,
              },
              role,
            },
            tx,
          );
          result.successCount++;
        } catch (err) {
          result.failedCount++;
          result.errors.push({
            row: rowNum,
            message: err instanceof Error ? err.message : "Failed to import user account row.",
          });
        }
      }
    });
  }
}

const BulkImportService = new bulkImportService();
export default BulkImportService;
