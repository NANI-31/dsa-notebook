import { lazy, type LazyExoticComponent, type FC } from "react";
import type { IconProps } from "./dsIcons";

/**
 * IconRegistry: Central mapping of category names to their lazy-loaded icons.
 * This structure allows us to scale to 50+ icons easily without bloating the
 * main Page component logic.
 */
const registry: Record<string, () => Promise<{ default: FC<IconProps> }>> = {
  Arrays: () => import("./dsIcons").then((m) => ({ default: m.ArrayIcon })),
  Strings: () => import("./dsIcons").then((m) => ({ default: m.StringIcon })),
  "Linked List": () =>
    import("./dsIcons").then((m) => ({ default: m.LinkedListIcon })),
  Stack: () => import("./dsIcons").then((m) => ({ default: m.StackIcon })),
  Queue: () => import("./dsIcons").then((m) => ({ default: m.QueueIcon })),
  Deque: () => import("./dsIcons").then((m) => ({ default: m.DequeIcon })),
  Trees: () => import("./dsIcons").then((m) => ({ default: m.TreeIcon })),
  "Binary Trees": () =>
    import("./dsIcons").then((m) => ({ default: m.BinaryTreeIcon })),
  BST: () => import("./dsIcons").then((m) => ({ default: m.BSTIcon })),
  Heap: () => import("./dsIcons").then((m) => ({ default: m.HeapIcon })),
  Graphs: () => import("./dsIcons").then((m) => ({ default: m.GraphIcon })),
  Trie: () => import("./dsIcons").then((m) => ({ default: m.TrieIcon })),
  // Algorithms
  Searching: () => import("./dsIcons").then((m) => ({ default: m.SearchingIcon })),
  Sorting: () => import("./dsIcons").then((m) => ({ default: m.SortingIcon })),
  Recursion: () => import("./dsIcons").then((m) => ({ default: m.RecursionIcon })),
  Backtracking: () => import("./dsIcons").then((m) => ({ default: m.BacktrackingIcon })),
  DP: () => import("./dsIcons").then((m) => ({ default: m.DynamicProgrammingIcon })),
  Greedy: () => import("./dsIcons").then((m) => ({ default: m.GreedyIcon })),
  "D&C": () => import("./dsIcons").then((m) => ({ default: m.DivideAndConquerIcon })),
};

// Internal cache for lazy components
const componentCache: Record<string, LazyExoticComponent<FC<IconProps>>> = {};

export const getIcon = (
  name: string,
): LazyExoticComponent<FC<IconProps>> | null => {
  if (!registry[name]) return null;

  if (!componentCache[name]) {
    componentCache[name] = lazy(registry[name]);
  }

  return componentCache[name];
};

/**
 * PrefetchIcons: Explicitly triggers the dynamic imports for a list of categories.
 * Use this to prime the network cache for 'hot' or high-priority items.
 */
export const prefetchIcons = (names: string[]): void => {
  names.forEach((name) => {
    if (registry[name]) {
      // Trigger the import immediately without waiting for rendering
      registry[name]();
    }
  });
};

/**
 * Registry Helper: Returns all available icon names for validation or dynamic listing.
 */
export const getAvailableIcons = (): string[] => Object.keys(registry);
