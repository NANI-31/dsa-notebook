import React from "react";
import { LuLayoutDashboard, LuCode, LuStickyNote } from "react-icons/lu";
import { useProblemForm } from "../../context/ProblemFormContext";

// --- SharedFormTabs.tsx ---
export const SharedFormTabs: React.FC = () => {
  const { activeTab, setActiveTab } = useProblemForm();

  const TabButton = ({
    id,
    label,
    icon: Icon,
  }: {
    id: "details" | "code" | "notes";
    label: string;
    icon: any;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center justify-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative flex-1 sm:flex-none ${
        activeTab === id ? "text-brand" : "text-text-muted hover:text-text-main"
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
      {activeTab === id && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand animate-in fade-in slide-in-from-bottom-1 duration-300" />
      )}
    </button>
  );

  return (
    <div className="flex border-b border-border-subtle mb-10 overflow-x-auto no-scrollbar scroll-smooth">
      <TabButton id="details" label="Context" icon={LuLayoutDashboard} />
      <TabButton id="code" label="Implem" icon={LuCode} />
      <TabButton id="notes" label="Analysis" icon={LuStickyNote} />
    </div>
  );
};
