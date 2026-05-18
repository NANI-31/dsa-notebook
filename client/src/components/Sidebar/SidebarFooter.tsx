import React from "react";
import { Link } from "react-router-dom";
import { LuSettings, LuPlus } from "react-icons/lu";

interface SidebarFooterProps {
  isActive: (path: string) => boolean;
  onClose: () => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ isActive, onClose }) => {
  return (
    <div className="p-4 bg-sidebar border-t border-border-subtle shrink-0 flex items-center gap-2">
      <Link
        to="/settings"
        onClick={onClose}
        className={`p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-muted hover:text-text-main rounded-xl transition-all duration-200 shrink-0 ${
          isActive("/settings") ? "text-brand bg-brand/10 dark:bg-brand/10" : ""
        }`}
        title="System Settings & Taxonomy"
      >
        <LuSettings size={18} />
      </Link>
      <Link
        to="/problems/new"
        onClick={onClose}
        className="flex-1 bg-brand hover:opacity-90 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-brand/20 hover:shadow-brand/30"
      >
        <LuPlus size={18} />
        <span>New Problem</span>
      </Link>
    </div>
  );
};

export default SidebarFooter;
