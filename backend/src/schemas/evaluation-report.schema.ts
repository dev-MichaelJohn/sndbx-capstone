import { sql } from "drizzle-orm";
import {
  decimal,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { Accounts } from "./auth.schema.js";
import { CourseOfferings, Semesters } from "./institution.schema.js";

// ==========================================
// CONSOLIDATED REPORTS (IFER)
// ==========================================

export const IndividualFacultyEvaluationReports = pgTable(
  "individual_faculty_evaluation_reports",
  {
    id: serial("id").primaryKey(),
    semester_id: integer("semester_id")
      .notNull()
      .references(() => Semesters.id),
    faculty_id: integer("faculty_id")
      .notNull()
      .references(() => Accounts.id),

    overall_set_rating: decimal("overall_set_rating", { precision: 5, scale: 2 }),
    overall_sef_rating: decimal("overall_sef_rating", { precision: 5, scale: 2 }),

    average_student_sentiment: decimal("average_student_sentiment", { precision: 5, scale: 2 }),
    average_supervisor_sentiment: decimal("average_supervisor_sentiment", {
      precision: 5,
      scale: 2,
    }),

    status: varchar("status", { length: 32 }).default("DRAFT").notNull(), // DRAFT, FINALIZED, ACKNOWLEDGED

    areas_for_improvement: text("areas_for_improvement"),
    proposed_activities: text("proposed_activities"),
    action_plan: text("action_plan"),
    acknowledged_at: timestamp("acknowledged_at"),

    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [
    index("idx_ifer_semester_id").on(t.semester_id),
    index("idx_ifer_faculty_id").on(t.faculty_id),
    uniqueIndex("uidx_active_ifer_faculty_semester")
      .on(t.semester_id, t.faculty_id)
      .where(sql`deleted_at IS NULL`),
  ],
);

export const IferClassSummaries = pgTable(
  "ifer_class_summaries",
  {
    id: serial("id").primaryKey(),
    ifer_id: integer("ifer_id")
      .notNull()
      .references(() => IndividualFacultyEvaluationReports.id, { onDelete: "cascade" }),
    course_offering_id: integer("course_offering_id")
      .notNull()
      .references(() => CourseOfferings.id),

    student_count: integer("student_count").notNull(),
    average_set_rating: decimal("average_set_rating", { precision: 5, scale: 2 }).notNull(),
    weighted_set_score: decimal("weighted_set_score", { precision: 7, scale: 2 }).notNull(),
  },
  (t) => [
    index("idx_ifer_summary_ifer_id").on(t.ifer_id),
    index("idx_ifer_summary_course_offering_id").on(t.course_offering_id),
    uniqueIndex("uidx_ifer_class_summary").on(t.ifer_id, t.course_offering_id),
  ],
);
