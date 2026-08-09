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
import EvaluationScheduleRouter from "./evaluation-schedule.router.js";
import EvaluationExecutionRouter from "./evaluation-execution.router.js";
import EvaluationReportRouter from "./evaluation-report.route.js";
import EvaluationAnalyticsRouter from "./evaluation-analytics.route.js";
import SystemLogRouter from "./system-log.route.js";
import rateLimit from "express-rate-limit";
import BulkImportRouter from "./bulk-import.route.js";

const ProtectedRouter: IRouter = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

ProtectedRouter.use(AuthController.verifyJWT);
ProtectedRouter.use(AuthController.isVerified);

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
ProtectedRouter.use("/evaluation-schedules", EvaluationScheduleRouter);
ProtectedRouter.use("/evaluation-execution", EvaluationExecutionRouter);
ProtectedRouter.use("/evaluation-reports", EvaluationReportRouter);
ProtectedRouter.use("/evaluation-analytics", EvaluationAnalyticsRouter);
ProtectedRouter.use("/logs", SystemLogRouter);
ProtectedRouter.use("/bulk-import", BulkImportRouter);

ProtectedRouter.get("/", (_req: Request, res: Response, _next: NextFunction) => {
  const response = createAPIResponse(200, "Welcome to Super Admin Routes!.");
  res.status(response.status).json(response);
});

export default ProtectedRouter;
