import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import {
  fetchProblemBySlug,
  saveProblemVariants,
  updateLocalVariants,
} from "../features/problems/problemsSlice";
import type { Solution } from "../types/problem";

interface ProblemDetailsContextType {
  // Redux State
  problem: any;
  loading: boolean;
  error: string | null;
  saving: boolean;
  terminalLayout: string;

  // Local State
  activeVariantIndex: number;
  setActiveVariantIndex: (index: number) => void;
  isRunning: boolean;
  executionOutput: string;
  executionError: string;
  stdin: string;
  setStdin: (val: string) => void;
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  showInput: boolean;
  setShowInput: (show: boolean) => void;
  isSaved: boolean;

  // Computed
  variants: Solution[];
  activeVariant: Solution;

  // Handlers
  handleRun: () => void;
  handleCodeChange: (value: string | undefined) => void;
  handleLanguageChange: (lang: string) => void;
  handleEditorDidMount: (editor: any) => void;
  formatCode: () => void;
  onSync: () => void;
}

const ProblemDetailsContext = createContext<ProblemDetailsContextType | undefined>(undefined);

export const useProblemDetails = () => {
  const context = useContext(ProblemDetailsContext);
  if (!context) {
    throw new Error("useProblemDetails must be used within a ProblemDetailsProvider");
  }
  return context;
};

export const ProblemDetailsProvider: React.FC<{ slug: string | undefined; children: React.ReactNode }> = ({
  slug,
  children,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentProblem: problem,
    loading,
    error,
    saving,
  } = useSelector((state: RootState) => state.problems);

  const { terminalLayout } = useSelector((state: RootState) => state.settings);

  const editorRef = useRef<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [executionOutput, setExecutionOutput] = useState("");
  const [executionError, setExecutionError] = useState("");
  const [stdin, setStdin] = useState("");
  const [showTerminal, setShowTerminal] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const scrollPositionsRef = useRef<Record<number, number>>({});

  const variants = problem?.variants || [];
  const activeVariant = variants[activeVariantIndex];

  // Fetch problem on mount or slug change
  useEffect(() => {
    if (slug) {
      dispatch(fetchProblemBySlug(slug));
    }
  }, [slug, dispatch]);

  // Handle scroll persistence
  useEffect(() => {
    if (!editorRef.current) return;
    const savedScrollTop = scrollPositionsRef.current[activeVariantIndex] || 0;
    const timeoutId = setTimeout(() => {
      editorRef.current.setScrollTop(savedScrollTop);
    }, 0);

    return () => {
      if (editorRef.current) {
        scrollPositionsRef.current[activeVariantIndex] = editorRef.current.getScrollTop();
      }
      clearTimeout(timeoutId);
    };
  }, [activeVariantIndex]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined || !variants.length) return;
    const newVariants = [...variants];
    newVariants[activeVariantIndex] = {
      ...newVariants[activeVariantIndex],
      code: value,
    };
    dispatch(updateLocalVariants(newVariants));
    setIsSaved(false);
  };

  const handleLanguageChange = (lang: string) => {
    if (!variants.length) return;
    const newVariants = [...variants];
    newVariants[activeVariantIndex] = { ...newVariants[activeVariantIndex], language: lang };
    dispatch(updateLocalVariants(newVariants));
  };

  const formatCode = () => {
    editorRef.current?.getAction("editor.action.formatDocument")?.run();
  };

  const handleRun = async () => {
    if (!activeVariant) return;
    setIsRunning(true);
    setShowTerminal(true);
    setExecutionOutput("");
    setExecutionError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/execute`,
        {
          language: activeVariant.language,
          code: activeVariant.code,
          stdin: stdin,
        },
      );

      const { stdout, stderr, output } = response.data.run;
      setExecutionOutput(stdout || output);
      setExecutionError(stderr);
    } catch (error: any) {
      setExecutionError(
        error.response?.data?.message || "Failed to connect to execution runtime.",
      );
    } finally {
      setIsRunning(false);
    }
  };

  const onSync = () => {
    if (problem) {
      dispatch(saveProblemVariants({ slug: problem.slug, variants }));
    }
  };

  const value: ProblemDetailsContextType = {
    problem,
    loading,
    error,
    saving,
    terminalLayout,
    activeVariantIndex,
    setActiveVariantIndex,
    isRunning,
    executionOutput,
    executionError,
    stdin,
    setStdin,
    showTerminal,
    setShowTerminal,
    showInput,
    setShowInput,
    isSaved,
    variants,
    activeVariant,
    handleRun,
    handleCodeChange,
    handleLanguageChange,
    handleEditorDidMount,
    formatCode,
    onSync,
  };

  return <ProblemDetailsContext.Provider value={value}>{children}</ProblemDetailsContext.Provider>;
};
