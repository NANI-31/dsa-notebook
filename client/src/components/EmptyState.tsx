import React from 'react';
import { LuSearchX, LuRotateCcw } from 'react-icons/lu';

interface EmptyStateProps {
  onReset: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-brand/10 p-6 rounded-full text-brand mb-6 shadow-xl shadow-brand/5 border border-brand/20">
        <LuSearchX size={48} strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-bold text-text-main mb-2">No problems found</h3>
      <p className="text-text-muted max-w-sm mb-8">
        We couldn't find any problems matching your current search and filter criteria. Try adjusting your filters.
      </p>
      <button
        onClick={onReset}
        className="flex items-center gap-2 bg-text-main/5 hover:bg-text-main/10 text-text-main border border-border-subtle px-6 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
      >
        <LuRotateCcw size={18} />
        Reset all filters
      </button>
    </div>
  );
};

export default EmptyState;
