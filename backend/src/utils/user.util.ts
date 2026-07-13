import z from "zod";
import { GenerateZodSchemas } from "./schema.util.js";
import { Accounts, PersonalDetails, SystemRoles } from "@/schemas/auth.schema.js";

export const CreateUserReqSchema = z.object({
  credentials: GenerateZodSchemas(Accounts).insert.omit({
    personal_details_id: true
  }),
  personalDetails: GenerateZodSchemas(PersonalDetails).insert,
  role: z.enum(SystemRoles.enumValues),
});
export type CreateUserReqType = z.infer<typeof CreateUserReqSchema>;
