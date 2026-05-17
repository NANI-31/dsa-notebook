import React, { useState, useEffect, useRef } from "react";
import {
  LuSearch,
  LuPlus,
  LuFilterX,
  LuLoader,
  LuFilter,
  LuChevronDown,
} from "react-icons/lu";
import { Link } from "react-router-dom";
import MultiSelect from "../components/MultiSelect";
import EmptyState from "../components/EmptyState";
import ProblemCard from "../components/ProblemCard";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { fetchProblems } from "../features/problems/problemsSlice";
import type { ProblemFilters } from "../types/problem";

const AllProblems: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { problems, loading, pagination, hasMore } = useSelector((state: RootState) => state.problems);
  const categories = useSelector((state: RootState) => state.categories.list);
  const techniques = useSelector((state: RootState) => state.techniques.list);

  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(() => {
    const params = new URLSearchParams(window.location.search);
    const sub = params.get("subCategory");
    const cats = params.get("categories"); // Support both param names
    if (sub) return [sub];
    if (cats) return cats.split(",");
    return [];
  });
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(() => {
    const params = new URLSearchParams(window.location.search);
    const diff = params.get("difficulty");
    return diff ? diff.split(",") : [];
  });
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Initial fetch and filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: ProblemFilters = {
        search,
        difficulty: selectedDifficulties,
        categories: selectedSubCategories,
        techniques: selectedTechniques,
        page: 1, // Reset to page 1 on filter change
      };
      dispatch(fetchProblems(filters));
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [
    dispatch,
    search,
    selectedDifficulties,
    selectedSubCategories,
    selectedTechniques,
  ]);

  const subCategoriesOptions = React.useMemo(() => {
    const subs = new Set<string>();
    categories.forEach((cat) => {
      cat.subCategories.forEach((sub) => subs.add(sub));
    });
    return Array.from(subs).sort();
  }, [categories]);

  const difficultyOptions = ["Easy", "Medium", "Hard"];

  const techniquesOptions = React.useMemo(() => {
    return techniques.map((t) => t.name).sort();
  }, [techniques]);

  const resetFilters = () => {
    setSearch("");
    setSelectedSubCategories([]);
    setSelectedDifficulties([]);
    setSelectedTechniques([]);
  };

  const isFilterActive =
    search !== "" ||
    selectedSubCategories.length > 0 ||
    selectedDifficulties.length > 0 ||
    selectedTechniques.length > 0;

  // Infinite Scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = (pagination?.currentPage || 1) + 1;
          const filters: ProblemFilters = {
            search,
            difficulty: selectedDifficulties,
            categories: selectedSubCategories,
            techniques: selectedTechniques,
            page: nextPage,
          };
          dispatch(fetchProblems(filters));
        }
      },
      { threshold: 0.1 }, // Trigger a bit earlier
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [dispatch, hasMore, loading, pagination, search, selectedDifficulties, selectedSubCategories, selectedTechniques]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">
            Problem Library
          </h1>
          <div className="flex items-center gap-2 mt-1 px-1">
            <p className="text-text-muted text-sm font-medium">
              {pagination?.total || 0}{" "}
              {(pagination?.total || 0) === 1 ? "problem" : "problems"} available
            </p>
            {loading && !problems.length && (
              <LuLoader size={14} className="text-brand animate-spin" />
            )}
          </div>
        </div>
        <Link
          to="/problems/new"
          className="bg-brand hover:opacity-90 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black shadow-xl shadow-brand/20 transition-all active:scale-95"
        >
          <LuPlus size={20} />
          <span>New Problem</span>
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-sidebar border border-border-subtle p-4 md:p-6 rounded-3xl shadow-sm space-y-4">
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
              onChange={(e) => setSearch(e.target.value)}
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
            onChange={setSelectedSubCategories}
          />
          <MultiSelect
            label="Difficulties"
            options={difficultyOptions}
            selected={selectedDifficulties}
            onChange={setSelectedDifficulties}
          />
          <MultiSelect
            label="Patterns / Techniques"
            options={techniquesOptions}
            selected={selectedTechniques}
            onChange={setSelectedTechniques}
          />
        </div>
      </div>

      {/* Content Area */}
      {problems.length > 0 ? (
        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem, index) => (
              <ProblemCard 
                key={`${problem.slug}-${index}`} 
                problem={problem} 
                index={index} 
              />
            ))}
          </div>

          {/* Sentinel for Infinite Scroll */}
          {hasMore && (
            <div ref={observerRef} className="flex justify-center p-12">
              <div className="flex items-center gap-3 text-brand/60">
                <div className="h-2 w-2 bg-brand rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-brand rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 bg-brand rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] ml-2">
                  {loading ? "Discovering more problems..." : "Scroll for more catalog"}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        !loading && <EmptyState onReset={resetFilters} />
      )}
    </div>
  );
};

export default AllProblems;
