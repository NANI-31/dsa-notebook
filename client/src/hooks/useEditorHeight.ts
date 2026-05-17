import { useState, useCallback, useMemo } from "react";
import { EDITOR_CONSTANTS } from "../constants/editor";

interface UseEditorHeightProps {
  autoHeight: boolean;
  minHeight?: number | string;
  maxHeight?: number | string;
  isFocusMode?: boolean;
  initialHeight?: number | string;
}

/**
 * Hook to manage Monaco Editor height with memoized layout logic.
 */
export const useEditorHeight = ({
  autoHeight,
  minHeight = EDITOR_CONSTANTS.MIN_HEIGHT,
  maxHeight = EDITOR_CONSTANTS.MAX_HEIGHT,
  isFocusMode = false,
  initialHeight,
}: UseEditorHeightProps) => {
  const [dynamicHeight, setDynamicHeight] = useState<number | string>(
    initialHeight || minHeight
  );

  // Memoize bounds calculation
  const bounds = useMemo(() => {
    const min = typeof minHeight === "number" ? minHeight : EDITOR_CONSTANTS.MIN_HEIGHT;
    const max = isFocusMode 
      ? EDITOR_CONSTANTS.FOCUS_MODE_MAX_HEIGHT 
      : (typeof maxHeight === "number" ? maxHeight : EDITOR_CONSTANTS.MAX_HEIGHT);
    return { min, max };
  }, [minHeight, maxHeight, isFocusMode]);

  const updateHeight = useCallback(
    (editor: any) => {
      if (!autoHeight || !editor) return;

      const contentHeight = editor.getContentHeight();
      const newHeight = Math.min(bounds.max, Math.max(bounds.min, contentHeight));

      setDynamicHeight((prev) => {
        if (prev === newHeight) return prev;
        
        // Trigger Monaco's internal layout engine
        editor.layout({ 
          width: editor.getLayoutInfo().width, 
          height: newHeight 
        });
        
        return newHeight;
      });
    },
    [autoHeight, bounds]
  );

  return {
    dynamicHeight,
    updateHeight,
  };
};
