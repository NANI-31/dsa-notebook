import React from "react";
import { LuLoader } from "react-icons/lu";
import { useProblemForm } from "../../context/ProblemFormContext";

// --- SharedFormHeader.tsx ---
interface SharedFormHeaderProps {
  title: string;
  subtitle: string;
  actionLabel: string;
  actionIcon: React.ElementType;
  onAction: () => void;
  isDisabled?: boolean;
}

export const SharedFormHeader: React.FC<SharedFormHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  actionIcon: Icon,
  onAction,
  isDisabled,
}) => {
  const { formData, saving } = useProblemForm();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tighter leading-tight">
          {title}
        </h1>
        <p className="text-text-muted text-sm font-medium opacity-60">
          {subtitle}
        </p>
      </div>
      <button
        onClick={onAction}
        disabled={saving || !formData.title || isDisabled}
        className="flex items-center justify-center gap-3 bg-brand text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-brand/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
      >
        {saving ? (
          <LuLoader size={20} className="animate-spin" />
        ) : (
          <Icon size={20} />
        )}
        <span>{saving ? "Persisting..." : actionLabel}</span>
      </button>
    </div>
  );
};
