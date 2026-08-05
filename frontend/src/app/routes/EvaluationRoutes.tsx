import { Navigate, Route } from "react-router";
import EvaluationFormPage from "@/features/evaluation-management/page/EvaluationFormPage";
import EvaluationFormBuilderPage from "@/features/evaluation-management/page/EvaluationFormBuilderPage";

interface EvaluationRoutesProps {
  path?: string;
}

export const EvaluationRoutes = ({ path = "evaluation" }: EvaluationRoutesProps = {}) => (
  <Route path={path}>
    <Route index element={<Navigate to="forms" replace />} />
    <Route path="forms">
      <Route index element={<EvaluationFormPage />} />
      <Route path=":type/:formId" element={<EvaluationFormBuilderPage />} />
    </Route>
  </Route>
);
