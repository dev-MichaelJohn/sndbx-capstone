import SemesterController from "@/controllers/semester.controller.js";
import { Router, type IRouter } from "express";

const SemesterRouter: IRouter = Router();

SemesterRouter.get("/", (req, res, next) => {
  SemesterController.getSemesters(req, res, next);
});

SemesterRouter.get("/:id", (req, res, next) => {
  SemesterController.getSemester(req, res, next);
});

SemesterRouter.post("/", (req, res, next) => {
  SemesterController.createSemester(req, res, next);
});

SemesterRouter.put("/:id", (req, res, next) => {
  SemesterController.updateSemester(req, res, next);
});

SemesterRouter.delete("/:id", (req, res, next) => {
  SemesterController.deleteSemester(req, res, next);
});

export default SemesterRouter;
