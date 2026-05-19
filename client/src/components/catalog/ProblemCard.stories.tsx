import React from "react";
import { BrowserRouter } from "react-router-dom";
import ProblemCard from "../ProblemCard";
import type { Problem } from "../../types/problem";

export default {
  title: "Catalog/ProblemCard",
  component: ProblemCard,
  decorators: [
    (Story: React.ComponentType) => (
      <BrowserRouter>
        <div className="max-w-[400px] p-6 bg-app-bg">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
};

const mockEasyProblem: Problem = {
  _id: "1",
  title: "Two Sum",
  slug: "two-sum",
  difficulty: "Easy",
  category: { _id: "c1", name: "Algorithms" },
  subCategory: "Arrays",
  categories: ["Arrays", "Hash Table"],
  techniques: [
    { _id: "t1", name: "Two Pointers" },
    { _id: "t2", name: "Hash Map" },
  ],
  timeComplexity: "O(N)",
  spaceComplexity: "O(N)",
  timeComplexityAnalysis: "Simple loop lookup",
  spaceComplexityAnalysis: "Storage for index map",
  description: "Find two numbers that add up to target.",
  explanation: "Hash table lookups take O(1) time.",
  notes: "Remember edge cases like duplicate elements.",
  variants: [],
  starred: false,
};

const mockMediumProblem: Problem = {
  _id: "2",
  title: "Longest Substring Without Repeating Characters",
  slug: "longest-substring",
  difficulty: "Medium",
  category: { _id: "c2", name: "Algorithms" },
  subCategory: "Sliding Window",
  categories: ["Sliding Window"],
  techniques: [
    { _id: "t3", name: "Sliding Window" },
    { _id: "t4", name: "Hash Set" },
  ],
  timeComplexity: "O(N)",
  spaceComplexity: "O(min(M, N))",
  timeComplexityAnalysis: "Sliding window moves across characters",
  spaceComplexityAnalysis: "Set storage size limit",
  description: "Calculate size of longest unique character substring.",
  explanation: "Maintain sliding bounds and map frequencies.",
  notes: "Check input length of 0.",
  variants: [],
  starred: true,
};

const mockHardProblem: Problem = {
  _id: "3",
  title: "Merge k Sorted Lists",
  slug: "merge-k-sorted-lists",
  difficulty: "Hard",
  category: { _id: "c1", name: "Algorithms" },
  subCategory: "Heap",
  categories: ["Divide and Conquer", "Heap"],
  techniques: [
    { _id: "t5", name: "Heap / Priority Queue" },
    { _id: "t6", name: "Merge Sort" },
  ],
  timeComplexity: "O(N log K)",
  spaceComplexity: "O(K)",
  timeComplexityAnalysis: "Each element traversal costs log K heap balance",
  spaceComplexityAnalysis: "Heap storage space allocation",
  description: "Merge K linked lists in sorted order.",
  explanation: "Priority queues deliver min elements continuously.",
  notes: "Ensure lists are not null.",
  variants: [],
  starred: false,
};

export const Easy = () => <ProblemCard problem={mockEasyProblem} index={0} />;
export const MediumStarred = () => <ProblemCard problem={mockMediumProblem} index={1} />;
export const Hard = () => <ProblemCard problem={mockHardProblem} index={2} />;
