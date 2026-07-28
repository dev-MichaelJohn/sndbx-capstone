import { SQL, sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  smallint,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { Accounts } from "./auth.schema.js";

export const Colleges = pgTable(
  "colleges",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    initialism: varchar("initialism", { length: 16 }).notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [
    uniqueIndex("uidx_active_college_name")
      .on(t.name)
      .where(sql`deleted_at IS NULL`),
    uniqueIndex("uidx_active_college_initialism")
      .on(t.initialism)
      .where(sql`deleted_at IS NULL`),
  ],
);

export const Programs = pgTable(
  "programs",
  {
    id: serial("id").primaryKey(),
    college_id: integer("college_id")
      .notNull()
      .references(() => Colleges.id),
    name: varchar("name", { length: 128 }).notNull(),
    initialism: varchar("initialism", { length: 16 }).notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [
    uniqueIndex("uidx_active_program_college_name")
      .on(t.college_id, t.name)
      .where(sql`deleted_at IS NULL`),
    uniqueIndex("uidx_active_program_name_initialism")
      .on(t.initialism)
      .where(sql`deleted_at IS NULL`),
  ],
);

export const YearLevelEnum = pgEnum("year_level", ["I", "II", "III", "IV", "V"]);
export const SectionEnum = pgEnum("section", ["A", "B", "C", "D", "E", "F"]);
export const Classes = pgTable(
  "classes",
  {
    id: serial("id").primaryKey(),
    program_id: integer("program_id")
      .notNull()
      .references(() => Programs.id),
    year_level: YearLevelEnum().notNull(),
    section: SectionEnum().notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [
    uniqueIndex("uidx_active_class_program_year_section")
      .on(t.program_id, t.year_level, t.section)
      .where(sql`deleted_at IS NULL`),
  ],
);

export const SemeterTermEnum = pgEnum("semester_term", ["1st", "2nd", "Summer"]);
export const Courses = pgTable(
  "courses",
  {
    id: serial("id").primaryKey(),
    program_id: integer("program_id")
      .notNull()
      .references(() => Programs.id),
    name: varchar("name", { length: 128 }).notNull(),
    initialism: varchar("initialism", { length: 16 }).notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [
    uniqueIndex("uidx_active_course_program_name")
      .on(t.program_id, t.name)
      .where(sql`deleted_at IS NULL`),
    uniqueIndex("uidx_active_course_program_initialism")
      .on(t.program_id, t.initialism)
      .where(sql`deleted_at IS NULL`),
  ],
);

export const Semesters = pgTable(
  "semesters",
  {
    id: serial("id").primaryKey(),
    semester_term: SemeterTermEnum().notNull(),
    school_year_start: smallint("school_year_start").notNull(),
    school_year_end: smallint("school_year_end")
      .notNull()
      .generatedAlwaysAs((): SQL => sql`${Semesters.school_year_start} + 1`),
    start_date: date("start_date").notNull(),
    end_date: date("end_date").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [
    uniqueIndex("uidx_active_semester")
      .on(t.semester_term, t.school_year_start, t.school_year_end)
      .where(sql`deleted_at IS NULL`),
    check("chk_semester_date_order", sql`${t.start_date} < ${t.end_date}`),
  ],
);

export const CollegeDeans = pgTable(
  "college_deans",
  {
    id: serial("id").primaryKey(),
    college_id: integer("college_id")
      .notNull()
      .references(() => Colleges.id),
    dean_id: integer("dean_id")
      .notNull()
      .references(() => Accounts.id),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [
    uniqueIndex("uidx_active_college_dean")
      .on(t.college_id)
      .where(sql`deleted_at IS NULL`),
    uniqueIndex("uidx_active_dean_account")
      .on(t.dean_id)
      .where(sql`deleted_at IS NULL`),
    index("idx_college_deans_dean_id").on(t.dean_id),
  ],
);

export const ProgramChairs = pgTable(
  "program_chairs",
  {
    id: serial("id").primaryKey(),
    program_id: integer("program_id")
      .notNull()
      .references(() => Programs.id),
    chair_id: integer("chair_id")
      .notNull()
      .references(() => Accounts.id),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [
    uniqueIndex("uidx_active_program_chair")
      .on(t.program_id)
      .where(sql`deleted_at IS NULL`),
    index("idx_program_chairs_chair_id").on(t.chair_id),
  ],
);

export const ClassCourses = pgTable(
  "class_courses",
  {
    id: serial("id").primaryKey(),
    course_id: integer("course_id")
      .notNull()
      .references(() => Courses.id),
    class_id: integer("class_id")
      .notNull()
      .references(() => Classes.id),
    semester_id: integer("semester_id")
      .notNull()
      .references(() => Semesters.id),
    faculty_id: integer("faculty_id")
      .notNull()
      .references(() => Accounts.id),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [
    uniqueIndex("uidx_active_class_course_semester")
      .on(t.class_id, t.course_id, t.semester_id)
      .where(sql`deleted_at IS NULL`),
    index("idx_class_courses_faculty_id").on(t.faculty_id),
  ],
);

export const StudentClasses = pgTable(
  "student_classes",
  {
    id: serial("id").primaryKey(),
    student_account_id: integer("student_account_id")
      .notNull()
      .references(() => Accounts.id),
    class_course_id: integer("class_course_id")
      .notNull()
      .references(() => ClassCourses.id),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => [
    uniqueIndex("uidx_active_student_class_course")
      .on(t.student_account_id, t.class_course_id)
      .where(sql`deleted_at IS NULL`),
  ],
);
