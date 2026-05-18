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
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
              problem.difficulty === "Easy"
                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                : problem.difficulty === "Medium"
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
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
      <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tight leading-none group flex items-center gap-4">
        {problem.title}
        <button
          onClick={onSync}
          disabled={saving}
          className={`text-[9px] px-3 py-1 rounded-lg border flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100 italic ${
            isSaved
              ? "border-green-500/20 text-green-500"
              : "border-brand/20 text-brand"
          }`}
        >
          {saving ? (
            <LuLoader size={10} className="animate-spin" />
          ) : (
            <LuCheck size={10} />
          )}
          {saving ? "Syncing..." : "Sync Changes"}
        </button>
      </h1>

      {/* Complexity Card - Expandable Ribbon */}
      <div className="bg-sidebar/40 border border-white/15 rounded-2xl shadow-sm overflow-hidden transition-all duration-500">
        {/* Clickable Header Row — keep original UI untouched */}
        <button
          onClick={() => setComplexityOpen(!complexityOpen)}
          className="w-full p-4 flex flex-wrap items-center gap-8 md:gap-12 cursor-pointer hover:bg-white/2 transition-all duration-300"
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
          <div className="flex items-center gap-4 border-l border-white/5 pl-8 md:pl-12">
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

          {/* Expand/Collapse Chevron */}
          <div className="ml-auto flex items-center gap-2">
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
      />
    </div>
  );
};

export default ProblemHeader;
