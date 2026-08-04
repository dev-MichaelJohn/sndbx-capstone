import { and, eq, gte, isNull, lte } from "drizzle-orm";
import {
  CreateRecord,
  UpdateRecord,
  SoftDeleteRecord,
  GetRecord,
  GetRecords,
  type TableNames,
  type SoftDeletableTables,
} from "./db.service.js";
import { AppError } from "@/utils/error.util.js";
import {
  StudentEvaluationSchedules,
  SupervisorEvaluationSchedules,
} from "@/schemas/evaluation-execution.schema.js";
import {
  UpsertScheduleReqSchema,
  type UpsertScheduleReq,
  type ScheduleSelect,
  type EvaluationType,
} from "@/types/evaluation-schedule.type.js";

export interface IEvaluationScheduleService {
  createSchedule(
    type: EvaluationType,
    payload: UpsertScheduleReq,
  ): Promise<{ schedule: ScheduleSelect }>;
  getSchedules(type: EvaluationType, semesterId?: number): Promise<ScheduleSelect[]>;
  getSchedule(type: EvaluationType, id: number): Promise<ScheduleSelect>;
  updateSchedule(
    type: EvaluationType,
    id: number,
    payload: Partial<UpsertScheduleReq>,
  ): Promise<{ schedule: ScheduleSelect }>;
  deleteSchedule(type: EvaluationType, id: number): Promise<void>;
  getActiveSchedule(type: EvaluationType, semesterId: number): Promise<ScheduleSelect | undefined>;
}

export class evaluationScheduleService implements IEvaluationScheduleService {
  async createSchedule(
    type: EvaluationType,
    payload: UpsertScheduleReq,
  ): Promise<{ schedule: ScheduleSelect }> {
    const validation = await UpsertScheduleReqSchema.safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    const tableName: TableNames =
      type === "student" ? "StudentEvaluationSchedules" : "SupervisorEvaluationSchedules";
    const schemaTable =
      type === "student" ? StudentEvaluationSchedules : SupervisorEvaluationSchedules;

    const existing = await GetRecord(tableName, {
      where: () =>
        and(
          eq(schemaTable.semester_id, validation.data.semester_id),
          eq(schemaTable.form_id, validation.data.form_id),
          isNull(schemaTable.deleted_at),
        ),
    });

    if (existing) throw new AppError(409, "Schedule for this semester and form already exists.");

    const schedule = await CreateRecord(tableName, validation.data);
    return { schedule: schedule as ScheduleSelect };
  }

  async getSchedules(type: EvaluationType, semesterId?: number): Promise<ScheduleSelect[]> {
    const tableName: SoftDeletableTables =
      type === "student" ? "StudentEvaluationSchedules" : "SupervisorEvaluationSchedules";
    const schemaTable =
      type === "student" ? StudentEvaluationSchedules : SupervisorEvaluationSchedules;

    const records = await GetRecords(tableName, {
      where: () =>
        and(
          isNull(schemaTable.deleted_at),
          semesterId ? eq(schemaTable.semester_id, semesterId) : undefined,
        ),
    });

    return records as ScheduleSelect[];
  }

  async getSchedule(type: EvaluationType, id: number): Promise<ScheduleSelect> {
    const tableName: SoftDeletableTables =
      type === "student" ? "StudentEvaluationSchedules" : "SupervisorEvaluationSchedules";
    const schemaTable =
      type === "student" ? StudentEvaluationSchedules : SupervisorEvaluationSchedules;

    const schedule = await GetRecord(tableName, {
      where: () => and(eq(schemaTable.id, id), isNull(schemaTable.deleted_at)),
    });

    if (!schedule) throw new AppError(404, "Schedule not found.");
    return schedule as ScheduleSelect;
  }

  async updateSchedule(
    type: EvaluationType,
    id: number,
    payload: Partial<UpsertScheduleReq>,
  ): Promise<{ schedule: ScheduleSelect }> {
    const tableName: SoftDeletableTables =
      type === "student" ? "StudentEvaluationSchedules" : "SupervisorEvaluationSchedules";
    const schemaTable =
      type === "student" ? StudentEvaluationSchedules : SupervisorEvaluationSchedules;

    const existing = await GetRecord(tableName, {
      where: () => and(eq(schemaTable.id, id), isNull(schemaTable.deleted_at)),
    });
    if (!existing) throw new AppError(404, "Schedule not found.");

    const merged = {
      semester_id: payload.semester_id ?? existing.semester_id,
      form_id: payload.form_id ?? existing.form_id,
      open_at: payload.open_at ?? existing.open_at,
      close_at: payload.close_at ?? existing.close_at,
    };

    const validation = await UpsertScheduleReqSchema.safeParseAsync(merged);
    if (!validation.success) throw validation.error;

    const updated = await UpdateRecord(tableName, id, validation.data, schemaTable.id);
    return { schedule: updated as ScheduleSelect };
  }

  async deleteSchedule(type: EvaluationType, id: number): Promise<void> {
    const tableName: SoftDeletableTables =
      type === "student" ? "StudentEvaluationSchedules" : "SupervisorEvaluationSchedules";
    const schemaTable =
      type === "student" ? StudentEvaluationSchedules : SupervisorEvaluationSchedules;

    const deleted = await SoftDeleteRecord(tableName, id, schemaTable.id);
    if (!deleted) throw new AppError(404, "Schedule not found.");
  }

  async getActiveSchedule(
    type: EvaluationType,
    semesterId: number,
  ): Promise<ScheduleSelect | undefined> {
    const tableName: SoftDeletableTables =
      type === "student" ? "StudentEvaluationSchedules" : "SupervisorEvaluationSchedules";
    const schemaTable =
      type === "student" ? StudentEvaluationSchedules : SupervisorEvaluationSchedules;
    const now = new Date();

    const schedule = await GetRecord(tableName, {
      where: () =>
        and(
          eq(schemaTable.semester_id, semesterId),
          lte(schemaTable.open_at, now),
          gte(schemaTable.close_at, now),
          isNull(schemaTable.deleted_at),
        ),
    });

    return schedule as ScheduleSelect | undefined;
  }
}

const EvaluationScheduleService = new evaluationScheduleService();
export default EvaluationScheduleService;
