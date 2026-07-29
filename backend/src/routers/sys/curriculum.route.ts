import CurriculumController from "@/controllers/curriculum.controller.js";
import { Router, type IRouter } from "express";

const CurriculumRouter: IRouter = Router({ mergeParams: true });

CurriculumRouter.get("/", (req, res, next) => CurriculumController.getCurriculums(req, res, next));
CurriculumRouter.get("/:id", (req, res, next) =>
  CurriculumController.getCurriculum(req, res, next),
);
CurriculumRouter.post("/", (req, res, next) =>
  CurriculumController.createCurriculum(req, res, next),
);
CurriculumRouter.patch("/:id", (req, res, next) =>
  CurriculumController.updateCurriculum(req, res, next),
);
CurriculumRouter.delete("/:id", (req, res, next) =>
  CurriculumController.deleteCurriculum(req, res, next),
);

export default CurriculumRouter;
