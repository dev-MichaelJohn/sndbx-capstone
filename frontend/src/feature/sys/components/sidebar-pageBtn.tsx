import { icons } from "lucide-react";
import { usePageContext, type SystemPages } from "../context/page.context";
import { Link } from "react-router";
import { GenericIcon } from "./generic-icon";

interface SidebarPageBtnProps {
  iconName: keyof typeof icons;
  pageName: SystemPages;
}

export const SidebarPageBtn = ({ iconName, pageName }: SidebarPageBtnProps) => {
  const { page: activePage, setPage } = usePageContext();
  const link = pageName.toLowerCase() === "dashboard" ? "" : `/${pageName.toLowerCase()}`;
  const active = activePage === pageName;
  const buttonText = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return (
    <Link to={`/sys${link}`}>
      <div
        className={`flex items-center justify-center w-full gap-2 py-3 px-4 rounded-4xl 
        ${!active && "hover:bg-(--bg-light)"}
        ${active && "bg-(--bg-dark) pointer-events-none"}`}
        onClick={() => setPage(pageName)}
      >
        <GenericIcon
          name={iconName}
          className={`
          text-md font-normal
          ${active ? "text-(--primary) text-shadow-sm" : "text-(--text)"}
        `}
        />
        <h1
          className={`
          text-md font-normal flex-1
          ${active ? "text-(--primary) text-shadow-sm" : "text-(--text)"}
        `}
        >
          {buttonText}
        </h1>
      </div>
    </Link>
  );
};
