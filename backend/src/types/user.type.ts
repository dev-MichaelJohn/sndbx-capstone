import z from "zod";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import {
  AccountRoles,
  Accounts,
  PersonalDetails,
  Roles,
  SystemRoles,
} from "../schemas/auth.schema.js";

// ==========================================
// 1. Base Entity Schemas & Inferred Types
// ==========================================

/** Login credentials and account-level fields (email, password, verification status, etc). */
export const AccountSchema = GenerateZodSchemas(Accounts, {
  email: (schema) => schema.trim().toLowerCase().pipe(z.email("Invalid email address format.")),
  password: (schema) =>
    schema
      .trim()
      .min(8, "Password must be at least 8 characters long.")
      .max(72, "Password cannot exceed 72 characters."),
  personal_details_id: (schema) =>
    schema.int("Personal details ID must be an integer.").positive("Invalid personal details ID."),
});
export type AccountInsert = z.infer<typeof AccountSchema.insert>;
export type AccountSelect = z.infer<typeof AccountSchema.select>;
export type AccountUpdate = z.infer<typeof AccountSchema.update>;

/** Join-table mapping an account to a system role. */
export const AccountRoleSchema = GenerateZodSchemas(AccountRoles, {
  account_id: (schema) =>
    schema.int("Account ID must be an integer.").positive("Invalid account ID."),
  role_id: (schema) => schema.int("Role ID must be an integer.").positive("Invalid role ID."),
});
export type AccountRoleInsert = z.infer<typeof AccountRoleSchema.insert>;
export type AccountRoleSelect = z.infer<typeof AccountRoleSchema.select>;
export type AccountRoleUpdate = z.infer<typeof AccountRoleSchema.update>;

/** An account holder's personal information (name, institutional id, etc), kept separate from login credentials. */
export const PersonalDetailsSchema = GenerateZodSchemas(PersonalDetails, {
  institutional_id: (schema) => schema.trim().min(8, "Institutional ID is required."),
  first_name: (schema) => schema.trim().min(2, "First name is required."),
  last_name: (schema) => schema.trim().min(2, "Last name is required."),
  middle_name: () => z.string().trim().optional().nullable(),
  suffix: () => z.string().trim().optional().nullable(),
});
export type PersonalDetailsInsert = z.infer<typeof PersonalDetailsSchema.insert>;
export type PersonalDetailsSelect = z.infer<typeof PersonalDetailsSchema.select>;
export type PersonalDetailsUpdate = z.infer<typeof PersonalDetailsSchema.update>;

/** A system role that can be assigned to an account (e.g. FACULTY, SUPERVISOR, SYS_ADMIN). */
export const RoleSchema = GenerateZodSchemas(Roles);
export type RoleInsert = z.infer<typeof RoleSchema.insert>;
export type RoleSelect = z.infer<typeof RoleSchema.select>;
export type RoleUpdate = z.infer<typeof RoleSchema.update>;

// ==========================================
// 2. Enums & Standalone Validators
// ==========================================

/** One of the fixed system role enum values, validated as a standalone value (e.g. a request query param). */
export const SystemRoleSchema = z.enum(SystemRoles.enumValues);
export type SystemRole = z.infer<typeof SystemRoleSchema>;

// ==========================================
// 3. Request DTO Schemas & Composed Types
// ==========================================

/**
 * Validates the full payload for a "create user" request: login
 * credentials (minus the auto-assigned `personal_details_id`), personal
 * details, and the system role to assign.
 */
export const CreateUserReqSchema = z.object({
  credentials: AccountSchema.insert
    .omit({
      personal_details_id: true,
    })
    .extend({
      password: AccountSchema.insert.shape.password.optional(),
    }),
  personalDetails: PersonalDetailsSchema.insert,
  role: SystemRoleSchema,
});
export type CreateUserReqType = z.infer<typeof CreateUserReqSchema>;

/** An account's insertable fields joined with its currently assigned system role. */
export type AccountRecordWithRole = AccountInsert & {
  system_role: SystemRole;
};

export const UserSchema = z.object({
  user: AccountSchema.select
    .omit({
      password: true,
    })
    .extend({
      id: z.coerce.number().int().positive().nonoptional(),
    }),
  personalDetails: PersonalDetailsSchema.select.extend({
    id: z.coerce.number().int().positive().nonoptional(),
  }),
  roles: z.array(z.enum(SystemRoles.enumValues)),
});
export type UserType = z.infer<typeof UserSchema>;

export const UserLoginSchema = AccountSchema.insert.omit({
  personal_details_id: true,
});
export type UserLoginType = z.infer<typeof UserLoginSchema>;
