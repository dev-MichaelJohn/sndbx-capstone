import type { PersonalDetailsSelect } from "@/types/auth.type.js";
import type { SystemRole } from "@/types/seeder.type.js";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      is_verified?: boolean;
      personalDetails: PersonalDetailsSelect;
      roles: Array<SystemRole>;
    }
  }
}
