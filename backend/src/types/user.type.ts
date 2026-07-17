import z from "zod";
import { GenerateZodSchemas } from "@/utils/schema.util.js";
import {
  AccountRoles,
  Accounts,
  PersonalDetails,
  Roles,
  SystemRoles,
} from "@/schemas/auth.schema.js";

/**
 * Validates the full payload for a "create user" request: login
 * credentials (minus the auto-assigned `personal_details_id`), personal
 * details, and the system role to assign.
 */

export const AccountSchema = GenerateZodSchemas(Accounts);
export const PersonalDetailsSchema = GenerateZodSchemas(PersonalDetails);
export const AccountRoleSchema = GenerateZodSchemas(AccountRoles);
export const RoleSchema = GenerateZodSchemas(Roles);

export type AccountInsert = z.infer<typeof AccountSchema.insert>;
export type AccountSelect = z.infer<typeof AccountSchema.select>;
export type AccountUpdate = z.infer<typeof AccountSchema.update>;

export const CreateUserReqSchema = z.object({
  credentials: AccountSchema.insert.omit({
    personal_details_id: true,
  }),
  personalDetails: PersonalDetailsSchema.insert,
  role: z.enum(SystemRoles.enumValues),
});
export type CreateUserReqType = z.infer<typeof CreateUserReqSchema>;

export const SystemRoleSchema = z.enum(SystemRoles.enumValues);
export type SystemRole = z.infer<typeof SystemRoleSchema>;

export type AccountRecordWithRole = AccountInsert & {
  system_role: SystemRole;
};
