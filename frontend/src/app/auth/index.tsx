import { Outlet } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthFlowProvider } from "@/features/auth/auth.context";

export const AuthPage = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Toaster />
      <AuthFlowProvider>
        <Outlet />
      </AuthFlowProvider>
    </div>
  );
};
