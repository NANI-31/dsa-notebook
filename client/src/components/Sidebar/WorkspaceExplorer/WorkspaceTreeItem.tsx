import React from "react";
import { Link } from "react-router-dom";
import {
  LuChevronRight,
  LuFolder,
  LuFolderOpen,
  LuPlus,
  LuFolderPlus,
  LuTrash2,
  LuFileCode,
  LuCheck,
} from "react-icons/lu";

export interface FlatNode {
  id: string;
  type: "folder" | "problem" | "inline-creation";
  name: string;
  depth: number;
  data: any;
  isExpanded?: boolean;
}

interface WorkspaceTreeItemProps {
  node: FlatNode;
  style: React.CSSProperties;
  selectedFolderId: string | null;
  isFileActive: boolean;
  dragOverFolderId: string | null;
  dropPosition: "before" | "inside" | "after" | null;
  creationTarget: {
    parentFolder: string | null;
    type: "folder" | "file";
  } | null;
  inlineName: string;

  // Selection & expand
  onSelectFolder: (folderId: string) => void;
  onToggleExpand: (folderId: string) => void;
  onStartCreate: (parentFolder: string | null, type: "folder" | "file") => void;
  onDeleteFolder: (e: React.MouseEvent, id: string, name: string) => void;
  onDeleteProblem: (e: React.MouseEvent, slug: string, title: string) => void;
  onInlineSubmit: (e: React.FormEvent) => void;
  onInlineChange: (value: string) => void;
  onCancelCreate: () => void;
  onCloseSidebar: () => void;

  // Drag and Drop
  onDragStart: (e: React.DragEvent, item: any, type: "folder" | "problem") => void;
  onDragEnd: () => void;
  onDragOverFolder: (e: React.DragEvent, folderId: string) => void;
  onDragLeaveFolder: () => void;
  onDropFolder: (e: React.DragEvent, folderId: string) => void;
}

export const WorkspaceTreeItem: React.FC<WorkspaceTreeItemProps> = ({
  node,
  style,
  selectedFolderId,
  isFileActive,
  dragOverFolderId,
  dropPosition,
  creationTarget,
  inlineName,
  onSelectFolder,
  onToggleExpand,
  onStartCreate,
  onDeleteFolder,
  onDeleteProblem,
  onInlineSubmit,
  onInlineChange,
  onCancelCreate,
  onCloseSidebar,
  onDragStart,
  onDragEnd,
  onDragOverFolder,
  onDragLeaveFolder,
  onDropFolder,
}) => {
  const depthPadding = node.depth * 14;

  if (node.type === "folder") {
    const folder = node.data;
    const isExpanded = node.isExpanded;
    const isSelected = selectedFolderId === folder._id;

    return (
      <div style={style} className="pr-1.5 py-0.5 select-none animate-in fade-in-0 slide-in-from-top-1.5 duration-200 ease-out">
        <div
          onClick={() => {
            onSelectFolder(folder._id);
            onToggleExpand(folder._id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectFolder(folder._id);
              onToggleExpand(folder._id);
            }
          }}
          role="treeitem"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-selected={isSelected}
          draggable={true}
          onDragStart={(e) => onDragStart(e, folder, "folder")}
          onDragEnd={onDragEnd}
          onDragOver={(e) => onDragOverFolder(e, folder._id)}
          onDragLeave={onDragLeaveFolder}
          onDrop={(e) => onDropFolder(e, folder._id)}
          className={`group flex items-center justify-between py-1.5 pr-2.5 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 relative outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
            isSelected
              ? "bg-brand/10 text-brand font-semibold shadow-sm shadow-brand/5"
              : "hover:bg-text-main/5 text-text-muted hover:text-text-main"
          } ${
            dragOverFolderId === folder._id && dropPosition === "inside"
              ? "bg-brand/20 border border-dashed border-brand/55 scale-[1.01]"
              : ""
          } ${
            dragOverFolderId === folder._id && dropPosition === "before"
              ? "border-t-2 border-brand"
              : ""
          } ${
            dragOverFolderId === folder._id && dropPosition === "after"
              ? "border-b-2 border-brand"
              : ""
          }`}
          style={{ paddingLeft: `${depthPadding + 8}px` }}
        >
          {/* Folder details */}
          <div className="flex-[0_0_85%] max-w-[85%] flex items-center gap-1.5 min-w-0">
            <div className={`text-text-muted/60 transition-transform duration-200 ease-out origin-center ${isExpanded ? "rotate-90" : "rotate-0"}`}>
              <LuChevronRight size={14} />
            </div>
            <div className="text-brand/85">
              {isExpanded ? (
                <LuFolderOpen size={16} className="fill-brand/10" />
              ) : (
                <LuFolder size={16} className="fill-brand/10" />
              )}
            </div>
            <span className="text-xs truncate font-medium">
              {folder.name}
            </span>
          </div>

          {/* VS Code Hover Shortcuts */}
          <div className="flex-[0_0_15%] max-w-[15%] flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectFolder(folder._id);
                onStartCreate(folder._id, "file");
              }}
              title="New Problem inside"
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/5 text-text-muted hover:text-text-main transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand/40"
            >
              <LuPlus size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectFolder(folder._id);
                onStartCreate(folder._id, "folder");
              }}
              title="New Subfolder"
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/5 text-text-muted hover:text-text-main transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand/40"
            >
              <LuFolderPlus size={12} />
            </button>
            <button
              onClick={(e) => onDeleteFolder(e, folder._id, folder.name)}
              title="Delete Folder"
              className="p-1 rounded hover:bg-rose-500/10 text-text-muted hover:text-rose-500 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/40"
            >
              <LuTrash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (node.type === "problem") {
    const problem = node.data;

    return (
      <div style={style} className="pr-1.5 py-0.5 select-none animate-in fade-in-0 slide-in-from-top-1.5 duration-200 ease-out">
        <div
          draggable={true}
          onDragStart={(e) => onDragStart(e, problem, "problem")}
          onDragEnd={onDragEnd}
          className={`group flex items-center justify-between pr-2.5 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 relative outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
            isFileActive
              ? "bg-brand/15 text-brand font-bold shadow-sm shadow-brand/5"
              : "hover:bg-text-main/5 text-text-muted/80 hover:text-text-main"
          }`}
          style={{ paddingLeft: `${depthPadding + 22}px` }}
        >
          <Link
            to={`/problems/${problem.slug}`}
            onClick={onCloseSidebar}
            role="treeitem"
            aria-selected={isFileActive}
            className="flex-[0_0_90%] max-w-[90%] flex items-center gap-2 py-1.5 min-w-0 outline-none"
          >
            <div className={isFileActive ? "text-brand" : "text-text-muted/40"}>
              <LuFileCode size={14} />
            </div>
            <span className="text-xs truncate font-medium">
              {problem.title}
            </span>
          </Link>

          {/* Delete Problem Icon Shortcut */}
          <div className="flex-[0_0_10%] max-w-[10%] flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 z-10">
            <button
              onClick={(e) => onDeleteProblem(e, problem.slug, problem.title)}
              title="Delete Problem"
              className="p-1 rounded hover:bg-rose-500/10 text-text-muted hover:text-rose-500 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/40"
            >
              <LuTrash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (node.type === "inline-creation") {
    return (
      <div style={style} className="pr-1.5 py-0.5 animate-in fade-in-0 slide-in-from-top-1.5 duration-200 ease-out">
        <form
          onSubmit={onInlineSubmit}
          className="flex items-center gap-1.5 py-1 pr-2 rounded-lg bg-sidebar border border-brand/35 animate-in slide-in-from-top-1 duration-200"
          style={{ paddingLeft: `${depthPadding + 14}px` }}
        >
          <div className="text-brand">
            {creationTarget?.type === "folder" ? (
              <LuFolder size={14} />
            ) : (
              <LuFileCode size={14} />
            )}
          </div>
          <input
            type="text"
            autoFocus
            placeholder={
              creationTarget?.type === "folder" ? "Folder..." : "Problem..."
            }
            value={inlineName}
            onChange={(e) => onInlineChange(e.target.value)}
            onBlur={onCancelCreate}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancelCreate();
            }}
            className="bg-transparent text-xs font-semibold focus:outline-none w-full text-text-main placeholder-text-muted/30"
          />
          <button type="submit" className="p-0.5 text-brand hover:opacity-80 focus:outline-none">
            <LuCheck size={12} />
          </button>
        </form>
      </div>
    );
  }

  return null;
};
