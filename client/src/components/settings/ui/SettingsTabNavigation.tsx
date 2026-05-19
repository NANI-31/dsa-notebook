import React from "react";
import { LuPalette, LuDatabase, LuLayers } from "react-icons/lu";

interface Tab {
  id: "general" | "data" | "taxonomy";
  label: string;
  icon: any;
}

interface SettingsTabNavigationProps {
  activeTab: "general" | "data" | "taxonomy";
  onTabSelect: (tab: "general" | "data" | "taxonomy") => void;
}

const TABS: Tab[] = [
  { id: "general", label: "Interface", icon: LuPalette },
  { id: "data", label: "Core Data", icon: LuDatabase },
  { id: "taxonomy", label: "Taxonomy Insights", icon: LuLayers }
];

export const SettingsTabNavigation: React.FC<SettingsTabNavigationProps> = ({
  activeTab,
  onTabSelect
}) => {
  return (
    <div className="flex items-center gap-2 mb-12 p-2 bg-sidebar/50 backdrop-blur-3xl rounded-3xl w-full sm:w-fit border border-border-subtle shadow-2xl">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isActive
                ? "bg-brand text-white shadow-xl shadow-brand/30 scale-[1.02]"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
