import React from "react";

interface SyncBadgeProps {
  syncStatus: "synced" | "syncing" | "offline" | "error";
  isOnline: boolean;
}

export const SyncBadge: React.FC<SyncBadgeProps> = ({ syncStatus, isOnline }) => {
  let iconColor = "bg-green-500 shadow-green-500/20";
  let textColor = "text-green-500 border-green-500/20";
  let label = "Synced with Cloud";
  let pulse = "";

  if (syncStatus === "syncing") {
    iconColor = "bg-amber-500 shadow-amber-500/20";
    textColor = "text-amber-500 border-amber-500/20";
    label = "Saving changes...";
    pulse = "animate-ping";
  } else if (syncStatus === "offline" || !isOnline) {
    iconColor = "bg-gray-400 shadow-gray-400/20";
    textColor = "text-gray-400 border-gray-400/20";
    label = "Offline (Saved locally)";
  } else if (syncStatus === "error") {
    iconColor = "bg-rose-500 shadow-rose-500/20";
    textColor = "text-rose-500 border-rose-500/20";
    label = "Sync Error (Retrying)";
    pulse = "animate-bounce";
  }

  return (
    <div className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-sidebar/50 border ${textColor} shadow-xl backdrop-blur-xl transition-all duration-300 w-fit select-none`}>
      <div className="relative flex h-2 w-2">
        {pulse && <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${iconColor} ${pulse}`}></span>}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${iconColor}`}></span>
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest font-mono`}>
        {label}
      </span>
    </div>
  );
};
