import CourseController from "@/controllers/course.controller.js";
import { Router, type IRouter } from "express";

const CourseRouter: IRouter = Router({ mergeParams: true });

CourseRouter.get("/", (req, res, next) => {
  CourseController.getCourses(req, res, next);
});

CourseRouter.get("/:id", (req, res, next) => {
  CourseController.getCourse(req, res, next);
});

CourseRouter.post("/", (req, res, next) => {
  CourseController.createCourse(req, res, next);
});

CourseRouter.put("/:id", (req, res, next) => {
  CourseController.updateCourse(req, res, next);
});

CourseRouter.delete("/:id", (req, res, next) => {
  CourseController.deleteCourse(req, res, next);
});

export default CourseRouter;
