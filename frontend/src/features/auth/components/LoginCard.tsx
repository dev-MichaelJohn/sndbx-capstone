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

export const LoginCard = () => {
  return (
    <Card className="w-full max-w-sm shadow">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Login to you account</CardTitle>
        <CardDescription className="text-md">
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" form="form-login" className="w-full text-sm font-bold">
          Login
        </Button>
        <a
          href="#"
          className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-chart-5"
        >
          Back to home
        </a>
      </CardFooter>
    </Card>
  );
};
