import { useRef, useEffect } from "react";
import type { editor } from "monaco-editor";

/**
 * A highly optimized, regex-based semantic highlighter for Monaco Editor.
 * Colors booleans, operators, function names, and object properties 
 * without requiring the massive TextMate grammar payload.
 *
 * It dynamically imports the heavy regex engine so it is not parsed
 * by the browser until Monaco is fully loaded.
 */
export const useSemanticHighlighter = (
  editorInstance: editor.IStandaloneCodeEditor | null,
  monacoInstance: any,
) => {
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(
    null,
  );

  useEffect(() => {
    if (!editorInstance || !monacoInstance) return;

    let isMounted = true;
    let disposable: any = null;

    // Dynamically import the heavy regex engine
    import("./regexEngine")
      .then(({ getSemanticDecorations }) => {
        if (!isMounted) return;

        if (!decorationsRef.current) {
          decorationsRef.current = editorInstance.createDecorationsCollection();
        }

        const updateDecorations = () => {
          const model = editorInstance.getModel();
          if (!model) return;
          const newDecorations = getSemanticDecorations(
            model,
            monacoInstance.Range
          );
          decorationsRef.current?.set(newDecorations);
        };

        disposable = editorInstance.onDidChangeModelContent(updateDecorations);
        updateDecorations(); // Initial run
      })
      .catch((err) => {
        console.error("Failed to load regex engine:", err);
      });

    return () => {
      isMounted = false;
      if (disposable) {
        disposable.dispose();
      }
      decorationsRef.current?.clear();
    };
  }, [editorInstance, monacoInstance]);
};
