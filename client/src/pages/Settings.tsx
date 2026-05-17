import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import {
  setTheme,
  setAccentColor,
  setSyncWithSystem,
  setTerminalLayout,
  setEditorHighContrast,
  setEditorTheme,
  setEditorFontSize,
  setEditorFontLigatures,
  setEditorFontFamily,
  syncSettings,
  type SettingsState,
} from "../features/settings/settingsSlice";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../features/categories/categoriesSlice";
import {
  createTechnique,
  deleteTechnique,
} from "../features/techniques/techniquesSlice";
import {
  LuSun,
  LuMoon,
  LuSmartphone,
  LuLayoutDashboard,
  LuPalette,
  LuMonitor,
  LuTerminal,
  LuDatabase,
  LuPlus,
  LuTrash2,
  LuLightbulb,
  LuAccessibility,
  LuCode,
  LuType,
} from "react-icons/lu";

const THEME_ACCENT_MAP: Record<string, string> = {
  "dracula": "#6366f1",      // Purple
  "github-light": "#0ea5e9", // Blue
  "monokai": "#ec4899",      // Pink
  "custom-dark": "#0ea5e9",  // Blue (One Dark blue accent)
};

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    theme,
    accentColor,
    syncWithSystem,
    terminalLayout,
    editorHighContrast,
    editorTheme,
    editorFontSize,
    editorFontLigatures,
    editorFontFamily,
  } = useSelector((state: RootState) => state.settings);
  const categories = useSelector((state: RootState) => state.categories.list);
  const techniques = useSelector((state: RootState) => state.techniques.list);

  const [newCatName, setNewCatName] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");
  const [newTechName, setNewTechName] = useState("");
  const [activeTab, setActiveTab] = useState<"general" | "data">("general");

  const handleSettingChange = (
    key: keyof SettingsState,
    value: any,
    actionCreator: any,
  ) => {
    dispatch(actionCreator(value));
    
    let updatedPayload: Partial<SettingsState> = { [key]: value };
    
    // Auto-sync accent color when changing editorTheme
    if (key === "editorTheme") {
      const mappedAccent = THEME_ACCENT_MAP[value];
      if (mappedAccent) {
        dispatch(setAccentColor(mappedAccent));
        updatedPayload = {
          ...updatedPayload,
          accentColor: mappedAccent,
        };
      }
    }
    
    dispatch(syncSettings(updatedPayload));
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    dispatch(createCategory({ name: newCatName, subCategories: [] }));
    setNewCatName("");
  };

  const handleAddSubCategory = (catId: string) => {
    if (!newSubName.trim()) return;
    const category = categories.find((c) => c._id === catId);
    if (category) {
      const updatedSubs = [...category.subCategories, newSubName.trim()];
      dispatch(
        updateCategory({ id: catId, data: { subCategories: updatedSubs } }),
      );
      setNewSubName("");
    }
  };

  const handleRemoveSubCategory = (catId: string, sub: string) => {
    const category = categories.find((c) => c._id === catId);
    if (category) {
      const updatedSubs = category.subCategories.filter((s) => s !== sub);
      dispatch(
        updateCategory({ id: catId, data: { subCategories: updatedSubs } }),
      );
    }
  };

  const handleAddTechnique = () => {
    if (!newTechName.trim()) return;
    dispatch(createTechnique(newTechName.trim()));
    setNewTechName("");
  };

  const accents = [
    { name: "Purple", color: "#6366f1" },
    { name: "Blue", color: "#0ea5e9" },
    { name: "Green", color: "#10b981" },
    { name: "Orange", color: "#f59e0b" },
    { name: "Pink", color: "#ec4899" },
  ];

  const SettingSection = ({
    title,
    icon: Icon,
    children,
    fullWidth = false,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    fullWidth?: boolean;
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

  const SettingCard = ({
    title,
    description,
    active,
    onClick,
    icon: Icon,
  }: {
    title: string;
    description: string;
    active: boolean;
    onClick: () => void;
    icon?: any;
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

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <header className="mb-12 space-y-2">
        <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tighter leading-tight">
          System Preferences
        </h1>
        <p className="text-text-muted font-medium opacity-60 max-w-xl">
          Configure global environment parameters and architectural taxonomy.
        </p>
      </header>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-12 p-2 bg-sidebar/50 backdrop-blur-3xl rounded-3xl w-full sm:w-fit border border-border-subtle shadow-2xl">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "general" ? "bg-brand text-white shadow-xl shadow-brand/30 scale-[1.02]" : "text-text-muted hover:text-text-main"}`}
        >
          <LuPalette size={18} />
          <span>Interface</span>
        </button>
        <button
          onClick={() => setActiveTab("data")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "data" ? "bg-brand text-white shadow-xl shadow-brand/30 scale-[1.02]" : "text-text-muted hover:text-text-main"}`}
        >
          <LuDatabase size={18} />
          <span>Core Data</span>
        </button>
      </div>

      <div className="min-h-[600px]">
        {activeTab === "general" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
            <SettingSection title="Global Appearance" icon={LuPalette}>
              <SettingCard
                title="Monochrome"
                description="High contrast light mode for optimal clarity."
                icon={LuSun}
                active={theme === "light" && !syncWithSystem}
                onClick={() => {
                  handleSettingChange("syncWithSystem", false, setSyncWithSystem);
                  handleSettingChange("theme", "light", setTheme);
                }}
              />
              <SettingCard
                title="Midnight"
                description="Deep onyx dark mode for focus and immersion."
                icon={LuMoon}
                active={theme === "dark" && !syncWithSystem}
                onClick={() => {
                  handleSettingChange("syncWithSystem", false, setSyncWithSystem);
                  handleSettingChange("theme", "dark", setTheme);
                }}
              />
              <SettingCard
                title="Adaptive"
                description="Seamless synchronization with host system OS settings."
                icon={LuSmartphone}
                active={syncWithSystem}
                onClick={() =>
                  handleSettingChange(
                    "syncWithSystem",
                    !syncWithSystem,
                    setSyncWithSystem,
                  )
                }
              />
            </SettingSection>

            <div className="bg-sidebar/30 backdrop-blur-xl border border-border-subtle rounded-3xl p-6 md:p-10 mb-8">
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-brand/10 p-2.5 rounded-xl text-brand">
                  <LuMonitor size={22} />
                </div>
                <h2 className="text-xl font-black text-text-main tracking-tight uppercase text-[10px]">
                  Visual Identity
                </h2>
              </div>
              <div className="flex flex-wrap gap-5">
                {accents.map((accent) => (
                  <button
                    key={accent.name}
                    onClick={() =>
                      handleSettingChange("accentColor", accent.color, setAccentColor)
                    }
                    className={`group relative flex items-center justify-center w-16 h-16 rounded-3xl transition-all duration-500 ${
                      accentColor === accent.color
                        ? "ring-4 ring-brand/30 scale-110 shadow-2xl"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: accent.color }}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-opacity duration-300 ${accentColor === accent.color ? "opacity-100" : "opacity-0"}`}
                    />
                    <span className="absolute -bottom-10 text-[9px] font-black uppercase tracking-[0.2em] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {accent.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <SettingSection title="Runtime Environment" icon={LuLayoutDashboard}>
              <SettingCard
                title="Horizontal"
                description="Full-width source code editor with stacked console."
                icon={LuTerminal}
                active={terminalLayout === "bottom"}
                onClick={() =>
                  handleSettingChange("terminalLayout", "bottom", setTerminalLayout)
                }
              />
              <SettingCard
                title="Wide-Angle"
                description="Side-by-side IDE view for synchronized monitoring."
                icon={LuTerminal}
                active={terminalLayout === "sidebar"}
                onClick={() =>
                  handleSettingChange(
                    "terminalLayout",
                    "sidebar",
                    setTerminalLayout,
                  )
                }
              />
            </SettingSection>

            <SettingSection title="Editor Theme" icon={LuCode}>
              <SettingCard
                title="One Dark"
                description="Our refined One Dark layout with semantic enhancements."
                icon={LuCode}
                active={editorTheme === "custom-dark"}
                onClick={() =>
                  handleSettingChange("editorTheme", "custom-dark", setEditorTheme)
                }
              />
              <SettingCard
                title="Dracula"
                description="Vibrant neon styling with a deep purple background."
                icon={LuCode}
                active={editorTheme === "dracula"}
                onClick={() =>
                  handleSettingChange("editorTheme", "dracula", setEditorTheme)
                }
              />
              <SettingCard
                title="Monokai"
                description="Classic retro developer styling with hot pink highlights."
                icon={LuCode}
                active={editorTheme === "monokai"}
                onClick={() =>
                  handleSettingChange("editorTheme", "monokai", setEditorTheme)
                }
              />
              <SettingCard
                title="GitHub Light"
                description="Clean light theme matches the original GitHub feel."
                icon={LuCode}
                active={editorTheme === "github-light"}
                onClick={() =>
                  handleSettingChange("editorTheme", "github-light", setEditorTheme)
                }
              />
            </SettingSection>

            <SettingSection title="Accessibility" icon={LuAccessibility}>
              <SettingCard
                title="High Contrast"
                description="Enhanced visibility for the code editor area."
                icon={LuAccessibility}
                active={editorHighContrast}
                onClick={() =>
                  handleSettingChange(
                    "editorHighContrast",
                    !editorHighContrast,
                    setEditorHighContrast,
                  )
                }
              />
              {/* Font Size Adjuster Card */}
              <div className="flex flex-col text-left p-6 rounded-3xl border-2 border-border-subtle bg-black/5 relative overflow-hidden transition-all duration-500 hover:border-text-muted/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-text-muted/10 text-text-muted">
                    <LuType size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-text-main">
                      Font Size
                    </h3>
                    <p className="text-[10px] text-text-muted leading-relaxed font-bold uppercase tracking-tight opacity-60">
                      Scale the editor code font size.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-auto">
                  <button
                    disabled={editorFontSize <= 10}
                    onClick={() =>
                      handleSettingChange(
                        "editorFontSize",
                        editorFontSize - 1,
                        setEditorFontSize,
                      )
                    }
                    className="w-10 h-10 rounded-xl bg-black/20 hover:bg-black/45 border border-border-subtle flex items-center justify-center font-bold text-text-main disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-lg font-black text-brand min-w-[32px] text-center font-mono">
                    {editorFontSize}px
                  </span>
                  <button
                    disabled={editorFontSize >= 24}
                    onClick={() =>
                      handleSettingChange(
                        "editorFontSize",
                        editorFontSize + 1,
                        setEditorFontSize,
                      )
                    }
                    className="w-10 h-10 rounded-xl bg-black/20 hover:bg-black/45 border border-border-subtle flex items-center justify-center font-bold text-text-main disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Font Ligatures Toggle Card */}
              <SettingCard
                title="Font Ligatures"
                description="Enable standard multi-character ligatures like ->, !==."
                icon={LuType}
                active={editorFontLigatures}
                onClick={() =>
                  handleSettingChange(
                    "editorFontLigatures",
                    !editorFontLigatures,
                    setEditorFontLigatures,
                  )
                }
              />

              {/* Font Family Selector Card */}
              <div className="flex flex-col text-left p-6 rounded-3xl border-2 border-border-subtle bg-black/5 relative overflow-hidden transition-all duration-500 hover:border-text-muted/30 col-span-1 md:col-span-2">
                <div className="flex items-center justify-between flex-wrap gap-4 w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-text-muted/10 text-text-muted">
                      <LuType size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-widest text-text-main">
                        Font Family
                      </h3>
                      <p className="text-[10px] text-text-muted leading-relaxed font-bold uppercase tracking-tight opacity-60">
                        Choose your preferred editor coding typeface.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      value={editorFontFamily || "Fira Code"}
                      onChange={(e) =>
                        handleSettingChange(
                          "editorFontFamily",
                          e.target.value,
                          setEditorFontFamily,
                        )
                      }
                      className="bg-sidebar border-2 border-border-subtle rounded-2xl px-5 py-2.5 font-mono text-sm font-bold text-text-main focus:outline-none focus:border-brand/50 transition-all duration-300 cursor-pointer shadow-lg outline-none appearance-none pr-10"
                    >
                      <option value="Fira Code">Fira Code (Ligatures)</option>
                      <option value="JetBrains Mono">JetBrains Mono</option>
                      <option value="Source Code Pro">Source Code Pro</option>
                      <option value="Share Tech Mono">Share Tech Mono</option>
                      <option value="Courier New">Courier New (System)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-muted">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Live Preview Block */}
                <div className="mt-6 p-4 rounded-2xl bg-black/20 border border-border-subtle font-mono text-xs text-text-muted/80 leading-relaxed select-none transition-all duration-500 overflow-hidden max-h-[80px] flex items-center justify-between"
                     style={{ fontFamily: `'${editorFontFamily || "Fira Code"}', monospace` }}>
                  <div>
                    <span className="text-emerald-400 font-bold">const</span> solution = <span className="text-brand">(x) =&gt;</span> x * <span className="text-amber-500">2</span>;
                    <br />
                    <span className="text-text-muted/40">// Beautiful ligatures check: x !== null &amp;&amp; a -&gt; b</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-brand/10 text-brand rounded-lg hidden sm:inline-block">
                    Live Preview
                  </span>
                </div>
              </div>
            </SettingSection>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-6 duration-700">
            <SettingSection title="Taxonomy Infrastructure" icon={LuDatabase} fullWidth>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 md:gap-16">
                <div className="space-y-10">
                  <div>
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6 px-4 italic opacity-40">
                      Primary Categories
                    </h3>
                    <div className="space-y-2.5">
                      {categories.map((cat) => (
                        <div
                          key={cat._id}
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedCatId === cat._id ? "bg-brand/5 border-brand text-brand shadow-lg" : "bg-white/5 border-transparent hover:border-border-subtle"}`}
                          onClick={() => setSelectedCatId(cat._id)}
                        >
                          <span className="font-bold text-sm uppercase tracking-widest">
                            {cat.name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(deleteCategory(cat._id));
                            }}
                            className="p-2.5 rounded-xl hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all active:scale-90"
                          >
                            <LuTrash2 size={18} />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-3 mt-8 px-2">
                        <input
                          type="text"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="Provision new category..."
                          className="flex-1 bg-white/5 border-2 border-border-subtle rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-brand transition-all placeholder:text-text-muted/20"
                        />
                        <button
                          onClick={handleAddCategory}
                          className="p-4 bg-brand text-white rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-brand/20 active:scale-95"
                        >
                          <LuPlus size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {selectedCatId && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                      <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6 px-4 italic opacity-40">
                        Sub Taxonomy for {categories.find((c) => c._id === selectedCatId)?.name}
                      </h3>
                      <div className="flex flex-wrap gap-3 px-2">
                        {categories
                          .find((c) => c._id === selectedCatId)
                          ?.subCategories.map((sub) => (
                            <div
                              key={sub}
                              className="flex items-center gap-3 bg-brand/5 border-2 border-brand/20 rounded-2xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-brand"
                            >
                              <span>{sub}</span>
                              <button
                                onClick={() =>
                                  handleRemoveSubCategory(selectedCatId, sub)
                                }
                                className="text-brand/40 hover:text-red-400 transition-colors p-1"
                              >
                                <LuPlus size={16} className="rotate-45" />
                              </button>
                            </div>
                          ))}
                        <div className="flex items-center gap-3 mt-4 w-full">
                          <input
                            type="text"
                            value={newSubName}
                            onChange={(e) => setNewSubName(e.target.value)}
                            placeholder="Append sub-category..."
                            className="flex-1 bg-white/5 border-2 border-border-subtle rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-brand transition-all placeholder:text-text-muted/20"
                          />
                          <button
                            onClick={() => handleAddSubCategory(selectedCatId)}
                            className="p-4 bg-brand/10 text-brand rounded-2xl hover:bg-brand/20 transition-all border-2 border-brand/20 active:scale-95"
                          >
                            <LuPlus size={24} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6 px-4 italic opacity-40 flex items-center gap-2">
                    <LuLightbulb size={16} className="text-brand" /> Patterns & Techniques
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {techniques.map((tech) => (
                        <div
                          key={tech._id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border-2 border-transparent hover:border-border-subtle transition-all group shadow-sm"
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {tech.name}
                          </span>
                          <button
                            onClick={() => dispatch(deleteTechnique(tech._id))}
                            className="p-2 rounded-xl hover:bg-red-500/10 text-text-muted hover:text-red-400 opacity-20 group-hover:opacity-100 transition-all"
                          >
                            <LuTrash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-8 px-2">
                      <input
                        type="text"
                        value={newTechName}
                        onChange={(e) => setNewTechName(e.target.value)}
                        placeholder="Define new technique..."
                        className="flex-1 bg-white/5 border-2 border-border-subtle rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-brand transition-all placeholder:text-text-muted/20"
                      />
                      <button
                        onClick={handleAddTechnique}
                        className="p-4 bg-brand text-white rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-brand/20 active:scale-95"
                      >
                        <LuPlus size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SettingSection>
          </div>
        )}
      </div>

      <footer className="mt-20 text-center border-t border-border-subtle/20 pt-10">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-text-muted/20">
          State synchronized with cloud database latency &lt; 200ms
        </p>
      </footer>
    </div>
  );
};

export default Settings;
