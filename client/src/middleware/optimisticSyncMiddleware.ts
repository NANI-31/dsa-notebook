import type { Middleware } from '@reduxjs/toolkit';
import { addToast } from '../features/ui/uiSlice';
import api from '../services/api';

interface QueueItem {
  id: string;
  type: 'PATCH_SETTINGS' | 'PUT_PROBLEM' | 'DELETE_PROBLEM';
  url: string;
  payload: any;
  timestamp: number;
}

let isFlushing = false;

const flushOfflineQueue = async (dispatch: any) => {
  if (isFlushing) return;
  const queueJson = localStorage.getItem("dsa-offline-queue");
  if (!queueJson) return;

  try {
    const queue: QueueItem[] = JSON.parse(queueJson);
    if (!queue.length) return;

    isFlushing = true;
    dispatch(addToast({
      message: "System online: Syncing queued offline modifications...",
      type: "info",
      duration: 3000
    }));

    const failedItems: QueueItem[] = [];

    for (const item of queue) {
      try {
        if (item.type === 'PATCH_SETTINGS') {
          await api.patch(item.url, item.payload);
        } else if (item.type === 'PUT_PROBLEM') {
          await api.put(item.url, item.payload);
        } else if (item.type === 'DELETE_PROBLEM') {
          await api.delete(item.url);
        }
      } catch (err) {
        console.error("Failed to sync offline item:", item, err);
        failedItems.push(item);
      }
    }

    if (failedItems.length > 0) {
      localStorage.setItem("dsa-offline-queue", JSON.stringify(failedItems));
      dispatch(addToast({
        message: `${failedItems.length} modifications failed to sync. Will retry later.`,
        type: "warning",
        duration: 4000
      }));
    } else {
      localStorage.removeItem("dsa-offline-queue");
      dispatch(addToast({
        message: "All offline modifications successfully synced with the cloud!",
        type: "success",
        duration: 4000
      }));
    }
  } catch (e) {
    console.error("Error during offline queue flush:", e);
  } finally {
    isFlushing = false;
  }
};

export const optimisticSyncMiddleware: Middleware = (store) => {
  // Listen for online events to trigger background synchronization when network is recovered
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
      flushOfflineQueue(store.dispatch);
    });

    // Run initial check on startup
    setTimeout(() => {
      if (navigator.onLine) {
        flushOfflineQueue(store.dispatch);
      }
    }, 1500);
  }

  return (next) => (action: any) => {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (!isOnline) {
      if (action.type === 'problems/updateProblem/pending') {
        const { slug, problemData } = action.meta.arg;
        const queue: QueueItem[] = JSON.parse(localStorage.getItem("dsa-offline-queue") || "[]");

        // De-duplicate updates to the same problem
        const url = `/problems/${slug}`;
        const filtered = queue.filter(item => item.url !== url);

        filtered.push({
          id: `${Date.now()}-${Math.random()}`,
          type: 'PUT_PROBLEM',
          url,
          payload: problemData,
          timestamp: Date.now()
        });

        localStorage.setItem("dsa-offline-queue", JSON.stringify(filtered));
        store.dispatch(addToast({
          message: `Saved offline: modifications to "${problemData.title || slug}" will sync when online.`,
          type: "info",
          duration: 4000
        }));
      } else if (action.type === 'problems/deleteProblem/pending') {
        const slug = action.meta.arg;
        const queue: QueueItem[] = JSON.parse(localStorage.getItem("dsa-offline-queue") || "[]");

        const url = `/problems/${slug}`;
        const filtered = queue.filter(item => item.url !== url);

        filtered.push({
          id: `${Date.now()}-${Math.random()}`,
          type: 'DELETE_PROBLEM',
          url,
          payload: null,
          timestamp: Date.now()
        });

        localStorage.setItem("dsa-offline-queue", JSON.stringify(filtered));
        store.dispatch(addToast({
          message: `Saved offline: deletion of "${slug}" will sync when online.`,
          type: "info",
          duration: 4000
        }));
      } else if (action.type === 'settings/syncSettings/pending') {
        const settings = action.meta.arg;
        const queue: QueueItem[] = JSON.parse(localStorage.getItem("dsa-offline-queue") || "[]");

        // Merge settings payloads if already in queue
        const existingIndex = queue.findIndex(item => item.type === 'PATCH_SETTINGS');
        if (existingIndex !== -1) {
          queue[existingIndex].payload = {
            ...queue[existingIndex].payload,
            ...settings
          };
        } else {
          queue.push({
            id: `${Date.now()}-${Math.random()}`,
            type: 'PATCH_SETTINGS',
            url: '/settings',
            payload: settings,
            timestamp: Date.now()
          });
        }

        localStorage.setItem("dsa-offline-queue", JSON.stringify(queue));
      }
    }

    return next(action);
  };
};
export default optimisticSyncMiddleware;
