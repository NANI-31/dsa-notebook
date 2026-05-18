import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface DragLog {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  itemType: "folder" | "problem";
  sourceParentFolderId: string | null;
  targetParentFolderId: string | null;
  status: "success" | "failure" | "blocked";
  blockReason?: string | null;
  durationMs?: number;
}

export interface UndoRedoAction {
  itemId: string;
  itemName: string;
  itemSlug?: string; // used for problem requests
  itemType: "folder" | "problem";
  sourceParentFolderId: string | null;
  targetParentFolderId: string | null;
}

interface DragAuditState {
  dragLogs: DragLog[];
  undoStack: UndoRedoAction[];
  redoStack: UndoRedoAction[];
}

const initialState: DragAuditState = {
  dragLogs: [],
  undoStack: [],
  redoStack: [],
};

const dragAuditSlice = createSlice({
  name: "dragAudit",
  initialState,
  reducers: {
    logDragInteraction: (state, action: PayloadAction<Omit<DragLog, "id" | "timestamp">>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const timestamp = new Date().toISOString();
      const newLog = { ...action.payload, id, timestamp };
      state.dragLogs.unshift(newLog);
      
      // Observability audit logger
      console.log(`%c[Drag Audit Log] %c${action.payload.itemType.toUpperCase()} "${action.payload.itemName}" was moved from ${action.payload.sourceParentFolderId || "root"} to ${action.payload.targetParentFolderId || "root"} [Status: ${action.payload.status}]`, "color: #6366f1; font-weight: bold;", "color: inherit;", newLog);
    },
    recordDragSuccess: (state, action: PayloadAction<UndoRedoAction>) => {
      state.undoStack.push(action.payload);
      state.redoStack = []; // Clear redo stack on new action
    },
    undoAction: (state) => {
      const action = state.undoStack.pop();
      if (action) {
        state.redoStack.push(action);
      }
    },
    redoAction: (state) => {
      const action = state.redoStack.pop();
      if (action) {
        state.undoStack.push(action);
      }
    },
  },
});

export const { logDragInteraction, recordDragSuccess, undoAction, redoAction } = dragAuditSlice.actions;
export default dragAuditSlice.reducer;
