import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./LoginForm";
import { Link } from "react-router";

export const LoginCard = () => {
  return (
    <Card className="w-full max-w-sm shadow rounded-2xl border border-border/80">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Login to your account</CardTitle>
        <CardDescription className="text-xs">
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          form="form-login"
          className="w-full text-xs font-bold h-9 cursor-pointer"
        >
          Login
        </Button>
        <div className="flex w-full justify-between text-xs pt-1">
          <Link
            to="/auth/forgot-password"
            className="text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
          <a
            href="#"
            className="inline-block underline-offset-4 hover:underline text-muted-foreground"
          >
            Back to home
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};
