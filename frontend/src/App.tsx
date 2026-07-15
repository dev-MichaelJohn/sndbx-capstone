import { Route, Routes } from "react-router";
import { SysBasePage } from "./feature/sys";

export const App = () => {
  return (
    <Routes>
      <Route path="sys" element={<SysBasePage />}></Route>
    </Routes>
  );
};
