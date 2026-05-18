import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../../app/store";
import {
  fetchFolders,
  moveFolderOptimistic,
} from "../../../features/folders/foldersSlice";
import {
  undoAction,
  redoAction,
} from "../../../features/dragAudit/dragAuditSlice";
import { addToast } from "../../../features/ui/uiSlice";
import api from "../../../services/api";
import type { Problem } from "../../../types/problem";

interface UseWorkspaceUndoRedoProps {
  localProblems: Problem[];
  setLocalProblems: React.Dispatch<React.SetStateAction<Problem[]>>;
  folders: any[];
  fetchWorkspaceProblems: () => Promise<void>;
}

export const useWorkspaceUndoRedo = ({
  localProblems,
  setLocalProblems,
  folders,
  fetchWorkspaceProblems,
}: UseWorkspaceUndoRedoProps) => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux Selectors for Undo/Redo history
  const undoStack = useSelector((state: any) => state.dragAudit.undoStack);
  const redoStack = useSelector((state: any) => state.dragAudit.redoStack);

  const triggerUndo = async () => {
    if (undoStack.length === 0) return;
    const action = undoStack[undoStack.length - 1];
    const oldProblemsState = [...localProblems];
    dispatch(undoAction());

    try {
      if (action.itemType === "problem") {
        setLocalProblems((prev) =>
          prev.map((p) =>
            p._id === action.itemId
              ? { ...p, folderId: action.sourceParentFolderId }
              : p
          )
        );
        await api.put(`/problems/${action.itemSlug}`, {
          folderId: action.sourceParentFolderId,
        });
      } else if (action.itemType === "folder") {
        dispatch(
          moveFolderOptimistic({
            id: action.itemId,
            parentFolder: action.sourceParentFolderId,
          })
        );
        await api.put(`/folders/${action.itemId}`, {
          parentFolder: action.sourceParentFolderId,
        });
        dispatch(fetchFolders());
      }
      await fetchWorkspaceProblems();
      dispatch(
        addToast({
          message: `Undone move: "${action.itemName}"`,
          type: "info",
          duration: 2500,
        })
      );
    } catch (err) {
      if (action.itemType === "problem") {
        setLocalProblems(oldProblemsState);
      } else if (action.itemType === "folder") {
        dispatch(
          moveFolderOptimistic({
            id: action.itemId,
            parentFolder: action.targetParentFolderId,
          })
        );
      }
      dispatch(
        addToast({
          message: `Failed to undo movement`,
          type: "error",
          duration: 3000,
        })
      );
    }
  };

  const triggerRedo = async () => {
    if (redoStack.length === 0) return;
    const action = redoStack[redoStack.length - 1];
    const oldProblemsState = [...localProblems];
    dispatch(redoAction());

    try {
      if (action.itemType === "problem") {
        setLocalProblems((prev) =>
          prev.map((p) =>
            p._id === action.itemId
              ? { ...p, folderId: action.targetParentFolderId }
              : p
          )
        );
        await api.put(`/problems/${action.itemSlug}`, {
          folderId: action.targetParentFolderId,
        });
      } else if (action.itemType === "folder") {
        dispatch(
          moveFolderOptimistic({
            id: action.itemId,
            parentFolder: action.targetParentFolderId,
          })
        );
        await api.put(`/folders/${action.itemId}`, {
          parentFolder: action.targetParentFolderId,
        });
        dispatch(fetchFolders());
      }
      await fetchWorkspaceProblems();
      dispatch(
        addToast({
          message: `Redone move: "${action.itemName}"`,
          type: "info",
          duration: 2500,
        })
      );
    } catch (err) {
      if (action.itemType === "problem") {
        setLocalProblems(oldProblemsState);
      } else if (action.itemType === "folder") {
        dispatch(
          moveFolderOptimistic({
            id: action.itemId,
            parentFolder: action.sourceParentFolderId,
          })
        );
      }
      dispatch(
        addToast({
          message: `Failed to redo movement`,
          type: "error",
          duration: 3000,
        })
      );
    }
  };

  // Keyboard shortcut listener for Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.ctrlKey && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        triggerUndo();
      }
      if (
        e.ctrlKey &&
        (e.key.toLowerCase() === "y" ||
          (e.key.toLowerCase() === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        triggerRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undoStack, redoStack, folders, localProblems]);

  return {
    triggerUndo,
    triggerRedo,
    undoStack,
    redoStack,
  };
};
