import { and, eq, gte, isNull, lte, sql } from "drizzle-orm";
import db from "@/configs/db.config.js";
import { CreateRecord, GetRecord, GetRecords, UpdateRecord } from "./db.service.js";
import { AppError } from "@/utils/error.util.js";
import {
  IndividualFacultyEvaluationReports,
  IferClassSummaries,
} from "@/schemas/evaluation-report.schema.js";
import {
  StudentEvaluations,
  SupervisorEvaluations,
  SupervisorEvaluationSchedules,
} from "@/schemas/evaluation-execution.schema.js";
import {
  Classes,
  CourseCurriculums,
  CourseOfferings,
  Courses,
  Programs,
  StudentClasses,
} from "@/schemas/institution.schema.js";
import { Accounts, PersonalDetails } from "@/schemas/auth.schema.js";
import { generateIferPdfBuffer } from "@/utils/components/ifer.pdf.js";
import { generateFedafPdfBuffer } from "@/utils/components/fedaf.pdf.js";
import { EVALUATION_WEIGHTS, RATING_CONFIG } from "@/utils/evaluation-report.util.js";
import {
  GenerateBatchIferReqSchema,
  UpdateDevelopmentPlanReqSchema,
  UpdateIferStatusReqSchema,
  type GenerateBatchIferReq,
  type IferSelect,
  type UnifiedFacultyReportDetail,
  type UpdateDevelopmentPlanReq,
  type UpdateIferStatusReq,
} from "@/types/evaluation-report.type.js";

export interface IEvaluationReportService {
  getAllReports(): Promise<Array<IferSelect & { faculty_name: string | null }>>;
  generateBatchReports(payload: GenerateBatchIferReq): Promise<{ generated_count: number }>;
  getReportDetail(reportId: number, isSelfView?: boolean): Promise<UnifiedFacultyReportDetail>;
  getFacultyReports(facultyId: number): Promise<IferSelect[]>;
  saveDevelopmentPlan(reportId: number, payload: UpdateDevelopmentPlanReq): Promise<IferSelect>;
  acknowledgeReport(reportId: number, facultyId: number): Promise<IferSelect>;
  updateReportStatus(reportId: number, payload: UpdateIferStatusReq): Promise<IferSelect>;
  renderIferPdf(reportId: number, isSelfView?: boolean): Promise<Buffer>;
  renderFedafPdf(reportId: number): Promise<Buffer>;
}

export class evaluationReportService implements IEvaluationReportService {
  private formatRating(val: number): string {
    return val.toFixed(RATING_CONFIG.DECIMAL_PLACES);
  }

  private async findActiveReportById(reportId: number): Promise<IferSelect> {
    const report = (await GetRecord("IndividualFacultyEvaluationReports", {
      where: (IndividualFacultyEvaluationReports) =>
        and(
          eq(IndividualFacultyEvaluationReports.id, reportId),
          isNull(IndividualFacultyEvaluationReports.deleted_at),
        ),
    })) as IferSelect | undefined;

    if (!report) throw new AppError(404, "Report not found.");
    return report;
  }

  private async validateNoActiveSchedules(semesterId: number, now: Date): Promise<void> {
    const activeStudentSchedules = await GetRecords("StudentEvaluationSchedules", {
      where: (s) =>
        and(
          eq(s.semester_id, semesterId),
          isNull(s.deleted_at),
          lte(s.open_at, now),
          gte(s.close_at, now),
        ),
    });

    const activeSupervisorSchedules = await GetRecords("SupervisorEvaluationSchedules", {
      where: (s) =>
        and(
          eq(s.semester_id, semesterId),
          isNull(s.deleted_at),
          lte(s.open_at, now),
          gte(s.close_at, now),
        ),
    });

    if (activeStudentSchedules.length > 0 || activeSupervisorSchedules.length > 0) {
      throw new AppError(
        400,
        "Cannot generate reports while an evaluation schedule is currently active.",
      );
    }
  }

  private async validateHasSubmittedEvaluations(semesterId: number): Promise<void> {
    const studentSubmissions = await GetRecords("StudentEvaluations", {
      select: (StudentEvaluations) => ({ id: StudentEvaluations.id }),
      where: () =>
        and(
          eq(CourseOfferings.semester_id, semesterId),
          isNull(CourseOfferings.deleted_at),
          sql`${StudentEvaluations.submitted_at} IS NOT NULL`,
        ),
      join: (query) =>
        query
          .innerJoin(StudentClasses, eq(StudentEvaluations.student_class_id, StudentClasses.id))
          .innerJoin(CourseOfferings, eq(StudentClasses.course_offering_id, CourseOfferings.id)),
    });

    const supervisorSubmissions = await GetRecords("SupervisorEvaluations", {
      select: (SupervisorEvaluations) => ({ id: SupervisorEvaluations.id }),
      where: () =>
        and(
          eq(SupervisorEvaluationSchedules.semester_id, semesterId),
          isNull(SupervisorEvaluationSchedules.deleted_at),
          sql`${SupervisorEvaluations.submitted_at} IS NOT NULL`,
        ),
      join: (query) =>
        query.innerJoin(
          SupervisorEvaluationSchedules,
          eq(SupervisorEvaluations.schedule_id, SupervisorEvaluationSchedules.id),
        ),
    });

    if (studentSubmissions.length === 0 && supervisorSubmissions.length === 0) {
      throw new AppError(
        400,
        "Cannot generate reports: No submitted student or supervisor evaluations found for this semester.",
      );
    }
  }

  private async fetchStudentComments(semesterId: number, facultyId: number): Promise<string[]> {
    const studentComments = await GetRecords<"StudentEvaluations", { comment: string | null }>(
      "StudentEvaluations",
      {
        select: (StudentEvaluations) => ({ comment: StudentEvaluations.comment }),
        where: () =>
          and(
            eq(CourseOfferings.semester_id, semesterId),
            eq(CourseOfferings.faculty_id, facultyId),
            sql`${StudentEvaluations.comment} IS NOT NULL`,
          ),
        join: (query) =>
          query
            .innerJoin(StudentClasses, eq(StudentClasses.course_offering_id, CourseOfferings.id))
            .innerJoin(CourseOfferings, eq(StudentClasses.course_offering_id, CourseOfferings.id)),
      },
    );

    return studentComments.map((c) => c.comment!).filter(Boolean);
  }

  private async fetchSupervisorComments(semesterId: number): Promise<string[]> {
    const supervisorComments = await GetRecords<
      "SupervisorEvaluations",
      { comment: string | null }
    >("SupervisorEvaluations", {
      select: (SupervisorEvaluations) => ({ comment: SupervisorEvaluations.comment }),
      where: () =>
        and(
          eq(SupervisorEvaluationSchedules.semester_id, semesterId),
          sql`${SupervisorEvaluations.comment} IS NOT NULL`,
        ),
      join: (query) =>
        query.innerJoin(
          SupervisorEvaluationSchedules,
          eq(SupervisorEvaluations.schedule_id, SupervisorEvaluationSchedules.id),
        ),
    });

    return supervisorComments.map((c) => c.comment!).filter(Boolean);
  }

  private rollupClassSummaries(
    classSummaries: UnifiedFacultyReportDetail["class_summaries"],
  ): UnifiedFacultyReportDetail["class_summaries"] {
    const courseMap = new Map<string, UnifiedFacultyReportDetail["class_summaries"][number]>();

    for (const item of classSummaries) {
      const existing = courseMap.get(item.course_code);
      const studentCount = item.student_count;
      const avgRating = Number(item.average_set_rating) || 0;
      const weightedScore = Number(item.weighted_set_score) || studentCount * avgRating;

      if (existing) {
        const newTotalStudents = existing.student_count + studentCount;
        const newTotalWeightedScore = Number(existing.weighted_set_score) + weightedScore;
        const newAvgRating = newTotalStudents > 0 ? newTotalWeightedScore / newTotalStudents : 0;

        existing.student_count = newTotalStudents;
        existing.average_set_rating = this.formatRating(newAvgRating);
        existing.weighted_set_score = this.formatRating(newTotalWeightedScore);
      } else {
        courseMap.set(item.course_code, {
          ...item,
          section: "All Sections",
          average_set_rating: this.formatRating(avgRating),
          weighted_set_score: this.formatRating(weightedScore),
        });
      }
    }

    return Array.from(courseMap.values());
  }

  private computeCombinedRating(setRating: string | null, sefRating: string | null): number | null {
    if (setRating && sefRating) {
      return (
        Number(setRating) * EVALUATION_WEIGHTS.SET_DEFAULT +
        Number(sefRating) * EVALUATION_WEIGHTS.SEF_DEFAULT
      );
    }
    return setRating ? Number(setRating) : null;
  }

  async getAllReports(): Promise<Array<IferSelect & { faculty_name: string | null }>> {
    return await GetRecords<
      "IndividualFacultyEvaluationReports",
      IferSelect & { faculty_name: string | null }
    >("IndividualFacultyEvaluationReports", {
      select: (t) => ({
        id: t.id,
        semester_id: t.semester_id,
        faculty_id: t.faculty_id,
        overall_set_rating: t.overall_set_rating,
        overall_sef_rating: t.overall_sef_rating,
        average_student_sentiment: t.average_student_sentiment,
        average_supervisor_sentiment: t.average_supervisor_sentiment,
        status: t.status,
        areas_for_improvement: t.areas_for_improvement,
        proposed_activities: t.proposed_activities,
        action_plan: t.action_plan,
        acknowledged_at: t.acknowledged_at,
        created_at: t.created_at,
        updated_at: t.updated_at,
        deleted_at: t.deleted_at,
        faculty_name: sql<string>`concat(${PersonalDetails.first_name}, ' ', ${PersonalDetails.last_name})`,
      }),
      where: (t) => isNull(t.deleted_at),
      join: (query) =>
        query
          .innerJoin(Accounts, eq(IndividualFacultyEvaluationReports.faculty_id, Accounts.id))
          .leftJoin(PersonalDetails, eq(Accounts.personal_details_id, PersonalDetails.id)),
    });
  }

  async generateBatchReports(payload: GenerateBatchIferReq): Promise<{ generated_count: number }> {
    const validation = await GenerateBatchIferReqSchema.safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    const { semester_id } = validation.data;

    const semester = await GetRecord("Semesters", {
      where: (Semesters) => eq(Semesters.id, semester_id),
    });
    if (!semester) throw new AppError(404, "Semester not found.");

    const now = new Date();
    await this.validateNoActiveSchedules(semester_id, now);
    await this.validateHasSubmittedEvaluations(semester_id);

    const facultyOfferings = await GetRecords<"CourseOfferings", { faculty_id: number }>(
      "CourseOfferings",
      {
        select: (CourseOfferings) => ({ faculty_id: CourseOfferings.faculty_id }),
        where: (CourseOfferings) =>
          and(eq(CourseOfferings.semester_id, semester_id), isNull(CourseOfferings.deleted_at)),
        join: (query) => query.groupBy(CourseOfferings.faculty_id),
      },
    );

    let generatedCount = 0;

    for (const { faculty_id } of facultyOfferings) {
      if (!faculty_id) continue;

      const classSummariesRaw = await GetRecords<
        "CourseOfferings",
        {
          course_offering_id: number;
          student_count: number;
          avg_set_rating: number;
          avg_student_sentiment: number;
        }
      >("CourseOfferings", {
        select: (CourseOfferings) => ({
          course_offering_id: CourseOfferings.id,
          student_count: sql<number>`count(${StudentEvaluations.id})::int`,
          avg_set_rating: sql<number>`coalesce(avg(${StudentEvaluations.set_rating}), 0)::float`,
          avg_student_sentiment: sql<number>`coalesce(avg(${StudentEvaluations.comment_score}), 0)::float`,
        }),
        where: (CourseOfferings) =>
          and(
            eq(CourseOfferings.semester_id, semester_id),
            eq(CourseOfferings.faculty_id, faculty_id),
            isNull(CourseOfferings.deleted_at),
          ),
        join: (query) =>
          query
            .leftJoin(StudentClasses, eq(StudentClasses.course_offering_id, CourseOfferings.id))
            .leftJoin(
              StudentEvaluations,
              and(
                eq(StudentEvaluations.student_class_id, StudentClasses.id),
                sql`${StudentEvaluations.submitted_at} IS NOT NULL`,
              ),
            )
            .groupBy(CourseOfferings.id),
      });

      const activeSummaries = classSummariesRaw.filter((c) => c.student_count > 0);
      const totalStudents = activeSummaries.reduce((acc, c) => acc + c.student_count, 0);
      const totalWeightedSetScore = activeSummaries.reduce(
        (acc, c) => acc + c.student_count * c.avg_set_rating,
        0,
      );

      const overallSetRating =
        totalStudents > 0 ? this.formatRating(totalWeightedSetScore / totalStudents) : null;
      const avgStudentSentiment =
        activeSummaries.length > 0
          ? this.formatRating(
              activeSummaries.reduce((acc, c) => acc + c.avg_student_sentiment, 0) /
                activeSummaries.length,
            )
          : null;

      const supervisorEval = await GetRecords<
        "SupervisorEvaluations",
        {
          avg_sef_rating: number;
          avg_supervisor_sentiment: number;
          count: number;
        }
      >("SupervisorEvaluations", {
        select: () => ({
          avg_sef_rating: sql<number>`coalesce(avg(${SupervisorEvaluations.set_rating}), 0)::float`,
          avg_supervisor_sentiment: sql<number>`coalesce(avg(${SupervisorEvaluations.comment_score}), 0)::float`,
          count: sql<number>`count(${SupervisorEvaluations.id})::int`,
        }),
        where: () =>
          and(
            eq(SupervisorEvaluationSchedules.semester_id, semester_id),
            sql`${SupervisorEvaluations.submitted_at} IS NOT NULL`,
          ),
        join: (query) =>
          query.innerJoin(
            SupervisorEvaluationSchedules,
            eq(SupervisorEvaluations.schedule_id, SupervisorEvaluationSchedules.id),
          ),
      });

      const overallSefRating =
        supervisorEval[0] && supervisorEval[0].count > 0
          ? this.formatRating(supervisorEval[0].avg_sef_rating)
          : null;
      const avgSupervisorSentiment =
        supervisorEval[0] && supervisorEval[0].count > 0
          ? this.formatRating(supervisorEval[0].avg_supervisor_sentiment)
          : null;

      await db.transaction(async (tx) => {
        const existing = await GetRecord("IndividualFacultyEvaluationReports", {
          where: (IndividualFacultyEvaluationReports) =>
            and(
              eq(IndividualFacultyEvaluationReports.semester_id, semester_id),
              eq(IndividualFacultyEvaluationReports.faculty_id, faculty_id),
              isNull(IndividualFacultyEvaluationReports.deleted_at),
            ),
          tx,
        });

        let ifer: IferSelect;

        if (existing) {
          ifer = (await UpdateRecord(
            "IndividualFacultyEvaluationReports",
            existing.id,
            {
              overall_set_rating: overallSetRating,
              overall_sef_rating: overallSefRating,
              average_student_sentiment: avgStudentSentiment,
              average_supervisor_sentiment: avgSupervisorSentiment,
              status: "DRAFT",
            },
            IndividualFacultyEvaluationReports.id,
            tx,
          )) as IferSelect;

          await tx.delete(IferClassSummaries).where(eq(IferClassSummaries.ifer_id, existing.id));
        } else {
          ifer = (await CreateRecord(
            "IndividualFacultyEvaluationReports",
            {
              semester_id,
              faculty_id,
              overall_set_rating: overallSetRating,
              overall_sef_rating: overallSefRating,
              average_student_sentiment: avgStudentSentiment,
              average_supervisor_sentiment: avgSupervisorSentiment,
              status: "DRAFT",
            },
            tx,
          )) as IferSelect;
        }

        for (const item of activeSummaries) {
          await CreateRecord(
            "IferClassSummaries",
            {
              ifer_id: ifer.id,
              course_offering_id: item.course_offering_id,
              student_count: item.student_count,
              average_set_rating: this.formatRating(item.avg_set_rating),
              weighted_set_score: this.formatRating(item.student_count * item.avg_set_rating),
            },
            tx,
          );
        }
      });

      generatedCount++;
    }

    return { generated_count: generatedCount };
  }

  async getReportDetail(reportId: number, isSelfView = false): Promise<UnifiedFacultyReportDetail> {
    const report = await this.findActiveReportById(reportId);

    const faculty = await GetRecord<
      "Accounts",
      { id: number; first_name: string | null; last_name: string | null }
    >("Accounts", {
      select: (Accounts) => ({
        id: Accounts.id,
        first_name: PersonalDetails.first_name,
        last_name: PersonalDetails.last_name,
      }),
      where: (Accounts) => eq(Accounts.id, report.faculty_id),
      join: (query) =>
        query.leftJoin(PersonalDetails, eq(Accounts.personal_details_id, PersonalDetails.id)),
    });

    const semester = await GetRecord("Semesters", {
      where: (Semesters) => eq(Semesters.id, report.semester_id),
    });

    let classSummaries = await GetRecords<
      "IferClassSummaries",
      {
        id: number;
        ifer_id: number;
        course_offering_id: number;
        student_count: number;
        average_set_rating: string;
        weighted_set_score: string;
        course_code: string;
        course_title: string;
        section: string;
      }
    >("IferClassSummaries", {
      select: (IferClassSummaries) => ({
        id: IferClassSummaries.id,
        ifer_id: IferClassSummaries.ifer_id,
        course_offering_id: IferClassSummaries.course_offering_id,
        student_count: IferClassSummaries.student_count,
        average_set_rating: IferClassSummaries.average_set_rating,
        weighted_set_score: IferClassSummaries.weighted_set_score,
        course_code: Courses.initialism,
        course_title: Courses.name,
        section: sql<string>`concat(${Programs.initialism}, ' ', ${Classes.year_level}, '-', ${Classes.section})`,
      }),
      where: (IferClassSummaries) => eq(IferClassSummaries.ifer_id, reportId),
      join: (query) =>
        query
          .innerJoin(CourseOfferings, eq(IferClassSummaries.course_offering_id, CourseOfferings.id))
          .innerJoin(
            CourseCurriculums,
            eq(CourseOfferings.course_curriculum_id, CourseCurriculums.id),
          )
          .innerJoin(Courses, eq(CourseCurriculums.course_id, Courses.id))
          .innerJoin(Classes, eq(CourseOfferings.class_id, Classes.id))
          .innerJoin(Programs, eq(Classes.program_id, Programs.id)),
    });

    if (isSelfView) {
      classSummaries = this.rollupClassSummaries(classSummaries);
    }

    const studentComments = await this.fetchStudentComments(report.semester_id, report.faculty_id);
    const supervisorComments = await this.fetchSupervisorComments(report.semester_id);
    const combinedRating = this.computeCombinedRating(
      report.overall_set_rating,
      report.overall_sef_rating,
    );

    return {
      report,
      faculty: {
        id: report.faculty_id,
        name: faculty ? `${faculty.first_name ?? ""} ${faculty.last_name ?? ""}`.trim() : "Unknown",
        department: "Academic Department",
      },
      semester: {
        id: report.semester_id,
        academic_year: semester
          ? `${semester.school_year_start}-${semester.school_year_end}`
          : "N/A",
        term: semester?.semester_term ?? "N/A",
      },
      class_summaries: classSummaries,
      combined_weighted_rating: combinedRating,
      student_comments: studentComments,
      supervisor_comments: supervisorComments,
    };
  }

  async getFacultyReports(facultyId: number): Promise<IferSelect[]> {
    const reports = await GetRecords("IndividualFacultyEvaluationReports", {
      where: (IndividualFacultyEvaluationReports) =>
        and(
          eq(IndividualFacultyEvaluationReports.faculty_id, facultyId),
          isNull(IndividualFacultyEvaluationReports.deleted_at),
        ),
    });
    return reports as IferSelect[];
  }

  async saveDevelopmentPlan(
    reportId: number,
    payload: UpdateDevelopmentPlanReq,
  ): Promise<IferSelect> {
    const validation = await UpdateDevelopmentPlanReqSchema.safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    await this.findActiveReportById(reportId);

    const updated = await UpdateRecord(
      "IndividualFacultyEvaluationReports",
      reportId,
      {
        areas_for_improvement: validation.data.areas_for_improvement,
        proposed_activities: validation.data.proposed_activities,
        action_plan: validation.data.action_plan,
      },
      IndividualFacultyEvaluationReports.id,
    );

    return updated as IferSelect;
  }

  async acknowledgeReport(reportId: number, facultyId: number): Promise<IferSelect> {
    const existing = await this.findActiveReportById(reportId);

    if (existing.faculty_id !== facultyId)
      throw new AppError(403, "Forbidden: You can only acknowledge your own report.");

    const updated = await UpdateRecord(
      "IndividualFacultyEvaluationReports",
      reportId,
      {
        status: "ACKNOWLEDGED",
        acknowledged_at: new Date(),
      },
      IndividualFacultyEvaluationReports.id,
    );

    return updated as IferSelect;
  }

  async updateReportStatus(reportId: number, payload: UpdateIferStatusReq): Promise<IferSelect> {
    const validation = await UpdateIferStatusReqSchema.safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    await this.findActiveReportById(reportId);

    const updated = await UpdateRecord(
      "IndividualFacultyEvaluationReports",
      reportId,
      { status: validation.data.status },
      IndividualFacultyEvaluationReports.id,
    );

    return updated as IferSelect;
  }

  async renderIferPdf(reportId: number, isSelfView = false): Promise<Buffer> {
    const details = await this.getReportDetail(reportId, isSelfView);
    return await generateIferPdfBuffer(details);
  }

  async renderFedafPdf(reportId: number): Promise<Buffer> {
    const details = await this.getReportDetail(reportId, false);
    return await generateFedafPdfBuffer(details);
  }
}

const EvaluationReportService = new evaluationReportService();
export default EvaluationReportService;
