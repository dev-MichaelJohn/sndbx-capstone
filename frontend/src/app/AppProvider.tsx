import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/features/auth/context/user.context";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <TooltipProvider>
              <Toaster />
              {children}
            </TooltipProvider>
          </UserProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};
