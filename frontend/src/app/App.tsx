import { Routes, Route } from "react-router";
import { AuthPage } from "./auth";
import { LoginCard } from "./auth/LoginCard";
import { OTPCard } from "./auth/OTPCard";

const App = () => {
  return (
    <Routes>
      <Route path="auth" element={<AuthPage />}>
        <Route path="login" element={<LoginCard />} />
        <Route path="otp" element={<OTPCard />} />
      </Route>
    </Routes>
  );
};

export default App;
