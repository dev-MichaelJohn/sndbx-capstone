import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import App from "@/app/App";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import "@fontsource-variable/roboto";
import { UserProvider } from "./features/auth/user.context";
import { TooltipProvider } from "./components/ui/tooltip";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <TooltipProvider>
              <App />
            </TooltipProvider>
          </UserProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
