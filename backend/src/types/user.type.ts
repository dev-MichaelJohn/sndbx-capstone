import z from "zod";
import { GenerateZodSchemas } from "@/utils/schema.util.js";
import {
  AccountRoles,
  Accounts,
  PersonalDetails,
  Roles,
  SystemRoles,
} from "@/schemas/auth.schema.js";

/** Login credentials and account-level fields (email, password, verification status, etc). */
export const AccountSchema = GenerateZodSchemas(Accounts);
export type AccountInsert = z.infer<typeof AccountSchema.insert>;
export type AccountSelect = z.infer<typeof AccountSchema.select>;
export type AccountUpdate = z.infer<typeof AccountSchema.update>;

/** Join-table mapping an account to a system role. */
export const AccountRoleSchema = GenerateZodSchemas(AccountRoles);
export type AccountRoleInsert = z.infer<typeof AccountRoleSchema.insert>;
export type AccountRoleSelect = z.infer<typeof AccountRoleSchema.select>;
export type AccountRoleUpdate = z.infer<typeof AccountRoleSchema.update>;

/** An account holder's personal information (name, institutional id, etc), kept separate from login credentials. */
export const PersonalDetailsSchema = GenerateZodSchemas(PersonalDetails);
export type PersonalDetailsInsert = z.infer<typeof PersonalDetailsSchema.insert>;
export type PersonalDetailsSelect = z.infer<typeof PersonalDetailsSchema.select>;
export type PersonalDetailsUpdate = z.infer<typeof PersonalDetailsSchema.update>;

/** A system role that can be assigned to an account (e.g. FACULTY, SUPERVISOR, SYS_ADMIN). */
export const RoleSchema = GenerateZodSchemas(Roles);
export type RoleInsert = z.infer<typeof RoleSchema.insert>;
export type RoleSelect = z.infer<typeof RoleSchema.select>;
export type RoleUpdate = z.infer<typeof RoleSchema.update>;

/** One of the fixed system role enum values, validated as a standalone value (e.g. a request query param). */
export const SystemRoleSchema = z.enum(SystemRoles.enumValues);
export type SystemRole = z.infer<typeof SystemRoleSchema>;

/**
 * Validates the full payload for a "create user" request: login
 * credentials (minus the auto-assigned `personal_details_id`), personal
 * details, and the system role to assign.
 */
export const CreateUserReqSchema = z.object({
  credentials: AccountSchema.insert.omit({
    personal_details_id: true,
  }),
  personalDetails: PersonalDetailsSchema.insert,
  role: z.enum(SystemRoles.enumValues),
});
export type CreateUserReqType = z.infer<typeof CreateUserReqSchema>;

/** An account's insertable fields joined with its currently assigned system role. */
export type AccountRecordWithRole = AccountInsert & {
  system_role: SystemRole;
};
