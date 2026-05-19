import React from "react";
import { LuMonitor } from "react-icons/lu";

interface Accent {
  name: string;
  color: string;
}

interface AccentOverrideGridProps {
  activeAccent: string;
  activeTheme: string;
  accents: Accent[];
  onAccentSelect: (accentColor: string) => void;
}

export const AccentOverrideGrid: React.FC<AccentOverrideGridProps> = ({
  activeAccent,
  activeTheme,
  accents,
  onAccentSelect,
}) => {
  return (
    <div className="pt-6 border-t border-border-subtle/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-brand/10 p-2.5 rounded-xl text-brand">
          <LuMonitor size={20} />
        </div>
        <h3 className="text-sm font-black text-text-main tracking-tight uppercase text-[9px]">
          Individual Accent Manual Override
        </h3>
      </div>
      <div className="flex flex-wrap gap-5">
        {accents.map((accent) => {
          const isSelected = activeAccent === accent.color && (activeTheme === "default" || !activeTheme);
          return (
            <button
              key={accent.name}
              onClick={() => onAccentSelect(accent.color)}
              className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 ${
                isSelected
                  ? "ring-4 ring-brand/30 scale-110 shadow-2xl"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: accent.color }}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-0"}`}
              />
              <span className="absolute -bottom-10 text-[9px] font-black uppercase tracking-[0.2em] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {accent.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
