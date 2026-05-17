import React from "react";
import {
  LuLayoutDashboard,
  LuList,
  LuStar,
  LuDatabase,
  LuGitBranch,
  LuLightbulb,
  LuTerminal,
  LuCode,
  LuPlus,
  LuSun,
  LuMoon,
  LuSettings,
  LuLayers,
  LuX,
} from "react-icons/lu";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { toggleTheme } from "../features/settings/settingsSlice";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((state: RootState) => state.settings.theme);

  const navItems = [
    { name: "Dashboard", icon: LuLayoutDashboard, path: "/" },
    { name: "All Problems", icon: LuList, path: "/problems" },
    { name: "Starred", icon: LuStar, path: "/starred" },
    { name: "Data Structures", icon: LuDatabase, path: "/ds" },
    { name: "Algorithms", icon: LuGitBranch, path: "/algorithms" },
    { name: "Techniques", icon: LuLightbulb, path: "/techniques" },
    { name: "Coding Problems", icon: LuTerminal, path: "/coding" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-68 bg-sidebar text-text-muted flex flex-col border-r border-border-subtle overflow-hidden transition-transform duration-300 lg:static lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="bg-brand p-2 rounded-lg text-white shadow-lg shadow-brand/20 transition-all duration-500">
            <LuCode size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-text-main">
            DSA Tracker
          </h1>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-500 hover:scale-110 active:scale-95 text-text-muted hover:text-text-main group"
            aria-label="Toggle Theme"
          >
            <div className="transition-transform duration-500 group-hover:rotate-12 group-active:rotate-45">
              {theme === "dark" ? <LuSun size={20} /> : <LuMoon size={20} />}
            </div>
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-text-muted"
          >
            <LuX size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar space-y-8">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-muted/50 mb-4 px-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-brand/10 text-brand"
                    : "hover:bg-text-main/5 hover:text-text-main"
                }`}
              >
                <item.icon
                  size={18}
                  className={
                    isActive(item.path)
                      ? "text-brand"
                      : "text-text-muted group-hover:text-text-main"
                  }
                />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-muted/50 mb-4 px-2">
            Configure
          </p>
          <nav className="space-y-1">
            <Link
              to="/taxonomy"
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive("/taxonomy")
                  ? "bg-brand/10 text-brand"
                  : "hover:bg-text-main/5 hover:text-text-main"
              }`}
            >
              <LuLayers
                size={18}
                className={
                  isActive("/taxonomy")
                    ? "text-brand"
                    : "text-text-muted group-hover:text-text-main"
                }
              />
              <span className="text-sm font-medium">Taxonomy</span>
            </Link>
            <Link
              to="/settings"
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive("/settings")
                  ? "bg-brand/10 text-brand"
                  : "hover:bg-text-main/5 hover:text-text-main"
              }`}
            >
              <LuSettings
                size={18}
                className={
                  isActive("/settings")
                    ? "text-brand"
                    : "text-text-muted group-hover:text-text-main"
                }
              />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Footer Content */}
      <div className="p-4 bg-sidebar border-t border-border-subtle">
        <Link
          to="/problems/new"
          onClick={onClose}
          className="w-full bg-brand hover:opacity-90 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-brand/20 hover:shadow-brand/30"
        >
          <LuPlus size={18} />
          <span>New Problem</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
