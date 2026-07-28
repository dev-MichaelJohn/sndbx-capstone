import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OTPForm } from "./OTPForm";
import { useAuthFlow } from "@/features/auth/auth.context";
import { Link, Navigate } from "react-router";
import { ResendBtn } from "./ResendBtn";
import { useValidateLogin } from "@/features/auth/auth.service";
import toast from "react-hot-toast";

export const OTPCard = () => {
  const { pendingAuth, setPendingAuth } = useAuthFlow();
  const login = useValidateLogin();
  if (!pendingAuth) return <Navigate to="/auth/login" replace></Navigate>;

  const handleResend = async () => {
    let toastId: string | undefined;
    try {
      toastId = toast.loading("Resending...");
      setPendingAuth((prev) => (prev ? { ...prev, isLoading: true } : null));
      const result = await login.mutateAsync({
        email: pendingAuth.email,
        password: pendingAuth.password,
      });

      const { data, message } = result;
      if (!data) throw new Error("Unexpected response from server.");

      setPendingAuth((prev) =>
        prev
          ? {
              ...prev,
              resendAt: data.resendAt,
              isLoading: false,
            }
          : null,
      );
      toast.success(message, { id: toastId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Resend failed.";
      setPendingAuth((prev) => (prev ? { ...prev, isLoading: false } : null));
      toast.error(message, { id: toastId });
    }
  };

  return (
    <Card className="w-full max-w-sm shadow">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Login to your account</CardTitle>
        <CardDescription className="text-md">
          Enter the one-time code sent to your email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OTPForm />
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" form="form-otp" className="w-full text-sm font-bold">
          Login
        </Button>
        {pendingAuth.resendAt && (
          <ResendBtn
            resendAt={pendingAuth.resendAt}
            onResend={handleResend}
            isLoading={login.isPending || pendingAuth.isLoading}
          />
        )}
        <Link
          to="/auth/login"
          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
        >
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
};
