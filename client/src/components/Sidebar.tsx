import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { fetchFolders } from "../features/folders/foldersSlice";
import { fetchCategories } from "../features/categories/categoriesSlice";
import api from "../services/api";
import type { Problem } from "../types/problem";

// Sub-components
import SidebarHeader from "./Sidebar/SidebarHeader";
import NavigationSection from "./Sidebar/NavigationSection";
import WorkspaceExplorer from "./Sidebar/WorkspaceExplorer/WorkspaceExplorer";
import SidebarFooter from "./Sidebar/SidebarFooter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const theme = useSelector((state: RootState) => state.settings.theme);
  const { folders } = useSelector((state: RootState) => state.folders);
  const { list: categories } = useSelector(
    (state: RootState) => state.categories,
  );

  // Local state for Workspace Problems & Resizing Width
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const isResizingRef = useRef(false);

  const isActive = (path: string) => location.pathname === path;

  // Restore sidebar width from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebarWidth");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 240) {
        setSidebarWidth(parsed);
      }
    }
  }, []);

  // Drag Resize Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const max30Percent = window.innerWidth * 0.22;
      // Clamp between min 240px and max 30% of innerWidth
      const newWidth = Math.max(240, Math.min(e.clientX, max30Percent));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        localStorage.setItem("sidebarWidth", sidebarWidth.toString());
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [sidebarWidth]);

  // Load backend dependencies
  useEffect(() => {
    dispatch(fetchFolders());
    dispatch(fetchCategories());
    fetchWorkspaceProblems();
  }, [dispatch]);

  const fetchWorkspaceProblems = async () => {
    try {
      setLoadingProblems(true);
      const response = await api.get<{ data: Problem[] }>(
        "/problems?limit=1000",
      );
      setAllProblems(response.data.data);
    } catch (err) {
      console.error("[Workspace Tree] Failed to load problems:", err);
    } finally {
      setLoadingProblems(false);
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
        />
      )}

      {/* Main Sidebar Panel */}
      <div
        style={{ width: `${sidebarWidth}px` }}
        className={`fixed lg:sticky top-0 left-0 h-screen bg-sidebar border-r border-border-subtle flex flex-col z-50 transition-transform duration-300 shrink-0 select-none ${
          isOpen
            ? "translate-x-0 shadow-2xl lg:shadow-none"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <SidebarHeader theme={theme} onClose={onClose} />

        {/* Sidebar Content */}
        <div className="flex-1 flex flex-col overflow-hidden px-4 py-2 gap-2 pb-6">
          <NavigationSection isActive={isActive} onClose={onClose} />

          <WorkspaceExplorer
            folders={folders}
            categories={categories}
            allProblems={allProblems}
            loadingProblems={loadingProblems}
            onClose={onClose}
            fetchWorkspaceProblems={fetchWorkspaceProblems}
          />
        </div>

        <SidebarFooter isActive={isActive} onClose={onClose} />

        {/* Resize Handle Handle Bar */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-brand/30 active:bg-brand/50 transition-colors z-50 group"
          title="Drag to resize sidebar"
        >
          {/* Visual Indicator Cue Line */}
          <div className="w-[2px] h-10 bg-brand/35 rounded absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
