import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LuStar, LuPencil, LuTrash, LuClock, LuZap, LuTag, LuLoader, LuCheck, LuChevronDown } from 'react-icons/lu';

import { useProblemDetails } from '../../context/ProblemDetailsContext';
import { deleteProblem } from '../../features/problems/problemsSlice';
import { addToast } from '../../features/ui/uiSlice';
import type { AppDispatch } from '../../app/store';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal';

const ProblemHeader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { 
    problem, 
    saving, 
    isSaved, 
    onSync 
  } = useProblemDetails();

  const [complexityOpen, setComplexityOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!problem || !problem.slug) return;
    try {
      const action = await dispatch(deleteProblem(problem.slug));
      if (deleteProblem.fulfilled.match(action)) {
        dispatch(
          addToast({
            message: `Problem "${problem.title}" deleted successfully!`,
            type: "success",
            duration: 3000,
          })
        );
        navigate("/problems");
      }
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Failed to delete problem",
          type: "error",
          duration: 3000,
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Badges and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
              problem.difficulty === "Easy"
                ? "bg-accent-easy/10 text-accent-easy border border-accent-easy/20"
                : problem.difficulty === "Medium"
                  ? "bg-accent-medium/10 text-accent-medium border border-accent-medium/20"
                  : "bg-accent-hard/10 text-accent-hard border border-accent-hard/20"
            }`}
          >
            {problem.difficulty}
          </span>
          <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">
            {problem.categories?.[0] || "Uncategorized"}
          </span>
          <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">
            Refined Logic
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl shadow-lg active:scale-95 transition-all">
            <LuStar size={18} fill="currentColor" />
          </button>
          <Link
            to={`/problems/${problem.slug}/edit`}
            className="p-2.5 bg-white/5 border border-white/5 text-text-muted hover:text-text-main rounded-xl transition-all active:scale-95"
          >
            <LuPencil size={18} />
          </Link>
          <button
            onClick={handleDeleteClick}
            className="p-2.5 bg-white/5 border border-white/5 text-text-muted hover:text-red-500 rounded-xl transition-all active:scale-95"
            title="Delete Problem"
          >
            <LuTrash size={18} />
          </button>
        </div>
      </div>

      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 group">
        <h1 className="text-fluid-h1 font-black text-text-main tracking-tight leading-tight">
          {problem.title}
        </h1>
        <button
          onClick={onSync}
          disabled={saving}
          className={`text-[9px] px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all shrink-0 w-fit ${
            isSaved
              ? "border-green-500/20 text-green-500"
              : "border-brand/20 text-brand"
          } opacity-100 sm:opacity-0 sm:group-hover:opacity-100`}
        >
          {saving ? (
            <LuLoader size={10} className="animate-spin" />
          ) : (
            <LuCheck size={10} />
          )}
          {saving ? "Syncing..." : "Sync Changes"}
        </button>
      </div>

      {/* Complexity Card - Expandable Ribbon */}
      <div className="bg-sidebar/40 border border-white/15 rounded-2xl shadow-sm overflow-hidden transition-all duration-500">
        <button
          onClick={() => setComplexityOpen(!complexityOpen)}
          className="w-full p-4 flex flex-wrap items-center gap-y-4 gap-x-8 md:gap-12 cursor-pointer hover:bg-white/2 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <LuClock className="text-brand/60" size={16} />
            <span className="text-text-muted">
              Time:{" "}
              <span className="text-text-main font-bold lowercase ml-0.5">
                {problem.timeComplexity || "O(n)"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LuZap className="text-brand/60" size={16} />
            <span className="text-text-muted">
              Space:{" "}
              <span className="text-text-main font-bold lowercase ml-0.5">
                {problem.spaceComplexity || "O(1)"}
              </span>
            </span>
          </div>

          {/* Expand/Collapse Chevron (moved before Techniques for perfect mobile alignment) */}
          <div className="ml-auto md:order-last flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/40 hidden sm:inline">
              {complexityOpen ? "Collapse" : "Analysis"}
            </span>
            <LuChevronDown
              size={16}
              className={`text-text-muted/40 transition-transform duration-300 ${
                complexityOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Techniques (wraps beautifully below on mobile) */}
          <div className="flex items-center gap-4 border-t border-white/5 pt-4 w-full md:w-auto md:border-t-0 md:pt-0 md:border-l md:border-white/5 md:pl-12">
            <LuTag className="text-brand/60" size={16} />
            <div className="flex flex-wrap gap-2">
              {problem.techniques?.map((tech: any) => (
                <span
                  key={tech._id}
                  className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest rounded-lg text-text-muted/80 hover:bg-brand/5 hover:text-brand transition-all"
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        </button>

        {/* Expandable Analysis Content */}
        <div
          className={`grid transition-all duration-500 ease-in-out ${
            complexityOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-5 pt-1 border-t border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Time Complexity Analysis */}
                <div className="p-5 bg-white/3 border border-white/5 rounded-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-sky-500/10">
                      <LuClock size={14} className="text-sky-400" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-main">
                      Time Complexity —{" "}
                      <span className="text-brand lowercase">
                        {problem.timeComplexity || "O(n)"}
                      </span>
                    </h3>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {problem.timeComplexityAnalysis ||
                      "No time complexity analysis provided. Edit this problem to add a detailed breakdown."}
                  </p>
                </div>

                {/* Space Complexity Analysis */}
                <div className="p-5 bg-white/3 border border-white/5 rounded-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10">
                      <LuZap size={14} className="text-emerald-400" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-main">
                      Space Complexity —{" "}
                      <span className="text-brand lowercase">
                        {problem.spaceComplexity || "O(1)"}
                      </span>
                    </h3>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {problem.spaceComplexityAnalysis ||
                      "No space complexity analysis provided. Edit this problem to add a detailed breakdown."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium custom confirmation modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        problemTitle={problem.title}
        itemType="file"
      />
    </div>
  );
};

export default ProblemHeader;
