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
import { Navigate } from "react-router";

export const OTPCard = () => {
  const { pendingAuth } = useAuthFlow();
  if (!pendingAuth) return <Navigate to="/auth/login" replace></Navigate>;

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
        <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
          Back to login
        </a>
      </CardFooter>
    </Card>
  );
};
