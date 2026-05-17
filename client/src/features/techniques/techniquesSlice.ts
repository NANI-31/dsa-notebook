import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface Technique {
  _id: string;
  name: string;
}

interface TechniquesState {
  list: Technique[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TechniquesState = {
  list: [],
  status: "idle",
  error: null,
};

export const fetchTechniques = createAsyncThunk(
  "techniques/fetchTechniques",
  async () => {
    const response = await api.get("/techniques");
    return response.data;
  },
);

export const createTechnique = createAsyncThunk(
  "techniques/createTechnique",
  async (name: string) => {
    const response = await api.post("/techniques", { name });
    return response.data;
  },
);

export const updateTechnique = createAsyncThunk(
  "techniques/updateTechnique",
  async ({ id, name }: { id: string; name: string }) => {
    const response = await api.put(`/techniques/${id}`, { name });
    return response.data;
  },
);

export const deleteTechnique = createAsyncThunk(
  "techniques/deleteTechnique",
  async (id: string) => {
    await api.delete(`/techniques/${id}`);
    return id;
  },
);

const techniquesSlice = createSlice({
  name: "techniques",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechniques.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTechniques.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchTechniques.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch techniques";
      })
      .addCase(createTechnique.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateTechnique.fulfilled, (state, action) => {
        const index = state.list.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteTechnique.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t._id !== action.payload);
      });
  },
});

export default techniquesSlice.reducer;
