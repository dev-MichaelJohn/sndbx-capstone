import UserService, { type IUserService } from "@/services/user.service.js";
import { createAPIResponse } from "@/utils/response.util.js";
import { CreateUserReqSchema } from "@/types/user.type.js";
import type { NextFunction, Request, Response } from "express";

/** Handles user account creation requests. */
class userController {
  constructor(private userService: IUserService = UserService) {}

  /**
   * Validates `req.body` against {@link CreateUserReqSchema}, then delegates
   * to {@link IUserService.createUser} to create the account, personal
   * details, and role-mapping records.
   *
   * @param req - expects `body: CreateUserReqType` (credentials, personalDetails, role)
   * @param res - responds 201 with the created user on success
   * @param next - forwards validation errors or service failures to error-handling middleware
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = await CreateUserReqSchema.safeParseAsync(req.body);
      if (!validation.success) throw validation.error;

      const { credentials, personalDetails, role } = validation.data;
      const user = await this.userService.createUser({ credentials, personalDetails, role });

      const response = createAPIResponse<typeof user>(
        201,
        "User account was successfully created.",
        user,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const UserController = new userController();
export default UserController;
