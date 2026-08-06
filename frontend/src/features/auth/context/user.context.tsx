import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AccountSelect, PersonalDetailsSelect, SystemRole } from "backend/types/user.type";
import { createContext, useContext, type ReactNode } from "react";
import { fetchCurrentUser, logoutRecord } from "@/features/auth/api/auth.service";

type CurrentUser =
  | (Pick<AccountSelect, "id" | "email"> & {
      personalDetails: PersonalDetailsSelect;
      roles: SystemRole[];
    })
  | null;

type UserContextType = {
  user: CurrentUser;
  isLoading: boolean;
  setUser: (user: CurrentUser | null) => void;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const result = await fetchCurrentUser();
        return result.data;
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  const setUser = (newUser: CurrentUser | null) => {
    queryClient.setQueryData(["currentUser"], newUser);
  };

  const logout = async () => {
    try {
      await logoutRecord();
    } catch {
      // Proceed with cache invalidation even if logout request fails
    } finally {
      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear();
    }
  };

  return (
    <UserContext.Provider value={{ user: user ?? null, isLoading, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
