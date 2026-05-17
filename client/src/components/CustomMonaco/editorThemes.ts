import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface ThemeDefinition extends editor.IStandaloneThemeData {}

export const EDITOR_THEMES: Record<string, ThemeDefinition> = {
  "custom-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "string", foreground: "98c379" }, // Classic One Dark green for strings
      { token: "comment", foreground: "9ca3af", fontStyle: "italic" }, // Gray for comments
      { token: "number", foreground: "d19a66" }, // Numbers
      { token: "keyword", foreground: "c678dd" },
    ],
    colors: {
      "editor.background": "#0c0e14",
      "editor.lineHighlightBorder": "#00000000",
    },
  },
  "dracula": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "ff79c6" },
      { token: "string", foreground: "f1fa8c" },
      { token: "number", foreground: "bd93f9" },
      { token: "comment", foreground: "6272a4", fontStyle: "italic" },
    ],
    colors: {
      "editor.background": "#282a36",
      "editor.foreground": "#f8f8f2",
      "editor.lineHighlightBorder": "#00000000",
    },
  },
  "monokai": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "f92672" },
      { token: "string", foreground: "e6db74" },
      { token: "number", foreground: "ae81ff" },
      { token: "comment", foreground: "75715e" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#f8f8f2",
      "editor.lineHighlightBorder": "#00000000",
    },
  },
  "github-light": {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "d73a49" },
      { token: "string", foreground: "032f62" },
      { token: "number", foreground: "005cc5" },
      { token: "comment", foreground: "6a737d", fontStyle: "italic" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#24292e",
      "editor.lineHighlightBorder": "#00000000",
    },
  },
};

export const THEME_LAYOUT_COLORS: Record<
  string,
  { bg: string; headerBg: string; border: string; text: string }
> = {
  "custom-dark": {
    bg: "#0c0e14",
    headerBg: "rgba(255, 255, 255, 0.05)",
    border: "var(--border-subtle)",
    text: "var(--text-main)",
  },
  "dracula": {
    bg: "#282a36",
    headerBg: "#1e1f29",
    border: "rgba(189, 147, 249, 0.2)",
    text: "#f8f8f2",
  },
  "monokai": {
    bg: "#272822",
    headerBg: "#1e1f1c",
    border: "rgba(117, 113, 94, 0.2)",
    text: "#f8f8f2",
  },
  "github-light": {
    bg: "#ffffff",
    headerBg: "#f6f8fa",
    border: "#e1e4e8",
    text: "#24292e",
  },
};

export const defineEditorThemes = (monaco: Monaco) => {
  // Register all available themes from the dictionary
  Object.keys(EDITOR_THEMES).forEach((themeName) => {
    monaco.editor.defineTheme(themeName, EDITOR_THEMES[themeName]);
  });
};
