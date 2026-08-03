import CollegeController from "@/controllers/college.controller.js";
import { Router, type IRouter } from "express";
import ProgramRouter from "./program.router.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";

const CollegeRouter: IRouter = Router();

CollegeRouter.get(
  "/available-deans",
  requirePermission(PERMISSIONS.COLLEGE_READ),
  async (req, res, next) => {
    await CollegeController.searchAvailableDeanCandidates(req, res, next);
  },
);
CollegeRouter.get("/", requirePermission(PERMISSIONS.COLLEGE_READ), async (req, res, next) => {
  await CollegeController.getColleges(req, res, next);
});

CollegeRouter.get("/:id", requirePermission(PERMISSIONS.COLLEGE_READ), async (req, res, next) => {
  await CollegeController.getCollege(req, res, next);
});

CollegeRouter.post("/", requirePermission(PERMISSIONS.COLLEGE_CREATE), async (req, res, next) => {
  await CollegeController.createCollegeRecord(req, res, next);
});

CollegeRouter.put("/:id", requirePermission(PERMISSIONS.COLLEGE_UPDATE), async (req, res, next) => {
  await CollegeController.updateCollegeRecord(req, res, next);
});

CollegeRouter.delete(
  "/:id",
  requirePermission(PERMISSIONS.COLLEGE_DELETE),
  async (req, res, next) => {
    await CollegeController.deleteCollegeRecord(req, res, next);
  },
);

CollegeRouter.use("/:id/programs", requirePermission(PERMISSIONS.PROGRAM_READ), ProgramRouter);

export default CollegeRouter;
