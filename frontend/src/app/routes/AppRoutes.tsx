import { Route, Routes } from "react-router";
import { AuthRoutes } from "./AuthRoutes";
import { SysRoutes } from "./SysRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { SupervisorRoutes } from "./SupervisorRoutes";
import { StudentRoutes } from "./StudentRoutes";
import { FacultyRoutes } from "./FacultyRoutes";
import NotFoundPage from "@/components/NotFoundPage";
import PublicLandingPage from "@/components/PublicLandingPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicLandingPage />} />

      {AuthRoutes()}
      {SysRoutes()}
      {AdminRoutes()}
      {SupervisorRoutes()}
      {StudentRoutes()}
      {FacultyRoutes()}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
