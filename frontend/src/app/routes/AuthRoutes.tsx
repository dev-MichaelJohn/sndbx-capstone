import type { RouteObject } from "react-router";
import { RedirectIfAuthenticated } from "@/features/auth/components/RedirectIfAuthenticated";
import { AuthPage } from "@/features/auth/page/AuthPage";
import { LoginCard } from "@/features/auth/components/LoginCard";
import { OTPCard } from "@/features/auth/components/OTPCard";
import { ForgotPasswordCard } from "@/features/auth/components/ForgotPasswordCard";
import { ResetPasswordCard } from "@/features/auth/components/ResetPasswordCard";

export const AuthRoutes: RouteObject = {
  path: "/auth",
  element: <RedirectIfAuthenticated />,
  children: [
    {
      element: <AuthPage />,
      children: [
        { path: "login", element: <LoginCard /> },
        { path: "otp", element: <OTPCard /> },
        { path: "forgot-password", element: <ForgotPasswordCard /> },
        { path: "reset-password", element: <ResetPasswordCard /> },
      ],
    },
  ],
};
