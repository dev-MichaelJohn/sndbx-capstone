import AuthController from "@/controllers/auth.controller.js";
import { createAPIResponse } from "@/utils/response.util.js";
import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import UserRouter from "./user.router.js";
import CollegeRouter from "./college.route.js";
import ProgramRouter from "./program.router.js";
import SemesterRouter from "./semester.router.js";
import CourseRouter from "./course.route.js";
import CurriculumRouter from "./curriculum.route.js";
import ClassRouter from "./class.route.js";
import CourseOfferingRouter from "./offerings.route.js";
import StudentClassRouter from "./student-class.route.js";
import ClassStudentRouter from "./class-student.route.js";
import EvaluationFormRouter from "./evaluation-form.route.js";

const ProtectedRouter: IRouter = Router();

ProtectedRouter.use(AuthController.verifyJWT);

ProtectedRouter.use("/users", UserRouter);
ProtectedRouter.use("/colleges", CollegeRouter);
ProtectedRouter.use("/programs", ProgramRouter);
ProtectedRouter.use("/programs", ProgramRouter);
ProtectedRouter.use("/semesters", SemesterRouter);
ProtectedRouter.use("/courses", CourseRouter);
ProtectedRouter.use("/curriculum", CurriculumRouter);
ProtectedRouter.use("/classes", ClassRouter);
ProtectedRouter.use("/course-offerings", CourseOfferingRouter);
ProtectedRouter.use("/class-students", ClassStudentRouter);
ProtectedRouter.use("/student-classes", StudentClassRouter);
ProtectedRouter.use("/evaluation-forms", EvaluationFormRouter);

ProtectedRouter.get("/", (_req: Request, res: Response, _next: NextFunction) => {
  const response = createAPIResponse(200, "Welcome to Super Admin Routes!.");
  res.status(response.status).json(response);
});

export default ProtectedRouter;
