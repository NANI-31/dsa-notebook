import mongoose from "mongoose";
import dotenv from "dotenv";
import Problem from "../models/Problem";
import Category from "../models/Category";
import Solution from "../models/Solution";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dsa-tracker";

const ALGO_SEED_DATA = [
  {
    subCategory: "Sorting",
    problems: [
      {
        title: "Merge Sort",
        difficulty: "Medium",
        slug: "merge-sort",
        solutions: [
          {
            name: "Recursive Divide & Conquer",
            language: "typescript",
            code: `function mergeSort(arr: number[]): number[] {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
    const result = [];
    let l = 0, r = 0;
    while (l < left.length && r < right.length) {
        if (left[l] < right[r]) result.push(left[l++]);
        else result.push(right[r++]);
    }
    return [...result, ...left.slice(l), ...right.slice(r)];
}`
          }
        ]
      },
      {
        title: "Quick Sort",
        difficulty: "Medium",
        slug: "quick-sort",
        solutions: [
          {
            name: "Lomuto Partition Scheme",
            language: "typescript",
            code: `function quickSort(arr: number[], low = 0, high = arr.length - 1): number[] {
    if (low < high) {
        const pivot = partition(arr, low, high);
        quickSort(arr, low, pivot - 1);
        quickSort(arr, pivot + 1, high);
    }
    return arr;
}

function partition(arr: number[], low: number, high: number): number {
    const pivot = arr[high];
    let i = low;
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            i++;
        }
    }
    [arr[i], arr[high]] = [arr[high], arr[i]];
    return i;
}`
          }
        ]
      }
    ]
  },
  {
    subCategory: "Searching",
    problems: [
      {
        title: "Binary Search",
        difficulty: "Easy",
        slug: "binary-search",
        solutions: [
          {
            name: "Iterative O(log N)",
            language: "typescript",
            code: `function search(nums: number[], target: number): number {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
};`
          }
        ]
      },
      {
        title: "Search in Rotated Sorted Array",
        difficulty: "Medium",
        slug: "search-in-rotated-sorted-array",
        solutions: [
          {
            name: "Modified Binary Search",
            language: "typescript",
            code: `function search(nums: number[], target: number): number {
    let l = 0, r = nums.length - 1;
    while (l <= r) {
        const mid = Math.floor((l + r) / 2);
        if (nums[mid] === target) return mid;
        if (nums[l] <= nums[mid]) {
            if (target >= nums[l] && target < nums[mid]) r = mid - 1;
            else l = mid + 1;
        } else {
            if (target > nums[mid] && target <= nums[r]) l = mid + 1;
            else r = mid - 1;
        }
    }
    return -1;
};`
          }
        ]
      }
    ]
  },
  {
    subCategory: "DP",
    problems: [
      {
        title: "Climbing Stairs",
        difficulty: "Easy",
        slug: "climbing-stairs",
        solutions: [
          {
            name: "Iterative Tabulation",
            language: "typescript",
            code: `function climbStairs(n: number): number {
    if (n <= 2) return n;
    let first = 1, second = 2;
    for (let i = 3; i <= n; i++) {
        let third = first + second;
        first = second;
        second = third;
    }
    return second;
};`
          }
        ]
      },
      {
        title: "Longest Common Subsequence",
        difficulty: "Medium",
        slug: "longest-common-subsequence",
        solutions: [
          {
            name: "2D DP Matrix",
            language: "typescript",
            code: `function longestCommonSubsequence(text1: string, text2: string): number {
    const dp = Array.from({ length: text1.length + 1 }, () => new Array(text2.length + 1).fill(0));
    for (let i = 1; i <= text1.length; i++) {
        for (let j = 1; j <= text2.length; j++) {
            if (text1[i-1] === text2[j-1]) dp[i][j] = 1 + dp[i-1][j-1];
            else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
    }
    return dp[text1.length][text2.length];
};`
          }
        ]
      }
    ]
  }
];

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected.");

        let algoCategory = await Category.findOne({ name: "Algorithms" });
        if (!algoCategory) {
            console.error("❌ 'Algorithms' category not found. Please run baseline seeding first.");
            return;
        }

        for (const group of ALGO_SEED_DATA) {
            console.log(`\nProcessing ${group.subCategory}...`);
            for (const pData of group.problems) {
                let problem = await Problem.findOne({ slug: pData.slug });
                if (problem) {
                    console.log(`- Problem ${pData.title} already exists. Skipping.`);
                    continue;
                }

                problem = new Problem({
                    title: pData.title,
                    difficulty: pData.difficulty,
                    slug: pData.slug,
                    category: algoCategory._id,
                    subCategory: group.subCategory,
                    description: `Master ${group.subCategory} concepts with ${pData.title}.`,
                    timeComplexity: pData.difficulty === "Easy" ? "O(N)" : "O(N log N)",
                    spaceComplexity: "O(N)",
                    techniques: []
                });

                await problem.save();
                console.log(`- Created problem: ${pData.title}`);

                for (const sData of pData.solutions) {
                    const solution = new Solution({
                        problemId: problem._id,
                        name: sData.name,
                        language: sData.language,
                        code: sData.code
                    });
                    await solution.save();
                }
            }
        }

        console.log("\n🎉 Algorithm seeding completed successfully.");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
