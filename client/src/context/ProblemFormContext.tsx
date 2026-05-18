import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import type { ProblemFormData } from "../types/problem";
import type { Category } from "../features/categories/categoriesSlice";

interface ProblemFormContextType {
  formData: ProblemFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProblemFormData>>;
  activeTab: "details" | "code" | "notes";
  setActiveTab: (tab: "details" | "code" | "notes") => void;
  showDescPreview: boolean;
  setShowDescPreview: (show: boolean) => void;
  showNotesPreview: boolean;
  setShowNotesPreview: (show: boolean) => void;
  categories: Category[];
  categoriesMap: Record<string, string[]>;
  categoryStatus: string;
  techniquesList: Array<{ _id: string; name: string }>;
  saving: boolean;
  toggleTechnique: (techId: string) => void;
}

const ProblemFormContext = createContext<ProblemFormContextType | undefined>(undefined);

export const useProblemForm = () => {
  const context = useContext(ProblemFormContext);
  if (!context) {
    throw new Error("useProblemForm must be used within a ProblemFormProvider");
  }
  return context;
};

export const ProblemFormProvider: React.FC<{ 
  initialData: ProblemFormData; 
  children: React.ReactNode; 
  onAutoSave?: (data: ProblemFormData) => void;
}> = ({
  initialData,
  children,
  onAutoSave,
}) => {
  const { saving } = useSelector((state: RootState) => state.problems);
  const { list: categories, status: categoryStatus } = useSelector(
    (state: RootState) => state.categories,
  );
  const { list: techniquesList } = useSelector(
    (state: RootState) => state.techniques,
  );

  const [activeTab, setActiveTab] = useState<"details" | "code" | "notes">("details");
  const [showDescPreview, setShowDescPreview] = useState(false);
  const [showNotesPreview, setShowNotesPreview] = useState(false);
  const [formData, setFormData] = useState<ProblemFormData>(initialData);

  // Sync formData with initialData if it changes (useful for EditProblem hydration)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const categoriesMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    categories.forEach((cat) => {
      map[cat.name] = cat.subCategories;
    });
    return map;
  }, [categories]);

  useEffect(() => {
    if (onAutoSave) {
      onAutoSave(formData);
    }
  }, [formData, onAutoSave]);

  const toggleTechnique = (techId: string) => {
    setFormData((prev) => ({
      ...prev,
      techniques: prev.techniques.includes(techId)
        ? prev.techniques.filter((t) => t !== techId)
        : [...prev.techniques, techId],
    }));
  };

  const value: ProblemFormContextType = {
    formData,
    setFormData,
    activeTab,
    setActiveTab,
    showDescPreview,
    setShowDescPreview,
    showNotesPreview,
    setShowNotesPreview,
    categories,
    categoriesMap,
    categoryStatus,
    techniquesList,
    saving,
    toggleTechnique,
  };

  return <ProblemFormContext.Provider value={value}>{children}</ProblemFormContext.Provider>;
};
