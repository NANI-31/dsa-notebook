import React, { useRef, useEffect, useState } from "react";
import Editor, {
  type EditorProps,
  type OnMount,
  type BeforeMount,
  loader,
} from "@monaco-editor/react";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { EDITOR_CONSTANTS } from "../../constants/editor";
import { useEditorHeight } from "../../hooks/useEditorHeight";
import { useSemanticHighlighter } from "./useSemanticHighlighter";
import { defineEditorThemes, THEME_LAYOUT_COLORS } from "./editorThemes";

// Pinned version configured to match Monaco CDN Asset Pre-caching Service Worker
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs",
  },
});

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
    editorFontFamily,
  } = useSelector((state: RootState) => state.settings);

  const [resolvedFontFamily, setResolvedFontFamily] = useState(editorFontFamily || "Fira Code");

  // Observability font rendering validation hook
  useEffect(() => {
    const fontToTest = editorFontFamily || "Fira Code";
    if (document.fonts && typeof document.fonts.check === "function") {
      const checkAndVerifyFont = async () => {
        try {
          const isAvailable = document.fonts.check(`14px "${fontToTest}"`);
          if (isAvailable) {
            setResolvedFontFamily(fontToTest);
          } else {
            console.log(`[Font Observability] Loading remote font: "${fontToTest}"...`);
            await document.fonts.load(`14px "${fontToTest}"`);
            if (document.fonts.check(`14px "${fontToTest}"`)) {
              setResolvedFontFamily(fontToTest);
            } else {
              console.warn(
                `[Font Observability] Font "${fontToTest}" failed validation. Falling back to standard system monospace.`
              );
              setResolvedFontFamily("monospace");
            }
          }
        } catch (err) {
          console.warn(`[Font Observability] Validation check failed:`, err);
          setResolvedFontFamily("monospace");
        }
      };
      checkAndVerifyFont();
    } else {
      setResolvedFontFamily(fontToTest);
    }
  }, [editorFontFamily]);

  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [monacoInstance, setMonacoInstance] = useState<any>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  // IntersectionObserver to delay initialization until component is near the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "150px", // Pre-load slightly before scrolling into view
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

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
    fontFamily: `'${resolvedFontFamily}', ${EDITOR_CONSTANTS.FONT_FAMILY}`,
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

  const renderSkeleton = () => (
    <div 
      className="w-full h-full flex flex-col p-6 animate-pulse"
      style={{
        backgroundColor: "var(--editor-bg)",
        color: "var(--editor-text)",
        fontFamily: `'${resolvedFontFamily}', ${EDITOR_CONSTANTS.FONT_FAMILY}`,
      }}
    >
      <div className="flex flex-col gap-4 opacity-30">
        <div className="flex gap-4">
          <div className="w-8 h-4 bg-current/20 rounded-md" />
          <div className="w-48 h-4 bg-current/10 rounded-md" />
        </div>
        <div className="flex gap-4">
          <div className="w-8 h-4 bg-current/20 rounded-md" />
          <div className="w-64 h-4 bg-current/10 rounded-md" />
        </div>
        <div className="flex gap-4">
          <div className="w-8 h-4 bg-current/20 rounded-md" />
          <div className="w-32 h-4 bg-current/10 rounded-md" />
        </div>
        <div className="flex gap-4">
          <div className="w-8 h-4 bg-current/20 rounded-md" />
          <div className="w-20 h-4 bg-current/15 rounded-md" />
        </div>
        <div className="flex gap-4 mt-4">
          <div className="w-8 h-4 bg-current/20 rounded-md" />
          <div className="w-80 h-4 bg-current/10 rounded-md" />
        </div>
        <div className="flex gap-4">
          <div className="w-8 h-4 bg-current/20 rounded-md" />
          <div className="w-40 h-4 bg-current/10 rounded-md" />
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      style={{
        height: autoHeight ? dynamicHeight : props.height || "100%",
        transition: `height ${EDITOR_CONSTANTS.TRANSITION_SPEED} ${EDITOR_CONSTANTS.TRANSITION_TIMING}`,
        overflow: "hidden",
      }}
    >
      {isIntersecting ? (
        <Editor
          {...props}
          height="100%"
          theme={getEditorTheme()}
          beforeMount={handleBeforeMount}
          onMount={handleEditorMount}
          options={defaultOptions}
        />
      ) : (
        renderSkeleton()
      )}
    </div>
  );
};

export default CustomMonaco;
