import { and, eq, isNull, sql } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";
import { GetRecords } from "./db.service.js";
import {
  IndividualFacultyEvaluationReports,
  IferClassSummaries,
} from "@/schemas/evaluation-report.schema.js";
import { StudentClasses } from "@/schemas/institution.schema.js";
import {
  Classes,
  Colleges,
  CourseCurriculums,
  CourseOfferings,
  Courses,
  Programs,
  Semesters,
} from "@/schemas/institution.schema.js";
import { Accounts, PersonalDetails } from "@/schemas/auth.schema.js";
import { RATING_CONFIG } from "@/utils/evaluation-report.util.js";
import type { EvaluationAnalyticsPayload } from "@/types/evaluation-analytics.type.js";
import type { SupervisorScope } from "@/types/supervisor.type.js";
import { buildScopeFilter } from "@/utils/scope.util.js";
import { StudentEvaluations } from "@/schemas/evaluation-execution.schema.js";

const ANALYTICS_CONFIG = {
  DEFAULT_SCORE: 0.0,
  SENTIMENT_THRESHOLDS: {
    POSITIVE_MIN: 0.7,
    NEUTRAL_MIN: 0.4,
  },
  PERCENTAGE_FACTOR: 100,
  COURSE_RANKING_LIMIT: 5,
  DECIMAL_PRECISION: 1,
} as const;

interface CachedAnalytics {
  data: EvaluationAnalyticsPayload;
  timestamp: number;
}

const analyticsCache = new Map<string, CachedAnalytics>();
const ANALYTICS_CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export const clearAnalyticsCache = () => {
  analyticsCache.clear();
};

export interface IEvaluationAnalyticsService {
  getAnalytics(
    semesterId?: number,
    scope?: SupervisorScope | null,
  ): Promise<EvaluationAnalyticsPayload>;
}

export class EvaluationAnalyticsService implements IEvaluationAnalyticsService {
  private calculateMeanRating(ratingValues: Array<string | null>): number {
    const numericValues = ratingValues.map((val) => Number(val)).filter(Boolean);
    if (numericValues.length === 0) return ANALYTICS_CONFIG.DEFAULT_SCORE;
    const sum = numericValues.reduce((accumulator, current) => accumulator + current, 0);
    return Number((sum / numericValues.length).toFixed(RATING_CONFIG.DECIMAL_PLACES));
  }

  private async calculateCompletionRate(
    semesterId?: number,
    scope?: SupervisorScope | null,
  ): Promise<number> {
    const scopeFilter = buildScopeFilter(scope, { collegeTable: Colleges, programTable: Programs });

    const [totalExpectedResult, totalSubmittedResult] = await Promise.all([
      GetRecords<"StudentClasses", { count: number }>("StudentClasses", {
        select: () => ({ count: sql<number>`count(${StudentClasses.id})::int` }),
        where: () =>
          and(
            isNull(StudentClasses.deleted_at),
            semesterId ? eq(CourseOfferings.semester_id, semesterId) : undefined,
            scopeFilter,
          ),
        join: (q) =>
          q
            .innerJoin(CourseOfferings, eq(StudentClasses.course_offering_id, CourseOfferings.id))
            .innerJoin(Classes, eq(CourseOfferings.class_id, Classes.id))
            .innerJoin(Programs, eq(Classes.program_id, Programs.id))
            .leftJoin(Colleges, eq(Programs.college_id, Colleges.id)),
      }),
      GetRecords<"StudentEvaluations", { count: number }>("StudentEvaluations", {
        select: () => ({ count: sql<number>`count(${StudentEvaluations.id})::int` }),
        where: () =>
          and(
            sql`${StudentEvaluations.submitted_at} IS NOT NULL`,
            semesterId ? eq(CourseOfferings.semester_id, semesterId) : undefined,
            scopeFilter,
          ),
        join: (q) =>
          q
            .innerJoin(StudentClasses, eq(StudentEvaluations.student_class_id, StudentClasses.id))
            .innerJoin(CourseOfferings, eq(StudentClasses.course_offering_id, CourseOfferings.id))
            .innerJoin(Classes, eq(CourseOfferings.class_id, Classes.id))
            .innerJoin(Programs, eq(Classes.program_id, Programs.id))
            .leftJoin(Colleges, eq(Programs.college_id, Colleges.id)),
      }),
    ]);

    const totalExpected = totalExpectedResult[0]?.count ?? 0;
    const totalSubmitted = totalSubmittedResult[0]?.count ?? 0;

    if (totalExpected === 0) return 0.0;
    return Number(((totalSubmitted / totalExpected) * 100).toFixed(1));
  }

  private calculateSentimentDistribution(sentimentScores: Array<string | null>): {
    positive_pct: number;
    neutral_pct: number;
    negative_pct: number;
  } {
    const validScores = sentimentScores.map((score) => (score !== null ? Number(score) : 0));

    if (validScores.length === 0) {
      return { positive_pct: 0, neutral_pct: 100, negative_pct: 0 };
    }

    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    for (const score of validScores) {
      if (isNaN(score) || score === 0) {
        neutralCount++;
      } else if (score > 0) {
        positiveCount++;
      } else {
        negativeCount++;
      }
    }

    const totalCount = validScores.length;

    return {
      positive_pct: Number(
        ((positiveCount / totalCount) * ANALYTICS_CONFIG.PERCENTAGE_FACTOR).toFixed(
          ANALYTICS_CONFIG.DECIMAL_PRECISION,
        ),
      ),
      neutral_pct: Number(
        ((neutralCount / totalCount) * ANALYTICS_CONFIG.PERCENTAGE_FACTOR).toFixed(
          ANALYTICS_CONFIG.DECIMAL_PRECISION,
        ),
      ),
      negative_pct: Number(
        ((negativeCount / totalCount) * ANALYTICS_CONFIG.PERCENTAGE_FACTOR).toFixed(
          ANALYTICS_CONFIG.DECIMAL_PRECISION,
        ),
      ),
    };
  }

  private async fetchCollegePerformance(
    scope?: SupervisorScope | null,
  ): Promise<Array<{ college: string; avg_set: number; avg_sef: number }>> {
    const scopeFilter = buildScopeFilter(scope, { collegeTable: Colleges, programTable: Programs });
    const collegeRecords = await GetRecords<
      "IndividualFacultyEvaluationReports",
      { college: string; avg_set: number; avg_sef: number }
    >("IndividualFacultyEvaluationReports", {
      select: () => ({
        college: sql<string>`coalesce(${Colleges.initialism}, ${Programs.initialism})`,
        avg_set: sql<number>`coalesce(avg(${IndividualFacultyEvaluationReports.overall_set_rating}::numeric), 0)::float`,
        avg_sef: sql<number>`coalesce(avg(${IndividualFacultyEvaluationReports.overall_sef_rating}::numeric), 0)::float`,
      }),
      where: (reportRecord) => and(isNull(reportRecord.deleted_at), scopeFilter),
      join: (queryBuilder) =>
        queryBuilder
          .innerJoin(Accounts, eq(IndividualFacultyEvaluationReports.faculty_id, Accounts.id))
          .innerJoin(CourseOfferings, eq(CourseOfferings.faculty_id, Accounts.id))
          .innerJoin(Classes, eq(CourseOfferings.class_id, Classes.id))
          .innerJoin(Programs, eq(Classes.program_id, Programs.id))
          .leftJoin(Colleges, eq(Programs.college_id, Colleges.id))
          .groupBy(Colleges.id, Colleges.initialism, Programs.initialism) as unknown as PgSelect,
    });

    return collegeRecords.map((collegeRecord) => ({
      college: collegeRecord.college,
      avg_set: Number(collegeRecord.avg_set.toFixed(RATING_CONFIG.DECIMAL_PLACES)),
      avg_sef: Number(collegeRecord.avg_sef.toFixed(RATING_CONFIG.DECIMAL_PLACES)),
    }));
  }

  private async fetchCourseRankings(scope?: SupervisorScope | null): Promise<{
    top_courses: Array<{ course_code: string; course_title: string; avg_set: number }>;
    bottom_courses: Array<{ course_code: string; course_title: string; avg_set: number }>;
  }> {
    const scopeFilter = buildScopeFilter(scope, { collegeTable: Colleges, programTable: Programs });
    const coursePerformance = await GetRecords<
      "IferClassSummaries",
      { course_code: string; course_title: string; avg_set: number }
    >("IferClassSummaries", {
      select: () => ({
        course_code: Courses.initialism,
        course_title: Courses.name,
        avg_set: sql<number>`avg(${IferClassSummaries.average_set_rating}::numeric)::float`,
      }),
      where: () => scopeFilter,
      join: (queryBuilder) =>
        queryBuilder
          .innerJoin(CourseOfferings, eq(IferClassSummaries.course_offering_id, CourseOfferings.id))
          .innerJoin(
            CourseCurriculums,
            eq(CourseOfferings.course_curriculum_id, CourseCurriculums.id),
          )
          .innerJoin(Courses, eq(CourseCurriculums.course_id, Courses.id))
          .innerJoin(Classes, eq(CourseOfferings.class_id, Classes.id))
          .innerJoin(Programs, eq(Classes.program_id, Programs.id))
          .leftJoin(Colleges, eq(Programs.college_id, Colleges.id))
          .groupBy(Courses.initialism, Courses.name)
          .orderBy(
            sql`avg(${IferClassSummaries.average_set_rating}::numeric) DESC`,
          ) as unknown as PgSelect,
    });

    const formattedCourses = coursePerformance.map((courseRecord) => ({
      course_code: courseRecord.course_code,
      course_title: courseRecord.course_title,
      avg_set: Number(courseRecord.avg_set.toFixed(RATING_CONFIG.DECIMAL_PLACES)),
    }));

    const limit = ANALYTICS_CONFIG.COURSE_RANKING_LIMIT;

    return {
      top_courses: formattedCourses.slice(0, limit),
      bottom_courses: formattedCourses.slice(-limit).reverse(),
    };
  }

  private async fetchFacultyRankings(): Promise<{
    top_faculty: Array<{ faculty_id: number; faculty_name: string; avg_rating: number }>;
    bottom_faculty: Array<{ faculty_id: number; faculty_name: string; avg_rating: number }>;
  }> {
    const facultyPerformance = await GetRecords<
      "IndividualFacultyEvaluationReports",
      { faculty_id: number; faculty_name: string; avg_rating: number }
    >("IndividualFacultyEvaluationReports", {
      select: (reportRecord) => ({
        faculty_id: reportRecord.faculty_id,
        faculty_name: sql<string>`concat(${PersonalDetails.first_name}, ' ', ${PersonalDetails.last_name})`,
        avg_rating: sql<number>`coalesce(${reportRecord.overall_set_rating}::numeric, 0)::float`,
      }),
      where: (reportRecord) => isNull(reportRecord.deleted_at),
      join: (queryBuilder) =>
        queryBuilder
          .innerJoin(Accounts, eq(IndividualFacultyEvaluationReports.faculty_id, Accounts.id))
          .leftJoin(PersonalDetails, eq(Accounts.personal_details_id, PersonalDetails.id))
          .orderBy(
            sql`${IndividualFacultyEvaluationReports.overall_set_rating}::numeric DESC`,
          ) as unknown as PgSelect,
    });

    const formattedFaculty = facultyPerformance.map((facultyRecord) => ({
      faculty_id: facultyRecord.faculty_id,
      faculty_name: facultyRecord.faculty_name || "Unknown Faculty",
      avg_rating: Number(facultyRecord.avg_rating.toFixed(RATING_CONFIG.DECIMAL_PLACES)),
    }));

    const limit = ANALYTICS_CONFIG.COURSE_RANKING_LIMIT;

    return {
      top_faculty: formattedFaculty.slice(0, limit),
      bottom_faculty: formattedFaculty.slice(-limit).reverse(),
    };
  }

  private async fetchSemesterTrends(): Promise<
    Array<{ term: string; avg_set: number; avg_sef: number }>
  > {
    const historicalRecords = await GetRecords<
      "Semesters",
      { term: string; avg_set: number; avg_sef: number }
    >("Semesters", {
      select: (semesterTable) => ({
        term: sql<string>`concat('AY ', ${semesterTable.school_year_start}, '-', ${semesterTable.school_year_end}, ' ', ${semesterTable.semester_term})`,
        avg_set: sql<number>`coalesce(avg(${IndividualFacultyEvaluationReports.overall_set_rating}::numeric), 0)::float`,
        avg_sef: sql<number>`coalesce(avg(${IndividualFacultyEvaluationReports.overall_sef_rating}::numeric), 0)::float`,
      }),
      where: (semesterTable) => isNull(semesterTable.deleted_at),
      join: (queryBuilder) =>
        queryBuilder
          .leftJoin(
            IndividualFacultyEvaluationReports,
            and(
              eq(IndividualFacultyEvaluationReports.semester_id, Semesters.id),
              isNull(IndividualFacultyEvaluationReports.deleted_at),
            ),
          )
          .groupBy(
            Semesters.id,
            Semesters.school_year_start,
            Semesters.school_year_end,
            Semesters.semester_term,
          )
          .orderBy(Semesters.school_year_start, Semesters.semester_term) as unknown as PgSelect,
    });

    return historicalRecords.map((semesterRecord) => ({
      term: semesterRecord.term,
      avg_set: Number(semesterRecord.avg_set.toFixed(RATING_CONFIG.DECIMAL_PLACES)),
      avg_sef: Number(semesterRecord.avg_sef.toFixed(RATING_CONFIG.DECIMAL_PLACES)),
    }));
  }

  private async fetchProgramSemesterTrends(
    scope?: SupervisorScope | null,
  ): Promise<Array<{ term: string; program_code: string; avg_set: number; avg_sef: number }>> {
    const scopeFilter = buildScopeFilter(scope, { collegeTable: Colleges, programTable: Programs });
    const programTrends = await GetRecords<
      "Semesters",
      { term: string; program_code: string; avg_set: number; avg_sef: number }
    >("Semesters", {
      select: (semesterTable) => ({
        term: sql<string>`concat('AY ', ${semesterTable.school_year_start}, '-', ${semesterTable.school_year_end}, ' ', ${semesterTable.semester_term})`,
        program_code: Programs.initialism,
        avg_set: sql<number>`coalesce(avg(${IndividualFacultyEvaluationReports.overall_set_rating}::numeric), 0)::float`,
        avg_sef: sql<number>`coalesce(avg(${IndividualFacultyEvaluationReports.overall_sef_rating}::numeric), 0)::float`,
      }),
      where: (semesterTable) => and(isNull(semesterTable.deleted_at), scopeFilter),
      join: (queryBuilder) =>
        queryBuilder
          .innerJoin(
            IndividualFacultyEvaluationReports,
            and(
              eq(IndividualFacultyEvaluationReports.semester_id, Semesters.id),
              isNull(IndividualFacultyEvaluationReports.deleted_at),
            ),
          )
          .innerJoin(Accounts, eq(IndividualFacultyEvaluationReports.faculty_id, Accounts.id))
          .innerJoin(CourseOfferings, eq(CourseOfferings.faculty_id, Accounts.id))
          .innerJoin(Classes, eq(CourseOfferings.class_id, Classes.id))
          .innerJoin(Programs, eq(Classes.program_id, Programs.id))
          .leftJoin(Colleges, eq(Programs.college_id, Colleges.id))
          .groupBy(
            Semesters.id,
            Semesters.school_year_start,
            Semesters.school_year_end,
            Semesters.semester_term,
            Programs.initialism,
          )
          .orderBy(
            Semesters.school_year_start,
            Semesters.semester_term,
            Programs.initialism,
          ) as unknown as PgSelect,
    });

    return programTrends.map((programRecord) => ({
      term: programRecord.term,
      program_code: programRecord.program_code,
      avg_set: Number(programRecord.avg_set.toFixed(RATING_CONFIG.DECIMAL_PLACES)),
      avg_sef: Number(programRecord.avg_sef.toFixed(RATING_CONFIG.DECIMAL_PLACES)),
    }));
  }

  async getAnalytics(
    semesterId?: number,
    scope?: SupervisorScope | null,
  ): Promise<EvaluationAnalyticsPayload> {
    const cacheKey = `${semesterId ?? "all"}_${JSON.stringify(scope ?? "global")}`;
    const now = Date.now();
    const cached = analyticsCache.get(cacheKey);

    if (cached && now - cached.timestamp < ANALYTICS_CACHE_TTL_MS) {
      return cached.data;
    }

    const scopeFilter = buildScopeFilter(scope, { collegeTable: Colleges, programTable: Programs });

    const fetchBaseReports = () =>
      GetRecords("IndividualFacultyEvaluationReports", {
        select: (t) => ({
          id: t.id,
          overall_set_rating: t.overall_set_rating,
          overall_sef_rating: t.overall_sef_rating,
          average_student_sentiment: t.average_student_sentiment,
          average_supervisor_sentiment: t.average_supervisor_sentiment,
        }),
        where: (reportRecord) =>
          and(
            isNull(reportRecord.deleted_at),
            semesterId ? eq(reportRecord.semester_id, semesterId) : undefined,
            scopeFilter,
          ),
        ...(scopeFilter
          ? {
              join: (query) =>
                query
                  .innerJoin(
                    Accounts,
                    eq(IndividualFacultyEvaluationReports.faculty_id, Accounts.id),
                  )
                  .innerJoin(
                    CourseOfferings,
                    and(
                      eq(CourseOfferings.faculty_id, Accounts.id),
                      eq(
                        CourseOfferings.semester_id,
                        IndividualFacultyEvaluationReports.semester_id,
                      ),
                      isNull(CourseOfferings.deleted_at),
                    ),
                  )
                  .innerJoin(
                    Classes,
                    and(eq(CourseOfferings.class_id, Classes.id), isNull(Classes.deleted_at)),
                  )
                  .innerJoin(
                    Programs,
                    and(eq(Classes.program_id, Programs.id), isNull(Programs.deleted_at)),
                  )
                  .leftJoin(
                    Colleges,
                    and(eq(Programs.college_id, Colleges.id), isNull(Colleges.deleted_at)),
                  )
                  .groupBy(
                    IndividualFacultyEvaluationReports.id,
                    IndividualFacultyEvaluationReports.overall_set_rating,
                    IndividualFacultyEvaluationReports.overall_sef_rating,
                    IndividualFacultyEvaluationReports.average_student_sentiment,
                    IndividualFacultyEvaluationReports.average_supervisor_sentiment,
                  ) as unknown as PgSelect,
            }
          : {}),
      });

    // Run all 7 database queries in PARALLEL via Promise.all()
    const [
      reports,
      completionRate,
      collegePerformance,
      courseRankings,
      facultyRankings,
      semesterTrends,
      programSemesterTrends,
    ] = await Promise.all([
      fetchBaseReports(),
      this.calculateCompletionRate(semesterId, scope),
      this.fetchCollegePerformance(scope),
      this.fetchCourseRankings(scope),
      this.fetchFacultyRankings(),
      this.fetchSemesterTrends(),
      this.fetchProgramSemesterTrends(scope),
    ]);

    const meanSet = this.calculateMeanRating(reports.map((report) => report.overall_set_rating));
    const meanSef = this.calculateMeanRating(reports.map((report) => report.overall_sef_rating));

    const sentimentBreakdown = this.calculateSentimentDistribution(
      reports.map((report) => report.average_student_sentiment),
    );

    const payload: EvaluationAnalyticsPayload = {
      kpis: {
        avg_set_rating: meanSet,
        avg_sef_rating: meanSef,
        completion_rate_percentage: completionRate,
        total_reports_generated: reports.length,
      },
      college_performance: collegePerformance,
      semester_trends: semesterTrends,
      program_semester_trends: programSemesterTrends,
      sentiment_breakdown: sentimentBreakdown,
      course_rankings: courseRankings,
      faculty_rankings: facultyRankings,
    };

    analyticsCache.set(cacheKey, { data: payload, timestamp: now });
    return payload;
  }
}

const EvaluationAnalyticsServiceInstance = new EvaluationAnalyticsService();
export default EvaluationAnalyticsServiceInstance;
