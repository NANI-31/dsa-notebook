import { configureStore } from '@reduxjs/toolkit';
import problemsReducer from '../features/problems/problemsSlice';
import settingsReducer from '../features/settings/settingsSlice';
import categoriesReducer from '../features/categories/categoriesSlice';
import techniquesReducer from '../features/techniques/techniquesSlice';
import { taxonomyListenerMiddleware } from '../middleware/taxonomyListener';

// Add your reducers here
export const store = configureStore({
  reducer: {
    problems: problemsReducer,
    settings: settingsReducer,
    categories: categoriesReducer,
    techniques: techniquesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(taxonomyListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
