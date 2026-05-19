import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  LuWand,
  LuX,
  LuZap,
  LuFlame,
  LuLightbulb,
  LuCopy,
  LuLoader,
  LuCpu,
  LuCheck
} from "react-icons/lu";
import type { RootState } from "../app/store";
import {
  streamAIReview,
  streamAIHint,
  setAIActiveTab,
  initializeAIForProblem
} from "../features/ai/aiSlice";

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  problemTitle: string;
  problemDescription: string;
  code: string;
  language: string;
  onApplyCode?: (code: string) => void;
  problemId: string;
}

const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  problemTitle,
  problemDescription,
  code,
  language,
  onApplyCode,
  problemId,
}) => {
  const dispatch = useDispatch<any>();
  const aiState = useSelector((state: RootState) => state.ai);

  // Initialize slice when active problemId changes
  React.useEffect(() => {
    if (isOpen && problemId) {
      dispatch(initializeAIForProblem(problemId));
    }
  }, [isOpen, problemId, dispatch]);

  const activeTab = aiState.activeTab;
  const loading = aiState.loading;
  const error = aiState.error;
  const review = aiState.review;
  const hints = aiState.hints;
  const hintCount = aiState.hintCount;

  const [copiedReviewCode, setCopiedReviewCode] = React.useState(false);

  if (!isOpen) return null;

  const handleReview = () => {
    dispatch(streamAIReview(problemId, problemTitle, problemDescription, code, language));
  };

  const handleGetHint = () => {
    dispatch(streamAIHint(problemId, problemTitle, problemDescription, code, language, hintCount));
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReviewCode(true);
    setTimeout(() => setCopiedReviewCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans transition-all duration-300">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#000]/60 backdrop-blur-sm animate-in fade-in duration-300"
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-2xl h-screen bg-[#0d0e14] border-l border-white/5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500 ease-out z-10 overflow-hidden">
        {/* Decorative Glowing Orb in Background */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-brand to-indigo-500 p-2.5 rounded-xl text-white shadow-lg shadow-brand/20 animate-pulse">
              <LuWand size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-text-main">
                Gemini Workspace Assistant
              </h2>
              <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest mt-0.5">
                Google Generative AI Streamer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 border border-transparent hover:border-white/5 text-text-muted hover:text-text-main rounded-xl transition-all"
          >
            <LuX size={20} />
          </button>
        </div>

        {/* Workspace Tab bar */}
        <div className="flex px-8 py-4 bg-white/5 border-b border-white/5 gap-2">
          <button
            onClick={() => dispatch(setAIActiveTab("review"))}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
              activeTab === "review"
                ? "bg-brand border-brand text-white shadow-xl shadow-brand/15"
                : "bg-transparent border-white/5 text-text-muted hover:text-text-main hover:bg-white/5"
            }`}
          >
            <LuCpu size={14} />
            Code Review
          </button>
          <button
            onClick={() => dispatch(setAIActiveTab("hint"))}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
              activeTab === "hint"
                ? "bg-brand border-brand text-white shadow-xl shadow-brand/15"
                : "bg-transparent border-white/5 text-text-muted hover:text-text-main hover:bg-white/5"
            }`}
          >
            <LuLightbulb size={14} />
            Tutor Hints ({hintCount})
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium flex items-center gap-2 animate-in fade-in duration-300">
              <LuX size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === "review" ? (
            <div className="space-y-6">
              {review ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Complexity Block */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                      <LuZap size={14} />
                      <span>Complexity Matrix</span>
                    </div>
                    <div className="text-lg font-black font-mono text-text-main whitespace-pre-line leading-relaxed">
                      {review.complexity}
                    </div>
                  </div>

                  {/* Correctness & Bugs */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      <LuCheck size={14} />
                      <span>Correctness & Edge Cases</span>
                    </div>
                    <p className="text-xs font-semibold text-text-muted/90 leading-relaxed whitespace-pre-line">
                      {review.correctness}
                    </p>
                  </div>

                  {/* Refactoring suggestions */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand">
                      <LuFlame size={14} />
                      <span>Optimizations & Structure</span>
                    </div>
                    <p className="text-xs font-semibold text-text-muted/90 leading-relaxed whitespace-pre-line">
                      {review.optimizations}
                    </p>
                  </div>

                  {/* Code Solution Alternates */}
                  <div className="p-6 rounded-2xl bg-[#08090d] border border-white/5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                        <LuCpu size={14} />
                        <span>Optimized Alternative ({language})</span>
                      </div>
                      <div className="flex gap-2">
                        {onApplyCode && (
                          <button
                            onClick={() => onApplyCode(review.alternativeCode)}
                            disabled={loading || !review.alternativeCode || review.alternativeCode.includes("compiling")}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-brand/10 border border-brand text-brand hover:bg-brand hover:text-white transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <LuZap size={12} />
                            Apply to Editor
                          </button>
                        )}
                        <button
                          onClick={() => handleCopyCode(review.alternativeCode)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                            copiedReviewCode
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                              : "bg-white/5 border-white/5 text-text-muted hover:text-text-main"
                          }`}
                        >
                          {copiedReviewCode ? <LuCheck size={12} /> : <LuCopy size={12} />}
                          {copiedReviewCode ? "Copied!" : "Copy Code"}
                        </button>
                      </div>
                    </div>
                    <pre className="p-5 bg-black/40 border border-white/5 rounded-xl text-xs font-mono text-cyan-300/90 overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar">
                      {review.alternativeCode}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-white/5 rounded-3xl min-h-[300px] gap-6">
                  <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/10">
                    <LuCpu size={32} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-text-main mb-1.5">
                      No Review Active
                    </h3>
                    <p className="text-[10px] font-bold text-text-muted max-w-xs leading-relaxed uppercase tracking-widest opacity-60">
                      Let Gemini analyze your current editor solution for complexity, unhandled edge cases, and optimizations.
                    </p>
                  </div>
                  <button
                    onClick={handleReview}
                    disabled={loading}
                    className="flex items-center gap-2 bg-brand hover:scale-105 active:scale-95 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50 transition-all"
                  >
                    {loading ? <LuLoader className="animate-spin" size={14} /> : <LuWand size={14} />}
                    Analyze Code
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {hints.length > 0 && (
                <div className="space-y-4">
                  {hints.map((hint, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white/5 border border-white/5 flex gap-4 animate-in slide-in-from-bottom-2 duration-300"
                    >
                      <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-brand/10 text-brand font-black text-xs animate-pulse">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand opacity-60 block mb-1">
                          Incremental hint #{idx + 1}
                        </span>
                        <p className="text-xs font-semibold text-text-main leading-relaxed whitespace-pre-line">
                          {hint}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center justify-center text-center p-8 bg-white/5 border border-white/5 rounded-3xl min-h-[220px] gap-6 mt-4">
                <div className="p-4 bg-brand/10 text-brand rounded-full border border-brand/10">
                  <LuLightbulb size={32} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-main mb-1.5">
                    Incremental Tutor Clues
                  </h3>
                  <p className="text-[10px] font-bold text-text-muted max-w-xs leading-relaxed uppercase tracking-widest opacity-60">
                    Stuck? Get bite-sized incremental hints designed to guide you toward the solution without spoiling the actual code.
                  </p>
                </div>
                <button
                  onClick={handleGetHint}
                  disabled={loading}
                  className="flex items-center gap-2 bg-brand hover:scale-105 active:scale-95 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50 transition-all"
                >
                  {loading ? <LuLoader className="animate-spin" size={14} /> : <LuLightbulb size={14} />}
                  {hintCount === 0 ? "Get First Hint" : "Get Next Hint"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantDrawer;
