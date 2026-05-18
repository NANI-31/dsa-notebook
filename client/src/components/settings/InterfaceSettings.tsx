import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../app/store";
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
  setEditorCursorBlinking,
  setEditorLineNumberPadding,
  setEditorContrastRatio,
  syncSettings,
  setShortcut,
  type SettingsState,
} from "../../features/settings/settingsSlice";
import { addToast } from "../../features/ui/uiSlice";
import {
  LuSun,
  LuMoon,
  LuSmartphone,
  LuPalette,
  LuMonitor,
  LuLayoutDashboard,
  LuTerminal,
  LuAccessibility,
  LuCode,
  LuType,
  LuKeyboard,
} from "react-icons/lu";
import { SettingSection } from "./SettingSection";
import { SettingCard } from "./SettingCard";
import { useSettings } from "../../context/SettingsContext";

const THEME_ACCENT_MAP: Record<string, string> = {
  "dracula": "#6366f1",      // Purple
  "github-light": "#0ea5e9", // Blue
  "monokai": "#ec4899",      // Pink
  "custom-dark": "#0ea5e9",  // Blue (One Dark blue accent)
};

export const InterfaceSettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { prewarmMonacoThemes, resetToDefaults } = useSettings();

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
    editorCursorBlinking,
    editorLineNumberPadding,
    editorContrastRatio,
    shortcuts,
  } = useSelector((state: RootState) => state.settings);

  const [recordingAction, setRecordingAction] = useState<string | null>(null);

  // Background Monaco editor packages & theme pre-warming hook
  useEffect(() => {
    prewarmMonacoThemes();
  }, [prewarmMonacoThemes]);

  // Keyboard shortcut intercepting recorder hook
  useEffect(() => {
    if (!recordingAction) return;

    const handleRecord = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Escape terminates key combo recording immediately
      if (e.key === "Escape") {
        setRecordingAction(null);
        (window as any).isRecordingShortcut = false;
        return;
      }

      // Skip standalone modifier key down triggers
      if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) {
        return;
      }

      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push("Ctrl");
      if (e.altKey) parts.push("Alt");
      if (e.shiftKey) parts.push("Shift");

      let keyName = e.key;
      if (keyName === " ") keyName = "Space";
      
      parts.push(keyName.length === 1 ? keyName.toUpperCase() : keyName);
      const newCombo = parts.join("+");

      // Standard browser keyboard shortcuts list to prevent hijacks and hijacking core browser hotkeys
      const CONFLICTING_BROWSER_HOTKEYS = [
        "Ctrl+T",       // New Tab
        "Ctrl+W",       // Close Tab
        "Ctrl+N",       // New Window
        "Ctrl+R",       // Reload page
        "Ctrl+Shift+R", // Hard reload
        "Ctrl+F5",      // Hard reload
        "F5",           // Reload page
        "Ctrl+F",       // Search page
        "Ctrl+G",       // Find next
        "Ctrl+H",       // History page
        "Ctrl+J",       // Downloads page
        "Ctrl+D",       // Bookmark page
        "Ctrl+S",       // Save page
        "Ctrl+P",       // Print page
        "Ctrl+U",       // View source code
        "F11",          // Fullscreen mode
        "F12",          // browser console devtools
        "Ctrl+Shift+I", // browser console devtools
        "Ctrl+Shift+J", // browser console devtools
        "Alt+D",        // browser address bar focus
        "Ctrl+Tab",     // Next browser tab
        "Ctrl+Shift+Tab", // Previous browser tab
      ];

      if (CONFLICTING_BROWSER_HOTKEYS.includes(newCombo)) {
        dispatch(
          addToast({
            message: `Rebind rejected: "${newCombo}" is a standard system hotkey. Overriding browser default keys could hijack critical browser controls!`,
            type: "warning",
            duration: 6000,
          })
        );
        setRecordingAction(null);
        (window as any).isRecordingShortcut = false;
        return;
      }

      // Update in store and broadcast to other active tabs
      dispatch(setShortcut({ actionId: recordingAction, keyCombo: newCombo }));
      
      setRecordingAction(null);
      (window as any).isRecordingShortcut = false;
    };

    (window as any).isRecordingShortcut = true;
    window.addEventListener("keydown", handleRecord, true);

    return () => {
      window.removeEventListener("keydown", handleRecord, true);
      (window as any).isRecordingShortcut = false;
    };
  }, [recordingAction, dispatch]);

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

  const accents = [
    { name: "Purple", color: "#6366f1" },
    { name: "Blue", color: "#0ea5e9" },
    { name: "Green", color: "#10b981" },
    { name: "Orange", color: "#f59e0b" },
    { name: "Pink", color: "#ec4899" },
  ];

  return (
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
          
          {/* Dynamic Premium Typographic Live Preview Block */}
          <div 
            className="mt-6 p-6 rounded-2xl bg-sidebar/50 border border-border-subtle font-mono transition-all duration-300 overflow-hidden relative shadow-inner group flex flex-col gap-3 min-h-[140px]"
            style={{ 
              fontFamily: `'${editorFontFamily || "Fira Code"}', monospace`,
              fontSize: `${editorFontSize}px`,
              fontVariantLigatures: editorFontLigatures ? "contextual" : "none",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle/50 text-[10px] text-text-muted/50 select-none font-sans font-bold uppercase tracking-widest">
              <span>Active Buffer Preview</span>
              <span className="px-2.5 py-1 bg-brand/10 text-brand rounded-lg">
                {editorFontFamily || "Fira Code"} - {editorFontSize}px
              </span>
            </div>
            <div className="leading-relaxed select-none">
              <span className="text-emerald-400 font-bold">const</span> computeSolution = <span className="text-brand">(val: number) =&gt;</span> &#123;
              <br />
              &nbsp;&nbsp;<span className="text-purple-400">if</span> (val !== <span className="text-amber-400">null</span> &amp;&amp; val &gt;= <span className="text-amber-500">0</span>) &#123;
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-400">return</span> val === <span className="text-amber-500">0</span> ? <span className="text-amber-500">1</span> : val * <span className="text-rose-400">3</span>;
              <br />
              &nbsp;&nbsp;&#125;
              <br />
              &nbsp;&nbsp;<span className="text-sky-400">return</span> <span className="text-amber-500">-1</span>;
              <br />
              &#125;;
              <br />
              <span className="text-text-muted/40">// Verification of Ligatures: !=, ===, &gt;=, -&gt;</span>
            </div>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Tactile Keyboard Shortcuts" icon={LuKeyboard} fullWidth>
        <div className="bg-sidebar/20 border border-border-subtle/50 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle/30">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-text-main">
                Interactive Shortcut mapper
              </h3>
              <p className="text-[10px] text-text-muted leading-relaxed font-bold uppercase tracking-tight opacity-60 mt-1">
                Configure customized tactile hotkeys to control IDE compilation sandboxes, layout toggles, themes, and accessibility settings.
              </p>
            </div>
            <button
              onClick={resetToDefaults}
              className="px-5 py-2.5 rounded-xl bg-black/30 hover:bg-black/50 border border-border-subtle text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-text-main active:scale-95 transition-all self-start sm:self-center"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="divide-y divide-border-subtle/20">
            {[
              { id: "runCode", name: "Run Execution Sandbox", desc: "Execute/run active code workspace compiler natively." },
              { id: "toggleTheme", name: "Cycle Visual Theme", desc: "Toggle Monochrome Light mode or Midnight Dark theme instantly." },
              { id: "increaseFontSize", name: "Increment Font Size", desc: "Scale typography size larger for code viewport." },
              { id: "decreaseFontSize", name: "Decrement Font Size", desc: "Scale typography size smaller for code viewport." },
              { id: "toggleTerminal", name: "Toggle Diagnostics Drawer", desc: "Show/hide console output drawers and execution latency reports." },
            ].map((act) => {
              const combo = shortcuts[act.id] || "";
              const isRecording = recordingAction === act.id;
              
              const renderKeycaps = (comboString: string) => {
                if (!comboString) return <span className="text-[9px] text-text-muted font-bold">UNBOUND</span>;
                const keys = comboString.split("+");
                const keyLabels: Record<string, string> = {
                  "Ctrl": "Ctrl",
                  "Alt": "Alt",
                  "Shift": "Shift",
                  "Enter": "Enter",
                  "Space": "Space",
                  "ArrowUp": "▲ Up",
                  "ArrowDown": "▼ Down",
                  "ArrowLeft": "◀ Left",
                  "ArrowRight": "▶ Right",
                };
                return (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {keys.map((k, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span className="text-text-muted/40 font-black text-xs font-mono">+</span>}
                        <kbd className="px-3 py-1.5 rounded-xl bg-black/45 border-t border-r border-l border-white/5 border-b-[3px] border-black/80 text-[9px] font-mono text-text-main tracking-widest font-black uppercase shadow-lg select-none min-w-[28px] text-center inline-block transform transition-all duration-100">
                          {keyLabels[k] || k}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                );
              };

              return (
                <div key={act.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-5 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-widest text-text-main flex items-center gap-2">
                      <span>{act.name}</span>
                      {isRecording && (
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                      )}
                    </h4>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-tight opacity-55 max-w-xl">
                      {act.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 justify-between md:justify-end">
                    <div className="min-w-[120px] flex justify-start">
                      {isRecording ? (
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 animate-pulse bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                          Recording Keypress (Esc to Exit)...
                        </span>
                      ) : (
                        renderKeycaps(combo)
                      )}
                    </div>
                    <button
                      onClick={() => setRecordingAction(act.id)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95 cursor-pointer ${isRecording ? "bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/20" : "bg-black/20 hover:bg-black/40 border-border-subtle text-text-main hover:border-brand/40"}`}
                    >
                      {isRecording ? "Recording..." : "Rebind"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SettingSection>

      <SettingSection title="IDE Accessibility" icon={LuAccessibility} fullWidth>
        <div className="space-y-8">
          {/* Cursor Blinking Style */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-border-subtle/20">
            <div className="space-y-1">
              <h3 className="font-black text-sm uppercase tracking-widest text-text-main">
                Cursor Blinking Style
              </h3>
              <p className="text-[10px] text-text-muted leading-relaxed font-bold uppercase tracking-tight opacity-60">
                Controls the animation style of the text cursor inside the Monaco code editor.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["blink", "smooth", "phase", "expand", "solid"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() =>
                    handleSettingChange(
                      "editorCursorBlinking",
                      mode,
                      setEditorCursorBlinking,
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all duration-300 ${
                    editorCursorBlinking === mode
                      ? "bg-brand/10 border-brand text-brand shadow-lg shadow-brand/10"
                      : "border-border-subtle bg-black/5 text-text-muted hover:border-text-muted/30 hover:text-text-main"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Line Number Gutter Padding */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-border-subtle/20">
            <div className="space-y-1">
              <h3 className="font-black text-sm uppercase tracking-widest text-text-main">
                Line Number Padding
              </h3>
              <p className="text-[10px] text-text-muted leading-relaxed font-bold uppercase tracking-tight opacity-60">
                Scale the gutter width allocated to line numbers for wider or tighter readability.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                disabled={editorLineNumberPadding <= 8}
                onClick={() =>
                  handleSettingChange(
                    "editorLineNumberPadding",
                    editorLineNumberPadding - 4,
                    setEditorLineNumberPadding,
                  )
                }
                className="w-10 h-10 rounded-xl bg-black/20 hover:bg-black/45 border border-border-subtle flex items-center justify-center font-bold text-text-main disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                -
              </button>
              <div className="flex flex-col items-center min-w-[48px]">
                <span className="text-lg font-black text-brand font-mono">{editorLineNumberPadding}px</span>
                <span className="text-[8px] text-text-muted/50 font-bold uppercase tracking-widest">Width</span>
              </div>
              <button
                disabled={editorLineNumberPadding >= 48}
                onClick={() =>
                  handleSettingChange(
                    "editorLineNumberPadding",
                    editorLineNumberPadding + 4,
                    setEditorLineNumberPadding,
                  )
                }
                className="w-10 h-10 rounded-xl bg-black/20 hover:bg-black/45 border border-border-subtle flex items-center justify-center font-bold text-text-main disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Contrast Ratio Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-black text-sm uppercase tracking-widest text-text-main">
                Contrast Ratio
              </h3>
              <p className="text-[10px] text-text-muted leading-relaxed font-bold uppercase tracking-tight opacity-60">
                Adjust the CSS contrast filter applied to the code editor viewport for enhanced readability.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={60}
                max={180}
                step={5}
                value={editorContrastRatio}
                onChange={(e) =>
                  handleSettingChange(
                    "editorContrastRatio",
                    Number(e.target.value),
                    setEditorContrastRatio,
                  )
                }
                className="w-32 sm:w-48 accent-brand cursor-pointer"
              />
              <div className="flex flex-col items-center min-w-[48px]">
                <span className="text-lg font-black text-brand font-mono">{editorContrastRatio}%</span>
                <span className="text-[8px] text-text-muted/50 font-bold uppercase tracking-widest">Level</span>
              </div>
              <button
                onClick={() =>
                  handleSettingChange(
                    "editorContrastRatio",
                    100,
                    setEditorContrastRatio,
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-black/20 hover:bg-black/44 border border-border-subtle text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </SettingSection>
    </div>
  );
};
