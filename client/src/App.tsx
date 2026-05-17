import { useEffect, useCallback, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
import { fetchSettings } from "./features/settings/settingsSlice";
import { fetchCategories } from "./features/categories/categoriesSlice";
import { fetchTechniques } from "./features/techniques/techniquesSlice";
import { LuMenu, LuCode } from "react-icons/lu";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { theme, accentColor, syncWithSystem } = useSelector(
    (state: RootState) => state.settings,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
    dispatch(fetchCategories());
    dispatch(fetchTechniques());
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
