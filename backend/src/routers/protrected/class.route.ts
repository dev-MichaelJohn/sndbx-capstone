import { Router, type IRouter } from "express";
import ClassController from "@/controllers/class.controller.js";

const ClassRouter: IRouter = Router({ mergeParams: true });

ClassRouter.get("/", (req, res, next) => ClassController.getClasses(req, res, next));
ClassRouter.get("/:classId", (req, res, next) => ClassController.getClass(req, res, next));
ClassRouter.post("/", (req, res, next) => ClassController.createClass(req, res, next));
ClassRouter.patch("/:classId", (req, res, next) => ClassController.updateClass(req, res, next));
ClassRouter.delete("/:classId", (req, res, next) => ClassController.deleteClass(req, res, next));

export default ClassRouter;
