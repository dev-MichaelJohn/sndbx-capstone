import UserService, { type IUserService } from "@/services/user.service.js";
import { createAPIResponse } from "@/utils/response.util.js";
import { CreateUserReqSchema, UpdateUserReqSchema, UserSearchSchema } from "@/types/user.type.js";
import { AppError } from "@/utils/error.util.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod"; // still used by extractId

class userController {
  constructor(private userService: IUserService = UserService) {}

  private async extractId(id: unknown) {
    const validation = await z.coerce
      .number("User ID is required.")
      .int("User ID must be an integer.")
      .positive("User ID must be a positive integer.")
      .safeParseAsync(id);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  /**
   * GET /users
   * Returns a paginated, searchable list of accounts with personal details
   * and roles. Accepts `search`, `role`, `page`, `orderBy`, `orderDir` as
   * query params.
   */
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = await UserSearchSchema.safeParseAsync(req.query);
      if (!validation.success) throw validation.error;

      const result = await this.userService.getUsers(validation.data);
      const response = createAPIResponse<typeof result>(
        200,
        "User accounts retrieved successfully.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /users
   * Creates a new user account (PersonalDetails + Accounts + AccountRoles).
   * Sends a welcome email if the password was auto-generated.
   * Body: { credentials, personalDetails, role }
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body) throw new AppError(400, "Request body cannot be empty.");

      const validation = await CreateUserReqSchema.safeParseAsync(req.body);
      if (!validation.success) throw validation.error;

      const result = await this.userService.createUser(validation.data);
      const response = createAPIResponse<typeof result>(
        201,
        "User account was successfully created.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /users/:id
   * Admin-driven update of email and/or personal details fields.
   * Password and role changes are excluded from this endpoint.
   * Sends an update notification email on success.
   * Body: { credentials?: { email }, personalDetails?: { ... } }
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body) throw new AppError(400, "Request body cannot be empty.");

      const id = await this.extractId(req.params.id);

      const validation = await UpdateUserReqSchema.safeParseAsync(req.body);
      if (!validation.success) throw validation.error;

      const result = await this.userService.updateUser(id, validation.data);
      const response = createAPIResponse<typeof result>(
        200,
        "User account updated successfully.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /users/:id
   * Cascade soft-deletes AccountRoles → PersonalDetails → Accounts.
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await this.extractId(req.params.id);

      await this.userService.deleteUser(id);
      const response = createAPIResponse<null>(200, "User account deleted successfully.", null);
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const UserController = new userController();
export default UserController;
