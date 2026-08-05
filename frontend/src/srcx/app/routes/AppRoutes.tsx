import { Routes } from "react-router";
import { AuthRoutes } from "./AuthRoutes";
import { SysRoutes } from "./SysRoutes";

export const AppRoutes = () => {
  return (
    <Routes>
      <AuthRoutes />
      <SysRoutes />
    </Routes>
  );
};
