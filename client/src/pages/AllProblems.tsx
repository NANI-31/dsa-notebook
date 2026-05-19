import React, { useState, useEffect } from "react";
import { LuPlus, LuLoader } from "react-icons/lu";
import { Link } from "react-router-dom";
import { List } from "react-window";
import EmptyState from "../components/EmptyState";
import ProblemCard from "../components/ProblemCard";
import FilterSection from "../components/catalog/FilterSection";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { fetchProblems } from "../features/problems/problemsSlice";
import type { ProblemFilters } from "../types/problem";

// Helper hook to track window width and height dynamically
const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
};

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
    const cats = params.get("categories");
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

  const { width, height } = useWindowSize();

  // Dynamic grid column configuration matching Tailwind layout breakpoints
  const cols = React.useMemo(() => {
    if (width < 640) return 1;
    if (width < 1024) return 2;
    if (width < 1536) return 3;
    return 4;
  }, [width]);

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

  const rowProps = React.useMemo(() => ({}), []);

  // Slice problem list array into dynamic row chunks
  const rows = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < problems.length; i += cols) {
      result.push(problems.slice(i, i + cols));
    }
    return result;
  }, [problems, cols]);

  // Virtual Row Renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    // If hasMore is active, show the scroll loader as the last virtual list item
    if (index === rows.length) {
      return (
        <div style={style} className="flex justify-center items-center py-6">
          <div className="flex items-center gap-3 text-brand/60">
            <div className="h-2 w-2 bg-brand rounded-full animate-bounce" />
            <div className="h-2 w-2 bg-brand rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="h-2 w-2 bg-brand rounded-full animate-bounce [animation-delay:0.4s]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] ml-2">
              {loading ? "Discovering more problems..." : "Scroll for more catalog"}
            </span>
          </div>
        </div>
      );
    }

    const rowItems = rows[index];

    return (
      <div style={style} className="flex gap-6 pb-6 pr-2">
        {rowItems.map((problem, subIndex) => (
          <div
            key={problem._id}
            className="flex-1 min-w-0"
            style={{ maxWidth: `calc((100% - ${(cols - 1) * 24}px) / ${cols})` }}
          >
            <ProblemCard problem={problem} index={index * cols + subIndex} />
          </div>
        ))}
        {/* Pad empty space in the last row to maintain grid alignment */}
        {rowItems.length < cols &&
          Array.from({ length: cols - rowItems.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1" />
          ))}
      </div>
    );
  };

  const totalRows = rows.length + (hasMore ? 1 : 0);
  const virtualListHeight = Math.max(400, height - 380);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-fluid-h1 font-extrabold tracking-tight text-text-main">
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
          className="w-full sm:w-auto bg-brand hover:opacity-90 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black shadow-xl shadow-brand/20 transition-all active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <LuPlus size={20} />
          <span>New Problem</span>
        </Link>
      </div>

      {/* Extracted Modular Filter Section */}
      <FilterSection
        search={search}
        onSearchChange={setSearch}
        selectedSubCategories={selectedSubCategories}
        onSubCategoriesChange={setSelectedSubCategories}
        selectedDifficulties={selectedDifficulties}
        onDifficultiesChange={setSelectedDifficulties}
        selectedTechniques={selectedTechniques}
        onTechniquesChange={setSelectedTechniques}
        subCategoriesOptions={subCategoriesOptions}
        difficultyOptions={difficultyOptions}
        techniquesOptions={techniquesOptions}
        resetFilters={resetFilters}
        isFilterActive={isFilterActive}
      />

      {/* Virtualized Infinite Scroll Listing Area */}
      {problems.length > 0 ? (
        <div className="w-full">
          <List<{}>
            rowCount={totalRows}
            rowHeight={340}
            rowComponent={Row}
            rowProps={rowProps}
            className="custom-scrollbar"
            onRowsRendered={({ stopIndex }) => {
              // Trigger fetching of next paginated page when nearing list end
              if (stopIndex >= totalRows - 2 && hasMore && !loading) {
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
            }}
            style={{ height: virtualListHeight }}
          />
        </div>
      ) : (
        !loading && <EmptyState onReset={resetFilters} />
      )}
    </div>
  );
};

export default AllProblems;
