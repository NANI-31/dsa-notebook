import React from 'react';

interface SectionHeaderProps {
  title: string;
  colorClass: string;
  children?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  colorClass,
  children,
}) => (
  <div className="flex items-center justify-between mb-8 group">
    <div className="flex items-center gap-4">
      <div
        className={`w-1.5 h-8 rounded-full ${colorClass} shadow-lg shadow-brand/20`}
      />
      <h2 className="text-fluid-h2 font-black text-text-main tracking-tight transition-all">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

export default SectionHeader;
