import { and, desc, eq, gte, isNotNull, isNull, lte, sql } from "drizzle-orm";
import db from "@/configs/db.config.js";
import { CreateRecord, GetRecord, GetRecords, UpdateRecord } from "./db.service.js";
import { AppError } from "@/utils/error.util.js";
import { calculateAfinnScore } from "@/utils/sentiment.util.js";
import { emitLiveSubmission } from "@/utils/socket.util.js";
import { Accounts, PersonalDetails } from "@/schemas/auth.schema.js";
import {
  CourseCurriculums,
  CourseOfferings,
  Courses,
  StudentClasses,
} from "@/schemas/institution.schema.js";
import {
  StudentEvaluationSchedules,
  StudentEvaluations,
  StudentEvaluationRatings,
  SupervisorEvaluationSchedules,
  SupervisorEvaluations,
  SupervisorEvaluationRatings,
} from "@/schemas/evaluation-execution.schema.js";
import {
  SubmitStudentEvalReqSchema,
  SubmitSupervisorEvalReqSchema,
  type SubmitStudentEvalReq,
  type SubmitSupervisorEvalReq,
  type StudentEvalSelect,
  type SupervisorEvalSelect,
} from "@/types/evaluation-execution.type.js";
import type { AnonymousSubmissionEvent } from "@/types/socket.type.js";

export interface IEvaluationExecutionService {
  submitStudentEvaluation(
    payload: SubmitStudentEvalReq,
  ): Promise<{ evaluation: StudentEvalSelect }>;
  submitSupervisorEvaluation(
    evaluatorId: number,
    payload: SubmitSupervisorEvalReq,
  ): Promise<{ evaluation: SupervisorEvalSelect }>;
  getStudentEvaluation(
    scheduleId: number,
    studentClassId: number,
  ): Promise<{ evaluation: StudentEvalSelect; ratings: unknown[] } | null>;
  getSupervisorEvaluation(
    evaluatorId: number,
    scheduleId: number,
    courseOfferingId: number,
  ): Promise<{ evaluation: SupervisorEvalSelect; ratings: unknown[] } | null>;
  getRecentAnonymousSubmissions(): Promise<AnonymousSubmissionEvent[]>;
}

export class evaluationExecutionService implements IEvaluationExecutionService {
  private async emitAnonymousStudentSubmission(studentClassId: number) {
    try {
      const details = await GetRecord<
        "StudentClasses",
        { faculty_name: string; course_initialism: string; course_name: string }
      >("StudentClasses", {
        select: () => ({
          faculty_name: sql<string>`CONCAT(${PersonalDetails.first_name}, ' ', ${PersonalDetails.last_name})`,
          course_initialism: Courses.initialism,
          course_name: Courses.name,
        }),
        join: (q) =>
          q
            .innerJoin(CourseOfferings, eq(StudentClasses.course_offering_id, CourseOfferings.id))
            .innerJoin(
              CourseCurriculums,
              eq(CourseOfferings.course_curriculum_id, CourseCurriculums.id),
            )
            .innerJoin(Courses, eq(CourseCurriculums.course_id, Courses.id))
            .innerJoin(Accounts, eq(CourseOfferings.faculty_id, Accounts.id))
            .innerJoin(PersonalDetails, eq(Accounts.personal_details_id, PersonalDetails.id)),
        where: eq(StudentClasses.id, studentClassId),
      });

      if (details) {
        emitLiveSubmission({
          id: crypto.randomUUID(),
          evaluator_type: "STUDENT",
          faculty_name: details.faculty_name,
          course_initialism: details.course_initialism,
          course_name: details.course_name,
          submitted_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Failed to emit live student submission event:", err);
    }
  }

  private async emitAnonymousSupervisorSubmission(courseOfferingId: number) {
    try {
      const details = await GetRecord<
        "CourseOfferings",
        { faculty_name: string; course_initialism: string; course_name: string }
      >("CourseOfferings", {
        select: () => ({
          faculty_name: sql<string>`CONCAT(${PersonalDetails.first_name}, ' ', ${PersonalDetails.last_name})`,
          course_initialism: Courses.initialism,
          course_name: Courses.name,
        }),
        join: (q) =>
          q
            .innerJoin(
              CourseCurriculums,
              eq(CourseOfferings.course_curriculum_id, CourseCurriculums.id),
            )
            .innerJoin(Courses, eq(CourseCurriculums.course_id, Courses.id))
            .innerJoin(Accounts, eq(CourseOfferings.faculty_id, Accounts.id))
            .innerJoin(PersonalDetails, eq(Accounts.personal_details_id, PersonalDetails.id)),
        where: eq(CourseOfferings.id, courseOfferingId),
      });

      if (details) {
        emitLiveSubmission({
          id: crypto.randomUUID(),
          evaluator_type: "SUPERVISOR",
          faculty_name: details.faculty_name,
          course_initialism: details.course_initialism,
          course_name: details.course_name,
          submitted_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Failed to emit live supervisor submission event:", err);
    }
  }

  async submitStudentEvaluation(
    payload: SubmitStudentEvalReq,
  ): Promise<{ evaluation: StudentEvalSelect }> {
    const validation = await SubmitStudentEvalReqSchema.safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    const { schedule_id, student_class_id, comment, is_draft, ratings } = validation.data;
    const now = new Date();

    const schedule = await GetRecord("StudentEvaluationSchedules", {
      where: () =>
        and(
          eq(StudentEvaluationSchedules.id, schedule_id),
          lte(StudentEvaluationSchedules.open_at, now),
          gte(StudentEvaluationSchedules.close_at, now),
          isNull(StudentEvaluationSchedules.deleted_at),
        ),
    });
    if (!schedule) throw new AppError(400, "Student evaluation schedule is closed or inactive.");

    const existing = await GetRecord("StudentEvaluations", {
      where: () =>
        and(
          eq(StudentEvaluations.schedule_id, schedule_id),
          eq(StudentEvaluations.student_class_id, student_class_id),
        ),
    });

    if (existing && existing.submitted_at !== null) {
      throw new AppError(409, "Evaluation already finalized and submitted.");
    }

    const totalRating = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const setRating = ratings.length > 0 ? (totalRating / ratings.length).toFixed(2) : null;
    const commentScore = comment ? calculateAfinnScore(comment).toFixed(2) : null;
    const submittedAt = is_draft ? null : now;

    const result = await db.transaction(async (tx) => {
      let evaluation: StudentEvalSelect;

      if (existing) {
        evaluation = (await UpdateRecord(
          "StudentEvaluations",
          existing.id,
          {
            comment,
            comment_score: is_draft ? null : commentScore,
            set_rating: is_draft ? null : setRating,
            submitted_at: submittedAt,
          },
          StudentEvaluations.id,
          tx,
        )) as StudentEvalSelect;

        await tx
          .delete(StudentEvaluationRatings)
          .where(eq(StudentEvaluationRatings.evaluation_id, existing.id));
      } else {
        evaluation = (await CreateRecord(
          "StudentEvaluations",
          {
            schedule_id,
            student_class_id,
            comment,
            comment_score: is_draft ? null : commentScore,
            set_rating: is_draft ? null : setRating,
            submitted_at: submittedAt,
          },
          tx,
        )) as StudentEvalSelect;
      }

      if (ratings.length > 0) {
        for (const item of ratings) {
          await CreateRecord(
            "StudentEvaluationRatings",
            {
              evaluation_id: evaluation.id,
              question_id: item.question_id,
              rating: item.rating,
            },
            tx,
          );
        }
      }

      return { evaluation };
    });

    if (!is_draft) {
      this.emitAnonymousStudentSubmission(student_class_id);
    }

    return result;
  }

  async submitSupervisorEvaluation(
    evaluatorId: number,
    payload: SubmitSupervisorEvalReq,
  ): Promise<{ evaluation: SupervisorEvalSelect }> {
    const validation = await SubmitSupervisorEvalReqSchema.safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    const { schedule_id, course_offering_id, comment, is_draft, ratings } = validation.data;
    const now = new Date();

    const schedule = await GetRecord("SupervisorEvaluationSchedules", {
      where: () =>
        and(
          eq(SupervisorEvaluationSchedules.id, schedule_id),
          lte(SupervisorEvaluationSchedules.open_at, now),
          gte(SupervisorEvaluationSchedules.close_at, now),
          isNull(SupervisorEvaluationSchedules.deleted_at),
        ),
    });
    if (!schedule) throw new AppError(400, "Supervisor evaluation schedule is closed or inactive.");

    const existing = await GetRecord("SupervisorEvaluations", {
      where: () =>
        and(
          eq(SupervisorEvaluations.schedule_id, schedule_id),
          eq(SupervisorEvaluations.evaluator_id, evaluatorId),
          eq(SupervisorEvaluations.course_offering_id, course_offering_id),
        ),
    });

    if (existing && existing.submitted_at !== null) {
      throw new AppError(409, "Supervisor evaluation already finalized and submitted.");
    }

    const totalRating = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const setRating = ratings.length > 0 ? (totalRating / ratings.length).toFixed(2) : null;
    const commentScore = comment ? calculateAfinnScore(comment).toFixed(2) : null;
    const submittedAt = is_draft ? null : now;

    const result = await db.transaction(async (tx) => {
      let evaluation: SupervisorEvalSelect;

      if (existing) {
        evaluation = (await UpdateRecord(
          "SupervisorEvaluations",
          existing.id,
          {
            comment,
            comment_score: is_draft ? null : commentScore,
            set_rating: is_draft ? null : setRating,
            submitted_at: submittedAt,
          },
          SupervisorEvaluations.id,
          tx,
        )) as SupervisorEvalSelect;

        await tx
          .delete(SupervisorEvaluationRatings)
          .where(eq(SupervisorEvaluationRatings.evaluation_id, existing.id));
      } else {
        evaluation = (await CreateRecord(
          "SupervisorEvaluations",
          {
            schedule_id,
            evaluator_id: evaluatorId,
            course_offering_id,
            comment,
            comment_score: is_draft ? null : commentScore,
            set_rating: is_draft ? null : setRating,
            submitted_at: submittedAt,
          },
          tx,
        )) as SupervisorEvalSelect;
      }

      if (ratings.length > 0) {
        for (const item of ratings) {
          await CreateRecord(
            "SupervisorEvaluationRatings",
            {
              evaluation_id: evaluation.id,
              question_id: item.question_id,
              rating: item.rating,
            },
            tx,
          );
        }
      }

      return { evaluation };
    });

    if (!is_draft) {
      this.emitAnonymousSupervisorSubmission(course_offering_id);
    }

    return result;
  }

  async getStudentEvaluation(scheduleId: number, studentClassId: number) {
    const evaluation = await GetRecord("StudentEvaluations", {
      where: () =>
        and(
          eq(StudentEvaluations.schedule_id, scheduleId),
          eq(StudentEvaluations.student_class_id, studentClassId),
        ),
    });

    if (!evaluation) return null;

    const ratings = await GetRecords("StudentEvaluationRatings", {
      where: () => eq(StudentEvaluationRatings.evaluation_id, evaluation.id),
    });

    return { evaluation, ratings };
  }

  async getSupervisorEvaluation(evaluatorId: number, scheduleId: number, courseOfferingId: number) {
    const evaluation = await GetRecord("SupervisorEvaluations", {
      where: () =>
        and(
          eq(SupervisorEvaluations.schedule_id, scheduleId),
          eq(SupervisorEvaluations.evaluator_id, evaluatorId),
          eq(SupervisorEvaluations.course_offering_id, courseOfferingId),
        ),
    });

    if (!evaluation) return null;

    const ratings = await GetRecords("SupervisorEvaluationRatings", {
      where: () => eq(SupervisorEvaluationRatings.evaluation_id, evaluation.id),
    });

    return { evaluation, ratings };
  }

  async getRecentAnonymousSubmissions(): Promise<AnonymousSubmissionEvent[]> {
    return await GetRecords<"StudentEvaluations", AnonymousSubmissionEvent>("StudentEvaluations", {
      select: () => ({
        id: sql<string>`CAST(${StudentEvaluations.id} AS TEXT)`,
        evaluator_type: sql<"STUDENT" | "SUPERVISOR">`'STUDENT'`,
        faculty_name: sql<string>`CONCAT(${PersonalDetails.first_name}, ' ', ${PersonalDetails.last_name})`,
        course_initialism: Courses.initialism,
        course_name: Courses.name,
        submitted_at: sql<string>`${StudentEvaluations.submitted_at}::text`,
      }),
      join: (q) =>
        q
          .innerJoin(StudentClasses, eq(StudentEvaluations.student_class_id, StudentClasses.id))
          .innerJoin(CourseOfferings, eq(StudentClasses.course_offering_id, CourseOfferings.id))
          .innerJoin(
            CourseCurriculums,
            eq(CourseOfferings.course_curriculum_id, CourseCurriculums.id),
          )
          .innerJoin(Courses, eq(CourseCurriculums.course_id, Courses.id))
          .innerJoin(Accounts, eq(CourseOfferings.faculty_id, Accounts.id))
          .innerJoin(PersonalDetails, eq(Accounts.personal_details_id, PersonalDetails.id))
          .orderBy(desc(StudentEvaluations.submitted_at))
          .limit(10),
      where: isNotNull(StudentEvaluations.submitted_at),
    });
  }
}

const EvaluationExecutionService = new evaluationExecutionService();
export default EvaluationExecutionService;
