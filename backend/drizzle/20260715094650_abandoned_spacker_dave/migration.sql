CREATE TYPE "system_role" AS ENUM('SYS_ADMIN', 'ADMIN', 'SUPERVISOR', 'FACULTY', 'STUDENT');--> statement-breakpoint
CREATE TYPE "section" AS ENUM('A', 'B', 'C', 'D', 'E', 'F');--> statement-breakpoint
CREATE TYPE "semester_term" AS ENUM('1st', '2nd', 'Summer');--> statement-breakpoint
CREATE TYPE "year_level" AS ENUM('I', 'II', 'III', 'IV', 'V');--> statement-breakpoint
CREATE TABLE "account_roles" (
	"id" serial PRIMARY KEY,
	"account_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY,
	"personal_details_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" serial PRIMARY KEY,
	"email" varchar(255) NOT NULL,
	"code" varchar(8) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_details" (
	"id" serial PRIMARY KEY,
	"institutional_id" varchar(32) NOT NULL,
	"last_name" varchar(64) NOT NULL,
	"first_name" varchar(64) NOT NULL,
	"middle_name" varchar(64),
	"suffix" varchar(8),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" serial PRIMARY KEY,
	"account_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY,
	"system_role" "system_role" NOT NULL,
	"description" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "class_courses" (
	"id" serial PRIMARY KEY,
	"course_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"semester_id" integer NOT NULL,
	"faculty_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" serial PRIMARY KEY,
	"program_id" integer NOT NULL,
	"year_level" "year_level" NOT NULL,
	"section" "section" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "college_deans" (
	"id" serial PRIMARY KEY,
	"college_id" integer NOT NULL,
	"dean_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "colleges" (
	"id" serial PRIMARY KEY,
	"name" varchar(128) NOT NULL,
	"initialism" varchar(16) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY,
	"program_id" integer NOT NULL,
	"name" varchar(128) NOT NULL,
	"initialism" varchar(16) NOT NULL,
	"semester_term" "semester_term" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "program_chairs" (
	"id" serial PRIMARY KEY,
	"program_id" integer NOT NULL,
	"chair_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY,
	"college_id" integer NOT NULL,
	"name" varchar(128) NOT NULL,
	"initialism" varchar(16) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "semesters" (
	"id" serial PRIMARY KEY,
	"semester_term" "semester_term" NOT NULL,
	"school_year_start" smallint NOT NULL,
	"school_year_end" smallint GENERATED ALWAYS AS ("semesters"."school_year_start" + 1) STORED NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "chk_semester_date_order" CHECK ("start_date" < "end_date")
);
--> statement-breakpoint
CREATE TABLE "student_classes" (
	"id" serial PRIMARY KEY,
	"student_account_id" integer NOT NULL,
	"class_course_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_accountrole_account_role" ON "account_roles" ("account_id","role_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_account_roles_role_id" ON "account_roles" ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_accounts_email" ON "accounts" ("email") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_accounts_personal_details" ON "accounts" ("personal_details_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_otp_email" ON "otp_codes" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_institution_id" ON "personal_details" ("institutional_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_personal_details_composite" ON "personal_details" ("institutional_id", "last_name", "first_name", COALESCE("middle_name", ''), COALESCE("suffix", '')) WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_refresh_tokens_hash" ON "refresh_tokens" ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_account_id" ON "refresh_tokens" ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_roles_system_role" ON "roles" ("system_role") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_class_course_semester" ON "class_courses" ("class_id","course_id","semester_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_class_courses_faculty_id" ON "class_courses" ("faculty_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_class_program_year_section" ON "classes" ("program_id","year_level","section") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_college_dean" ON "college_deans" ("college_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_dean_account" ON "college_deans" ("dean_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_college_deans_dean_id" ON "college_deans" ("dean_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_college_name" ON "colleges" ("name") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_college_initialism" ON "colleges" ("initialism") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_course_program_name" ON "courses" ("program_id","name") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_course_program_initialism" ON "courses" ("program_id","initialism") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_program_chair" ON "program_chairs" ("program_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_program_chairs_chair_id" ON "program_chairs" ("chair_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_program_college_name" ON "programs" ("college_id","name") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_program_name_initialism" ON "programs" ("initialism") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_semester" ON "semesters" ("semester_term","school_year_start","school_year_end") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_student_class_course" ON "student_classes" ("student_account_id","class_course_id") WHERE deleted_at IS NULL;--> statement-breakpoint
ALTER TABLE "account_roles" ADD CONSTRAINT "account_roles_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id");--> statement-breakpoint
ALTER TABLE "account_roles" ADD CONSTRAINT "account_roles_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_personal_details_id_personal_details_id_fkey" FOREIGN KEY ("personal_details_id") REFERENCES "personal_details"("id");--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id");--> statement-breakpoint
ALTER TABLE "class_courses" ADD CONSTRAINT "class_courses_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");--> statement-breakpoint
ALTER TABLE "class_courses" ADD CONSTRAINT "class_courses_class_id_classes_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id");--> statement-breakpoint
ALTER TABLE "class_courses" ADD CONSTRAINT "class_courses_semester_id_semesters_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id");--> statement-breakpoint
ALTER TABLE "class_courses" ADD CONSTRAINT "class_courses_faculty_id_accounts_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "accounts"("id");--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_program_id_programs_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id");--> statement-breakpoint
ALTER TABLE "college_deans" ADD CONSTRAINT "college_deans_college_id_colleges_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id");--> statement-breakpoint
ALTER TABLE "college_deans" ADD CONSTRAINT "college_deans_dean_id_accounts_id_fkey" FOREIGN KEY ("dean_id") REFERENCES "accounts"("id");--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_program_id_programs_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id");--> statement-breakpoint
ALTER TABLE "program_chairs" ADD CONSTRAINT "program_chairs_program_id_programs_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id");--> statement-breakpoint
ALTER TABLE "program_chairs" ADD CONSTRAINT "program_chairs_chair_id_accounts_id_fkey" FOREIGN KEY ("chair_id") REFERENCES "accounts"("id");--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_college_id_colleges_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id");--> statement-breakpoint
ALTER TABLE "student_classes" ADD CONSTRAINT "student_classes_student_account_id_accounts_id_fkey" FOREIGN KEY ("student_account_id") REFERENCES "accounts"("id");--> statement-breakpoint
ALTER TABLE "student_classes" ADD CONSTRAINT "student_classes_class_course_id_class_courses_id_fkey" FOREIGN KEY ("class_course_id") REFERENCES "class_courses"("id");