import { RouterProvider } from "react-router";
import { AppProviders } from "./app/AppProvider";
import { AppRoutes } from "./app/routes/AppRoutes";

export const App = () => {
  return (
    <AppProviders>
      <RouterProvider router={AppRoutes} />
    </AppProviders>
  );
};
