import ProgramController from "@/controllers/program.controller.js";
import { Router, type IRouter } from "express";
import CourseRouter from "./course.route.js";
import CurriculumRouter from "./curriculum.route.js";
import ClassRouter from "./class.route.js";

const ProgramRouter: IRouter = Router({ mergeParams: true });

ProgramRouter.get("/available-chairs", (req, res, next) => {
  ProgramController.searchAvailableChairCandidates(req, res, next);
});

ProgramRouter.get("/", (req, res, next) => {
  ProgramController.getPrograms(req, res, next);
});

ProgramRouter.get("/:program_id", (req, res, next) => {
  ProgramController.getProgram(req, res, next);
});

ProgramRouter.post("/", (req, res, next) => {
  ProgramController.createProgramRecord(req, res, next);
});

ProgramRouter.put("/:program_id", (req, res, next) => {
  ProgramController.updateProgramRecord(req, res, next);
});

ProgramRouter.delete("/:program_id", (req, res, next) => {
  ProgramController.deleteProgramRecord(req, res, next);
});

ProgramRouter.use("/:id/courses", CourseRouter);
ProgramRouter.use("/:id/curriculum", CurriculumRouter);
ProgramRouter.use("/:id/classes", ClassRouter);

export default ProgramRouter;
