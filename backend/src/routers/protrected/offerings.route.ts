import { Router, type IRouter } from "express";
import CourseOfferingController from "@/controllers/offerings.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";
import StudentClassRouter from "./student-class.route.js";

const CourseOfferingRouter: IRouter = Router({ mergeParams: true });

CourseOfferingRouter.get(
  "/",
  requirePermission(PERMISSIONS.COURSE_OFFERING_READ),
  (req, res, next) => CourseOfferingController.getCourseOfferings(req, res, next),
);
CourseOfferingRouter.get(
  "/:offeringId",
  requirePermission(PERMISSIONS.COURSE_OFFERING_READ),
  (req, res, next) => CourseOfferingController.getCourseOffering(req, res, next),
);
CourseOfferingRouter.post(
  "/",
  requirePermission(PERMISSIONS.COURSE_OFFERING_CREATE),
  (req, res, next) => CourseOfferingController.createCourseOffering(req, res, next),
);
CourseOfferingRouter.patch(
  "/:offeringId",
  requirePermission(PERMISSIONS.COURSE_OFFERING_UPDATE),
  (req, res, next) => CourseOfferingController.updateCourseOffering(req, res, next),
);
CourseOfferingRouter.delete(
  "/:offeringId",
  requirePermission(PERMISSIONS.COURSE_OFFERING_DELETE),
  (req, res, next) => CourseOfferingController.deleteCourseOffering(req, res, next),
);
CourseOfferingRouter.use(
  "/:id/student-classes",
  requirePermission(PERMISSIONS.STUDENT_CLASS_READ),
  StudentClassRouter,
);

export default CourseOfferingRouter;
