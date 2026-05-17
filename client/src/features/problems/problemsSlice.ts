import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Problem, ProblemFilters, Solution, PaginatedResponse } from "../../types/problem";
import api from "../../services/api";

interface ProblemsState {
  problems: Problem[];
  currentProblem: Problem | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  } | null;
  hasMore: boolean;
}

const initialState: ProblemsState = {
  problems: [],
  currentProblem: null,
  loading: false,
  saving: false,
  error: null,
  pagination: null,
  hasMore: true,
};

export const fetchProblems = createAsyncThunk(
  "problems/fetchProblems",
  async (filters: ProblemFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.difficulty?.length)
      params.append("difficulty", filters.difficulty.join(","));
    if (filters.categories?.length)
      params.append("categories", filters.categories.join(","));
    if (filters.categoryName)
      params.append("categoryName", filters.categoryName);
    if (filters.techniques?.length)
      params.append("techniques", filters.techniques.join(","));
    
    // Pagination params
    params.append("page", (filters.page || 1).toString());
    params.append("limit", (filters.limit || 12).toString());

    const response = await api.get<PaginatedResponse<Problem>>(`/problems?${params.toString()}`);
    return {
      ...response.data,
      isNewSearch: filters.page === undefined || filters.page === 1
    };
  },
);

export const fetchProblemBySlug = createAsyncThunk(
  "problems/fetchProblemBySlug",
  async (slug: string) => {
    const response = await api.get<Problem>(`/problems/${slug}`);
    return response.data;
  },
);

export const saveProblemVariants = createAsyncThunk(
  "problems/saveProblemVariants",
  async ({ slug, variants }: { slug: string; variants: Solution[] }) => {
    const response = await api.put(`/problems/${slug}`, { variants });
    return response.data;
  },
);

export const createProblem = createAsyncThunk(
  "problems/createProblem",
  async (problemData: any) => {
    const response = await api.post("/problems", problemData);
    return response.data;
  },
);

export const updateProblem = createAsyncThunk(
  "problems/updateProblem",
  async ({ slug, problemData }: { slug: string; problemData: any }) => {
    const response = await api.put(`/problems/${slug}`, problemData);
    return response.data;
  },
);

const problemsSlice = createSlice({
  name: "problems",
  initialState,
  reducers: {
    setCurrentProblem: (state, action: PayloadAction<Problem | null>) => {
      state.currentProblem = action.payload;
    },
    updateLocalVariants: (state, action: PayloadAction<Solution[]>) => {
      if (state.currentProblem) {
        state.currentProblem.variants = action.payload;
      }
    },
    resetProblems: (state) => {
      state.problems = [];
      state.pagination = null;
      state.hasMore = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Problems
      .addCase(fetchProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.loading = false;
        const { data, pagination, isNewSearch } = action.payload;
        
        if (isNewSearch) {
          state.problems = data;
        } else {
          // Append for pagination
          state.problems = [...state.problems, ...data];
        }
        
        state.pagination = pagination;
        state.hasMore = pagination.currentPage < pagination.pages;
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch problems";
      })
      // Fetch Single Problem
      .addCase(fetchProblemBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblemBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProblem = action.payload;
      })
      .addCase(fetchProblemBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Problem not found";
      })
      // Save Variants
      .addCase(saveProblemVariants.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveProblemVariants.fulfilled, (state, action) => {
        state.saving = false;
        if (
          state.currentProblem &&
          state.currentProblem.slug === action.payload.slug
        ) {
          state.currentProblem.variants = action.payload.variants;
        }
      })
      .addCase(saveProblemVariants.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to save code";
      })
      // Create Problem
      .addCase(createProblem.pending, (state) => {
        state.saving = true;
      })
      .addCase(createProblem.fulfilled, (state, action) => {
        state.saving = false;
        state.problems.push(action.payload);
      })
      .addCase(createProblem.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to create problem";
      })
      // Update Problem
      .addCase(updateProblem.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateProblem.fulfilled, (state, action) => {
        state.saving = false;
        state.currentProblem = action.payload;
        // Optionally update the list if it exists
        const index = state.problems.findIndex((p) => p.slug === action.payload.slug);
        if (index !== -1) {
          state.problems[index] = action.payload;
        }
      })
      .addCase(updateProblem.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to update problem";
      });
  },
});

export const { setCurrentProblem, updateLocalVariants, resetProblems } = problemsSlice.actions;
export default problemsSlice.reducer;
