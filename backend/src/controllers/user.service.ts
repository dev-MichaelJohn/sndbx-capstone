import UserService from "@/services/user.service.js";
import { createAPIResponse } from "@/utils/response.util.js";
import { CreateUserReqSchema, type CreateUserReqType } from "@/utils/user.util.js";
import type { NextFunction, Request, Response } from "express";

class userController {
  constructor() { }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = await CreateUserReqSchema.safeParseAsync(req.body);
      if (!parsed.success) throw parsed.error;

      const { body }: { body: CreateUserReqType } = req;
      const user = await UserService.createUser(body.credentials, body.personalDetails, body.role);

      const response = createAPIResponse<typeof user>(201, "User account was successfully created.", user);
      res.status(response.status).json(response);
    } catch (error: any) {
      next(error);
    }
  };
};

const UserController = new userController();
export default UserController;
