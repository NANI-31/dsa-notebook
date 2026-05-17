import React, { useRef, useEffect, useState } from "react";
import Editor, {
  type EditorProps,
  type OnMount,
  type BeforeMount,
} from "@monaco-editor/react";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { EDITOR_CONSTANTS } from "../../constants/editor";
import { useEditorHeight } from "../../hooks/useEditorHeight";
import { useSemanticHighlighter } from "./useSemanticHighlighter";
import { defineEditorThemes, THEME_LAYOUT_COLORS } from "./editorThemes";

interface CustomMonacoProps extends Omit<EditorProps, "theme"> {
  autoHeight?: boolean;
  minHeight?: number | string;
  maxHeight?: number | string;
  isFocusMode?: boolean;
}

/**
 * Advanced Monaco Editor wrapper for DSA Notebook.
 * Features:
 * - Theme synchronization (Standard & High Contrast)
 * - Intelligent Auto-Height with smooth transitions
 * - Focus Mode for deep-dive editing
 * - Standardized Premium Configuration
 * - Custom Semantic Highlighting (Regex-based)
 */
const CustomMonaco: React.FC<CustomMonacoProps> = ({
  autoHeight = false,
  minHeight = EDITOR_CONSTANTS.MIN_HEIGHT,
  maxHeight = EDITOR_CONSTANTS.MAX_HEIGHT,
  isFocusMode = false,
  onMount,
  ...props
}) => {
  const {
    theme: globalTheme,
    editorHighContrast,
    editorTheme,
    editorFontSize,
    editorFontLigatures,
  } = useSelector((state: RootState) => state.settings);

  const editorRef = useRef<any>(null);
  const [monacoInstance, setMonacoInstance] = useState<any>(null);

  const { dynamicHeight, updateHeight } = useEditorHeight({
    autoHeight,
    minHeight,
    maxHeight,
    isFocusMode,
    initialHeight: props.height,
  });

  // Apply custom semantic highlighting hooks
  useSemanticHighlighter(editorRef.current, monacoInstance);

  // Synchronize parent layout colors with the selected editor theme
  useEffect(() => {
    const activeThemeKey = getEditorTheme();
    const colors =
      THEME_LAYOUT_COLORS[activeThemeKey] || THEME_LAYOUT_COLORS["custom-dark"];

    const root = document.documentElement;
    root.style.setProperty("--editor-bg", colors.bg);
    root.style.setProperty("--editor-header-bg", colors.headerBg);
    root.style.setProperty("--editor-border", colors.border);
    root.style.setProperty("--editor-text", colors.text);
  }, [editorTheme, globalTheme, editorHighContrast]);

  const getEditorTheme = () => {
    if (editorHighContrast) {
      return globalTheme === "dark" ? "hc-black" : "hc-light";
    }
    return editorTheme || "custom-dark";
  };

  const handleBeforeMount: BeforeMount = (monaco) => {
    defineEditorThemes(monaco);
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setMonacoInstance(monaco);

    if (autoHeight) {
      updateHeight(editor);
      editor.onDidContentSizeChange(() => updateHeight(editor));
    }

    if (onMount) {
      onMount(editor, monaco);
    }
  };

  // Sync layout when focus mode switches
  useEffect(() => {
    if (editorRef.current && autoHeight) {
      updateHeight(editorRef.current);
    }
  }, [isFocusMode, autoHeight, updateHeight]);

  const defaultOptions: EditorProps["options"] = {
    fontSize: editorFontSize,
    fontLigatures: editorFontLigatures,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    padding: {
      top: EDITOR_CONSTANTS.PADDING_TOP,
      bottom: EDITOR_CONSTANTS.PADDING_BOTTOM,
    },
    fontFamily: EDITOR_CONSTANTS.FONT_FAMILY,
    cursorSmoothCaretAnimation: "on",
    smoothScrolling: true,
    roundedSelection: true,
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
    fixedOverflowWidgets: true,
    scrollbar: autoHeight
      ? { vertical: "hidden", handleMouseWheel: true }
      : undefined,
    renderLineHighlight: "none",
    ...props.options,
  };

  return (
    <div
      style={{
        height: autoHeight ? dynamicHeight : props.height || "100%",
        transition: `height ${EDITOR_CONSTANTS.TRANSITION_SPEED} ${EDITOR_CONSTANTS.TRANSITION_TIMING}`,
        overflow: "hidden",
      }}
    >
      <Editor
        {...props}
        height="100%"
        theme={getEditorTheme()}
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
        options={defaultOptions}
      />
    </div>
  );
};

export default CustomMonaco;
