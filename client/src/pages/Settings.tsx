import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { LuPalette, LuDatabase, LuLayers } from "react-icons/lu";
import { SyncBadge } from "../components/settings/SyncBadge";
import { InterfaceSettings } from "../components/settings/InterfaceSettings";
import { TaxonomySettings } from "../components/settings/TaxonomySettings";
import { SettingsProvider } from "../context/SettingsContext";
import TaxonomyExplorer from "./TaxonomyExplorer";

const SettingsContent: React.FC = () => {
  const { isOnline, syncStatus } = useSelector((state: RootState) => state.settings);
  const [activeTab, setActiveTab] = useState<"general" | "data" | "taxonomy">("general");

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-border-subtle/50 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tighter leading-tight">
            System Preferences
          </h1>
          <p className="text-text-muted font-medium opacity-60 max-w-xl">
            Configure global environment parameters and architectural taxonomy.
          </p>
        </div>
        <SyncBadge syncStatus={syncStatus} isOnline={isOnline} />
      </header>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-12 p-2 bg-sidebar/50 backdrop-blur-3xl rounded-3xl w-full sm:w-fit border border-border-subtle shadow-2xl">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "general" ? "bg-brand text-white shadow-xl shadow-brand/30 scale-[1.02]" : "text-text-muted hover:text-text-main"}`}
        >
          <LuPalette size={18} />
          <span>Interface</span>
        </button>
        <button
          onClick={() => setActiveTab("data")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "data" ? "bg-brand text-white shadow-xl shadow-brand/30 scale-[1.02]" : "text-text-muted hover:text-text-main"}`}
        >
          <LuDatabase size={18} />
          <span>Core Data</span>
        </button>
        <button
          onClick={() => setActiveTab("taxonomy")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "taxonomy" ? "bg-brand text-white shadow-xl shadow-brand/30 scale-[1.02]" : "text-text-muted hover:text-text-main"}`}
        >
          <LuLayers size={18} />
          <span>Taxonomy Insights</span>
        </button>
      </div>

      <div className="min-h-[600px]">
        {activeTab === "general" ? (
          <InterfaceSettings />
        ) : activeTab === "data" ? (
          <TaxonomySettings />
        ) : (
          <TaxonomyExplorer />
        )}
      </div>

      <footer className="mt-20 text-center border-t border-border-subtle/20 pt-10">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-text-muted/20">
          State synchronized with cloud database latency &lt; 200ms
        </p>
      </footer>
    </div>
  );
};

const Settings: React.FC = () => {
  return (
    <SettingsProvider>
      <SettingsContent />
    </SettingsProvider>
  );
};

export default Settings;
