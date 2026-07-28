import type { UserLoginType } from "backend/types/user.type";
import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type PendingAuth =
  | (UserLoginType & {
      resendAt: number;
      isLoading?: boolean;
    })
  | null;
type AuthFlowContextType = {
  pendingAuth: PendingAuth;
  setPendingAuth: Dispatch<SetStateAction<PendingAuth>>;
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthFlow = () => {
  const context = useContext(AuthFlowContext);
  if (!context) throw new Error("useAuthFlow must be used within AuthFlowProvider.");
  return context;
};
