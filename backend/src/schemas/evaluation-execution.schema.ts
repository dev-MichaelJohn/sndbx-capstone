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
} from "drizzle-orm/pg-core";
import { Accounts } from "./auth.schema.js";
import { CourseOfferings, Semesters, StudentClasses } from "./institution.schema.js";
import {
  StudentEvaluationForms,
  StudentEvaluationQuestions,
  SupervisorEvaluationForms,
  SupervisorEvaluationQuestions,
} from "./evaluation-forms.schema.js";

// ==========================================
// STUDENT EXECUTION
// ==========================================

export const StudentEvaluationSchedules = pgTable(
  "student_evaluation_schedules",
  {
    id: serial("id").primaryKey(),
    semester_id: integer("semester_id")
      .notNull()
      .references(() => Semesters.id),
    form_id: integer("form_id")
      .notNull()
      .references(() => StudentEvaluationForms.id),
    open_at: timestamp("open_at").notNull(),
    close_at: timestamp("close_at").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [
    index("idx_student_eval_schedule_semester_id").on(t.semester_id),
    index("idx_student_eval_schedule_form_id").on(t.form_id),
    uniqueIndex("uidx_active_student_schedule")
      .on(t.semester_id, t.form_id)
      .where(sql`deleted_at IS NULL`),
  ],
);

export const StudentEvaluations = pgTable(
  "student_evaluations",
  {
    id: serial("id").primaryKey(),
    schedule_id: integer("schedule_id")
      .notNull()
      .references(() => StudentEvaluationSchedules.id),
    student_class_id: integer("student_class_id")
      .notNull()
      .references(() => StudentClasses.id),
    comment: text("comment"),
    comment_score: decimal("comment_score", { precision: 5, scale: 2 }), // Sentiment score
    set_rating: decimal("set_rating", { precision: 5, scale: 2 }), // Computed Rating
    submitted_at: timestamp("submitted_at"), // NULL = Draft
  },
  (t) => [
    index("idx_student_eval_schedule_id").on(t.schedule_id),
    index("idx_student_eval_student_class_id").on(t.student_class_id),
    uniqueIndex("uidx_unique_student_submission").on(t.schedule_id, t.student_class_id),
  ],
);

export const StudentEvaluationRatings = pgTable(
  "student_evaluation_ratings",
  {
    id: serial("id").primaryKey(),
    evaluation_id: integer("evaluation_id")
      .notNull()
      .references(() => StudentEvaluations.id, { onDelete: "cascade" }),
    question_id: integer("question_id")
      .notNull()
      .references(() => StudentEvaluationQuestions.id),
    rating: integer("rating").notNull(),
  },
  (t) => [
    index("idx_student_eval_ratings_evaluation_id").on(t.evaluation_id),
    index("idx_student_eval_ratings_question_id").on(t.question_id),
    uniqueIndex("uidx_unique_student_question_rating").on(t.evaluation_id, t.question_id),
  ],
);

// ==========================================
// SUPERVISOR EXECUTION
// ==========================================

export const SupervisorEvaluationSchedules = pgTable(
  "supervisor_evaluation_schedules",
  {
    id: serial("id").primaryKey(),
    semester_id: integer("semester_id")
      .notNull()
      .references(() => Semesters.id),
    form_id: integer("form_id")
      .notNull()
      .references(() => SupervisorEvaluationForms.id),
    open_at: timestamp("open_at").notNull(),
    close_at: timestamp("close_at").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [
    index("idx_supervisor_eval_schedule_semester_id").on(t.semester_id),
    index("idx_supervisor_eval_schedule_form_id").on(t.form_id),
    uniqueIndex("uidx_active_supervisor_schedule")
      .on(t.semester_id, t.form_id)
      .where(sql`deleted_at IS NULL`),
  ],
);

export const SupervisorEvaluations = pgTable(
  "supervisor_evaluations",
  {
    id: serial("id").primaryKey(),
    schedule_id: integer("schedule_id")
      .notNull()
      .references(() => SupervisorEvaluationSchedules.id),
    evaluator_id: integer("evaluator_id")
      .notNull()
      .references(() => Accounts.id),
    course_offering_id: integer("course_offering_id")
      .notNull()
      .references(() => CourseOfferings.id),
    comment: text("comment"),
    comment_score: decimal("comment_score", { precision: 5, scale: 2 }), // Sentiment score
    set_rating: decimal("set_rating", { precision: 5, scale: 2 }), // Computed Rating
    submitted_at: timestamp("submitted_at"), // NULL = Draft
  },
  (t) => [
    index("idx_supervisor_eval_schedule_id").on(t.schedule_id),
    index("idx_supervisor_eval_evaluator_id").on(t.evaluator_id),
    index("idx_supervisor_eval_course_offering_id").on(t.course_offering_id),
    uniqueIndex("uidx_unique_supervisor_submission").on(
      t.schedule_id,
      t.evaluator_id,
      t.course_offering_id,
    ),
  ],
);

export const SupervisorEvaluationRatings = pgTable(
  "supervisor_evaluation_ratings",
  {
    id: serial("id").primaryKey(),
    evaluation_id: integer("evaluation_id")
      .notNull()
      .references(() => SupervisorEvaluations.id, { onDelete: "cascade" }),
    question_id: integer("question_id")
      .notNull()
      .references(() => SupervisorEvaluationQuestions.id),
    rating: integer("rating").notNull(),
  },
  (t) => [
    index("idx_supervisor_eval_ratings_evaluation_id").on(t.evaluation_id),
    index("idx_supervisor_eval_ratings_question_id").on(t.question_id),
    uniqueIndex("uidx_unique_supervisor_question_rating").on(t.evaluation_id, t.question_id),
  ],
);
