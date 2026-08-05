import { LoginCard } from "@/srcx/features/auth/components/LoginCard";
import { OTPCard } from "@/srcx/features/auth/components/OTPCard";
import { RedirectIfAuthenticated } from "@/srcx/features/auth/components/RedirectIfAuthenticated";
import { AuthPage } from "@/srcx/features/auth/page/AuthPage";
import { Route } from "react-router";

export const AuthRoutes = () => {
  return (
    <Route element={<RedirectIfAuthenticated />}>
      <Route path="auth" element={<AuthPage />}>
        <Route path="login" element={<LoginCard />} />
        <Route path="otp" element={<OTPCard />} />
      </Route>
    </Route>
  );
};
