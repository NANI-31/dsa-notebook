import React from "react";

interface SettingCardProps {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
  icon?: any;
  accentColor?: string;
}

export const SettingCard: React.FC<SettingCardProps> = ({
  title,
  description,
  active,
  onClick,
  icon: Icon,
  accentColor,
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col text-left p-6 rounded-3xl border-2 transition-all duration-500 group relative overflow-hidden ${
      active
        ? "border-brand bg-brand/5 shadow-2xl shadow-brand/10"
        : "border-border-subtle bg-black/5 hover:border-text-muted/30 hover:bg-black/10"
    }`}
  >
    <div className="flex items-center justify-between mb-6">
      <div
        className={`p-2.5 rounded-xl ${active ? "bg-brand text-white shadow-lg shadow-brand/20" : "bg-text-muted/10 text-text-muted transition-colors group-hover:bg-text-muted/20"}`}
      >
        {Icon ? (
          <Icon size={20} />
        ) : (
          <div
            className="w-5 h-5 rounded-full ring-2 ring-white/20"
            style={{
              backgroundColor: title === "Custom" ? accentColor : "",
            }}
          />
        )}
      </div>
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${active ? "border-brand bg-brand scale-110" : "border-border-subtle scale-100"}`}
      >
        {active && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
      </div>
    </div>
    <h3
      className={`font-black text-sm uppercase tracking-widest mb-2 transition-colors ${active ? "text-brand" : "text-text-main"}`}
    >
      {title}
    </h3>
    <p className="text-[10px] text-text-muted leading-relaxed font-bold uppercase tracking-tight opacity-60">
      {description}
    </p>
  </button>
);
