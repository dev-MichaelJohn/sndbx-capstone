CREATE TYPE "system_role" AS ENUM('SYS_ADMIN', 'ADMIN', 'SUPERVISOR', 'FACULTY', 'STUDENT');--> statement-breakpoint
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
	"code" varchar(6) NOT NULL,
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
CREATE UNIQUE INDEX "uidx_active_accountrole_account_role" ON "account_roles" ("account_id","role_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_accounts_email" ON "accounts" ("email") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_accounts_personal_details" ON "accounts" ("personal_details_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_otp_codes_email" ON "otp_codes" ("email") WHERE expires_at > NOW();--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_institution_id" ON "personal_details" ("institutional_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_active_personal_details_composite" ON "personal_details" ("institutional_id", "last_name", "first_name", COALESCE("middle_name", ''), COALESCE("suffix", '')) WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_email" ON "refresh_tokens" ("email") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_refresh_tokens_account_id" ON "refresh_tokens" ("account_id") WHERE deleted_at IS NULL;--> statement-breakpoint
ALTER TABLE "account_roles" ADD CONSTRAINT "account_roles_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id");--> statement-breakpoint
ALTER TABLE "account_roles" ADD CONSTRAINT "account_roles_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_personal_details_id_personal_details_id_fkey" FOREIGN KEY ("personal_details_id") REFERENCES "personal_details"("id");--> statement-breakpoint
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_email_accounts_email_fkey" FOREIGN KEY ("email") REFERENCES "accounts"("email");--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id");