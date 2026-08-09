import { ForgotPasswordCard } from "@/features/auth/components/ForgotPasswordCard";
import { LoginCard } from "@/features/auth/components/LoginCard";
import { OTPCard } from "@/features/auth/components/OTPCard";
import { RedirectIfAuthenticated } from "@/features/auth/components/RedirectIfAuthenticated";
import { ResetPasswordCard } from "@/features/auth/components/ResetPasswordCard";
import { AuthPage } from "@/features/auth/page/AuthPage";
import { Route } from "react-router";

export const AuthRoutes = () => {
  return (
    <Route element={<RedirectIfAuthenticated />}>
      <Route path="auth" element={<AuthPage />}>
        <Route path="login" element={<LoginCard />} />
        <Route path="otp" element={<OTPCard />} />
        <Route path="forgot-password" element={<ForgotPasswordCard />} />
        <Route path="reset-password" element={<ResetPasswordCard />} />
      </Route>
    </Route>
  );
};
