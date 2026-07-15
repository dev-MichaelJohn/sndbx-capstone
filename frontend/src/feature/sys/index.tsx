import { PageProvider } from "./context/page.context";
import { SysPageSidebar } from "./components/ui/SysPageSidebar";
import { ChevronRight, CirclePlus, Search } from "lucide-react";

export const SysBasePage = () => {
  return (
    <PageProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-(--bg)">
        <SysPageSidebar />
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-b-(--border) p-4">
            <div className="flex flex-col">
              <h1 className="text-(--text) text-2xl font-extrabold">INSTITUTIONAL INFORMATION</h1>
              <p className="text-(--text-muted) text-md font-normal">
                Manage colleges, departments, and their academic programs.
              </p>
            </div>
          </div>
          <div className="flex items-center border-b border-b-(--border) p-2 gap-1">
            <div className="flex items-center justify-center bg-(--primary) p-2 rounded-2xl">
              <p className="text-md text-(--highlight) font-bold">Colleges</p>
            </div>
            <ChevronRight className="text-muted size-6" />
            <div className="flex items-center justify-center bg-(--primary) p-2 rounded-2xl">
              <p className="text-md text-(--highlight) font-bold">COTE</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-(--text) text-xl font-bold py-2 tracking-wider">Colleges</h1>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center justify-between h-full w-96 px-4 py-2 rounded-3xl bg-(--bg-dark) border-2 border-(--border)">
                  <input
                    className="outline-0 h-full w-full text-md text-(--text) font-light"
                    placeholder="Search..."
                  />
                  <Search className="text-(--text-muted)" />
                </div>
                <button
                  className="flex items-center justify-between h-full gap-2 px-4 py-2 rounded-3xl bg-(--primary) cursor-pointer transition-all
                  active:scale-[0.98]"
                >
                  <CirclePlus className="text-(--highlight)" />
                  <p className="text-md text-(--highlight) font-bold">Add College</p>
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col px-4 py-2">
              <div className="flex flex-1 flex-col border border-(--border) border-t-4 border-t-(--primary) rounded-4xl p-4 shadow">
                <div className="flex items-center justify-between border-b border-b-(--border)">
                  <p className="w-1/4 text-md font-light text-(--text-muted)">INITIALISM</p>
                  <p className="w-1/4 text-md font-light text-(--text-muted)">COLLEGE NAME</p>
                  <p className="w-1/4 text-md font-light text-(--text-muted)">COLLEGE DEAN</p>
                  <p className="w-1/4 text-md font-light text-(--text-muted)">ACTIONS</p>
                </div>

                <div className="flex items-center justify-between border border-(--border) border-t border-t-transparent">
                  <div className="w-1/4 flex items-center justify-center py-2">
                    <p className="text-lg font-bold text-(--text-muted) w-full">CAS</p>
                  </div>
                  <div className="w-1/4 flex items-center justify-center py-2">
                    <p className="text font-bold text-(--text-muted) w-full">
                      College of Arts and Sciences
                    </p>
                  </div>
                  <div className="w-1/4 flex items-center justify-center py-2">
                    <p className="text font-bold text-(--text-muted) w-full">Dela Cruz, Juan</p>
                  </div>
                  <div className="w-1/4 flex items-center justify-center py-2">
                    <p className="text-lg font-bold text-(--text-muted) w-full">CAS</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border border-(--border) border-t border-t-transparent">
                  <div className="w-full flex items-center justify-center py-2">
                    <p className="text-lg font-bold text-(--text-muted) w-full text-center">
                      No record found.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageProvider>
  );
};
