import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LuPlus, LuLoader } from "react-icons/lu";
import { createProblem } from "../features/problems/problemsSlice";
import type { AppDispatch } from "../app/store";
import type { ProblemFormData } from "../types/problem";
import { addToast } from "../features/ui/uiSlice";
import SolutionEditor from "../components/SolutionEditor";

// Unified Layout Components
import {
  SharedFormHeader,
  SharedFormTabs,
  SharedContextTab,
  SharedAnalysisTab,
} from "../layout/SharedForm";

// Context
import {
  ProblemFormProvider,
  useProblemForm,
} from "../context/ProblemFormContext";

const NewProblemContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderIdParam = searchParams.get("folderId");
  const { formData, setFormData, activeTab, categories, categoryStatus } =
    useProblemForm();

  const handleCreate = async () => {
    if (!formData.title) return;

    // --- Pre-Submit Validation Guard ---
    const selectedCategory = categories.find(
      (c) => c.name === formData.category,
    );
    const categoryId = selectedCategory?._id || formData.category;

    if (!categoryId || !/^[a-f\d]{24}$/i.test(categoryId)) {
      dispatch(
        addToast({
          message:
            "Category could not be resolved. Please select a valid category from the dropdown.",
          type: "error",
          duration: 5000,
        }),
      );
      return;
    }

    if (!formData.subCategory) {
      dispatch(
        addToast({
          message: "Sub-category is required. Please select a sub-category.",
          type: "error",
          duration: 4000,
        }),
      );
      return;
    }

    const problemData = {
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficulty,
      category: categoryId,
      subCategory: formData.subCategory,
      timeComplexity: formData.timeComplexity,
      spaceComplexity: formData.spaceComplexity,
      timeComplexityAnalysis: formData.timeComplexityAnalysis,
      spaceComplexityAnalysis: formData.spaceComplexityAnalysis,
      techniques: formData.techniques,
      notes: formData.notes,
      explanation: formData.explanation,
      variants: formData.variants,
      folderId: folderIdParam || null,
    };

    const action = await dispatch(createProblem(problemData));
    if (createProblem.fulfilled.match(action)) {
      localStorage.removeItem("new-problem-draft");
      navigate(`/problems/${action.payload.slug}`);
    }
  };

  if (categoryStatus === "loading") {
    return (
      <div className="fixed inset-0 bg-app-bg/80 backdrop-blur-md z-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-brand blur-2xl opacity-20 animate-pulse" />
            <LuLoader className="animate-spin text-brand relative" size={48} />
          </div>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-text-main animate-pulse">
            Hydrating State...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-text-main pb-24 animate-in fade-in duration-500 relative">
      <SharedFormHeader
        title="Add New Problem"
        subtitle="Expand your problem catalog with a new entry."
        actionLabel="Create Problem"
        actionIcon={LuPlus}
        onAction={handleCreate}
      />
      <SharedFormTabs />

      <div className="animate-in slide-in-from-bottom-6 duration-700">
        {activeTab === "details" && <SharedContextTab />}

        {activeTab === "code" && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <SolutionEditor
              variants={formData.variants}
              onChange={(variants) =>
                setFormData((prev) => ({ ...prev, variants }))
              }
            />
          </div>
        )}

        {activeTab === "notes" && <SharedAnalysisTab />}
      </div>
    </div>
  );
};

const NewProblem: React.FC = () => {
  const initialData: ProblemFormData = React.useMemo(() => {
    const defaultData: ProblemFormData = {
      title: "",
      category: "Coding Problems",
      subCategory: "",
      difficulty: "Medium",
      description: "",
      timeComplexity: "",
      spaceComplexity: "",
      timeComplexityAnalysis: "",
      spaceComplexityAnalysis: "",
      techniques: [],
      explanation: "",
      notes: "",
      variants: [
        {
          name: "Main Solution",
          language: "typescript",
          code: "",
          codes: {},
        },
      ],
    };

    const saved = localStorage.getItem("new-problem-draft");
    if (!saved) return defaultData;

    try {
      const parsed = JSON.parse(saved);
      if (
        !parsed.variants ||
        !Array.isArray(parsed.variants) ||
        parsed.variants.length === 0
      ) {
        parsed.variants = defaultData.variants;
      }
      return { ...defaultData, ...parsed };
    } catch (e) {
      return defaultData;
    }
  }, []);

  const handleAutoSave = (data: ProblemFormData) => {
    localStorage.setItem("new-problem-draft", JSON.stringify(data));
  };

  return (
    <ProblemFormProvider initialData={initialData} onAutoSave={handleAutoSave}>
      <NewProblemContent />
    </ProblemFormProvider>
  );
};

export default NewProblem;
