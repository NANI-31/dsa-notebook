import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LuLoader } from "react-icons/lu";
import { List } from "react-window";

import { WorkspaceExplorerHeader } from "./WorkspaceExplorerHeader";
import { WorkspaceTreeItem } from "./WorkspaceTreeItem";
import { useWorkspaceUndoRedo } from "./useWorkspaceUndoRedo";
import { useWorkspaceDragAndDrop } from "./useWorkspaceDragAndDrop";

import type { AppDispatch } from "../../../app/store";
import {
  createFolder,
  deleteFolder,
} from "../../../features/folders/foldersSlice";
import { addToast } from "../../../features/ui/uiSlice";
import api from "../../../services/api";
import type { Problem } from "../../../types/problem";
import ConfirmDeleteModal from "../../modals/ConfirmDeleteModal";

interface WorkspaceExplorerProps {
  folders: any[];
  categories: any[];
  allProblems: Problem[];
  loadingProblems: boolean;
  onClose: () => void;
  fetchWorkspaceProblems: () => Promise<void>;
}

const WorkspaceExplorer: React.FC<WorkspaceExplorerProps> = ({
  folders,
  categories,
  allProblems,
  loadingProblems,
  onClose,
  fetchWorkspaceProblems,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();

  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [creationTarget, setCreationTarget] = useState<{
    parentFolder: string | null;
    type: "folder" | "file";
  } | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [problemToDelete, setProblemToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [inlineName, setInlineName] = useState("");
  const [localProblems, setLocalProblems] = useState<Problem[]>(allProblems);

  useEffect(() => {
    setLocalProblems(allProblems);
  }, [allProblems]);

  // Undo/Redo Custom Hook
  useWorkspaceUndoRedo({
    localProblems,
    setLocalProblems,
    folders,
    fetchWorkspaceProblems,
  });

  // Drag and Drop Custom Hook
  const {
    dragOverFolderId,
    dropPosition,
    isDragOverRoot,
    setDragOverFolderId,
    setDropPosition,
    handleDragStart,
    handleFolderDragOver,
    handleFolderDrop,
    handleRootDragOver,
    handleRootDragLeave,
    handleRootDrop,
    handleDragEnd,
  } = useWorkspaceDragAndDrop({
    localProblems,
    setLocalProblems,
    folders,
    fetchWorkspaceProblems,
  });

  // Container height measurement for virtualization sizing
  const [containerHeight, setContainerHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerHeight(entry.contentRect.height || 400);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  interface LocalFlatNode {
    id: string;
    type: "folder" | "problem" | "inline-creation";
    name: string;
    depth: number;
    data: any;
    isExpanded?: boolean;
  }

  // Linear flat-traversal layout builder for perfect virtualization performance scaling
  const getFlatNodes = () => {
    const list: LocalFlatNode[] = [];

    const traverse = (parentFolderId: string | null, depth: number) => {
      const levelFolders = folders.filter((f) => f.parentFolder === parentFolderId);
      const levelProblems = localProblems.filter((p) => p.folderId === parentFolderId);

      levelFolders.forEach((folder) => {
        const isExpanded = expandedFolders[folder._id] || false;
        list.push({
          id: folder._id,
          type: "folder",
          name: folder.name,
          depth,
          data: folder,
          isExpanded,
        });
        if (isExpanded) {
          traverse(folder._id, depth + 1);
        }
      });

      levelProblems.forEach((problem) => {
        list.push({
          id: problem._id,
          type: "problem",
          name: problem.title,
          depth,
          data: problem,
        });
      });

      // Inject the inline creation input node if the user triggers creation inside this level!
      if (creationTarget && creationTarget.parentFolder === parentFolderId) {
        list.push({
          id: "inline-creation-temp-id",
          type: "inline-creation",
          name: "",
          depth: parentFolderId === null ? 0 : depth,
          data: null,
        });
      }
    };

    traverse(null, 0);
    return list;
  };

  const flatNodes = getFlatNodes();

  const toggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleStartCreate = (
    parentFolder: string | null,
    type: "folder" | "file"
  ) => {
    if (parentFolder) {
      setExpandedFolders((prev) => ({
        ...prev,
        [parentFolder]: true,
      }));
    }
    setCreationTarget({ parentFolder, type });
    setInlineName("");
  };

  const handleCancelCreate = () => {
    setCreationTarget(null);
    setInlineName("");
  };

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineName.trim() || !creationTarget) return;

    const { parentFolder, type } = creationTarget;
    const name = inlineName.trim();

    try {
      if (type === "folder") {
        const action = await dispatch(
          createFolder({
            name,
            parentFolder,
          })
        );
        if (createFolder.fulfilled.match(action)) {
          dispatch(
            addToast({
              message: `Folder "${name}" created!`,
              type: "success",
              duration: 3000,
            })
          );
          if (parentFolder) {
            setExpandedFolders((prev) => ({ ...prev, [parentFolder]: true }));
          }
        }
      } else {
        if (!categories || categories.length === 0) {
          dispatch(
            addToast({
              message:
                "Please configure a Category first in Taxonomy settings!",
              type: "error",
              duration: 5000,
            })
          );
          return;
        }

        const defaultCategory = categories[0];
        const defaultSub = defaultCategory.subCategories[0] || "General";

        const response = await api.post<Problem>("/problems", {
          title: name,
          difficulty: "Medium",
          category: defaultCategory._id,
          subCategory: defaultSub,
          folderId: parentFolder,
          description: "Solve inside this workspace.",
          variants: [
            {
              name: "Main Solution",
              language: "typescript",
              code: "",
              codes: { typescript: "" },
            },
          ],
        });

        if (response.status === 201) {
          dispatch(
            addToast({
              message: `Problem "${name}" created successfully!`,
              type: "success",
              duration: 3000,
            })
          );
          fetchWorkspaceProblems();
          navigate(`/problems/${response.data.slug}`);
          onClose();
        }
      }
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.response?.data?.message || "Failed to create item",
          type: "error",
          duration: 3000,
        })
      );
    } finally {
      setCreationTarget(null);
      setInlineName("");
    }
  };

  const handleDeleteFolder = (
    e: React.MouseEvent,
    id: string,
    name: string
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setFolderToDelete({ id, name });
  };

  const handleConfirmDeleteFolder = async () => {
    if (!folderToDelete) return;
    const { id, name } = folderToDelete;
    try {
      const action = await dispatch(deleteFolder(id));
      if (deleteFolder.fulfilled.match(action)) {
        dispatch(
          addToast({
            message: `Folder "${name}" deleted.`,
            type: "success",
            duration: 3000,
          })
        );
        fetchWorkspaceProblems();
      }
    } catch (err) {
      dispatch(
        addToast({
          message: "Failed to delete folder",
          type: "error",
          duration: 3000,
        })
      );
    } finally {
      setFolderToDelete(null);
    }
  };

  const handleDeleteProblem = (
    e: React.MouseEvent,
    id: string,
    title: string
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setProblemToDelete({ id, title });
  };

  const handleConfirmDeleteProblem = async () => {
    if (!problemToDelete) return;
    const { id, title } = problemToDelete;
    try {
      const response = await api.delete(`/problems/${id}`);
      if (response.status === 200 || response.status === 204) {
        dispatch(
          addToast({
            message: `Problem "${title}" deleted.`,
            type: "success",
            duration: 3000,
          })
        );
        await fetchWorkspaceProblems();

        // If we deleted the active problem, navigate to problems directory
        if (location.pathname.includes(`/problems/`)) {
          navigate("/problems");
        }
      }
    } catch (err) {
      dispatch(
        addToast({
          message: "Failed to delete problem",
          type: "error",
          duration: 3000,
        })
      );
    } finally {
      setProblemToDelete(null);
    }
  };

  const handleCollapseAll = () => {
    setExpandedFolders({});
  };

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const node = flatNodes[index];
    if (!node) return null;

    const isFileActive =
      node.type === "problem" &&
      location.pathname === `/problems/${node.data?.slug}`;

    return (
      <WorkspaceTreeItem
        node={node as any}
        style={style}
        selectedFolderId={selectedFolderId}
        isFileActive={isFileActive}
        dragOverFolderId={dragOverFolderId}
        dropPosition={dropPosition}
        creationTarget={creationTarget}
        inlineName={inlineName}
        onSelectFolder={setSelectedFolderId}
        onToggleExpand={toggleExpand}
        onStartCreate={handleStartCreate}
        onDeleteFolder={handleDeleteFolder}
        onDeleteProblem={handleDeleteProblem}
        onInlineSubmit={handleInlineSubmit}
        onInlineChange={setInlineName}
        onCancelCreate={handleCancelCreate}
        onCloseSidebar={onClose}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOverFolder={handleFolderDragOver}
        onDragLeaveFolder={() => {
          setDragOverFolderId(null);
          setDropPosition(null);
        }}
        onDropFolder={handleFolderDrop}
      />
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <WorkspaceExplorerHeader
        isWorkspaceExpanded={isWorkspaceExpanded}
        onToggleWorkspace={() => setIsWorkspaceExpanded(!isWorkspaceExpanded)}
        onStartCreate={handleStartCreate}
        onCollapseAll={handleCollapseAll}
      />

      {/* VS Code Visual File Tree */}
      {isWorkspaceExpanded && (
        <div
          role="tree"
          aria-label="Workspace Folder Tree"
          onDragOver={handleRootDragOver}
          onDragLeave={handleRootDragLeave}
          onDrop={handleRootDrop}
          className={`flex-1 border border-border-subtle/50 rounded-2xl p-2.5 overflow-hidden custom-scrollbar min-h-0 animate-in fade-in slide-in-from-top-1 duration-200 transition-all ${
            isDragOverRoot
              ? "bg-brand/10 border-brand/60 ring-2 ring-brand/20 scale-[1.005]"
              : "bg-black/5 dark:bg-white/5"
          }`}
        >
          {loadingProblems && allProblems.length === 0 ? (
            <div className="flex items-center gap-2 text-text-muted/50 p-2.5 text-xs font-semibold">
              <LuLoader className="animate-spin text-brand" size={14} />
              <span>Loading workspace...</span>
            </div>
          ) : flatNodes.length === 0 ? (
            <div className="text-[10px] text-text-muted/40 p-4 text-center font-medium">
              Workspace empty. Click "+" to start creating.
            </div>
          ) : (
            <div ref={containerRef} className="w-full h-full min-h-0 flex-1">
              <List<{}>
                rowCount={flatNodes.length}
                rowHeight={36}
                rowProps={{}}
                rowComponent={Row}
                style={{ height: containerHeight, width: "100%" }}
                className="custom-scrollbar"
              />
            </div>
          )}
        </div>
      )}

      {/* Confirm Delete Folder Modal */}
      <ConfirmDeleteModal
        isOpen={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onConfirm={handleConfirmDeleteFolder}
        title="Delete Folder"
        description={`Are you absolutely sure you want to delete the folder "${folderToDelete?.name}"? All subfolders will be deleted recursively. Problems inside will bubble up.`}
        itemType="folder"
      />

      {/* Confirm Delete Problem Modal */}
      <ConfirmDeleteModal
        isOpen={!!problemToDelete}
        onClose={() => setProblemToDelete(null)}
        onConfirm={handleConfirmDeleteProblem}
        title="Delete Problem"
        description={`Are you absolutely sure you want to delete the problem "${problemToDelete?.title}"? This action cannot be undone.`}
        itemType="file"
      />
    </div>
  );
};

export default WorkspaceExplorer;
