import z from "zod";

export const SupervisorScopeSchema = z.object({
  collegeIds: z.array(z.number().int().positive()).nullish(),
  programIds: z.array(z.number().int().positive()).nullish(),
});

export type SupervisorScope = z.infer<typeof SupervisorScopeSchema>;

declare global {
  namespace Express {
    interface Request {
      supervisorScope?: SupervisorScope | null;
    }
  }
}
