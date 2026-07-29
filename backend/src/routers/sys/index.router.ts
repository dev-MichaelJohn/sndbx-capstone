import AuthController from "@/controllers/auth.controller.js";
import { authorizeHandler } from "@/middlewares/auth.middleware.js";
import { createAPIResponse } from "@/utils/response.util.js";
import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import UserRouter from "./user.router.js";
import CollegeRouter from "./college.route.js";
import ProgramRouter from "./program.router.js";
import SemesterRouter from "./semester.router.js";
import CourseRouter from "./course.route.js";
import CurriculumRouter from "./curriculum.route.js";
import ClassRouter from "./class.route.js";

const SysRouter: IRouter = Router();

SysRouter.use(AuthController.verifyJWT);
SysRouter.use(authorizeHandler("SYS_ADMIN"));

SysRouter.use("/users", UserRouter);
SysRouter.use("/colleges", CollegeRouter);
SysRouter.use("/programs", ProgramRouter);
SysRouter.use("/programs", ProgramRouter);
SysRouter.use("/semesters", SemesterRouter);
SysRouter.use("/courses", CourseRouter);
SysRouter.use("/curriculum", CurriculumRouter);
SysRouter.use("/classes", ClassRouter);

SysRouter.get("/", (_req: Request, res: Response, _next: NextFunction) => {
  const response = createAPIResponse(200, "Welcome to Super Admin Routes!.");
  res.status(response.status).json(response);
});

export default SysRouter;
