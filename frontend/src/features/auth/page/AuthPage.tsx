import { Outlet } from "react-router";
import { AuthProvider } from "@/features/auth/context/auth.context";

export const AuthPage = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </div>
  );
};
