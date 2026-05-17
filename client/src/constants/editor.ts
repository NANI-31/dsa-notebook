/**
 * System-wide configuration for the code editor environment.
 */
export const EDITOR_CONSTANTS = {
  MIN_HEIGHT: 200,
  MAX_HEIGHT: 1000,
  FOCUS_MODE_MAX_HEIGHT: 2500,
  TRANSITION_SPEED: "0.25s",
  TRANSITION_TIMING: "ease-in-out",
  FONT_FAMILY: "'Fira Code', 'JetBrains Mono', monospace",
  FONT_SIZE: 14,
  PADDING_TOP: 20,
  PADDING_BOTTOM: 20,
};

export type EditorSizePreset = 'compact' | 'standard' | 'expanded';

export const SIZE_PRESETS: Record<EditorSizePreset, { min: number, max: number }> = {
  compact: { min: 100, max: 400 },
  standard: { min: 200, max: 1000 },
  expanded: { min: 400, max: 2000 },
};
