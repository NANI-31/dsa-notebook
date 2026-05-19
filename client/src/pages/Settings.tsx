import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { SyncBadge } from "../components/settings/SyncBadge";
import { InterfaceSettings } from "../components/settings/InterfaceSettings";
import { TaxonomySettings } from "../components/settings/TaxonomySettings";
import { SettingsProvider } from "../context/SettingsContext";
import { SettingsTabNavigation } from "../components/settings/ui/SettingsTabNavigation";
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

      <SettingsTabNavigation activeTab={activeTab} onTabSelect={setActiveTab} />

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
