import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LuCode, LuSun, LuMoon, LuX } from "react-icons/lu";
import { toggleTheme } from "../../features/settings/settingsSlice";
import type { AppDispatch } from "../../app/store";

interface SidebarHeaderProps {
  theme: "light" | "dark";
  onClose: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ theme, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="p-6 flex items-center justify-between shrink-0">
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
          aria-label="Close Sidebar"
        >
          <LuX size={20} />
        </button>
      </div>
    </div>
  );
};

export default SidebarHeader;
