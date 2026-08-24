import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/features/auth/context/user.context";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false, // Prevents refetching when switching tabs
        refetchOnReconnect: false, // Prevents refetching on network reconnect
      },
    },
  });

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <TooltipProvider>
              <Toaster position="bottom-right" />
              {children}
            </TooltipProvider>
          </UserProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};
