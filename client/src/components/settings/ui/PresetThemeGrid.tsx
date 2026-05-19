import React from "react";
import { LuPalette } from "react-icons/lu";

interface PresetTheme {
  id: "default" | "cyberpunk" | "dracula" | "frost";
  name: string;
  desc: string;
  colors: string[];
}

interface PresetThemeGridProps {
  activeTheme: "default" | "cyberpunk" | "dracula" | "frost";
  onThemeSelect: (themeId: "default" | "cyberpunk" | "dracula" | "frost") => void;
}

export const PRESET_THEMES: PresetTheme[] = [
  {
    id: "default",
    name: "Midnight Onyx",
    desc: "Deep indigo visual identity with standard, polished status registers.",
    colors: ["#6366f1", "#10b981", "#f59e0b", "#ef4444"]
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Glow",
    desc: "High-energy hot rose brand with neon cyan, amber, and hot pink difficulty indicators.",
    colors: ["#f43f5e", "#00ffff", "#f59e0b", "#ec4899"]
  },
  {
    id: "dracula",
    name: "Dracula Night",
    desc: "Electric gothic purple brand with neon lime, pastel orange, and soft red accents.",
    colors: ["#bd93f9", "#50fa7b", "#ffb86c", "#ff5555"]
  },
  {
    id: "frost",
    name: "Glassmorphic Frost",
    desc: "Glacier ice-blue brand with polar mint, arctic gold, and coral pink indicators.",
    colors: ["#38bdf8", "#10b981", "#f59e0b", "#f43f5e"]
  }
];

export const PresetThemeGrid: React.FC<PresetThemeGridProps> = ({
  activeTheme,
  onThemeSelect,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-brand/10 p-2.5 rounded-xl text-brand">
            <LuPalette size={22} />
          </div>
          <h2 className="text-xl font-black text-text-main tracking-tight uppercase text-[10px]">
            Premium Accent Preset Themes
          </h2>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed font-bold uppercase tracking-tight opacity-60">
          Select high-fidelity coordinate-bound accent theme profiles with harmonized status badges and animations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {PRESET_THEMES.map((preset) => {
          const isActive = (activeTheme || "default") === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onThemeSelect(preset.id)}
              className={`flex flex-col text-left p-6 rounded-3xl border-2 transition-all duration-500 hover:scale-[1.02] cursor-pointer group relative overflow-hidden ${
                isActive
                  ? "border-brand bg-brand/5 shadow-lg shadow-brand/5 ring-4 ring-brand/10"
                  : "border-border-subtle bg-black/5 hover:border-text-muted/30"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-sm uppercase tracking-widest text-text-main group-hover:text-brand transition-colors">
                  {preset.name}
                </h3>
                <div className="flex gap-1">
                  {preset.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full border border-black/20 shadow-sm"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed font-bold uppercase tracking-tight opacity-75 mt-auto">
                {preset.desc}
              </p>
              {isActive && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
