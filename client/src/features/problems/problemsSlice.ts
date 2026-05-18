import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Problem, ProblemFilters, Solution, PaginatedResponse } from "../../types/problem";
import api from "../../services/api";

interface ProblemsState {
  problems: Problem[];
  byId: Record<string, Problem>;
  allIds: string[];
  currentProblem: Problem | null;
  problemsBackup: Problem[] | null;
  problemsBackupById: Record<string, Problem> | null;
  problemsBackupAllIds: string[] | null;
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
  byId: {},
  allIds: [],
  currentProblem: null,
  problemsBackup: null,
  problemsBackupById: null,
  problemsBackupAllIds: null,
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
    if (filters.folderId)
      params.append("folderId", filters.folderId);
    
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

export const deleteProblem = createAsyncThunk(
  "problems/deleteProblem",
  async (slug: string) => {
    await api.delete(`/problems/${slug}`);
    return slug;
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
      if (state.currentProblem && state.byId[state.currentProblem._id]) {
        state.byId[state.currentProblem._id].variants = action.payload;
      }
    },
    resetProblems: (state) => {
      state.problems = [];
      state.byId = {};
      state.allIds = [];
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
          state.byId = {};
          state.allIds = [];
        } else {
          // Append for pagination
          state.problems = [...state.problems, ...data];
        }

        data.forEach((p: Problem) => {
          state.byId[p._id] = p;
          if (!state.allIds.includes(p._id)) {
            state.allIds.push(p._id);
          }
        });
        
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
        const problem = action.payload;
        state.currentProblem = problem;
        state.byId[problem._id] = problem;
        if (!state.allIds.includes(problem._id)) {
          state.allIds.push(problem._id);
        }
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
        const updated = action.payload;
        if (
          state.currentProblem &&
          state.currentProblem.slug === updated.slug
        ) {
          state.currentProblem.variants = updated.variants;
        }
        if (state.byId[updated._id]) {
          state.byId[updated._id].variants = updated.variants;
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
        const problem = action.payload;
        state.problems.push(problem);
        state.byId[problem._id] = problem;
        state.allIds.push(problem._id);
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
        const updated = action.payload;
        state.currentProblem = updated;
        // Optionally update the list if it exists
        const index = state.problems.findIndex((p) => p.slug === updated.slug);
        if (index !== -1) {
          state.problems[index] = updated;
        }
        state.byId[updated._id] = updated;
        if (!state.allIds.includes(updated._id)) {
          state.allIds.push(updated._id);
        }
      })
      .addCase(updateProblem.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to update problem";
      })
      // Delete Problem
      .addCase(deleteProblem.pending, (state, action) => {
        state.loading = true;
        state.problemsBackup = [...state.problems];
        state.problemsBackupById = { ...state.byId };
        state.problemsBackupAllIds = [...state.allIds];
        
        const targetSlug = action.meta.arg;
        const targetProblem = state.problems.find((p) => p.slug === targetSlug);

        // Optimistically filter the problem from state list and maps
        state.problems = state.problems.filter((p) => p.slug !== targetSlug);
        if (targetProblem) {
          delete state.byId[targetProblem._id];
          state.allIds = state.allIds.filter((id) => id !== targetProblem._id);
        }

        if (state.currentProblem?.slug === targetSlug) {
          state.currentProblem = null;
        }
      })
      .addCase(deleteProblem.fulfilled, (state) => {
        state.loading = false;
        state.problemsBackup = null;
        state.problemsBackupById = null;
        state.problemsBackupAllIds = null;
      })
      .addCase(deleteProblem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete problem";
        // Rollback on failure
        if (state.problemsBackup) {
          state.problems = state.problemsBackup;
          state.problemsBackup = null;
        }
        if (state.problemsBackupById) {
          state.byId = state.problemsBackupById;
          state.problemsBackupById = null;
        }
        if (state.problemsBackupAllIds) {
          state.allIds = state.problemsBackupAllIds;
          state.problemsBackupAllIds = null;
        }
      });
  },
});

export const { setCurrentProblem, updateLocalVariants, resetProblems } = problemsSlice.actions;
export default problemsSlice.reducer;
