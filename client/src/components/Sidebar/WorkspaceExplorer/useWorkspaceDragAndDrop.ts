import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../app/store";
import {
  fetchFolders,
  moveFolderOptimistic,
} from "../../../features/folders/foldersSlice";
import {
  logDragInteraction,
  recordDragSuccess,
} from "../../../features/dragAudit/dragAuditSlice";
import { addToast } from "../../../features/ui/uiSlice";
import api from "../../../services/api";
import type { Problem } from "../../../types/problem";

interface UseWorkspaceDragAndDropProps {
  localProblems: Problem[];
  setLocalProblems: React.Dispatch<React.SetStateAction<Problem[]>>;
  folders: any[];
  fetchWorkspaceProblems: () => Promise<void>;
}

export const useWorkspaceDragAndDrop = ({
  localProblems,
  setLocalProblems,
  folders,
  fetchWorkspaceProblems,
}: UseWorkspaceDragAndDropProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "inside" | "after" | null>(null);
  const [isDragOverRoot, setIsDragOverRoot] = useState(false);
  
  const dragStartTimeRef = useRef<number | null>(null);

  // Self-healing reset safety-net: clear highlights when folders or problems update
  useEffect(() => {
    setDragOverFolderId(null);
    setDropPosition(null);
    setIsDragOverRoot(false);
  }, [localProblems, folders]);

  // Premium Drag Ghost Image Generator
  const createDragGhost = (title: string, type: "folder" | "problem") => {
    const ghost = document.createElement("div");
    ghost.style.position = "absolute";
    ghost.style.top = "-1000px";
    ghost.style.left = "-1000px";
    ghost.style.display = "flex";
    ghost.style.alignItems = "center";
    ghost.style.gap = "8px";
    ghost.style.padding = "6px 14px";
    ghost.style.borderRadius = "20px";
    ghost.style.backgroundColor = "rgba(99, 102, 241, 0.95)"; // Sleek Indigo brand pill
    ghost.style.color = "#ffffff";
    ghost.style.fontSize = "11px";
    ghost.style.fontWeight = "600";
    ghost.style.boxShadow =
      "0 10px 25px -5px rgba(99, 102, 241, 0.4), 0 8px 10px -6px rgba(99, 102, 241, 0.4)";
    ghost.style.border = "1px solid rgba(255, 255, 255, 0.25)";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "999999";
    ghost.style.fontFamily = "system-ui, -apple-system, sans-serif";

    const iconSpan = document.createElement("span");
    iconSpan.innerHTML = type === "folder" ? "📁" : "📄";
    iconSpan.style.fontSize = "13px";
    ghost.appendChild(iconSpan);

    const textSpan = document.createElement("span");
    textSpan.innerText = title;
    textSpan.style.whiteSpace = "nowrap";
    textSpan.style.overflow = "hidden";
    textSpan.style.textOverflow = "ellipsis";
    textSpan.style.maxWidth = "165px";
    ghost.appendChild(textSpan);

    document.body.appendChild(ghost);
    return ghost;
  };

  const isSubfolder = (sourceId: string, targetId: string | null): boolean => {
    if (!targetId) return false;
    let current = folders.find((f) => f._id === targetId);
    while (current) {
      if (current.parentFolder === sourceId) return true;
      current = current.parentFolder
        ? folders.find((f) => f._id === current.parentFolder)
        : null;
    }
    return false;
  };

  const handleDragStart = (
    e: React.DragEvent,
    item: any,
    type: "folder" | "problem"
  ) => {
    e.dataTransfer.effectAllowed = "move";
    dragStartTimeRef.current = Date.now();

    // Create premium drag preview ghost
    const ghost = createDragGhost(
      type === "folder" ? item.name : item.title,
      type
    );
    e.dataTransfer.setDragImage(ghost, 15, 15);

    // Remove element on next tick so it doesn't linger in DOM
    setTimeout(() => {
      if (ghost && ghost.parentNode) {
        ghost.parentNode.removeChild(ghost);
      }
    }, 0);

    if (type === "folder") {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          type: "folder",
          id: item._id,
          name: item.name,
          parentFolder: item.parentFolder,
        })
      );
    } else {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          type: "problem",
          id: item._id,
          slug: item.slug,
          title: item.title,
          folderId: item.folderId,
        })
      );
    }
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const height = rect.height;

    let position: "before" | "inside" | "after" = "inside";
    if (relativeY < height * 0.25) {
      position = "before";
    } else if (relativeY > height * 0.75) {
      position = "after";
    }

    if (dragOverFolderId !== folderId || dropPosition !== position) {
      setDragOverFolderId(folderId);
      setDropPosition(position);
    }
  };

  const handleFolderDrop = async (
    e: React.DragEvent,
    targetFolderId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const currentPosition = dropPosition;
    setDragOverFolderId(null);
    setDropPosition(null);
    setIsDragOverRoot(false);

    const dataStr = e.dataTransfer.getData("application/json");
    if (!dataStr) return;
    const draggedItem = JSON.parse(dataStr);
    const durationMs = dragStartTimeRef.current
      ? Date.now() - dragStartTimeRef.current
      : 0;

    // Determine targetParentFolderId based on dropPosition
    let targetParentFolderId: string | null = targetFolderId;
    if (currentPosition === "before" || currentPosition === "after") {
      const targetFolder = folders.find((f) => f._id === targetFolderId);
      targetParentFolderId = targetFolder ? targetFolder.parentFolder : null;
    }

    // Safety checks
    if (
      draggedItem.type === "folder" &&
      draggedItem.id === targetParentFolderId
    )
      return;
    if (
      draggedItem.type === "folder" &&
      draggedItem.id === targetFolderId &&
      currentPosition === "inside"
    )
      return;

    if (
      draggedItem.type === "folder" &&
      targetParentFolderId &&
      isSubfolder(draggedItem.id, targetParentFolderId)
    ) {
      dispatch(
        addToast({
          message: "Cannot move a folder into its own subfolders!",
          type: "error",
          duration: 3000,
        })
      );
      // Audit log blocked action
      dispatch(
        logDragInteraction({
          itemId: draggedItem.id,
          itemName: draggedItem.name,
          itemType: "folder",
          sourceParentFolderId: draggedItem.parentFolder,
          targetParentFolderId,
          status: "blocked",
          blockReason: "recursive loop",
          durationMs,
        })
      );
      return;
    }

    // Capture initial backups for robust rollbacks
    const oldProblemsState = [...localProblems];

    try {
      if (draggedItem.type === "problem") {
        const sourceFolderId = draggedItem.folderId;
        if (sourceFolderId === targetParentFolderId) return;

        // 1. OPTIMISTIC UPDATE: Update local state immediately
        setLocalProblems((prev) =>
          prev.map((p) =>
            p.slug === draggedItem.slug
              ? { ...p, folderId: targetParentFolderId }
              : p
          )
        );

        // 2. NETWORK MUTATION
        await api.put(`/problems/${draggedItem.slug}`, {
          folderId: targetParentFolderId,
        });

        dispatch(
          addToast({
            message: `Problem "${draggedItem.title}" moved successfully.`,
            type: "success",
            duration: 3000,
          })
        );

        // 3. AUDIT LOG SUCCESS
        dispatch(
          logDragInteraction({
            itemId: draggedItem.id,
            itemName: draggedItem.title,
            itemType: "problem",
            sourceParentFolderId: sourceFolderId,
            targetParentFolderId,
            status: "success",
            durationMs,
          })
        );

        // 4. RECORD SUCCESS TO UNDO STACK
        dispatch(
          recordDragSuccess({
            itemId: draggedItem.id,
            itemName: draggedItem.title,
            itemSlug: draggedItem.slug,
            itemType: "problem",
            sourceParentFolderId: sourceFolderId,
            targetParentFolderId,
          })
        );
      } else if (draggedItem.type === "folder") {
        const sourceFolderId = draggedItem.parentFolder;
        if (sourceFolderId === targetParentFolderId) return;

        // 1. OPTIMISTIC UPDATE: Dispatch optimistic Redux move
        dispatch(
          moveFolderOptimistic({
            id: draggedItem.id,
            parentFolder: targetParentFolderId,
          })
        );

        // 2. NETWORK MUTATION
        await api.put(`/folders/${draggedItem.id}`, {
          parentFolder: targetParentFolderId,
        });

        dispatch(
          addToast({
            message: `Folder "${draggedItem.name}" moved successfully.`,
            type: "success",
            duration: 3000,
          })
        );
        dispatch(fetchFolders());

        // 3. AUDIT LOG SUCCESS
        dispatch(
          logDragInteraction({
            itemId: draggedItem.id,
            itemName: draggedItem.name,
            itemType: "folder",
            sourceParentFolderId: sourceFolderId,
            targetParentFolderId,
            status: "success",
            durationMs,
          })
        );

        // 4. RECORD SUCCESS TO UNDO STACK
        dispatch(
          recordDragSuccess({
            itemId: draggedItem.id,
            itemName: draggedItem.name,
            itemType: "folder",
            sourceParentFolderId: sourceFolderId,
            targetParentFolderId,
          })
        );
      }
      await fetchWorkspaceProblems();
    } catch (err) {
      // ROLLBACK ON FAILURE
      if (draggedItem.type === "problem") {
        setLocalProblems(oldProblemsState);
      } else if (draggedItem.type === "folder") {
        dispatch(
          moveFolderOptimistic({
            id: draggedItem.id,
            parentFolder: draggedItem.parentFolder,
          })
        );
      }

      dispatch(
        addToast({
          message: "Failed to move item",
          type: "error",
          duration: 3000,
        })
      );

      // AUDIT LOG FAILURE
      dispatch(
        logDragInteraction({
          itemId: draggedItem.id,
          itemName:
            draggedItem.type === "folder"
              ? draggedItem.name
              : draggedItem.title,
          itemType: draggedItem.type,
          sourceParentFolderId:
            draggedItem.type === "folder"
              ? draggedItem.parentFolder
              : draggedItem.folderId,
          targetParentFolderId,
          status: "failure",
          blockReason: "network/server error",
          durationMs,
        })
      );
    }
  };

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragOverRoot) {
      setIsDragOverRoot(true);
    }
  };

  const handleRootDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOverRoot(false);
    }
  };

  const handleRootDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverRoot(false);

    const dataStr = e.dataTransfer.getData("application/json");
    if (!dataStr) return;
    const draggedItem = JSON.parse(dataStr);
    const durationMs = dragStartTimeRef.current
      ? Date.now() - dragStartTimeRef.current
      : 0;

    // Capture initial backups for robust rollbacks
    const oldProblemsState = [...localProblems];

    try {
      if (draggedItem.type === "problem") {
        if (draggedItem.folderId === null) return;

        // 1. OPTIMISTIC UPDATE
        setLocalProblems((prev) =>
          prev.map((p) =>
            p.slug === draggedItem.slug ? { ...p, folderId: null } : p
          )
        );

        // 2. NETWORK MUTATION
        await api.put(`/problems/${draggedItem.slug}`, { folderId: null });

        dispatch(
          addToast({
            message: `Problem "${draggedItem.title}" moved to root.`,
            type: "success",
            duration: 3000,
          })
        );

        // 3. AUDIT LOG SUCCESS
        dispatch(
          logDragInteraction({
            itemId: draggedItem.id,
            itemName: draggedItem.title,
            itemType: "problem",
            sourceParentFolderId: draggedItem.folderId,
            targetParentFolderId: null,
            status: "success",
            durationMs,
          })
        );

        // 4. RECORD SUCCESS TO UNDO STACK
        dispatch(
          recordDragSuccess({
            itemId: draggedItem.id,
            itemName: draggedItem.title,
            itemSlug: draggedItem.slug,
            itemType: "problem",
            sourceParentFolderId: draggedItem.folderId,
            targetParentFolderId: null,
          })
        );
      } else if (draggedItem.type === "folder") {
        if (draggedItem.parentFolder === null) return;

        // 1. OPTIMISTIC UPDATE
        dispatch(
          moveFolderOptimistic({ id: draggedItem.id, parentFolder: null })
        );

        // 2. NETWORK MUTATION
        await api.put(`/folders/${draggedItem.id}`, { parentFolder: null });

        dispatch(
          addToast({
            message: `Folder "${draggedItem.name}" moved to root.`,
            type: "success",
            duration: 3000,
          })
        );
        dispatch(fetchFolders());

        // 3. AUDIT LOG SUCCESS
        dispatch(
          logDragInteraction({
            itemId: draggedItem.id,
            itemName: draggedItem.name,
            itemType: "folder",
            sourceParentFolderId: draggedItem.parentFolder,
            targetParentFolderId: null,
            status: "success",
            durationMs,
          })
        );

        // 4. RECORD SUCCESS TO UNDO STACK
        dispatch(
          recordDragSuccess({
            itemId: draggedItem.id,
            itemName: draggedItem.name,
            itemType: "folder",
            sourceParentFolderId: draggedItem.parentFolder,
            targetParentFolderId: null,
          })
        );
      }
      await fetchWorkspaceProblems();
    } catch (err) {
      // ROLLBACK ON FAILURE
      if (draggedItem.type === "problem") {
        setLocalProblems(oldProblemsState);
      } else if (draggedItem.type === "folder") {
        dispatch(
          moveFolderOptimistic({
            id: draggedItem.id,
            parentFolder: draggedItem.parentFolder,
          })
        );
      }

      dispatch(
        addToast({
          message: "Failed to move item to root.",
          type: "error",
          duration: 3000,
        })
      );

      // AUDIT LOG FAILURE
      dispatch(
        logDragInteraction({
          itemId: draggedItem.id,
          itemName:
            draggedItem.type === "folder"
              ? draggedItem.name
              : draggedItem.title,
          itemType: draggedItem.type,
          sourceParentFolderId:
            draggedItem.type === "folder"
              ? draggedItem.parentFolder
              : draggedItem.folderId,
          targetParentFolderId: null,
          status: "failure",
          blockReason: "network/server error",
          durationMs,
        })
      );
    }
  };

  const handleDragEnd = () => {
    setDragOverFolderId(null);
    setDropPosition(null);
    setIsDragOverRoot(false);
  };

  return {
    dragOverFolderId,
    dropPosition,
    isDragOverRoot,
    setDragOverFolderId,
    setDropPosition,
    setIsDragOverRoot,
    handleDragStart,
    handleFolderDragOver,
    handleFolderDrop,
    handleRootDragOver,
    handleRootDragLeave,
    handleRootDrop,
    handleDragEnd,
  };
};
