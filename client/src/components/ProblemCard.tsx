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
      className="bg-sidebar border border-border-subtle p-6 rounded-3xl shadow-sm hover:border-brand/40 transition-all hover:translate-y-[-4px] group flex flex-col justify-between h-full animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ animationDelay: `${(index % 12) * 50}ms` }}
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-wrap gap-2">
            <span
              className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${
                problem.difficulty === "Easy"
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : problem.difficulty === "Medium"
                    ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}
            >
              {problem.difficulty}
            </span>
            {problem.categories && problem.categories.length > 0 && (
              <span className="text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest bg-border-subtle/30 text-text-muted border border-border-subtle">
                {problem.categories[0]}
              </span>
            )}
          </div>
          <button
            className={`transition-all duration-500 ${problem.starred ? "text-yellow-400 scale-125" : "text-text-muted hover:text-yellow-400 hover:scale-125"}`}
            onClick={(e) => e.preventDefault()} // Avoid navigation when starring (need star logic later)
          >
            <LuStar
              size={18}
              fill={problem.starred ? "currentColor" : "none"}
            />
          </button>
        </div>

        <h3 className="font-extrabold text-xl mb-4 leading-tight text-text-main group-hover:text-brand transition-colors tracking-tight">
          {problem.title}
        </h3>

        <div className="flex flex-wrap gap-1.5 mb-8">
          {(problem.techniques || []).slice(0, 3).map((tech) => (
            <span
              key={tech._id}
              className="text-[9px] px-2 py-1 rounded-lg bg-text-main/5 text-text-muted font-bold uppercase tracking-tighter"
            >
              {tech.name}
            </span>
          ))}
          {problem.techniques && problem.techniques.length > 3 && (
            <span className="text-[9px] px-2 py-1 rounded-lg bg-brand/5 text-brand font-bold">
              +{problem.techniques.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-5 border-t border-border-subtle/30 pt-5 text-[10px] font-bold uppercase tracking-widest text-text-muted/60">
        <div className="flex items-center gap-2">
          <LuClock size={12} className="text-brand/40" />
          <span>{problem.timeComplexity}</span>
        </div>
        <div className="flex items-center gap-2">
          <LuZap size={12} className="text-brand/40" />
          <span>{problem.spaceComplexity}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProblemCard;
