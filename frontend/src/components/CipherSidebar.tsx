import { useState, useEffect } from "react";
import { Shield, Upload, Table2, ScrollText, KeyRound, BarChart3, Sun, Moon, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "upload", label: "Ingest", icon: Upload },
  { id: "data", label: "View Data", icon: Table2 },
  { id: "detokenize", label: "Vault", icon: KeyRound },
  { id: "logs", label: "Audit Log", icon: ScrollText },
];

const CipherSidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ciphergrid-theme") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
    localStorage.setItem("ciphergrid-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <aside className="w-60 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight">CipherGrid</h1>
          <p className="text-[0.65rem] text-muted-foreground uppercase tracking-widest">Tokenization Engine</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="label-uppercase px-3 mb-3">Operations</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150",
              activeTab === item.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
            )}
            style={activeTab === item.id ? { boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05)" } : {}}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User + Theme */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150 border border-transparent"
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Felix Mathew</p>
            <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Analyst</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CipherSidebar;
