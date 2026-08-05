import { SysDashboard } from "@/app/sys/SysDashboard";
import { RequireRole } from "@/features/auth/components/RequireRole";
import ClassDetailsPage from "@/features/class/components/ClassDetails";
import CollegePage from "@/features/college/page/CollegePage";
import ProgramDetailsPage from "@//features/program/page/ProgramDetailsPage";
import ProgramPage from "@//features/program/page/ProgramPage";
import { CourseOfferingStudentsPage } from "@//features/student-class/page/StudentClassPage";
import UsersPage from "@//features/user/page/UsersPage";
import SemesterPage from "@//features/semester/page/SemestersPage";
import { Route } from "react-router";

export const SysRoutes = () => {
  return (
    <Route element={<RequireRole allowed={["SYS_ADMIN"]} />}>
      <Route path="sys" element={<SysDashboard />}>
        <Route path="dashboard" element={<h1>Dashboard</h1>} />
        <Route path="users" element={<UsersPage />} />
        <Route path="semesters" element={<SemesterPage />} />
        <Route path="institution">
          <Route index element={<CollegePage />} />
          <Route path=":collegeId/programs">
            <Route index element={<ProgramPage />} />
            <Route path=":programId">
              <Route index element={<ProgramDetailsPage />} />
              <Route path="classes/:classId">
                <Route index element={<ClassDetailsPage />} />
                <Route
                  path="course-offerings/:id/students"
                  element={<CourseOfferingStudentsPage />}
                />
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>
    </Route>
  );
};
