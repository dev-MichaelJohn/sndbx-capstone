import icon from "@/assets/icon.png";
import { SidebarPageBtn } from "../sidebar-pageBtn";

export const SysPageSidebar = () => {
  return (
    <div className="flex flex-col shrink-0 w-72 h-full ring-1">
      <div className="flex items-center justify-center gap-2 h-24 w-full p-4">
        <div className="flex items-center justify-center w-14 h-14">
          <img src={icon} />
        </div>
        <div className="flex flex-col flex-1 items-center w-full">
          <h1 className="text-(--text) text-xl text-justify font-black tracking-tighter w-full">
            PIT
          </h1>
          <h1 className="text-(--text) text-lg text-justify font-normal tracking-tighter w-full">
            Faculty Evaluation System
          </h1>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-8 gap-1 bg-(--bg)">
        <SidebarPageBtn iconName="LayoutDashboard" pageName="dashboard" />
        <SidebarPageBtn iconName="School" pageName="institution" />
        <SidebarPageBtn iconName="ScrollText" pageName="forms" />
        <SidebarPageBtn iconName="SquareUser" pageName="users" />
      </div>
    </div>
  );
};
