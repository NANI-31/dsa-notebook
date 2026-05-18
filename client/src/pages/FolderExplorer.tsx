import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  LuFolder,
  LuFolderPlus,
  LuPlus,
  LuChevronRight,
  LuTrash2,
  LuFileText,
  LuMove,
  LuPenLine,
  LuCheck,
  LuX,
  LuLoader,
  LuArrowUpRight,
  LuSearch,
  LuFolderTree,
} from "react-icons/lu";
import type { RootState, AppDispatch } from "../app/store";
import {
  fetchFolders,
  createFolder,
  updateFolder,
  deleteFolder,
} from "../features/folders/foldersSlice";
import { fetchProblems } from "../features/problems/problemsSlice";
import { addToast } from "../features/ui/uiSlice";
import api from "../services/api";

const FolderExplorer: React.FC = () => {
  const { folderId } = useParams<{ folderId?: string }>();
  const activeFolderId = folderId || null;

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux state
  const { folders, loading: foldersLoading, saving: foldersSaving } = useSelector(
    (state: RootState) => state.folders
  );
  const { problems, loading: problemsLoading } = useSelector(
    (state: RootState) => state.problems
  );

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  
  // Moving state
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [movingItemType, setMovingItemType] = useState<"folder" | "problem" | null>(null);

  // Load folders on mount and problems in this active folder
  useEffect(() => {
    dispatch(fetchFolders());
  }, [dispatch]);

  useEffect(() => {
    // Fetch problems specifically belonging to this folderId (or "root")
    dispatch(
      fetchProblems({
        folderId: activeFolderId || "root",
        limit: 100, // Fetch all within folder for easy browsing
      })
    );
  }, [dispatch, activeFolderId]);

  // Derive folder tree structure / path breadcrumbs
  const activeFolder = useMemo(() => {
    if (!activeFolderId) return null;
    return folders.find((f) => f._id === activeFolderId) || null;
  }, [folders, activeFolderId]);

  const breadcrumbs = useMemo(() => {
    if (!activeFolder) return [];
    const crumbs = [];
    let current = activeFolder;
    while (current) {
      crumbs.unshift(current);
      if (!current.parentFolder) break;
      const parent = folders.find((f) => f._id === current.parentFolder);
      if (!parent) break;
      current = parent;
    }
    return crumbs;
  }, [folders, activeFolder]);

  // Filter child folders inside the active folder
  const childFolders = useMemo(() => {
    return folders.filter((f) => f.parentFolder === activeFolderId);
  }, [folders, activeFolderId]);

  // Handle creating a subfolder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const action = await dispatch(
        createFolder({
          name: newFolderName.trim(),
          parentFolder: activeFolderId,
        })
      );
      if (createFolder.fulfilled.match(action)) {
        dispatch(
          addToast({
            message: `Folder "${newFolderName}" created successfully!`,
            type: "success",
            duration: 3000,
          })
        );
        setNewFolderName("");
        setIsCreatingFolder(false);
      }
    } catch (err: any) {
      dispatch(
        addToast({
          message: "Failed to create folder",
          type: "error",
          duration: 3000,
        })
      );
    }
  };

  // Handle renaming a folder
  const handleRenameFolder = async (id: string) => {
    if (!editingFolderName.trim()) return;
    try {
      const action = await dispatch(
        updateFolder({
          id,
          name: editingFolderName.trim(),
        })
      );
      if (updateFolder.fulfilled.match(action)) {
        dispatch(
          addToast({
            message: "Folder renamed successfully!",
            type: "success",
            duration: 3000,
          })
        );
        setEditingFolderId(null);
        setEditingFolderName("");
      }
    } catch (err) {
      dispatch(
        addToast({
          message: "Failed to rename folder",
          type: "error",
          duration: 3000,
        })
      );
    }
  };

  // Handle deleting a folder
  const handleDeleteFolder = async (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete folder "${name}"? All subfolders will be deleted. Any problems inside will bubble up.`
      )
    ) {
      try {
        const action = await dispatch(deleteFolder(id));
        if (deleteFolder.fulfilled.match(action)) {
          dispatch(
            addToast({
              message: `Folder "${name}" and all subfolders deleted!`,
              type: "success",
              duration: 3000,
            })
          );
        }
      } catch (err) {
        dispatch(
          addToast({
            message: "Failed to delete folder",
            type: "error",
            duration: 3000,
          })
        );
      }
    }
  };

  // Handle moving folder or problem to a new parent folder
  const handleMoveItem = async (targetParentId: string | null) => {
    if (!movingItemId || !movingItemType) return;

    try {
      if (movingItemType === "folder") {
        // Prevent moving a folder into itself
        if (movingItemId === targetParentId) {
          dispatch(
            addToast({
              message: "Cannot move a folder inside itself!",
              type: "error",
              duration: 3000,
            })
          );
          return;
        }

        const action = await dispatch(
          updateFolder({
            id: movingItemId,
            parentFolder: targetParentId,
          })
        );
        if (updateFolder.fulfilled.match(action)) {
          dispatch(
            addToast({
              message: "Folder moved successfully!",
              type: "success",
              duration: 3000,
            })
          );
        }
      } else {
        // Move problem by sending PUT API update request
        const problem = problems.find((p) => p._id === movingItemId);
        if (problem) {
          const response = await api.put(`/problems/${problem.slug}`, {
            folderId: targetParentId,
          });
          if (response.status === 200) {
            dispatch(
              addToast({
                message: `Problem "${problem.title}" moved successfully!`,
                type: "success",
                duration: 3000,
              })
            );
            // Refresh list
            dispatch(
              fetchProblems({
                folderId: activeFolderId || "root",
                limit: 100,
              })
            );
          }
        }
      }
      setMovingItemId(null);
      setMovingItemType(null);
    } catch (err) {
      dispatch(
        addToast({
          message: "Failed to move item",
          type: "error",
          duration: 3000,
        })
      );
    }
  };

  // Get list of folders user can move items to (exclude children if moving folder)
  const eligibleMoveFolders = useMemo(() => {
    if (!movingItemId || movingItemType !== "folder") {
      return folders;
    }
    
    // Simple check: exclude target folder and its descendants
    const excludedIds = new Set<string>([movingItemId]);
    let addedNew = true;
    while (addedNew) {
      addedNew = false;
      folders.forEach((f) => {
        if (f.parentFolder && excludedIds.has(f.parentFolder) && !excludedIds.has(f._id)) {
          excludedIds.add(f._id);
          addedNew = true;
        }
      });
    }

    return folders.filter((f) => !excludedIds.has(f._id));
  }, [folders, movingItemId, movingItemType]);

  // Difficulty badge styling helper
  const getDifficultyPill = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Hard":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-main pb-24 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Explorer Header */}
      <header className="p-6 md:p-8 border-b border-border-subtle bg-sidebar/50 backdrop-blur-md sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2 font-semibold">
            <Link
              to="/folders"
              className="hover:text-text-main hover:underline transition-all flex items-center gap-1"
            >
              <LuFolderTree size={14} className="text-brand" />
              <span>Root</span>
            </Link>
            {breadcrumbs.map((crumb) => (
              <React.Fragment key={crumb._id}>
                <LuChevronRight size={12} className="opacity-40" />
                <Link
                  to={`/folders/${crumb._id}`}
                  className="hover:text-text-main hover:underline transition-all"
                >
                  {crumb.name}
                </Link>
              </React.Fragment>
            ))}
          </div>

          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-brand/10 text-brand rounded-xl">
              <LuFolder size={24} />
            </div>
            {activeFolder ? activeFolder.name : "Folder Explorer"}
          </h2>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Search active folder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-sidebar border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 text-text-main transition-all font-medium"
            />
          </div>

          {/* New Folder Button */}
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="bg-sidebar hover:bg-black/10 dark:hover:bg-white/5 text-text-main border border-border-subtle font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <LuFolderPlus size={16} className="text-brand" />
            <span>New Folder</span>
          </button>

          {/* New Problem Button */}
          <Link
            to={`/problems/new?folderId=${activeFolderId || ""}`}
            className="bg-brand hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 active:scale-95 shadow-md shadow-brand/20"
          >
            <LuPlus size={16} />
            <span>New Problem</span>
          </Link>
        </div>
      </header>

      {/* Main Sandbox Grid */}
      <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
        
        {/* Inline Create Folder Modal Form */}
        {isCreatingFolder && (
          <form
            onSubmit={handleCreateFolder}
            className="bg-sidebar border border-brand/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-top-4 duration-300"
          >
            <div className="flex-1 w-full">
              <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-brand mb-2 italic">
                New Folder Name
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Dynamic Programming"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-app-bg border border-border-subtle rounded-xl px-4 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-brand/40 text-sm font-semibold"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto self-end mt-4 sm:mt-0">
              <button
                type="submit"
                className="bg-brand text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all flex items-center gap-2 hover:opacity-90 active:scale-95 flex-1 sm:flex-initial justify-center"
              >
                {foldersSaving ? <LuLoader className="animate-spin" /> : <LuCheck size={16} />}
                <span>Create</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }}
                className="bg-sidebar border border-border-subtle text-text-muted hover:text-text-main text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all active:scale-95 flex-1 sm:flex-initial justify-center"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* --- Folder Hierarchy Grid --- */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.35em] text-text-muted mb-5 italic opacity-40">
            Folders ({childFolders.length})
          </h3>

          {foldersLoading ? (
            <div className="flex items-center gap-3 text-text-muted py-8 font-semibold animate-pulse">
              <LuLoader className="animate-spin text-brand" size={20} />
              <span>Scanning directories...</span>
            </div>
          ) : childFolders.length === 0 ? (
            <div className="bg-sidebar/30 border border-dashed border-border-subtle rounded-2xl p-8 text-center text-text-muted font-medium text-sm">
              No subfolders here yet. Create one above!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {childFolders
                .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((folder) => {
                  const isEditing = editingFolderId === folder._id;
                  return (
                    <div
                      key={folder._id}
                      className="group relative bg-sidebar border border-border-subtle hover:border-brand/30 rounded-2xl p-4.5 transition-all duration-300 hover:shadow-lg shadow-sm flex items-center justify-between"
                    >
                      {/* Left: icon & title */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div
                          onClick={() => {
                            if (!isEditing) navigate(`/folders/${folder._id}`);
                          }}
                          className="p-3 bg-brand/10 text-brand rounded-xl cursor-pointer group-hover:scale-105 transition-transform"
                        >
                          <LuFolder size={20} className="fill-brand/15" />
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingFolderName}
                              onChange={(e) => setEditingFolderName(e.target.value)}
                              className="bg-app-bg border border-brand text-xs font-bold rounded-lg px-2 py-1 w-full text-text-main focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameFolder(folder._id);
                                if (e.key === "Escape") setEditingFolderId(null);
                              }}
                            />
                            <button
                              onClick={() => handleRenameFolder(folder._id)}
                              className="p-1.5 bg-brand text-white rounded-lg hover:opacity-90"
                            >
                              <LuCheck size={14} />
                            </button>
                            <button
                              onClick={() => setEditingFolderId(null)}
                              className="p-1.5 bg-sidebar border border-border-subtle rounded-lg text-text-muted hover:text-text-main"
                            >
                              <LuX size={14} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => navigate(`/folders/${folder._id}`)}
                            className="text-sm font-bold text-text-main hover:text-brand cursor-pointer truncate flex-1"
                          >
                            {folder.name}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Move Folder */}
                          <button
                            onClick={() => {
                              setMovingItemId(folder._id);
                              setMovingItemType("folder");
                            }}
                            title="Move Folder"
                            className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/5 text-text-muted hover:text-text-main"
                          >
                            <LuMove size={14} />
                          </button>
                          {/* Rename Folder */}
                          <button
                            onClick={() => {
                              setEditingFolderId(folder._id);
                              setEditingFolderName(folder.name);
                            }}
                            title="Rename"
                            className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/5 text-text-muted hover:text-text-main"
                          >
                            <LuPenLine size={14} />
                          </button>
                          {/* Delete Folder */}
                          <button
                            onClick={() => handleDeleteFolder(folder._id, folder.name)}
                            title="Delete"
                            className="p-2 rounded-lg hover:bg-rose-500/10 text-text-muted hover:text-rose-500"
                          >
                            <LuTrash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* --- Problem Files Section --- */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.35em] text-text-muted mb-5 italic opacity-40">
            Files & Problems ({problems.length})
          </h3>

          {problemsLoading ? (
            <div className="flex items-center gap-3 text-text-muted py-8 font-semibold animate-pulse">
              <LuLoader className="animate-spin text-brand" size={20} />
              <span>Indexing documents...</span>
            </div>
          ) : problems.length === 0 ? (
            <div className="bg-sidebar/30 border border-dashed border-border-subtle rounded-2xl p-12 text-center text-text-muted font-medium text-sm flex flex-col items-center gap-3">
              <LuFileText size={32} className="opacity-30" />
              <span>No problem files stored inside this directory. Create a new problem above!</span>
            </div>
          ) : (
            <div className="bg-sidebar border border-border-subtle rounded-3xl overflow-hidden shadow-sm">
              <div className="divide-y divide-border-subtle">
                {problems
                  .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((problem) => (
                    <div
                      key={problem._id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4.5 gap-4 hover:bg-text-main/5 transition-colors"
                    >
                      {/* Left side: title, difficulty, techniques */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="p-3 bg-brand/5 text-brand rounded-xl group-hover:bg-brand/10 transition-colors">
                          <LuFileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <Link
                              to={`/problems/${problem.slug}`}
                              className="text-sm font-black text-text-main hover:text-brand transition-colors truncate"
                            >
                              {problem.title}
                            </Link>
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getDifficultyPill(
                                problem.difficulty
                              )}`}
                            >
                              {problem.difficulty}
                            </span>
                          </div>
                          
                          {/* Breadcrumbs for taxonomy */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                            <span className="font-semibold uppercase tracking-wider text-[10px]">
                              {problem.category?.name || "Uncategorized"}
                            </span>
                            <LuChevronRight size={10} className="opacity-45" />
                            <span>{problem.subCategory}</span>
                            {problem.techniques && problem.techniques.length > 0 && (
                              <>
                                <span className="opacity-30">•</span>
                                <div className="flex flex-wrap gap-1">
                                  {problem.techniques.slice(0, 3).map((t) => (
                                    <span
                                      key={t._id}
                                      className="bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-[10px] font-medium"
                                    >
                                      {t.name}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Move Problem */}
                        <button
                          onClick={() => {
                            setMovingItemId(problem._id);
                            setMovingItemType("problem");
                          }}
                          className="px-3.5 py-2 rounded-xl bg-sidebar border border-border-subtle hover:border-brand/40 text-text-muted hover:text-text-main text-xs font-bold transition-all flex items-center gap-1.5"
                          title="Move to Folder"
                        >
                          <LuMove size={14} className="text-brand" />
                          <span>Move</span>
                        </button>

                        {/* Open Problem details */}
                        <Link
                          to={`/problems/${problem.slug}`}
                          className="p-2.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/5 text-text-muted hover:text-text-main flex items-center"
                          title="Open Sandbox"
                        >
                          <LuArrowUpRight size={16} />
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- Move Item Premium Overlay Modal --- */}
      {movingItemId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-sidebar border border-border-subtle w-full max-w-md rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-lg font-black tracking-tight text-text-main">
                Move {movingItemType === "folder" ? "Folder" : "Problem"}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Select a target directory folder to place this item inside.
              </p>
            </div>

            {/* Folders List */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar pr-1 border border-border-subtle rounded-2xl p-2 bg-app-bg/50">
              {/* Root folder option */}
              <button
                onClick={() => handleMoveItem(null)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all text-xs font-bold ${
                  activeFolderId === null
                    ? "bg-brand/10 text-brand"
                    : "hover:bg-text-main/5 text-text-muted hover:text-text-main"
                }`}
              >
                <LuFolderTree size={16} />
                <span>Move to Root (/)</span>
              </button>

              {eligibleMoveFolders.map((f) => (
                <button
                  key={f._id}
                  onClick={() => handleMoveItem(f._id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all text-xs font-bold ${
                    f._id === activeFolderId
                      ? "bg-brand/10 text-brand"
                      : "hover:bg-text-main/5 text-text-muted hover:text-text-main"
                  }`}
                >
                  <LuFolder size={16} />
                  <span>{f.name}</span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setMovingItemId(null);
                  setMovingItemType(null);
                }}
                className="w-full bg-sidebar border border-border-subtle hover:bg-black/10 dark:hover:bg-white/5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-text-muted hover:text-text-main active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderExplorer;
