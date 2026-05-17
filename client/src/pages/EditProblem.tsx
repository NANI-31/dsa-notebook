import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { LuSave, LuLoader } from "react-icons/lu";
import { 
  fetchProblemBySlug, 
  updateProblem 
} from "../features/problems/problemsSlice";
import type { AppDispatch, RootState } from "../app/store";
import SolutionEditor from "../components/SolutionEditor";

// Unified Layout Components
import { 
  SharedFormHeader, 
  SharedFormTabs, 
  SharedContextTab, 
  SharedAnalysisTab 
} from "../layout/SharedForm";

// Context
import { ProblemFormProvider, useProblemForm } from "../context/ProblemFormContext";

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

    const selectedCategory = categories.find(
      (c) => c.name === formData.category,
    );

    const problemData = {
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficulty,
      category: selectedCategory?._id || formData.category,
      subCategory: formData.subCategory,
      timeComplexity: formData.timeComplexity,
      spaceComplexity: formData.spaceComplexity,
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
              onChange={(variants) => setFormData((prev: any) => ({ ...prev, variants }))}
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

  const initialData = useMemo(() => {
    if (!problem || problem.slug !== slug) {
      return {
        title: "",
        category: "",
        subCategory: "",
        difficulty: "Medium",
        description: "",
        timeComplexity: "",
        spaceComplexity: "",
        techniques: [] as string[],
        explanation: "",
        notes: "",
        variants: [{ name: "Main Solution", language: "typescript", code: "" }],
      };
    }

    const safeVariants =
      problem.variants &&
      Array.isArray(problem.variants) &&
      problem.variants.length > 0
        ? problem.variants
        : [{ name: "Main Solution", language: "typescript", code: "" }];

    return {
      title: problem.title || "",
      category: problem.category?.name || "Coding Problems",
      subCategory: problem.subCategory || "",
      difficulty: problem.difficulty || "Medium",
      description: problem.description || "",
      timeComplexity: problem.timeComplexity || "",
      spaceComplexity: problem.spaceComplexity || "",
      techniques: problem.techniques?.map((t: any) => t._id) || [],
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
