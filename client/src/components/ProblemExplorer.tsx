import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { fetchProblems } from "../features/problems/problemsSlice";
import { LuSearch, LuLoader, LuArrowLeft } from "react-icons/lu";
import ProblemCard from "./ProblemCard";
import EmptyState from "./EmptyState";

interface ProblemExplorerProps {
  categoryName: string;
  subCategory: string;
  onBack: () => void;
}

const ProblemExplorer: React.FC<ProblemExplorerProps> = ({ categoryName, subCategory, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { problems, loading, pagination, hasMore } = useSelector((state: RootState) => state.problems);
  
  const [search, setSearch] = useState("");
  const observerRef = useRef<HTMLDivElement>(null);

  // Load problems for the specific sub-category
  useEffect(() => {
    const filters = {
      categories: [subCategory],
      categoryName: categoryName,
      search: search,
      page: 1,
      limit: 12
    };
    
    const timer = setTimeout(() => {
      dispatch(fetchProblems(filters));
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, subCategory, categoryName, search]);

  // Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = (pagination?.currentPage || 1) + 1;
          dispatch(fetchProblems({
            categories: [subCategory],
            categoryName: categoryName,
            search: search,
            page: nextPage,
            limit: 12
          }));
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [dispatch, hasMore, loading, pagination, search, subCategory, categoryName]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-sidebar border border-border-subtle hover:bg-brand/10 hover:border-brand hover:text-brand rounded-2xl transition-all active:scale-95 group"
          >
            <LuArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-main">
              {subCategory} <span className="text-brand/40 font-medium">Problems</span>
            </h1>
            <p className="text-text-muted text-sm font-medium">
              Explore specialized concepts within {categoryName}
            </p>
          </div>
        </div>
        
        <div className="relative group w-full md:w-80">
          <LuSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder={`Search ${subCategory}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-sidebar border border-border-subtle rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm text-text-main"
          />
        </div>
      </header>

      {problems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <ProblemCard key={problem._id} problem={problem} index={index} />
          ))}
        </div>
      ) : (
        !loading && <EmptyState onReset={() => setSearch("")} />
      )}

      {hasMore && (
        <div ref={observerRef} className="flex justify-center p-12">
          <LuLoader size={24} className="text-brand animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ProblemExplorer;
