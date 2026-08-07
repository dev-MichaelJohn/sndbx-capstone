import { Routes } from "react-router";
import { AuthRoutes } from "./AuthRoutes";
import { SysRoutes } from "./SysRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { SupervisorRoutes } from "./SupervisorRoutes";

export const AppRoutes = () => {
  return (
    <Routes>
      {AuthRoutes()}
      {SysRoutes()}
      {AdminRoutes()}
      {SupervisorRoutes()}
    </Routes>
  );
};
