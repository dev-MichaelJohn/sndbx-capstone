export interface EvaluationAnalyticsPayload {
  kpis: {
    avg_set_rating: number;
    avg_sef_rating: number;
    completion_rate_percentage: number;
    total_reports_generated: number;
  };
  college_performance: Array<{
    college: string;
    avg_set: number;
    avg_sef: number;
  }>;
  semester_trends: Array<{
    term: string;
    avg_set: number;
    avg_sef: number;
  }>;
  program_semester_trends: Array<{
    term: string;
    program_code: string;
    avg_set: number;
    avg_sef: number;
  }>;
  sentiment_breakdown: {
    positive_pct: number;
    neutral_pct: number;
    negative_pct: number;
  };
  course_rankings: {
    top_courses: Array<{ course_code: string; course_title: string; avg_set: number }>;
    bottom_courses: Array<{ course_code: string; course_title: string; avg_set: number }>;
  };
  faculty_rankings: {
    top_faculty: Array<{ faculty_id: number; faculty_name: string; avg_rating: number }>;
    bottom_faculty: Array<{ faculty_id: number; faculty_name: string; avg_rating: number }>;
  };
}
