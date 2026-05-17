import { useEffect, useCallback, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loader } from "@monaco-editor/react";
import type { RootState, AppDispatch } from "./app/store";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AllProblems from "./pages/AllProblems";
import ProblemDetails from "./pages/ProblemDetails";
import Settings from "./pages/Settings";
import NewProblem from "./pages/NewProblem";
import EditProblem from "./pages/EditProblem";
import TaxonomyExplorer from "./pages/TaxonomyExplorer";
import DataStructures from "./pages/DataStructures";
import Algorithms from "./pages/Algorithms";
import ErrorBoundary from "./components/ErrorBoundary";
import {
  fetchSettings,
  setOnline,
  syncOfflineSettings,
  setTheme,
  setAccentColor,
  setSyncWithSystem,
  setTerminalLayout,
  setEditorHighContrast,
  setEditorTheme,
  setEditorFontSize,
  setEditorFontLigatures,
  setEditorFontFamily,
} from "./features/settings/settingsSlice";
import ToastContainer from "./components/ToastContainer";
import { fetchCategories } from "./features/categories/categoriesSlice";
import { fetchTechniques } from "./features/techniques/techniquesSlice";
import { LuMenu, LuCode } from "react-icons/lu";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { theme, accentColor, syncWithSystem } = useSelector(
    (state: RootState) => state.settings,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Monitor network connection status and run offline synchronization recovery
  useEffect(() => {
    const handleOnlineStatus = () => {
      console.log("[Network Telemetry] Client transitioned to ONLINE state. Resyncing dirty cache...");
      dispatch(setOnline(true));
      dispatch(syncOfflineSettings());
    };

    const handleOfflineStatus = () => {
      console.warn("[Network Telemetry] Client transitioned to OFFLINE state.");
      dispatch(setOnline(false));
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOfflineStatus);

    // Run once on load to catch offline settings recovery
    if (navigator.onLine) {
      dispatch(syncOfflineSettings());
    }

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOfflineStatus);
    };
  }, [dispatch]);

  // BroadcastChannel settings synchronizer for cross-tab theme & layout changes
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("dsa-settings-channel");

    const handleBroadcast = (event: MessageEvent) => {
      const { type, payload } = event.data;
      console.log(`[Broadcast Sync] Received event across tab: ${type}`, payload);

      switch (type) {
        case "settings/setTheme":
          dispatch(setTheme(payload));
          break;
        case "settings/setAccentColor":
          dispatch(setAccentColor(payload));
          break;
        case "settings/setSyncWithSystem":
          dispatch(setSyncWithSystem(payload));
          break;
        case "settings/setTerminalLayout":
          dispatch(setTerminalLayout(payload));
          break;
        case "settings/setEditorHighContrast":
          dispatch(setEditorHighContrast(payload));
          break;
        case "settings/setEditorTheme":
          dispatch(setEditorTheme(payload));
          break;
        case "settings/setEditorFontSize":
          dispatch(setEditorFontSize(payload));
          break;
        case "settings/setEditorFontLigatures":
          dispatch(setEditorFontLigatures(payload));
          break;
        case "settings/setEditorFontFamily":
          dispatch(setEditorFontFamily(payload));
          break;
        default:
          break;
      }
    };

    channel.addEventListener("message", handleBroadcast);
    return () => {
      channel.removeEventListener("message", handleBroadcast);
      channel.close();
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchSettings());
    dispatch(fetchCategories());
    dispatch(fetchTechniques());

    // Preload Monaco core bundles silently during browser idle time
    const preloadMonaco = () => {
      const triggerLoad = () => {
        console.log("[Monaco Preloader] Starting background preload of Monaco core packages...");
        loader.init()
          .then(() => {
            console.log("[Monaco Preloader] Background assets successfully preloaded and cached! IDE instantiation latency reduced to 0ms.");
          })
          .catch((err) => {
            console.warn("[Monaco Preloader] Preload deferred or failed:", err);
          });
      };

      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => triggerLoad(), { timeout: 5000 });
      } else {
        setTimeout(() => triggerLoad(), 3000);
      }
    };

    preloadMonaco();
  }, [dispatch]);

  const applyTheme = useCallback((targetTheme: string) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(targetTheme);
  }, []);

  useEffect(() => {
    if (syncWithSystem) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? "dark" : "light";
        applyTheme(newTheme);
      };

      const initialTheme = mediaQuery.matches ? "dark" : "light";
      applyTheme(initialTheme);

      mediaQuery.addEventListener("change", handleSystemChange);
      return () => mediaQuery.removeEventListener("change", handleSystemChange);
    } else {
      applyTheme(theme);
    }
  }, [theme, syncWithSystem, applyTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--brand", accentColor);
  }, [accentColor]);

  return (
    <div className="flex h-screen bg-app-bg text-text-main overflow-hidden transition-all duration-300">
      <ToastContainer />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-sidebar border-b border-border-subtle z-20">
          <div className="flex items-center gap-3">
            <div className="bg-brand p-1.5 rounded-lg text-white shadow-lg shadow-brand/20">
              <LuCode size={16} />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-text-main">
              DSA Tracker
            </h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
          >
            <LuMenu size={20} />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/problems" element={<AllProblems />} />
                <Route path="/problems/new" element={<NewProblem />} />
                <Route path="/problems/:id" element={<ProblemDetails />} />
                <Route path="/problems/:id/edit" element={<EditProblem />} />
                <Route path="/ds" element={<DataStructures />} />
                <Route path="/algorithms" element={<Algorithms />} />
                <Route path="/taxonomy" element={<TaxonomyExplorer />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
