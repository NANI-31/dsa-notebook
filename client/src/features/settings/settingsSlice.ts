import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../services/api";

export interface SettingsState {
  theme: "light" | "dark";
  accentColor: string;
  syncWithSystem: boolean;
  terminalLayout: "sidebar" | "bottom";
  editorHighContrast: boolean;
  editorTheme: string;
  editorFontSize: number;
  editorFontLigatures: boolean;
  loading: boolean;
  error: string | null;
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
  loading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async () => {
    const response = await api.get("/settings");
    return response.data;
  },
);

export const syncSettings = createAsyncThunk(
  "settings/syncSettings",
  async (settings: Partial<SettingsState>) => {
    const response = await api.patch("/settings", settings);
    return response.data;
  },
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.accentColor = action.payload;
      localStorage.setItem("accent", action.payload);
    },
    setSyncWithSystem: (state, action: PayloadAction<boolean>) => {
      state.syncWithSystem = action.payload;
      localStorage.setItem("syncSystem", String(action.payload));
    },
    setTerminalLayout: (state, action: PayloadAction<"sidebar" | "bottom">) => {
      state.terminalLayout = action.payload;
      localStorage.setItem("terminalLayout", action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", state.theme);
      if (state.syncWithSystem) state.syncWithSystem = false;
    },
    setEditorHighContrast: (state, action: PayloadAction<boolean>) => {
      state.editorHighContrast = action.payload;
      localStorage.setItem("editorHighContrast", String(action.payload));
    },
    setEditorTheme: (state, action: PayloadAction<string>) => {
      state.editorTheme = action.payload;
      localStorage.setItem("editorTheme", action.payload);
    },
    setEditorFontSize: (state, action: PayloadAction<number>) => {
      state.editorFontSize = action.payload;
      localStorage.setItem("editorFontSize", String(action.payload));
    },
    setEditorFontLigatures: (state, action: PayloadAction<boolean>) => {
      state.editorFontLigatures = action.payload;
      localStorage.setItem("editorFontLigatures", String(action.payload));
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
        
        localStorage.setItem("terminalLayout", action.payload.terminalLayout);
        localStorage.setItem("editorHighContrast", String(action.payload.editorHighContrast));
        localStorage.setItem("editorTheme", action.payload.editorTheme || "custom-dark");
        localStorage.setItem("editorFontSize", String(action.payload.editorFontSize ?? 14));
        localStorage.setItem("editorFontLigatures", String(action.payload.editorFontLigatures ?? true));
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
} = settingsSlice.actions;
export default settingsSlice.reducer;
