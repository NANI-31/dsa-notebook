import React from "react";
import { Link } from "react-router-dom";
import { LuStar, LuClock, LuZap } from "react-icons/lu";
import type { Problem } from "../types/problem";

interface ProblemCardProps {
  problem: Problem;
  index: number;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, index }) => {
  return (
    <Link
      to={`/problems/${problem.slug}`}
      className="bg-sidebar border border-border-subtle p-card-padding rounded-3xl shadow-sm hover:border-brand/40 transition-all hover:translate-y-[-4px] group flex flex-col justify-between h-full animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ animationDelay: `${(index % 12) * 50}ms` }}
    >
      <div>
        <div className="flex justify-between items-start mb-6 gap-3">
          <div className="flex flex-wrap gap-2 min-w-0">
            <span
              className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest shrink-0 ${
                problem.difficulty === "Easy"
                  ? "bg-accent-easy/10 text-accent-easy border border-accent-easy/20"
                  : problem.difficulty === "Medium"
                    ? "bg-accent-medium/10 text-accent-medium border border-accent-medium/20"
                    : "bg-accent-hard/10 text-accent-hard border border-accent-hard/20"
              }`}
            >
              {problem.difficulty}
            </span>
            {problem.categories && problem.categories.length > 0 && (
              <span className="text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest bg-border-subtle/30 text-text-muted border border-border-subtle truncate max-w-[120px]" title={problem.categories[0]}>
                {problem.categories[0]}
              </span>
            )}
          </div>
          <button
            className={`transition-all duration-500 shrink-0 ${problem.starred ? "text-yellow-400 scale-125" : "text-text-muted hover:text-yellow-400 hover:scale-125"}`}
            onClick={(e) => e.preventDefault()} // Avoid navigation when starring
          >
            <LuStar
              size={18}
              fill={problem.starred ? "currentColor" : "none"}
            />
          </button>
        </div>

        <h3 className="font-extrabold text-lg sm:text-xl mb-4 leading-tight text-text-main group-hover:text-brand transition-colors tracking-tight line-clamp-2">
          {problem.title}
        </h3>

        <div className="flex flex-wrap gap-1.5 mb-8">
          {(problem.techniques || []).slice(0, 3).map((tech) => (
            <span
              key={tech._id}
              className="text-[9px] px-2 py-1 rounded-lg bg-text-main/5 text-text-muted font-bold uppercase tracking-tighter truncate max-w-[100px]"
              title={tech.name}
            >
              {tech.name}
            </span>
          ))}
          {problem.techniques && problem.techniques.length > 3 && (
            <span className="text-[9px] px-2 py-1 rounded-lg bg-brand/5 text-brand font-bold shrink-0">
              +{problem.techniques.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border-subtle/30 pt-5 text-[10px] font-bold uppercase tracking-widest text-text-muted/60">
        <div className="flex items-center gap-2">
          <LuClock size={12} className="text-brand/40 shrink-0" />
          <span>{problem.timeComplexity}</span>
        </div>
        <div className="flex items-center gap-2">
          <LuZap size={12} className="text-brand/40 shrink-0" />
          <span>{problem.spaceComplexity}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProblemCard;
