import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuFolderTree,
  LuList,
  LuStar,
  LuChevronDown,
  LuChevronRight,
} from "react-icons/lu";

interface NavigationSectionProps {
  isActive: (path: string) => boolean;
  onClose: () => void;
}

const NavigationSection: React.FC<NavigationSectionProps> = ({ isActive, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { name: "Dashboard", icon: LuLayoutDashboard, path: "/" },
    { name: "Folders", icon: LuFolderTree, path: "/folders" },
    { name: "All Problems", icon: LuList, path: "/problems" },
    { name: "Starred", icon: LuStar, path: "/starred" },
  ];

  return (
    <div className="space-y-2">
      {/* Clickable Header Section */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-left transition-colors duration-200"
      >
        <p className="text-[9px] uppercase font-black tracking-[0.25em] text-text-muted/60 italic">
          Navigation
        </p>
        <div className="text-text-muted/60">
          {isExpanded ? <LuChevronDown size={14} /> : <LuChevronRight size={14} />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <nav className="space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? "bg-brand/10 text-brand"
                  : "hover:bg-text-main/5 hover:text-text-main"
              }`}
            >
              <item.icon
                size={16}
                className={
                  isActive(item.path)
                    ? "text-brand"
                    : "text-text-muted group-hover:text-text-main"
                }
              />
              <span className="text-xs font-semibold">{item.name}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
};

export default NavigationSection;
