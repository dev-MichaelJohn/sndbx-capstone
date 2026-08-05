import { Route } from "react-router";
import CollegePage from "@/features/college/page/CollegePage";
import ProgramPage from "@/features/program/page/ProgramPage";
import ProgramDetailsPage from "@/features/program/page/ProgramDetailsPage";
import ClassDetailsPage from "@/features/class/components/ClassDetails";
import { CourseOfferingStudentsPage } from "@/features/student-class/page/StudentClassPage";

interface InstitutionRoutesProps {
  path?: string;
}

export const InstitutionRoutes = ({ path = "institution" }: InstitutionRoutesProps = {}) => (
  <Route path={path}>
    <Route index element={<CollegePage />} />
    <Route path=":collegeId/programs">
      <Route index element={<ProgramPage />} />
      <Route path=":programId">
        <Route index element={<ProgramDetailsPage />} />
        <Route path="classes/:classId">
          <Route index element={<ClassDetailsPage />} />
          <Route path="course-offerings/:id/students" element={<CourseOfferingStudentsPage />} />
        </Route>
      </Route>
    </Route>
  </Route>
);
