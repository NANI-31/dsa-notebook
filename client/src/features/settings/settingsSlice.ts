import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../services/api";
import { addToast } from "../ui/uiSlice";

export interface SettingsState {
  theme: "light" | "dark";
  accentColor: string;
  syncWithSystem: boolean;
  terminalLayout: "sidebar" | "bottom";
  editorHighContrast: boolean;
  editorTheme: string;
  editorFontSize: number;
  editorFontLigatures: boolean;
  editorFontFamily: string;
  loading: boolean;
  error: string | null;

  // Offline-first sync status
  isOnline: boolean;
  syncStatus: "synced" | "syncing" | "offline" | "error";

  // Customizable hotkeys for tactile keyboard shortcut manager
  shortcuts: Record<string, string>;
}

const initialState: SettingsState = {
  theme: (localStorage.getItem("theme") as "light" | "dark") || "dark",
  accentColor: localStorage.getItem("accent") || "#6366f1",
  syncWithSystem: localStorage.getItem("syncSystem") === "true",
  terminalLayout:
    (localStorage.getItem("terminalLayout") as "sidebar" | "bottom") ||
    "bottom",
  editorHighContrast: localStorage.getItem("editorHighContrast") === "true",
  editorTheme: localStorage.getItem("editorTheme") || "custom-dark",
  editorFontSize: Number(localStorage.getItem("editorFontSize")) || 14,
  editorFontLigatures: localStorage.getItem("editorFontLigatures") !== "false",
  editorFontFamily: localStorage.getItem("editorFontFamily") || "Fira Code",
  loading: false,
  error: null,
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  syncStatus: "synced",
  shortcuts: (() => {
    try {
      const saved = localStorage.getItem("editorShortcuts");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load shortcuts:", e);
    }
    return {
      runCode: "Ctrl+Enter",
      toggleTheme: "Ctrl+l",
      increaseFontSize: "Ctrl+ArrowUp",
      decreaseFontSize: "Ctrl+ArrowDown",
      toggleTerminal: "Ctrl+`",
    };
  })(),
};

// Global BroadcastChannel to sync settings cross-tab
const settingsChannel = typeof window !== "undefined" && "BroadcastChannel" in window
  ? new BroadcastChannel("dsa-settings-channel")
  : null;

export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async () => {
    const response = await api.get("/settings");
    return response.data;
  },
);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let pendingSettingsBuffer: Partial<SettingsState> = {};
let syncSettingsTimeoutId: any = null;
let pendingResolvers: Array<(value: any) => void> = [];
let pendingRejecters: Array<(reason: any) => void> = [];

export const syncSettings = createAsyncThunk(
  "settings/syncSettings",
  async (settings: Partial<SettingsState>, { dispatch }) => {
    // Accumulate/buffer settings updates
    pendingSettingsBuffer = {
      ...pendingSettingsBuffer,
      ...settings,
    };

    const isClientOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (!isClientOnline) {
      dispatch(setSyncStatus("offline"));
      // Write immediately to crash backup disk
      localStorage.setItem("offlineSettingsBackup", JSON.stringify(pendingSettingsBuffer));
    } else {
      dispatch(setSyncStatus("syncing"));
    }

    // Clear active timeouts to debounce by 1000ms
    if (syncSettingsTimeoutId) {
      clearTimeout(syncSettingsTimeoutId);
    }

    return new Promise((resolve, reject) => {
      pendingResolvers.push(resolve);
      pendingRejecters.push(reject);

      syncSettingsTimeoutId = setTimeout(async () => {
        const payloadToSync = { ...pendingSettingsBuffer };
        const resolvers = [...pendingResolvers];
        const rejecters = [...pendingRejecters];

        // Reset buffers
        pendingSettingsBuffer = {};
        pendingResolvers = [];
        pendingRejecters = [];
        syncSettingsTimeoutId = null;

        const stillOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
        if (!stillOnline) {
          dispatch(setSyncStatus("offline"));
          resolvers.forEach((r) => r({ message: "Saved locally (Offline)", offline: true }));
          return;
        }

        // Sync with Exponential Backoff Retry (Max 3 attempts)
        const maxRetries = 3;
        let attempt = 0;
        let success = false;
        let responseData: any = null;
        let lastError: any = null;

        while (attempt < maxRetries && !success) {
          try {
            attempt++;
            console.log(`[Sync settings retry] Sync attempt ${attempt} of ${maxRetries}...`);
            const response = await api.patch("/settings", payloadToSync);
            responseData = response.data;
            success = true;
          } catch (error: any) {
            lastError = error;
            console.warn(`[Sync settings retry] Attempt ${attempt} failed: ${error.message}`);
            if (attempt < maxRetries) {
              const backoffDelay = Math.pow(2, attempt) * 1000; // 2000ms, 4000ms
              dispatch(addToast({
                message: `Still retrying settings sync (Attempt ${attempt}/3)...`,
                type: "warning",
                duration: backoffDelay - 200
              }));
              await delay(backoffDelay);
            }
          }
        }

        if (success) {
          console.log("[Settings Sync Buffering] Sync successfully pushed to database!");
          dispatch(setSyncStatus("synced"));
          localStorage.removeItem("offlineSettingsBackup");
          
          dispatch(addToast({
            message: "Preferences synchronized with cloud database!",
            type: "success",
            duration: 3000
          }));

          resolvers.forEach((r) => r(responseData));
        } else {
          console.error("[Settings Sync Buffering] All sync attempts failed:", lastError);
          dispatch(setSyncStatus("error"));
          
          dispatch(addToast({
            message: "Server sync offline. Changes cached locally until connection restores.",
            type: "error",
            duration: 5000
          }));

          rejecters.forEach((rj) => rj(lastError.message || "Failed to sync settings"));
        }
      }, 1000);
    });
  }
);

export const syncOfflineSettings = createAsyncThunk(
  "settings/syncOfflineSettings",
  async (_, { dispatch }) => {
    const backupStr = localStorage.getItem("offlineSettingsBackup");
    if (backupStr) {
      try {
        const backup = JSON.parse(backupStr);
        console.log("[Offline Hydrator] Found offline settings backup. Re-syncing with server...", backup);
        dispatch(syncSettings(backup));
      } catch (err) {
        console.error("[Offline Hydrator] Failed to parse backup:", err);
      }
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      if (state.theme === action.payload) return;
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
      if (settingsChannel) {
        settingsChannel.postMessage({ type: "settings/setTheme", payload: action.payload });
      }
    },
    setAccentColor: (state, action: PayloadAction<string>) => {
      if (state.accentColor === action.payload) return;
      state.accentColor = action.payload;
      localStorage.setItem("accent", action.payload);
      if (settingsChannel) {
        settingsChannel.postMessage({ type: "settings/setAccentColor", payload: action.payload });
      }
    },
    setSyncWithSystem: (state, action: PayloadAction<boolean>) => {
      if (state.syncWithSystem === action.payload) return;
      state.syncWithSystem = action.payload;
      localStorage.setItem("syncSystem", String(action.payload));
      if (settingsChannel) {
        settingsChannel.postMessage({ type: "settings/setSyncWithSystem", payload: action.payload });
      }
    },
    setTerminalLayout: (state, action: PayloadAction<"sidebar" | "bottom">) => {
      if (state.terminalLayout === action.payload) return;
      state.terminalLayout = action.payload;
      localStorage.setItem("terminalLayout", action.payload);
      if (settingsChannel) {
        settingsChannel.postMessage({ type: "settings/setTerminalLayout", payload: action.payload });
      }
    },
    toggleTheme: (state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      state.theme = nextTheme;
      localStorage.setItem("theme", nextTheme);
      if (state.syncWithSystem) state.syncWithSystem = false;
      if (settingsChannel) {
        settingsChannel.postMessage({ type: "settings/setTheme", payload: nextTheme });
      }
    },
    setEditorHighContrast: (state, action: PayloadAction<boolean>) => {
      if (state.editorHighContrast === action.payload) return;
      state.editorHighContrast = action.payload;
      localStorage.setItem("editorHighContrast", String(action.payload));
      if (settingsChannel) {
        settingsChannel.postMessage({ type: "settings/setEditorHighContrast", payload: action.payload });
      }
    },
    setEditorTheme: (state, action: PayloadAction<string>) => {
      if (state.editorTheme === action.payload) return;
      state.editorTheme = action.payload;
      localStorage.setItem("editorTheme", action.payload);
      if (settingsChannel) {
        settingsChannel.postMessage({ type: "settings/setEditorTheme", payload: action.payload });
      }
    },
    setEditorFontSize: (state, action: PayloadAction<number>) => {
      if (state.editorFontSize === action.payload) return;
      state.editorFontSize = action.payload;
      localStorage.setItem("editorFontSize", String(action.payload));
      if (settingsChannel) {
        settingsChannel.postMessage({ type: "settings/setEditorFontSize", payload: action.payload });
      }
    },
    setEditorFontLigatures: (state, action: PayloadAction<boolean>) => {
      if (state.editorFontLigatures === action.payload) return;
      state.editorFontLigatures = action.payload;
      localStorage.setItem("editorFontLigatures", String(action.payload));
      if (settingsChannel) {
        settingsChannel.postMessage({ type: "settings/setEditorFontLigatures", payload: action.payload });
      }
    },
    setEditorFontFamily: (state, action: PayloadAction<string>) => {
      if (state.editorFontFamily === action.payload) return;
      state.editorFontFamily = action.payload;
      localStorage.setItem("editorFontFamily", action.payload);
      if (settingsChannel) {
        settingsChannel.postMessage({ type: "settings/setEditorFontFamily", payload: action.payload });
      }
    },
    setOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      if (!action.payload) {
        state.syncStatus = "offline";
      }
    },
    setSyncStatus: (state, action: PayloadAction<"synced" | "syncing" | "offline" | "error">) => {
      state.syncStatus = action.payload;
    },
    setShortcut: (state, action: PayloadAction<{ actionId: string; keyCombo: string }>) => {
      const { actionId, keyCombo } = action.payload;
      state.shortcuts[actionId] = keyCombo;
      localStorage.setItem("editorShortcuts", JSON.stringify(state.shortcuts));
      if (settingsChannel) {
        settingsChannel.postMessage({ type: "settings/setShortcut", payload: action.payload });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.theme = action.payload.theme;
        state.accentColor = action.payload.accentColor;
        state.syncWithSystem = action.payload.syncWithSystem;
        state.terminalLayout = action.payload.terminalLayout;

        // Update local storage to keep in sync
        localStorage.setItem("theme", action.payload.theme);
        localStorage.setItem("accent", action.payload.accentColor);
        localStorage.setItem(
          "syncSystem",
          String(action.payload.syncWithSystem),
        );
        state.editorHighContrast = action.payload.editorHighContrast;
        state.editorTheme = action.payload.editorTheme || "custom-dark";
        state.editorFontSize = action.payload.editorFontSize ?? 14;
        state.editorFontLigatures = action.payload.editorFontLigatures ?? true;
        state.editorFontFamily = action.payload.editorFontFamily || "Fira Code";
        
        localStorage.setItem("terminalLayout", action.payload.terminalLayout);
        localStorage.setItem("editorHighContrast", String(action.payload.editorHighContrast));
        localStorage.setItem("editorTheme", action.payload.editorTheme || "custom-dark");
        localStorage.setItem("editorFontSize", String(action.payload.editorFontSize ?? 14));
        localStorage.setItem("editorFontLigatures", String(action.payload.editorFontLigatures ?? true));
        localStorage.setItem("editorFontFamily", action.payload.editorFontFamily || "Fira Code");
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch settings";
      });
  },
});

export const {
  setTheme,
  setAccentColor,
  setSyncWithSystem,
  setTerminalLayout,
  toggleTheme,
  setEditorHighContrast,
  setEditorTheme,
  setEditorFontSize,
  setEditorFontLigatures,
  setEditorFontFamily,
  setOnline,
  setSyncStatus,
  setShortcut,
} = settingsSlice.actions;
export default settingsSlice.reducer;
