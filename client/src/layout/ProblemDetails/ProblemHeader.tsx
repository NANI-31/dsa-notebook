import React from 'react';
import { Link } from 'react-router-dom';
import { LuStar, LuPencil, LuTrash, LuClock, LuZap, LuTag, LuLoader, LuCheck } from 'react-icons/lu';

import { useProblemDetails } from '../../context/ProblemDetailsContext';

const ProblemHeader: React.FC = () => {
  const { 
    problem, 
    saving, 
    isSaved, 
    onSync 
  } = useProblemDetails();
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
          <button className="p-2.5 bg-white/5 border border-white/5 text-text-muted hover:text-red-500 rounded-xl transition-all active:scale-95">
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

      {/* Complexity Card - Slim Horizontal Ribbon */}
      <div className="bg-sidebar/40 border border-white/15 rounded-2xl p-4 flex flex-wrap items-center gap-8 md:gap-12 shadow-sm">
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
      </div>
    </div>
  );
};

export default ProblemHeader;
