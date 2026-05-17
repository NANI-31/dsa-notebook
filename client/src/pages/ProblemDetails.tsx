import React from "react";
import { Link, useParams } from "react-router-dom";
import { LuChevronRight, LuLoader, LuCode } from "react-icons/lu";

// Component Layouts
import ProblemHeader from "../layout/ProblemDetails/ProblemHeader";
import ProblemDescription from "../layout/ProblemDetails/ProblemDescription";
import CodeWorkspace from "../layout/ProblemDetails/CodeWorkspace";
import ProblemExplanations from "../layout/ProblemDetails/ProblemExplanations";
import ProblemFooter from "../layout/ProblemDetails/ProblemFooter";

// Context
import { ProblemDetailsProvider, useProblemDetails } from "../context/ProblemDetailsContext";

const ProblemDetailsContent: React.FC = () => {
  const { problem, loading, error } = useProblemDetails();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LuLoader size={40} className="animate-spin text-brand" />
        <p className="text-text-muted font-bold tracking-widest uppercase text-[10px] animate-pulse">
          Decrypting problem data...
        </p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-in fade-in duration-700">
        <div className="bg-red-500/10 p-8 rounded-full text-red-500 border border-red-500/10">
          <LuCode size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-text-main mb-2 tracking-tight">
            Problem Not Found
          </h2>
          <p className="text-text-muted max-w-sm mx-auto font-medium">
            {error || "The problem you are looking for does not exist or has been moved."}
          </p>
        </div>
        <Link
          to="/problems"
          className="bg-brand text-white px-8 py-3 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand/20"
        >
          Return to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 min-h-screen pb-32">
      {/* breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-10 overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link to="/problems" className="hover:text-brand transition-colors">
          Library
        </Link>
        <LuChevronRight size={12} className="opacity-40" />
        <span className="text-text-main/60">{problem.title}</span>
      </div>

      <div className="flex flex-col gap-8">
        <ProblemHeader />
        <ProblemDescription />
        <CodeWorkspace />
        <ProblemExplanations />
        <ProblemFooter />
      </div>
    </div>
  );
};

const ProblemDetails: React.FC = () => {
  const { id } = useParams();
  
  return (
    <ProblemDetailsProvider slug={id}>
      <ProblemDetailsContent />
    </ProblemDetailsProvider>
  );
};

export default ProblemDetails;
