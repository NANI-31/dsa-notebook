import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Category {
  _id: string;
  name: string;
  subCategories: string[];
}

interface SubCategoryStat {
  name: string;
  count: number;
}

interface CategoryStat {
  id: string;
  name: string;
  subCategories: SubCategoryStat[];
  totalCount: number;
}

interface CategoriesState {
  list: Category[];
  taxonomyStats: CategoryStat[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CategoriesState = {
  list: [],
  taxonomyStats: [],
  status: "idle",
  error: null,
};

export const fetchTaxonomyStats = createAsyncThunk(
  "categories/fetchTaxonomyStats",
  async () => {
    const response = await api.get("/categories/stats");
    return response.data;
  },
);

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const response = await api.get("/categories");
    return response.data;
  },
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (category: { name: string; subCategories: string[] }) => {
    const response = await api.post("/categories", category);
    return response.data;
  },
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, data }: { id: string; data: Partial<Category> }) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id: string) => {
    await api.delete(`/categories/${id}`);
    return id;
  },
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch categories";
      })
      .addCase(fetchTaxonomyStats.fulfilled, (state, action) => {
        state.taxonomyStats = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.list.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c._id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;
