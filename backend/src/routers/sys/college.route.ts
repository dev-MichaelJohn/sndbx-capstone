import CollegeController from "@/controllers/college.controller.js";
import { Router, type IRouter } from "express";
import ProgramRouter from "./program.router.js";

const CollegeRouter: IRouter = Router();

CollegeRouter.get("/available-deans", async (req, res, next) => {
  await CollegeController.searchAvailableDeanCandidates(req, res, next);
});
CollegeRouter.get("/", async (req, res, next) => {
  await CollegeController.getColleges(req, res, next);
});

CollegeRouter.get("/:id", async (req, res, next) => {
  await CollegeController.getCollege(req, res, next);
});

CollegeRouter.post("/", async (req, res, next) => {
  await CollegeController.createCollegeRecord(req, res, next);
});

CollegeRouter.put("/:id", async (req, res, next) => {
  await CollegeController.updateCollegeRecord(req, res, next);
});

CollegeRouter.delete("/:id", async (req, res, next) => {
  await CollegeController.deleteCollegeRecord(req, res, next);
});

CollegeRouter.use("/:id/programs", ProgramRouter);

export default CollegeRouter;
