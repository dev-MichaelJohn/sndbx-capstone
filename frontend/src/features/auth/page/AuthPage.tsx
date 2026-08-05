import { Outlet } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/features/auth/context/auth.context";

export const AuthPage = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Toaster />
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </div>
  );
};
