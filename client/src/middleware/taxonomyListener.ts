import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { createProblem, updateProblem } from "../features/problems/problemsSlice";
import { fetchTaxonomyStats } from "../features/categories/categoriesSlice";

export const taxonomyListenerMiddleware = createListenerMiddleware();

taxonomyListenerMiddleware.startListening({
  matcher: isAnyOf(createProblem.fulfilled, updateProblem.fulfilled),
  effect: async (_, listenerApi) => {
    // Silently refresh taxonomy stats in the background
    // whenever a problem is created or updated.
    listenerApi.dispatch(fetchTaxonomyStats() as any);
  },
});
