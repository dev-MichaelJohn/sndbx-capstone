import CourseController from "@/controllers/course.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";
import { Router, type IRouter } from "express";

const CourseRouter: IRouter = Router({ mergeParams: true });

CourseRouter.get("/", requirePermission(PERMISSIONS.COURSE_READ), (req, res, next) => {
  CourseController.getCourses(req, res, next);
});

CourseRouter.get("/:id", requirePermission(PERMISSIONS.COURSE_READ), (req, res, next) => {
  CourseController.getCourse(req, res, next);
});

CourseRouter.post("/", requirePermission(PERMISSIONS.COURSE_CREATE), (req, res, next) => {
  CourseController.createCourse(req, res, next);
});

CourseRouter.put("/:id", requirePermission(PERMISSIONS.COURSE_UPDATE), (req, res, next) => {
  CourseController.updateCourse(req, res, next);
});

CourseRouter.delete("/:id", requirePermission(PERMISSIONS.COURSE_DELETE), (req, res, next) => {
  CourseController.deleteCourse(req, res, next);
});

export default CourseRouter;
