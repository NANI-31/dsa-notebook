import React, { useState, useRef, useEffect } from "react";
import { LuChevronDown, LuCheck, LuX } from "react-icons/lu";

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    const isSelected = selected.includes(option);
    if (isSelected) {
      onChange(selected.filter((i) => i !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-app-bg border border-border-subtle rounded-xl py-2.5 px-4 text-sm font-medium transition-all hover:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20 ${
          selected.length > 0
            ? "border-brand text-brand bg-brand/5"
            : "text-text-main"
        }`}
      >
        <span className="truncate">
          {selected.length === 0 ? label : `${selected.length} Selected`}
        </span>
        <LuChevronDown
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          size={16}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-sidebar border border-border-subtle rounded-xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
            {options.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    isSelected
                      ? "bg-brand/10 text-brand font-bold"
                      : "hover:bg-text-main/5 text-text-muted hover:text-text-main"
                  }`}
                >
                  <span className="truncate">{option}</span>
                  {isSelected && <LuCheck size={14} className="shrink-0" />}
                </button>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border-subtle">
              <button
                onClick={() => onChange([])}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LuX size={12} />
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
