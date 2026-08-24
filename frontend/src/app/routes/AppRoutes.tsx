import { createBrowserRouter } from "react-router";
import { RequireVerification } from "@/features/auth/components/RequireVerification";
import PublicLandingPage from "@/components/PublicLandingPage";
import NotFoundPage from "@/components/NotFoundPage";

import { AuthRoutes } from "./AuthRoutes";
import { StudentRoutes } from "./StudentRoutes";
import { FacultyRoutes } from "./FacultyRoutes";
import { SupervisorRoutes } from "./SupervisorRoutes";
import { SysAdminRoutes, AdminRoutes } from "./AdminRoutes";

export const router = createBrowserRouter([
  // Public landing
  { path: "/", element: <PublicLandingPage /> },

  // Public Auth (Redirects away if already logged in)
  AuthRoutes,

  // 🛑 Protected & Verified Section (Instant Gate)
  {
    element: <RequireVerification />,
    children: [StudentRoutes, FacultyRoutes, SupervisorRoutes, SysAdminRoutes, AdminRoutes],
  },

  // Fallback 404
  { path: "*", element: <NotFoundPage /> },
]);
