import { Routes, Route } from "react-router";
import { AuthPage } from "./auth";
import { LoginCard } from "./auth/LoginCard";
import { OTPCard } from "./auth/OTPCard";
import { RequireRole } from "@/features/auth/RequireRole";
import { SysDashboard } from "./sys/SysDashboard";
import { OverviewPage } from "./sys/pages/OverviewPage";
import { UsersPage } from "./sys/pages/UsersPage";
import { InstitutionPage } from "./sys/pages/InstitutionPage";
import { AdminDashboard } from "./admin/AdminDasboard";
import { SupervisorDashboard } from "./supervisor/SupervisorDashboard";
import { FacultyDashboard } from "./faculty/FacultyDashboard";
import { StudentDashboard } from "./student/StudentDasboard";
import { RedirectIfAuthenticated } from "@/features/auth/RedirectIfAuthenticated";
import { ProgramsPage } from "./sys/pages/ProgramsPage";
import SemestersPage from "./sys/pages/SemestersPage";

const App = () => {
  return (
    <Routes>
      <Route element={<RedirectIfAuthenticated />}>
        <Route path="auth" element={<AuthPage />}>
          <Route path="login" element={<LoginCard />} />
          <Route path="otp" element={<OTPCard />} />
        </Route>
      </Route>

      <Route element={<RequireRole allowed={["SYS_ADMIN"]} />}>
        <Route element={<SysDashboard />}>
          <Route path="sys/dashboard" element={<OverviewPage />} />
          <Route path="sys/users" element={<UsersPage />} />
          <Route path="sys/institution">
            <Route index element={<InstitutionPage />} />
            <Route path=":collegeId/programs" element={<ProgramsPage />} />
          </Route>
          <Route path="sys/semesters" element={<SemestersPage />} />
        </Route>
      </Route>
      <Route element={<RequireRole allowed={["SYS_ADMIN", "ADMIN"]} />}>
        <Route path="admin/dashboard" element={<AdminDashboard />} />
      </Route>
      <Route element={<RequireRole allowed={["SUPERVISOR", "FACULTY"]} />}>
        <Route path="faculty/dashboard" element={<FacultyDashboard />} />
      </Route>
      <Route element={<RequireRole allowed={["SUPERVISOR"]} />}>
        <Route path="supervisor/dashboard" element={<SupervisorDashboard />} />
      </Route>
      <Route element={<RequireRole allowed={["STUDENT"]} />}>
        <Route path="student/dashboard" element={<StudentDashboard />} />
      </Route>
    </Routes>
  );
};

export default App;
