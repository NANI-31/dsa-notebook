import type { Middleware } from '@reduxjs/toolkit';

const BROADCAST_ACTION_TYPES = [
  // Settings / Preferences
  'settings/setTheme',
  'settings/setAccentColor',
  'settings/setAccentTheme',
  'settings/setSyncWithSystem',
  'settings/setTerminalLayout',
  'settings/toggleTheme',
  'settings/setEditorHighContrast',
  'settings/setEditorTheme',
  'settings/setEditorFontSize',
  'settings/setEditorFontLigatures',
  'settings/setEditorFontFamily',
  'settings/setEditorCursorBlinking',
  'settings/setEditorLineNumberPadding',
  'settings/setEditorContrastRatio',
  'settings/setShortcut',

  // Problems (Local Edits)
  'problems/createProblem/fulfilled',
  'problems/updateProblem/fulfilled',
  'problems/deleteProblem/fulfilled',
  'problems/saveProblemVariants/fulfilled',
  'problems/updateLocalVariants',

  // Folder Layouts
  'folders/createFolder/fulfilled',
  'folders/updateFolder/fulfilled',
  'folders/deleteFolder/fulfilled',
  'folders/moveFolderOptimistic',
];

const syncChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('dsa-global-sync-channel')
    : null;

export const broadcastSyncMiddleware: Middleware = (_store) => {
  return (next) => (action: any) => {
    const result = next(action);

    if (
      syncChannel &&
      BROADCAST_ACTION_TYPES.includes(action.type) &&
      (!action.meta || !action.meta.fromBroadcast)
    ) {
      console.log(`[Broadcast Sync Channel] Broadcasting action: ${action.type}`, action.payload);
      syncChannel.postMessage({
        type: action.type,
        payload: action.payload,
        meta: { ...action.meta, fromBroadcast: true },
      });
    }

    return result;
  };
};

export default broadcastSyncMiddleware;
