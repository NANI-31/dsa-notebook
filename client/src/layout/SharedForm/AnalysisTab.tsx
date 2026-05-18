import React from "react";
import { LuEye, LuPenLine, LuStickyNote } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useProblemForm } from "../../context/ProblemFormContext";

// --- SharedAnalysisTab.tsx ---
export const SharedAnalysisTab: React.FC = () => {
  const { formData, setFormData, showNotesPreview, setShowNotesPreview } =
    useProblemForm();

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-sidebar border border-border-subtle rounded-3xl p-6 md:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-brand/10 p-3 rounded-2xl text-brand">
              <LuStickyNote size={24} />
            </div>
            <h2 className="text-2xl font-black text-text-main tracking-tight">
              Technical Repository
            </h2>
          </div>
          <button
            onClick={() => setShowNotesPreview(!showNotesPreview)}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-brand/5 text-brand rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand/10 transition-all border border-brand/10"
          >
            {showNotesPreview ? <LuPenLine size={16} /> : <LuEye size={16} />}
            <span>
              {showNotesPreview ? "Edit Repository" : "View Rendered"}
            </span>
          </button>
        </div>

        {showNotesPreview ? (
          <div className="w-full bg-app-bg border border-border-subtle rounded-3xl px-8 py-10 min-h-[500px] prose prose-invert prose-brand max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {formData.notes || "*Repository is currently empty...*"}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            rows={20}
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="w-full bg-app-bg border border-border-subtle rounded-3xl px-8 py-8 text-text-main focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all font-bold resize-none min-h-[500px] leading-relaxed"
          />
        )}
      </div>
    </div>
  );
};
