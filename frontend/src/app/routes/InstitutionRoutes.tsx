import type { RouteObject } from "react-router";
import CollegePage from "@/features/college/page/CollegePage";
import ProgramPage from "@/features/program/page/ProgramPage";
import ProgramDetailsPage from "@/features/program/page/ProgramDetailsPage";
import ClassDetailsPage from "@/features/class/components/ClassDetails";
import { CourseOfferingStudentsPage } from "@/features/student-class/page/StudentClassPage";

export const InstitutionRoutes: RouteObject = {
  path: "institution",
  children: [
    { index: true, element: <CollegePage /> },
    {
      path: ":collegeId/programs",
      children: [
        { index: true, element: <ProgramPage /> },
        {
          path: ":programId",
          children: [
            { index: true, element: <ProgramDetailsPage /> },
            {
              path: "classes/:classId",
              children: [
                { index: true, element: <ClassDetailsPage /> },
                { path: "course-offerings/:id/students", element: <CourseOfferingStudentsPage /> },
              ],
            },
          ],
        },
      ],
    },
  ],
};
