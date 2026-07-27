import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export function SiteHeader({ pageName }: { pageName: string }) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-full w-full items-center gap-3 px-4">
        <SidebarTrigger className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">System</span>
          <svg className="hidden sm:block size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
        </div>
        <h1 className="text-sm font-semibold tracking-tight">{pageName}</h1>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className="fixed top-3 right-3 z-50 flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </header>
  );
}
