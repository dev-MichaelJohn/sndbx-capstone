import { useNavigate } from "react-router";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/features/auth/context/user.context";
import { getHomeRouteForRoles } from "@/lib/role-route";

/**
 * Global 404 Page Not Found component rendered for unmapped or unauthorized routes.
 * Constructed strictly using Shadcn UI components.
 */
export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const homeRoute = user?.roles ? getHomeRouteForRoles(user.roles) : "/auth/login";

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md rounded-2xl border border-border/80 shadow-2xl">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-inner">
            <FileQuestion className="size-7" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
              Error 404
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground leading-relaxed">
            The page or route you are looking for does not exist, has been removed, or you may not
            have the required authorization to access it.
          </CardDescription>
        </CardHeader>

        <CardContent className="py-4 text-center">
          <p className="font-mono text-xs text-muted-foreground/80 bg-muted/30 p-2.5 rounded-lg border border-border/50">
            HTTP 404 — PAGE_NOT_FOUND
          </p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="w-full h-9 text-xs font-medium cursor-pointer gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            <span>Go Back</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate(homeRoute)}
            className="w-full h-9 text-xs font-medium cursor-pointer gap-1.5 bg-primary text-primary-foreground"
          >
            <Home className="size-3.5" />
            <span>Back to Dashboard</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFoundPage;
