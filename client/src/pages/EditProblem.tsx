import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { LuSave, LuLoader } from "react-icons/lu";
import {
  fetchProblemBySlug,
  updateProblem,
} from "../features/problems/problemsSlice";
import type { AppDispatch, RootState } from "../app/store";
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

const EditProblemContent: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentProblem: problem, loading } = useSelector(
    (state: RootState) => state.problems,
  );
  const { formData, setFormData, activeTab, categories } = useProblemForm();

  const handleUpdate = async () => {
    if (!formData.title || !slug) return;

    // --- Pre-Submit Validation Guard ---
    const selectedCategory = categories.find(
      (c) => c.name === formData.category,
    );
    const categoryId =
      selectedCategory?._id || formData.categoryId || formData.category;

    // Validate: category must resolve to a valid ObjectId (24-hex chars)
    if (!categoryId || !/^[a-f\d]{24}$/i.test(categoryId)) {
      dispatch(
        addToast({
          message:
            "Category could not be resolved. Please re-select a category from the dropdown.",
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
    };

    const action = await dispatch(updateProblem({ slug, problemData }));
    if (updateProblem.fulfilled.match(action)) {
      navigate(`/problems/${action.payload.slug}`);
    }
  };

  if (loading && !problem) {
    return (
      <div className="fixed inset-0 bg-app-bg z-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <LuLoader className="animate-spin text-brand" size={48} />
          <p className="text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">
            Retrieving System State...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-text-main pb-24 animate-in fade-in duration-500 relative">
      <SharedFormHeader
        title="Modify Entry"
        subtitle={`Current Workspace: ${problem?.title}`}
        actionLabel="Save Changes"
        actionIcon={LuSave}
        onAction={handleUpdate}
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

const EditProblem: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentProblem: problem } = useSelector(
    (state: RootState) => state.problems,
  );

  useEffect(() => {
    if (slug) {
      dispatch(fetchProblemBySlug(slug));
    }
  }, [dispatch, slug]);

  const initialData: ProblemFormData = useMemo(() => {
    if (!problem || problem.slug !== slug) {
      return {
        title: "",
        category: "",
        categoryId: "",
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
          { name: "Main Solution", language: "typescript", code: "", codes: {} },
        ],
      };
    }

    const safeVariants =
      problem.variants &&
      Array.isArray(problem.variants) &&
      problem.variants.length > 0
        ? problem.variants.map((v) => ({
            ...v,
            codes: v.codes || { [v.language]: v.code },
          }))
        : [
            { name: "Main Solution", language: "typescript", code: "", codes: {} },
          ];

    return {
      title: problem.title || "",
      category: problem.category?.name || "Coding Problems",
      categoryId: problem.category?._id || "",
      subCategory: problem.subCategory || "",
      difficulty: problem.difficulty || "Medium",
      description: problem.description || "",
      timeComplexity: problem.timeComplexity || "",
      spaceComplexity: problem.spaceComplexity || "",
      timeComplexityAnalysis: problem.timeComplexityAnalysis || "",
      spaceComplexityAnalysis: problem.spaceComplexityAnalysis || "",
      techniques: problem.techniques?.map((t) => t._id) || [],
      explanation: problem.explanation || "",
      notes: problem.notes || "",
      variants: safeVariants,
    };
  }, [problem, slug]);

  return (
    <ProblemFormProvider initialData={initialData}>
      <EditProblemContent />
    </ProblemFormProvider>
  );
};

export default EditProblem;
