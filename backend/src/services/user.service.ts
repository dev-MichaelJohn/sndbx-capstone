import { type Accounts, type PersonalDetails } from "@/schemas/auth.schema.js";
import { eq, type InferInsertModel } from "drizzle-orm";
import { CreateRecord, GetRecord } from "./db.service.js";
import bcrypt from "bcryptjs";
import { AppError } from "@/utils/error.util.js";
import db from "@/configs/db.config.js";

class userService {
  constructor() { }

  async createUser(
    credentials: Omit<InferInsertModel<typeof Accounts>, "personal_details_id">,
    personalDetails: InferInsertModel<typeof PersonalDetails>,
    role: "SYS_ADMIN" | "ADMIN" | "SUPERVISOR" | "FACULTY" | "STUDENT",
  ) {
    return await db.transaction(async tx => {
      const userDetails = await CreateRecord("PersonalDetails", personalDetails, tx);
      if (!userDetails) throw new AppError(500,
        "Failed to create personal details record while registering user. User account was not created.");

      const hash = await bcrypt.hash(credentials.password, 10);
      const userCredentials: InferInsertModel<typeof Accounts> = {
        ...credentials,
        password: hash,
        personal_details_id: userDetails?.id
      };
      const userAccount = await CreateRecord("Accounts", userCredentials, tx);
      if (!userAccount) throw new AppError(500,
        "Failed to create account record while registering user. Personal details record was rolled back.");

      const systemRole = await GetRecord("Roles", {
        where: (Roles) => eq(Roles.system_role, role),
        tx
      });
      if (!systemRole) throw new AppError(400,
        "Given role has not been found. Changes during account creation were rolled back.");

      const userRole = await CreateRecord("AccountRoles", {
        account_id: userAccount.id,
        role_id: systemRole.id,
      }, tx);
      if (!userRole) throw new AppError(400,
        "Failed to map account record to a role. Changes during account creation were rolled back.");

      return {
        credentials: userCredentials,
        details: userCredentials,
        role: userRole,
      };
    });
  };
};

const UserService = new userService();
export default UserService;
