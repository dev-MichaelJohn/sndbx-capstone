import { SysDashboard } from "@/app/sys/SysDashboard";
import { RequireRole } from "@/srcx/features/auth/components/RequireRole";
import ClassDetailsPage from "@/srcx/features/class/components/ClassDetails";
import CollegePage from "@/srcx/features/college/page/CollegePage";
import ProgramDetailsPage from "@/srcx/features/program/page/ProgramDetailsPage";
import ProgramPage from "@/srcx/features/program/page/ProgramPage";
import { CourseOfferingStudentsPage } from "@/srcx/features/student-class/page/StudentClassPage";
import UsersPage from "@/srcx/features/user/page/UsersPage";
import SemesterPage from "@/srcx/features/semester/page/SemestersPage";
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
