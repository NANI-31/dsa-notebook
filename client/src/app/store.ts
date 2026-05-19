import { configureStore } from '@reduxjs/toolkit';
import problemsReducer from '../features/problems/problemsSlice';
import settingsReducer from '../features/settings/settingsSlice';
import categoriesReducer from '../features/categories/categoriesSlice';
import techniquesReducer from '../features/techniques/techniquesSlice';
import uiReducer from '../features/ui/uiSlice';
import foldersReducer from '../features/folders/foldersSlice';
import dragAuditReducer from '../features/dragAudit/dragAuditSlice';
import aiReducer from '../features/ai/aiSlice';
import { taxonomyListenerMiddleware } from '../middleware/taxonomyListener';
import { optimisticSyncMiddleware } from '../middleware/optimisticSyncMiddleware';
import { broadcastSyncMiddleware } from '../middleware/broadcastSyncMiddleware';

// Add your reducers here
export const store = configureStore({
  reducer: {
    problems: problemsReducer,
    settings: settingsReducer,
    categories: categoriesReducer,
    techniques: techniquesReducer,
    ui: uiReducer,
    folders: foldersReducer,
    dragAudit: dragAuditReducer,
    ai: aiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(
      taxonomyListenerMiddleware.middleware, 
      optimisticSyncMiddleware,
      broadcastSyncMiddleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
