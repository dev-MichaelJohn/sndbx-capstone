import type { UserLoginType } from "backend/types/user.type";
import { createContext, useContext, useState, type ReactNode } from "react";

type PendingAuth =
  | (UserLoginType & {
      resendAt: number;
    })
  | null;
type AuthFlowContextType = {
  pendingAuth: PendingAuth;
  setPendingAuth: (auth: PendingAuth) => void;
};

const AuthFlowContext = createContext<AuthFlowContextType | undefined>(undefined);

export const AuthFlowProvider = ({ children }: { children: ReactNode }) => {
  const [pendingAuth, setPendingAuth] = useState<PendingAuth>(null);

  return (
    <AuthFlowContext.Provider value={{ pendingAuth, setPendingAuth }}>
      {children}
    </AuthFlowContext.Provider>
  );
};

export const useAuthFlow = () => {
  const context = useContext(AuthFlowContext);
  if (!context) throw new Error("useAuthFlow must be used within AuthFlowProvider.");
  return context;
};
