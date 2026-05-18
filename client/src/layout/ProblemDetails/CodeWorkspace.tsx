import React, { lazy, Suspense, useState } from "react";
import {
  LuKeyboard,
  LuPlay,
  LuLoader,
  LuWand,
  LuTerminal,
  LuCircle,
  LuCpu,
  LuZap,
  LuHardDrive,
  LuActivity,
  LuInfo,
} from "react-icons/lu";
import { Select, MenuItem, FormControl } from "@mui/material";
const CustomMonaco = lazy(() => import("../../components/CustomMonaco/index"));
import SectionHeader from "./SectionHeader";

import { useProblemDetails } from "../../context/ProblemDetailsContext";

const RuntimeDiagnostics: React.FC<{ telemetry: any }> = ({ telemetry }) => {
  if (!telemetry) return null;

  const usedBytes = telemetry.heapUsedBytes || 0;
  const totalBytes = telemetry.heapTotalBytes || 0;
  const limitBytes = telemetry.heapLimitBytes || 0;

  const usedMb = usedBytes > 0 ? (usedBytes / (1024 * 1024)).toFixed(1) : "0.0";
  const totalMb =
    totalBytes > 0 ? (totalBytes / (1024 * 1024)).toFixed(0) : "0";
  const limitMb =
    limitBytes > 0 ? (limitBytes / (1024 * 1024)).toFixed(0) : "0";
  const usedPercent =
    limitBytes > 0 ? ((usedBytes / limitBytes) * 100).toFixed(1) : "0.0";

  return (
    <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 font-sans animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 transition-all">
        <div
          className={`p-2 rounded-lg ${telemetry.isOffline ? "bg-amber-500/10 text-amber-400" : "bg-sky-500/10 text-sky-400"}`}
        >
          <LuActivity size={16} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-black uppercase tracking-wider text-text-muted opacity-60">
            Engine
          </span>
          <span
            className={`text-[9px] font-extrabold uppercase tracking-widest ${telemetry.isOffline ? "text-amber-400" : "text-sky-400"}`}
          >
            {telemetry.isOffline ? "Offline Sandbox" : "Online Runtime"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
          <LuZap size={16} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-black uppercase tracking-wider text-text-muted opacity-60">
            Speed
          </span>
          <span className="text-xs font-black text-text-main font-mono">
            {telemetry.executionTimeMs} ms
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
          <LuHardDrive size={16} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-black uppercase tracking-wider text-text-muted opacity-60">
            Memory delta
          </span>
          <span className="text-xs font-black text-emerald-400 font-mono">
            +{telemetry.memoryDeltaKb} KB
          </span>
          {usedBytes > 0 && (
            <span className="text-[8px] font-bold text-text-muted font-mono leading-none mt-1 opacity-70">
              Heap: {usedMb}MB / {totalMb}MB ({limitMb}MB max)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
          <LuCpu size={16} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-black uppercase tracking-wider text-text-muted opacity-60">
            Parser
          </span>
          <span className="text-[9px] font-black text-purple-300 font-mono leading-tight">
            {telemetry.lineCount} lines @ {telemetry.linesPerMs} l/ms
          </span>
        </div>
      </div>

      {/* V8 CPU Health Safeguard Indicator */}
      <div
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
          telemetry.cpuLeakWarning
            ? "bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse"
            : "bg-white/5 border-white/5 text-emerald-400"
        }`}
      >
        <div
          className={`p-2 rounded-lg ${telemetry.cpuLeakWarning ? "bg-rose-500/20" : "bg-emerald-500/10"}`}
        >
          {telemetry.cpuLeakWarning ? (
            <LuInfo size={16} />
          ) : (
            <LuCpu size={16} className="animate-spin duration-3000" />
          )}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-black uppercase tracking-wider text-text-muted opacity-60">
            CPU Safeguard
          </span>
          <span className="text-[9px] font-extrabold uppercase tracking-widest font-mono leading-tight">
            {telemetry.cpuLeakWarning ? "STRESS / LEAK" : "STABLE / FAST"}
          </span>
        </div>
      </div>

      {/* V8 RAM Allocation Health Safeguard Indicator */}
      <div
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
          telemetry.ramLeakWarning
            ? "bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse"
            : "bg-white/5 border-white/5 text-emerald-400"
        }`}
      >
        <div
          className={`p-2 rounded-lg ${telemetry.ramLeakWarning ? "bg-rose-500/20" : "bg-emerald-500/10"}`}
        >
          {telemetry.ramLeakWarning ? (
            <LuInfo size={16} />
          ) : (
            <LuHardDrive size={16} />
          )}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-black uppercase tracking-wider text-text-muted opacity-60">
            RAM safeguard
          </span>
          <span className="text-[9px] font-extrabold uppercase tracking-widest font-mono leading-tight">
            {telemetry.ramLeakWarning ? "LEAK ALERT" : `SAFE (${usedPercent}%)`}
          </span>
        </div>
      </div>
    </div>
  );
};

const CodeWorkspace: React.FC = () => {
  const {
    variants,
    activeVariantIndex,
    setActiveVariantIndex,
    isRunning,
    handleRun,
    showInput,
    setShowInput,
    stdin,
    setStdin,
    terminalLayout,
    showTerminal,
    setShowTerminal,
    activeVariant,
    handleCodeChange,
    handleEditorDidMount,
    formatCode,
    handleLanguageChange,
    executionError,
    executionOutput,
    telemetry,
  } = useProblemDetails();

  const [activeTerminalTab, setActiveTerminalTab] = useState<
    "terminal" | "performance"
  >("terminal");
  return (
    <section className="animate-in slide-in-from-bottom-8 duration-1000">
      <SectionHeader title="Code" colorClass="bg-indigo-500">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInput(!showInput)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${showInput ? "bg-brand/10 border-brand text-brand" : "bg-sidebar border-border-subtle text-text-muted hover:text-text-main"}`}
          >
            <LuKeyboard size={14} />
            <span className="hidden sm:inline">Input</span>
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 bg-brand text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isRunning ? (
              <LuLoader size={14} className="animate-spin" />
            ) : (
              <LuPlay size={14} />
            )}
            Run
          </button>
        </div>
      </SectionHeader>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-sidebar p-1 rounded-2xl border border-border-subtle overflow-x-auto custom-scrollbar pb-2">
            {variants.map((v, idx) => (
              <button
                key={idx}
                onClick={() => setActiveVariantIndex(idx)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeVariantIndex === idx
                    ? "bg-brand text-white shadow-xl"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <FormControl size="small">
              <Select
                value={activeVariant.language}
                onChange={(e) => handleLanguageChange(e.target.value as string)}
                sx={{
                  backgroundColor: "var(--sidebar)",
                  color: "var(--text-main)",
                  fontSize: "10px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border-subtle)",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "& .MuiSelect-icon": { color: "var(--text-muted)" },
                  height: "38px",
                  minWidth: "160px",
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
                          letterSpacing: "0.1rem",
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
                <MenuItem value="javascript">JavaScript (ES6)</MenuItem>
                <MenuItem value="typescript">TypeScript</MenuItem>
                <MenuItem value="java">Java 17</MenuItem>
                <MenuItem value="cpp">C++ 20</MenuItem>
                <MenuItem value="c">C (GCC 9.2)</MenuItem>
              </Select>
            </FormControl>
            <button
              onClick={formatCode}
              className="p-2.5 bg-sidebar border border-border-subtle text-text-muted hover:text-brand rounded-xl transition-all shadow-sm"
              title="Pretty print code"
            >
              <LuWand size={18} />
            </button>
          </div>
        </div>

        <div
          className={`grid gap-6 ${terminalLayout === "sidebar" && showTerminal ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          <div
            className={`space-y-4 ${terminalLayout === "sidebar" && showTerminal ? "lg:col-span-2" : ""}`}
          >
            {/* Input Field */}
            {showInput && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <div className="bg-sidebar border border-border-subtle rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-[9px] font-black uppercase tracking-widest text-text-muted italic">
                    <LuKeyboard size={14} className="text-brand" />
                    <span>Standard Input (stdin)</span>
                  </div>
                  <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Define dataset for execution..."
                    className="w-full bg-app-bg border border-border-subtle rounded-2xl p-5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all min-h-[100px] text-text-main placeholder:text-text-muted/20"
                  />
                </div>
              </div>
            )}

            {/* Monaco Editor */}
            <div
              style={{
                backgroundColor: "var(--editor-bg)",
                borderColor: "var(--editor-border)",
                color: "var(--editor-text)",
              }}
              className="rounded-3xl border overflow-hidden shadow-2xl transition-editor-all transition-all duration-300"
            >
              <div
                style={{
                  backgroundColor: "var(--editor-header-bg)",
                  borderColor: "var(--editor-border)",
                }}
                className="px-5 py-3 border-b flex items-center justify-between transition-editor-all transition-all duration-300"
              >
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/90" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/90" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/90" />
                </div>
                <span
                  style={{ color: "var(--editor-text)" }}
                  className="text-[10px] font-black uppercase tracking-widest opacity-60"
                >
                  main.
                  {activeVariant.language === "python"
                    ? "py"
                    : activeVariant.language === "javascript"
                      ? "js"
                      : activeVariant.language === "typescript"
                        ? "ts"
                        : activeVariant.language === "java"
                          ? "java"
                          : activeVariant.language === "cpp"
                            ? "cpp"
                            : "c"}
                </span>
              </div>
              <Suspense
                fallback={
                  <div className="w-full flex flex-col p-6 animate-pulse bg-sidebar/50 backdrop-blur-md rounded-3xl min-h-[400px]">
                    <div className="flex flex-col gap-4 opacity-30">
                      <div className="flex gap-4">
                        <div className="w-8 h-4 bg-text-muted/20 rounded-md" />
                        <div className="w-48 h-4 bg-text-muted/10 rounded-md" />
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-4 bg-text-muted/20 rounded-md" />
                        <div className="w-64 h-4 bg-text-muted/10 rounded-md" />
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-4 bg-text-muted/20 rounded-md" />
                        <div className="w-32 h-4 bg-text-muted/10 rounded-md" />
                      </div>
                    </div>
                  </div>
                }
              >
                <CustomMonaco
                  height={
                    terminalLayout === "sidebar" && showTerminal
                      ? "600px"
                      : "500px"
                  }
                  language={activeVariant.language}
                  value={activeVariant.code}
                  onChange={handleCodeChange}
                  onMount={handleEditorDidMount}
                  options={{
                    lineNumbers: "on",
                    readOnly: false,
                  }}
                />
              </Suspense>
            </div>

            {/* Stacked Terminal Output */}
            {showTerminal && terminalLayout === "bottom" && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#0c0e14] border border-border-subtle rounded-3xl overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/5 gap-4">
                    <div className="flex items-center gap-3">
                      <LuTerminal size={14} className="text-brand" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-text-main hidden sm:inline">
                        System Terminal
                      </span>
                    </div>
                    {/* Tab Switcher inside header */}
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl gap-1">
                      <button
                        onClick={() => setActiveTerminalTab("terminal")}
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                          activeTerminalTab === "terminal"
                            ? "bg-brand text-white shadow-md"
                            : "text-text-muted hover:text-text-main"
                        }`}
                      >
                        Stdout
                      </button>
                      <button
                        onClick={() => setActiveTerminalTab("performance")}
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                          activeTerminalTab === "performance"
                            ? "bg-brand text-white shadow-md"
                            : "text-text-muted hover:text-text-main"
                        }`}
                      >
                        Diagnostics
                      </button>
                    </div>
                    <button
                      onClick={() => setShowTerminal(false)}
                      className="text-text-muted hover:text-red-500 transition-all p-1"
                    >
                      <LuCircle
                        size={16}
                        fill="currentColor"
                        className="opacity-20"
                      />
                    </button>
                  </div>
                  <div className="p-6 font-mono text-sm min-h-[150px] max-h-[400px] overflow-y-auto custom-scrollbar">
                    {isRunning ? (
                      <div className="flex items-center gap-3 text-text-muted italic animate-pulse">
                        <LuLoader size={16} className="animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Compiling & Executing...
                        </span>
                      </div>
                    ) : (
                      <>
                        {activeTerminalTab === "performance" ? (
                          telemetry ? (
                            <RuntimeDiagnostics telemetry={telemetry} />
                          ) : (
                            <div className="text-text-muted/40 italic text-xs uppercase tracking-widest flex items-center justify-center min-h-[100px] animate-in fade-in duration-300">
                              Run code to calculate diagnostics
                            </div>
                          )
                        ) : (
                          <>
                            {executionError ? (
                              <div className="text-red-400 whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <span className="font-black mr-2 opacity-50">
                                  [FATAL]
                                </span>
                                {executionError}
                              </div>
                            ) : executionOutput ? (
                              <div className="text-green-400 whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {executionOutput}
                              </div>
                            ) : (
                              <div className="text-text-muted/40 italic text-xs uppercase tracking-widest flex items-center justify-center min-h-[100px] animate-in fade-in duration-300">
                                Null pointer: No output detected
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Terminal Output */}
          {showTerminal && terminalLayout === "sidebar" && (
            <div className="hidden lg:flex animate-in slide-in-from-right-4 duration-500 flex-col h-full">
              <div className="bg-[#0c0e14] border border-border-subtle rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full sticky top-8">
                <div className="flex items-center justify-between px-6 py-2.5 bg-white/5 border-b border-white/5 gap-4">
                  <div className="flex items-center gap-3">
                    <LuTerminal size={18} className="text-brand" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-main hidden xl:inline">
                      Process Stream
                    </span>
                  </div>
                  {/* Tab Switcher inside header */}
                  <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-lg gap-0.5">
                    <button
                      onClick={() => setActiveTerminalTab("terminal")}
                      className={`px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider transition-all ${
                        activeTerminalTab === "terminal"
                          ? "bg-brand text-white shadow-sm"
                          : "text-text-muted hover:text-text-main"
                      }`}
                    >
                      Stdout
                    </button>
                    <button
                      onClick={() => setActiveTerminalTab("performance")}
                      className={`px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider transition-all ${
                        activeTerminalTab === "performance"
                          ? "bg-brand text-white shadow-sm"
                          : "text-text-muted hover:text-text-main"
                      }`}
                    >
                      Diagnostics
                    </button>
                  </div>
                  <button
                    onClick={() => setShowTerminal(false)}
                    className="bg-red-600 rounded-full hover:bg-red-500"
                  >
                    <LuCircle
                      size={16}
                      fill="currentColor"
                      className="opacity-20"
                    />
                  </button>
                </div>
                <div className="p-6 font-mono text-sm flex-1 overflow-y-auto custom-scrollbar leading-relaxed">
                  {isRunning ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-text-muted italic animate-pulse">
                      <LuLoader size={16} className="animate-spin text-brand" />
                      <span className="tracking-widest uppercase font-black text-[10px] text-brand/60">
                        Piping Stdout...
                      </span>
                    </div>
                  ) : (
                    <>
                      {activeTerminalTab === "performance" ? (
                        telemetry ? (
                          <RuntimeDiagnostics telemetry={telemetry} />
                        ) : (
                          <div className="flex items-center justify-center min-h-[300px] text-text-muted/20 italic font-black uppercase tracking-[0.3em] text-center animate-in fade-in duration-300">
                            No diagnostics calculated
                          </div>
                        )
                      ) : (
                        <>
                          {executionError ? (
                            <div className="text-red-400 whitespace-pre-wrap bg-red-400/5 p-6 rounded-2xl border border-red-400/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="font-black mb-3 uppercase tracking-tighter opacity-60">
                                Runtime Exception
                              </div>
                              {executionError}
                            </div>
                          ) : executionOutput ? (
                            <div className="text-green-400 whitespace-pre-wrap h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="font-black mb-3 uppercase tracking-tighter text-green-400/40">
                                Exit Code: 0 (Success)
                              </div>
                              {executionOutput}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center min-h-[300px] text-text-muted/20 italic font-black uppercase tracking-[0.3em] text-center animate-in fade-in duration-300">
                              No Data Stream
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CodeWorkspace;
