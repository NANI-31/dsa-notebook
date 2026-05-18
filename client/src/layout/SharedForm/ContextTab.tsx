import React from "react";
import { LuClock, LuMonitor, LuEye, LuPenLine } from "react-icons/lu";
import { Select, MenuItem, FormControl } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useProblemForm } from "../../context/ProblemFormContext";

// --- SharedContextTab.tsx ---
export const SharedContextTab: React.FC = () => {
  const {
    formData,
    setFormData,
    categoriesMap,
    techniquesList,
    toggleTechnique,
    showDescPreview,
    setShowDescPreview,
  } = useProblemForm();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 md:gap-12 animate-in slide-in-from-bottom-6 duration-700">
      <div className="space-y-8">
        <div className="bg-sidebar border border-border-subtle rounded-3xl p-6 md:p-10 space-y-8 shadow-sm">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 italic opacity-40">
              Label
            </label>
            <input
              type="text"
              placeholder="e.g. Reverse Linked List"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="w-full bg-app-bg border border-border-subtle rounded-2xl px-6 py-4 text-text-main focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all font-bold text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 italic opacity-40">
                Primary Domain
              </label>
              <FormControl fullWidth>
                <Select
                  value={
                    categoriesMap[formData.category] ? formData.category : ""
                  }
                  onChange={(e) => {
                    const newCategory = e.target.value as string;
                    setFormData((prev) => ({
                      ...prev,
                      category: newCategory,
                      subCategory: categoriesMap[newCategory]?.[0] || "",
                    }));
                  }}
                  sx={{
                    backgroundColor: "var(--app-bg)",
                    color: "var(--text-main)",
                    fontSize: "10px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    borderRadius: "1rem",
                    border: "1px solid var(--border-subtle)",
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "& .MuiSelect-icon": { color: "var(--text-muted)" },
                    height: "56px",
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
                  {Object.keys(categoriesMap).map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 italic opacity-40">
                Sub Taxonomy
              </label>
              <FormControl fullWidth>
                <Select
                  value={
                    categoriesMap[formData.category]?.includes(
                      formData.subCategory,
                    )
                      ? formData.subCategory
                      : ""
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subCategory: e.target.value as string,
                    }))
                  }
                  sx={{
                    backgroundColor: "var(--app-bg)",
                    color: "var(--text-main)",
                    fontSize: "10px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    borderRadius: "1rem",
                    border: "1px solid var(--border-subtle)",
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "& .MuiSelect-icon": { color: "var(--text-muted)" },
                    height: "56px",
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
                  {categoriesMap[formData.category]?.map((sub) => (
                    <MenuItem key={sub} value={sub}>
                      {sub}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 italic opacity-40">
                Difficulty Tier
              </label>
              <FormControl fullWidth>
                <Select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      difficulty: e.target.value as string,
                    }))
                  }
                  sx={{
                    backgroundColor: "var(--app-bg)",
                    color: "var(--text-main)",
                    fontSize: "10px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    borderRadius: "1rem",
                    border: "1px solid var(--border-subtle)",
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "& .MuiSelect-icon": { color: "var(--text-muted)" },
                    height: "56px",
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
                  {["Easy", "Medium", "Hard"].map((diff) => (
                    <MenuItem key={diff} value={diff}>
                      {diff}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 italic opacity-40">
                Time Complexity
              </label>
              <div className="relative">
                <LuClock
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-brand/20"
                  size={18}
                />
                <input
                  type="text"
                  value={formData.timeComplexity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      timeComplexity: e.target.value,
                    }))
                  }
                  className="w-full bg-app-bg border border-border-subtle rounded-2xl pl-14 pr-6 py-4 text-text-main focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all font-bold"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 italic opacity-40">
                Space Complexity
              </label>
              <div className="relative">
                <LuMonitor
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-brand/20"
                  size={18}
                />
                <input
                  type="text"
                  value={formData.spaceComplexity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      spaceComplexity: e.target.value,
                    }))
                  }
                  className="w-full bg-app-bg border border-border-subtle rounded-2xl pl-14 pr-6 py-4 text-text-main focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 italic opacity-40">
                Time Complexity Analysis
              </label>
              <textarea
                value={formData.timeComplexityAnalysis}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    timeComplexityAnalysis: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Explain why the time complexity is what it is..."
                className="w-full bg-app-bg border border-border-subtle rounded-2xl px-6 py-4 text-text-main focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all resize-none text-sm leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 italic opacity-40">
                Space Complexity Analysis
              </label>
              <textarea
                value={formData.spaceComplexityAnalysis}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    spaceComplexityAnalysis: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Explain why the space complexity is what it is..."
                className="w-full bg-app-bg border border-border-subtle rounded-2xl px-6 py-4 text-text-main focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all resize-none text-sm leading-relaxed"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic opacity-40">
                Problem Statement (MD)
              </label>
              <button
                onClick={() => setShowDescPreview(!showDescPreview)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand hover:opacity-80 transition-all px-3 py-1 bg-brand/5 rounded-lg border border-brand/10"
              >
                {showDescPreview ? (
                  <LuPenLine size={12} />
                ) : (
                  <LuEye size={12} />
                )}
                <span>{showDescPreview ? "Editor" : "Preview"}</span>
              </button>
            </div>
            {showDescPreview ? (
              <div className="w-full bg-app-bg border border-border-subtle rounded-3xl px-6 py-6 min-h-[300px] prose prose-invert prose-brand max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {formData.description ||
                    "*Rendered output will appear here...*"}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                rows={12}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full bg-app-bg border border-border-subtle rounded-3xl px-6 py-6 text-text-main focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all font-medium resize-none leading-relaxed"
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-sidebar border border-border-subtle rounded-3xl p-6 md:p-10 space-y-10 shadow-sm">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-5 italic opacity-40">
              Patterns / Techniques
            </label>
            <div className="flex flex-wrap gap-2.5">
              {techniquesList.map((tech) => (
                <button
                  key={tech._id}
                  onClick={() => toggleTechnique(tech._id)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                    formData.techniques.includes(tech._id)
                      ? "bg-brand text-white border-brand shadow-lg shadow-brand/20"
                      : "bg-app-bg border-border-subtle text-text-muted hover:border-brand/30 hover:text-text-main"
                  }`}
                >
                  {tech.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic opacity-40">
              Strategy / Approach
            </label>
            <textarea
              rows={10}
              value={formData.explanation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  explanation: e.target.value,
                }))
              }
              className="w-full bg-app-bg border border-border-subtle rounded-3xl px-6 py-6 text-text-main focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all font-medium resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
