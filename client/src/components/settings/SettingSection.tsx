import React from "react";

interface SettingSectionProps {
  title: string;
  icon: any;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  icon: Icon,
  children,
  fullWidth = false,
}) => (
  <section className="bg-sidebar/30 backdrop-blur-xl border border-border-subtle rounded-3xl p-6 md:p-10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center gap-3 mb-8">
      <div className="bg-brand/10 p-2.5 rounded-xl text-brand">
        <Icon size={22} />
      </div>
      <h2 className="text-xl font-black text-text-main tracking-tight uppercase text-[10px]">
        {title}
      </h2>
    </div>
    <div
      className={
        fullWidth
          ? "w-full"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      }
    >
      {children}
    </div>
  </section>
);
