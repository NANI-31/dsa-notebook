import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AIReviewResponse } from "../../services/aiService";
import { requestAIReviewStream, requestAIHintStream } from "../../services/aiService";
import type { AppDispatch } from "../../app/store";

export interface AIState {
  review: AIReviewResponse | null;
  hints: string[];
  hintCount: number;
  loading: boolean;
  error: string | null;
  activeTab: "review" | "hint";
  activeProblemId: string | null;
}

const initialState: AIState = {
  review: null,
  hints: [],
  hintCount: 0,
  loading: false,
  error: null,
  activeTab: "review",
  activeProblemId: null
};

// Resilient regex-based parser to extract fields from partial JSON string in real-time
const parsePartialJSON = (jsonStr: string): AIReviewResponse => {
  const result: AIReviewResponse = {
    complexity: "",
    correctness: "",
    optimizations: "",
    alternativeCode: ""
  };
  
  const extractKey = (key: string): string => {
    const regex = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)`, 'i');
    const match = jsonStr.match(regex);
    if (match) {
      try {
        return match[1]
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      } catch {
        return match[1];
      }
    }
    return "";
  };
  
  result.complexity = extractKey("complexity");
  result.correctness = extractKey("correctness");
  result.optimizations = extractKey("optimizations");
  
  const altRegex = /"alternativeCode"\s*:\s*"(.*)/s;
  const match = jsonStr.match(altRegex);
  if (match) {
    let rawCode = match[1];
    rawCode = rawCode
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
      
    if (rawCode.endsWith('"}') || rawCode.endsWith('"} ')) {
      rawCode = rawCode.substring(0, rawCode.lastIndexOf('"}'));
    } else if (rawCode.endsWith('"') || rawCode.endsWith('" ')) {
      rawCode = rawCode.substring(0, rawCode.lastIndexOf('"'));
    }
    result.alternativeCode = rawCode;
  }
  
  return result;
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    setAIActiveTab: (state, action: PayloadAction<"review" | "hint">) => {
      state.activeTab = action.payload;
    },
    initializeAIForProblem: (state, action: PayloadAction<string>) => {
      if (state.activeProblemId !== action.payload) {
        state.activeProblemId = action.payload;
        state.review = null;
        state.hints = [];
        state.hintCount = 0;
        state.loading = false;
        state.error = null;
      }
    },
    clearAIState: (state) => {
      state.review = null;
      state.hints = [];
      state.hintCount = 0;
      state.loading = false;
      state.error = null;
      state.activeProblemId = null;
    },
    setAILoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAIError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAIReview: (state, action: PayloadAction<AIReviewResponse | null>) => {
      state.review = action.payload;
    },
    appendAIHintPlaceholder: (state, action: PayloadAction<number>) => {
      state.hints.push("Tutor is drafting clue...");
      state.hintCount = action.payload;
    },
    updateAILastHint: (state, action: PayloadAction<string>) => {
      if (state.hints.length > 0) {
        state.hints[state.hints.length - 1] = action.payload;
      }
    }
  }
});

export const {
  setAIActiveTab,
  initializeAIForProblem,
  clearAIState,
  setAILoading,
  setAIError,
  setAIReview,
  appendAIHintPlaceholder,
  updateAILastHint
} = aiSlice.actions;

// Global thunk/streaming runner routines that decouple from Component lifecycle
export const streamAIReview = (
  problemId: string,
  problemTitle: string,
  problemDescription: string,
  code: string,
  language: string
) => async (dispatch: AppDispatch) => {
  dispatch(initializeAIForProblem(problemId));
  dispatch(setAILoading(true));
  dispatch(setAIError(null));
  dispatch(setAIReview({
    complexity: "Analyzing solution performance...",
    correctness: "Inspecting logical bugs and extreme inputs...",
    optimizations: "Preparing readability and efficiency recommendations...",
    alternativeCode: "// Gemini is compiling your optimized stream alternative..."
  }));

  let accumulatedText = "";
  try {
    await requestAIReviewStream(
      problemTitle,
      problemDescription,
      code,
      language,
      (chunk) => {
        accumulatedText += chunk;
        const parsed = parsePartialJSON(accumulatedText);
        dispatch(setAIReview({
          complexity: parsed.complexity || "Generating complexity matrix...",
          correctness: parsed.correctness || "Generating edge case report...",
          optimizations: parsed.optimizations || "Generating refactoring list...",
          alternativeCode: parsed.alternativeCode || "// Writing clean refactored solution..."
        }));
      },
      () => {
        dispatch(setAILoading(false));
      },
      (err) => {
        dispatch(setAIError(err.message || "Failed to process code review with Gemini."));
        dispatch(setAILoading(false));
      }
    );
  } catch (err: any) {
    dispatch(setAIError(err.message || "Failed to process code review with Gemini."));
    dispatch(setAILoading(false));
  }
};

export const streamAIHint = (
  problemId: string,
  problemTitle: string,
  problemDescription: string,
  code: string,
  language: string,
  currentHintCount: number
) => async (dispatch: AppDispatch) => {
  dispatch(initializeAIForProblem(problemId));
  dispatch(setAILoading(true));
  dispatch(setAIError(null));

  const nextHintCount = currentHintCount + 1;
  dispatch(appendAIHintPlaceholder(nextHintCount));

  let accumulatedHintText = "";
  try {
    await requestAIHintStream(
      problemTitle,
      problemDescription,
      code,
      language,
      nextHintCount,
      (chunk) => {
        accumulatedHintText += chunk;
        dispatch(updateAILastHint(accumulatedHintText));
      },
      () => {
        dispatch(setAILoading(false));
      },
      (err) => {
        dispatch(setAIError(err.message || "Failed to retrieve hint from Gemini."));
        dispatch(setAILoading(false));
      }
    );
  } catch (err: any) {
    dispatch(setAIError(err.message || "Failed to retrieve hint from Gemini."));
    dispatch(setAILoading(false));
  }
};

export default aiSlice.reducer;
