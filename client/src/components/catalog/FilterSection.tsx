import React, { useState } from "react";
import { LuSearch, LuFilter, LuChevronDown, LuFilterX } from "react-icons/lu";
import MultiSelect from "../MultiSelect";

interface FilterSectionProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedSubCategories: string[];
  onSubCategoriesChange: (val: string[]) => void;
  selectedDifficulties: string[];
  onDifficultiesChange: (val: string[]) => void;
  selectedTechniques: string[];
  onTechniquesChange: (val: string[]) => void;
  subCategoriesOptions: string[];
  difficultyOptions: string[];
  techniquesOptions: string[];
  resetFilters: () => void;
  isFilterActive: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  search,
  onSearchChange,
  selectedSubCategories,
  onSubCategoriesChange,
  selectedDifficulties,
  onDifficultiesChange,
  selectedTechniques,
  onTechniquesChange,
  subCategoriesOptions,
  difficultyOptions,
  techniquesOptions,
  resetFilters,
  isFilterActive,
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="bg-sidebar border border-border-subtle p-card-padding rounded-3xl shadow-sm space-y-4">
      {/* Search & Mobile Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative group flex-1">
          <LuSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by title or concept..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-app-bg border border-border-subtle rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm text-text-main font-medium placeholder:text-text-muted/40"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`flex-1 sm:flex-initial md:hidden flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all border ${showMobileFilters ? "bg-brand/10 border-brand text-brand" : "bg-app-bg border-border-subtle text-text-muted"}`}
          >
            <LuFilter size={18} />
            <span>Filters</span>
            <LuChevronDown
              size={16}
              className={`transition-transform duration-300 ${showMobileFilters ? "rotate-180" : ""}`}
            />
          </button>
          {isFilterActive && (
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 font-bold transition-all"
              title="Clear all filters"
            >
              <LuFilterX size={18} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Multi-Select Dropdowns / Mobile Collapsible */}
      <div
        className={`${showMobileFilters ? "grid" : "hidden md:grid"} grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300`}
      >
        <MultiSelect
          label="Sub-categories"
          options={subCategoriesOptions}
          selected={selectedSubCategories}
          onChange={onSubCategoriesChange}
        />
        <MultiSelect
          label="Difficulties"
          options={difficultyOptions}
          selected={selectedDifficulties}
          onChange={onDifficultiesChange}
        />
        <MultiSelect
          label="Patterns / Techniques"
          options={techniquesOptions}
          selected={selectedTechniques}
          onChange={onTechniquesChange}
        />
      </div>
    </div>
  );
};

export default FilterSection;
