import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../services/api";
import type { Folder } from "../../types/folder";

interface FoldersState {
  folders: Folder[];
  byId: Record<string, Folder>;
  allIds: string[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: FoldersState = {
  folders: [],
  byId: {},
  allIds: [],
  loading: false,
  saving: false,
  error: null,
};

// Async Thunks
export const fetchFolders = createAsyncThunk("folders/fetchFolders", async () => {
  const response = await api.get<Folder[]>("/folders");
  return response.data;
});

export const createFolder = createAsyncThunk(
  "folders/createFolder",
  async (payload: { name: string; parentFolder: string | null }) => {
    const response = await api.post<Folder>("/folders", payload);
    return response.data;
  }
);

export const updateFolder = createAsyncThunk(
  "folders/updateFolder",
  async ({ id, name, parentFolder }: { id: string; name?: string; parentFolder?: string | null }) => {
    const response = await api.patch<Folder>(`/folders/${id}`, { name, parentFolder });
    return response.data;
  }
);

export const deleteFolder = createAsyncThunk(
  "folders/deleteFolder",
  async (id: string) => {
    const response = await api.delete<{ message: string; deletedFolderIds: string[] }>(`/folders/${id}`);
    return { id, deletedFolderIds: response.data.deletedFolderIds };
  }
);

const foldersSlice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    moveFolderOptimistic: (
      state,
      action: PayloadAction<{ id: string; parentFolder: string | null }>
    ) => {
      const folder = state.folders.find((f) => f._id === action.payload.id);
      if (folder) {
        folder.parentFolder = action.payload.parentFolder;
        state.byId[folder._id] = folder;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Folders
      .addCase(fetchFolders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.loading = false;
        state.folders = action.payload;
        state.byId = {};
        state.allIds = [];
        action.payload.forEach((f) => {
          state.byId[f._id] = f;
          state.allIds.push(f._id);
        });
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch folders";
      })
      // Create Folder
      .addCase(createFolder.pending, (state) => {
        state.saving = true;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.saving = false;
        state.folders.push(action.payload);
        state.byId[action.payload._id] = action.payload;
        state.allIds.push(action.payload._id);
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to create folder";
      })
      // Update Folder
      .addCase(updateFolder.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateFolder.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.folders.findIndex((f) => f._id === action.payload._id);
        if (index !== -1) {
          state.folders[index] = action.payload;
        }
        state.byId[action.payload._id] = action.payload;
      })
      .addCase(updateFolder.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to update folder";
      })
      // Delete Folder
      .addCase(deleteFolder.pending, (state) => {
        state.saving = true;
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.saving = false;
        const toDelete = new Set(action.payload.deletedFolderIds);
        state.folders = state.folders.filter((f) => !toDelete.has(f._id));
        action.payload.deletedFolderIds.forEach((id) => {
          delete state.byId[id];
        });
        state.allIds = state.allIds.filter((id) => !toDelete.has(id));
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to delete folder";
      });
  },
});

export const { moveFolderOptimistic } = foldersSlice.actions;
export default foldersSlice.reducer;
