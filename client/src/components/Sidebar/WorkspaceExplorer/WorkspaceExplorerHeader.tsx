import React from "react";
import {
  LuChevronDown,
  LuChevronRight,
  LuPlus,
  LuFolderPlus,
  LuFolderTree,
} from "react-icons/lu";

interface WorkspaceExplorerHeaderProps {
  isWorkspaceExpanded: boolean;
  onToggleWorkspace: () => void;
  onStartCreate: (parentFolder: string | null, type: "folder" | "file") => void;
  onCollapseAll: () => void;
}

export const WorkspaceExplorerHeader: React.FC<WorkspaceExplorerHeaderProps> = ({
  isWorkspaceExpanded,
  onToggleWorkspace,
  onStartCreate,
  onCollapseAll,
}) => {
  return (
    <div className="flex items-center justify-between mb-2.5 px-0 select-none">
      {/* Toggle Button for Workspace */}
      <button
        onClick={onToggleWorkspace}
        className="flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 py-1 px-1.5 rounded-lg text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        <span className="text-[9px] uppercase font-black tracking-[0.25em] text-text-muted/60 italic">
          Workspace
        </span>
        <div className="text-text-muted/60">
          {isWorkspaceExpanded ? (
            <LuChevronDown size={14} />
          ) : (
            <LuChevronRight size={14} />
          )}
        </div>
      </button>

      {/* Global Toolbar Shortcuts */}
      <div className="flex items-center gap-1.5 text-text-muted">
        {/* Add Problem at Root */}
        <button
          onClick={() => onStartCreate(null, "file")}
          title="New Problem (Root)"
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-main transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <LuPlus size={13} />
        </button>
        {/* Add Folder at Root */}
        <button
          onClick={() => onStartCreate(null, "folder")}
          title="New Folder (Root)"
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-main transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <LuFolderPlus size={13} />
        </button>
        {/* Collapse All */}
        <button
          onClick={onCollapseAll}
          title="Collapse All"
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-main transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <LuFolderTree size={13} />
        </button>
      </div>
    </div>
  );
};
