export interface Solution {
  _id?: string;
  name: string;
  code: string;
  language: string;
  codes?: Record<string, string>;
}


export interface Problem {
  _id: string;
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: {
    _id: string;
    name: string;
  };
  subCategory: string;
  categories: string[];
  starred: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  timeComplexityAnalysis: string;
  spaceComplexityAnalysis: string;
  techniques: Array<{
    _id: string;
    name: string;
  }>;
  description: string;
  explanation: string;
  notes: string;
  variants: Solution[];
  folderId?: string | null;
  addedDate?: string;
}

/**
 * Typed form data shape for problem creation and editing.
 * Eliminates all `any` casts in setFormData callbacks across
 * ContextTab, AnalysisTab, EditProblem, and NewProblem.
 */
export interface ProblemFormData {
  title: string;
  category: string;
  categoryId?: string;
  subCategory: string;
  difficulty: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  timeComplexityAnalysis: string;
  spaceComplexityAnalysis: string;
  techniques: string[];
  explanation: string;
  notes: string;
  variants: Solution[];
  folderId?: string | null;
}

export interface ProblemFilters {
  search?: string;
  difficulty?: string[];
  categories?: string[];
  categoryName?: string;
  techniques?: string[];
  folderId?: string | null;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
}
