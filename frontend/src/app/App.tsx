import { Routes, Route } from "react-router";
import { AuthPage } from "./auth";
import { LoginCard } from "./auth/LoginCard";
import { OTPCard } from "./auth/OTPCard";
import { RequireRole } from "@/features/auth/RequireRole";
import { SysDashboard } from "./sys/SysDashboard";
import { AdminDashboard } from "./admin/AdminDasboard";
import { SupervisorDashboard } from "./supervisor/SupervisorDashboard";
import { FacultyDashboard } from "./faculty/FacultyDashboard";
import { StudentDashboard } from "./student/StudentDasboard";
import { RedirectIfAuthenticated } from "@/features/auth/RedirectIfAuthenticated";

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
        <Route path="sys/dashboard" element={<SysDashboard />} />
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
