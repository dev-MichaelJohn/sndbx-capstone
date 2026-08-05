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
type AuthContextType = {
  pendingAuth: PendingAuth;
  setPendingAuth: Dispatch<SetStateAction<PendingAuth>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [pendingAuth, setPendingAuth] = useState<PendingAuth>(null);

  return (
    <AuthContext.Provider value={{ pendingAuth, setPendingAuth }}>{children}</AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthFlow must be used within AuthFlowProvider.");
  return context;
};
