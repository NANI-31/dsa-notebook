import React, { useState } from "react";
import {
  LuCode,
  LuPlus,
  LuTrash2,
  LuType,
} from "react-icons/lu";
import CustomMonaco from "./CustomMonaco/index";
import { Select, MenuItem, FormControl } from "@mui/material";
import type { Solution } from "../types/problem";

interface SolutionEditorProps {
  variants: Solution[];
  onChange: (variants: Solution[]) => void;
}

const SolutionEditor: React.FC<SolutionEditorProps> = ({
  variants,
  onChange,
}) => {
  const [activeIndex, setactiveIndex] = useState(0);

  const addVariant = () => {
    const newVariant: Solution = {
      name: `Variant ${variants.length + 1}`,
      code: "",
      language: variants[activeIndex]?.language || "typescript",
    };
    onChange([...variants, newVariant]);
    setactiveIndex(variants.length);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    const nextVariants = variants.filter((_, i) => i !== index);
    onChange(nextVariants);
    setactiveIndex(Math.max(0, index - 1));
  };

  const updateVariant = (index: number, updates: Partial<Solution>) => {
    const nextVariants = variants.map((v, i) =>
      i === index ? { ...v, ...updates } : v,
    );
    onChange(nextVariants);
  };

  const activeVariant =
    variants && variants.length > 0
      ? variants[activeIndex] || variants[0]
      : null;

  if (!activeVariant) {
    return (
      <div className="flex flex-col items-center justify-center h-[700px] bg-sidebar border border-dashed border-border-subtle rounded-3xl gap-6">
        <div className="bg-brand/10 p-4 rounded-full text-brand animate-pulse">
          <LuCode size={32} />
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-black text-xl tracking-tight text-text-main">
            No Implementation Found
          </h3>
          <p className="text-text-muted text-xs font-medium max-w-xs mx-auto opacity-60">
            The solution registry for this problem is currently empty or has
            become unreadable.
          </p>
        </div>
        <button
          onClick={addVariant}
          className="flex items-center gap-3 bg-brand text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
        >
          <LuPlus size={18} />
          <span>Initialize Solution</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[700px] animate-in fade-in duration-500">
      {/* Sidebar - Variant List */}
      <div className="w-full lg:w-72 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2 mb-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic opacity-40">
            Solution Variants
          </h4>
          <button
            onClick={addVariant}
            className="p-2 bg-brand/10 text-brand rounded-lg hover:bg-brand hover:text-white transition-all shadow-lg shadow-brand/0 hover:shadow-brand/20"
            title="Add New Approach"
          >
            <LuPlus size={16} />
          </button>
        </div>

        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto no-scrollbar pb-4 lg:pb-0">
          {variants.map((v, i) => (
            <button
              key={i}
              onClick={() => setactiveIndex(i)}
              className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-all min-w-[180px] lg:min-w-0 group ${
                activeIndex === i
                  ? "bg-brand border-brand text-white shadow-xl shadow-brand/20"
                  : "bg-sidebar border-border-subtle text-text-muted hover:border-brand/40 hover:text-text-main"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <LuCode
                  size={18}
                  className={activeIndex === i ? "text-white" : "text-brand/40"}
                />
                <span className="text-xs font-bold truncate tracking-tight">
                  {v.name}
                </span>
              </div>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                {variants.length > 1 && (
                  <LuTrash2
                    size={14}
                    className="hover:text-red-400 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVariant(i);
                    }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Editor Area */}
      <div className="flex-1 bg-sidebar border border-border-subtle rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="relative">
              <LuType
                className="absolute left-0 top-1/2 -translate-y-1/2 text-brand/20"
                size={16}
              />
              <input
                type="text"
                value={activeVariant.name}
                onChange={(e) =>
                  updateVariant(activeIndex, { name: e.target.value })
                }
                placeholder="e.g. Optimized Hash Map"
                className="w-full bg-transparent pl-8 pr-4 py-2 text-text-main font-black tracking-tight text-xl focus:outline-none placeholder:opacity-10"
              />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-brand/40 to-transparent" />
            </div>
          </div>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={activeVariant.language}
              onChange={(e) =>
                updateVariant(activeIndex, {
                  language: e.target.value as string,
                })
              }
              sx={{
                backgroundColor: "var(--app-bg)",
                color: "var(--text-main)",
                fontSize: "10px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                borderRadius: "0.75rem",
                border: "1px solid var(--border-subtle)",
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "& .MuiSelect-icon": { color: "var(--text-muted)" },
                height: "42px",
              }}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      backgroundColor: "#1e1e1e",
                      color: "var(--text-main)",
                      border: "1px solid var(--border-subtle)",
                      "& .MuiMenuItem-root": {
                        fontSize: "10px",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        padding: "10px 20px",
                      },
                      "& .Mui-selected": {
                        backgroundColor: "var(--brand) !important",
                        color: "white",
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="python">Python 3</MenuItem>
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="typescript">TypeScript</MenuItem>
              <MenuItem value="java">Java 17</MenuItem>
              <MenuItem value="cpp">C++ 20</MenuItem>
              <MenuItem value="c">C (GCC 9.2)</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div 
          style={{
            backgroundColor: "var(--editor-bg)",
            borderColor: "var(--editor-border)",
          }}
          className="flex-1 rounded-2xl border overflow-hidden relative shadow-2xl transition-all duration-300"
        >
          <CustomMonaco
            height="100%"
            language={activeVariant.language}
            value={activeVariant.code}
            onChange={(value) =>
              updateVariant(activeIndex, { code: value || "" })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SolutionEditor;
