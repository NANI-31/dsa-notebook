export interface Solution {
  _id?: string;
  name: string;
  code: string;
  language: string;
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
  techniques: Array<{
    _id: string;
    name: string;
  }>;
  description: string;
  explanation: string;
  notes: string;
  variants: Solution[];
  addedDate?: string;
}

export interface ProblemFilters {
  search?: string;
  difficulty?: string[];
  categories?: string[];
  categoryName?: string;
  techniques?: string[];
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
