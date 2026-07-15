import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router";

export type SystemPages = "dashboard" | "users" | "institution" | "forms" | "schedules" | "reports";

export interface PageContextType {
  page: SystemPages;
  setPage: (page: SystemPages) => void;
  resetPage: () => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

const getDefaultLink = (pathname: string) => {
  let defaultLink = pathname.slice("/sys".length);
  if (defaultLink === "/" || defaultLink === "") defaultLink = "/dashboard";

  return defaultLink.slice(1);
};

export const PageProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const defaultLink = getDefaultLink(location.pathname);

  const [page, setPage] = useState<SystemPages>(defaultLink as SystemPages);

  useEffect(() => {
    let currentLnk = getDefaultLink(location.pathname);
    setPage(currentLnk as SystemPages);
  }, [location.pathname]);

  const resetPage = () => setPage("dashboard");

  return (
    <PageContext.Provider value={{ page, setPage, resetPage }}>{children}</PageContext.Provider>
  );
};

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) throw new Error("usePage must be used inside PageProvider");
  return context;
};
