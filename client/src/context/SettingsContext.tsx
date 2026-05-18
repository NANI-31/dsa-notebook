import React, { createContext, useContext } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store";
import {
  fetchSettings,
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
} from "../features/settings/settingsSlice";
import { addToast } from "../features/ui/uiSlice";
import { loader } from "@monaco-editor/react";
import { defineEditorThemes } from "../components/CustomMonaco/editorThemes";

export interface SettingsContextType {
  reinitializeSettings: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
  prewarmMonacoThemes: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  const reinitializeSettings = async () => {
    try {
      await dispatch(fetchSettings()).unwrap();
      dispatch(
        addToast({
          message: "Preferences re-initialized from cloud successfully!",
          type: "success",
          duration: 3000,
        })
      );
    } catch (err: any) {
      dispatch(
        addToast({
          message: `Failed to re-initialize settings: ${err.message || err}`,
          type: "error",
          duration: 5000,
        })
      );
    }
  };

  const resetToDefaults = async () => {
    try {
      // 1. Reset all settings state slices in Redux
      dispatch(setTheme("dark"));
      dispatch(setAccentColor("#6366f1"));
      dispatch(setSyncWithSystem(false));
      dispatch(setTerminalLayout("bottom"));
      dispatch(setEditorHighContrast(false));
      dispatch(setEditorTheme("custom-dark"));
      dispatch(setEditorFontSize(14));
      dispatch(setEditorFontLigatures(true));
      dispatch(setEditorFontFamily("Fira Code"));
      dispatch(setEditorCursorBlinking("smooth"));
      dispatch(setEditorLineNumberPadding(28));
      dispatch(setEditorContrastRatio(100));

      const defaultShortcuts = {
        runCode: "Ctrl+Enter",
        toggleTheme: "Ctrl+l",
        increaseFontSize: "Ctrl+ArrowUp",
        decreaseFontSize: "Ctrl+ArrowDown",
        toggleTerminal: "Ctrl+`",
      };

      dispatch(setShortcut({ actionId: "runCode", keyCombo: defaultShortcuts.runCode }));
      dispatch(setShortcut({ actionId: "toggleTheme", keyCombo: defaultShortcuts.toggleTheme }));
      dispatch(setShortcut({ actionId: "increaseFontSize", keyCombo: defaultShortcuts.increaseFontSize }));
      dispatch(setShortcut({ actionId: "decreaseFontSize", keyCombo: defaultShortcuts.decreaseFontSize }));
      dispatch(setShortcut({ actionId: "toggleTerminal", keyCombo: defaultShortcuts.toggleTerminal }));

      // 2. Synchronize entire reset package to cloud database
      await dispatch(
        syncSettings({
          theme: "dark",
          accentColor: "#6366f1",
          syncWithSystem: false,
          terminalLayout: "bottom",
          editorHighContrast: false,
          editorTheme: "custom-dark",
          editorFontSize: 14,
          editorFontLigatures: true,
          editorFontFamily: "Fira Code",
          editorCursorBlinking: "smooth",
          editorLineNumberPadding: 28,
          editorContrastRatio: 100,
          shortcuts: defaultShortcuts,
        })
      ).unwrap();

      dispatch(
        addToast({
          message: "All environment preferences successfully reset to system defaults!",
          type: "success",
          duration: 4000,
        })
      );
    } catch (err: any) {
      dispatch(
        addToast({
          message: `Settings reset failed to synchronize: ${err.message || err}`,
          type: "error",
          duration: 5000,
        })
      );
    }
  };

  const prewarmMonacoThemes = async () => {
    try {
      console.log("[Monaco Pre-warming Provider] Initiating background pre-warm...");
      const monaco = await loader.init();
      defineEditorThemes(monaco);
      console.log("[Monaco Pre-warming Provider] Monaco core and custom themes successfully preloaded!");
    } catch (err) {
      console.warn("[Monaco Pre-warming Provider] Pre-warm failed or was deferred:", err);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        reinitializeSettings,
        resetToDefaults,
        prewarmMonacoThemes,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
