import { AppProviders } from "./app/AppProvider";
import { AppRoutes } from "./app/routes/AppRoutes";

export const App = () => {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};
