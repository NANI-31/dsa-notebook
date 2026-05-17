import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Problem from "../models/Problem";
import Category from "../models/Category";
import Solution from "../models/Solution";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dsa-tracker";

const SEED_DATA = [
  {
    subCategory: "Arrays",
    problems: [
      {
        title: "Two Sum",
        difficulty: "Easy",
        slug: "two-sum",
        solutions: [
          {
            name: "Hash Map Approach",
            language: "typescript",
            code: `function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        map.set(nums[i], i);
    }
    return [];
};`
          }
        ]
      },
      {
        title: "Contains Duplicate",
        difficulty: "Easy",
        slug: "contains-duplicate",
        solutions: [
          {
            name: "Set Approach",
            language: "typescript",
            code: `function containsDuplicate(nums: number[]): boolean {
    const set = new Set(nums);
    return set.size !== nums.length;
};`
          }
        ]
      }
    ]
  },
  {
    subCategory: "Strings",
    problems: [
      {
        title: "Valid Anagram",
        difficulty: "Easy",
        slug: "valid-anagram",
        solutions: [
          {
            name: "Frequency Map",
            language: "typescript",
            code: `function isAnagram(s: string, t: string): boolean {
    if (s.length !== t.length) return false;
    const count = new Array(26).fill(0);
    for (let i = 0; i < s.length; i++) {
        count[s.charCodeAt(i) - 97]++;
        count[t.charCodeAt(i) - 97]--;
    }
    return count.every(c => c === 0);
};`
          }
        ]
      },
      {
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        slug: "longest-substring-without-repeating-characters",
        solutions: [
          {
            name: "Sliding Window",
            language: "typescript",
            code: `function lengthOfLongestSubstring(s: string): number {
    let max = 0, left = 0;
    const set = new Set();
    for (let right = 0; right < s.length; right++) {
        while (set.has(s[right])) {
            set.delete(s[left]);
            left++;
        }
        set.add(s[right]);
        max = Math.max(max, right - left + 1);
    }
    return max;
};`
          }
        ]
      }
    ]
  },
  {
    subCategory: "Linked List",
    problems: [
      {
        title: "Reverse Linked List",
        difficulty: "Easy",
        slug: "reverse-linked-list",
        solutions: [
          {
            name: "Iterative",
            language: "typescript",
            code: `function reverseList(head: ListNode | null): ListNode | null {
    let prev = null, curr = head;
    while (curr) {
        let next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
};`
          }
        ]
      },
      {
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        slug: "merge-two-sorted-lists",
        solutions: [
          {
            name: "Iterative Dummy Node",
            language: "typescript",
            code: `function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
    const dummy = new ListNode();
    let curr = dummy;
    while (list1 && list2) {
        if (list1.val < list2.val) {
            curr.next = list1;
            list1 = list1.next;
        } else {
            curr.next = list2;
            list2 = list2.next;
        }
        curr = curr.next;
    }
    curr.next = list1 || list2;
    return dummy.next;
};`
          }
        ]
      }
    ]
  },
  {
    subCategory: "Stack",
    problems: [
      {
        title: "Valid Parentheses",
        difficulty: "Easy",
        slug: "valid-parentheses",
        solutions: [
          {
            name: "Stack using Map",
            language: "typescript",
            code: `function isValid(s: string): boolean {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (char in map) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
};`
          }
        ]
      },
      {
        title: "Min Stack",
        difficulty: "Medium",
        slug: "min-stack",
        solutions: [
          {
            name: "Two Stacks",
            language: "typescript",
            code: `class MinStack {
    private stack: number[] = [];
    private minStack: number[] = [];
    push(val: number): void {
        this.stack.push(val);
        if (this.minStack.length === 0 || val <= this.minStack[this.minStack.length - 1]) {
            this.minStack.push(val);
        }
    }
    pop(): void {
        const val = this.stack.pop();
        if (val === this.minStack[this.minStack.length - 1]) {
            this.minStack.pop();
        }
    }
    top(): number { return this.stack[this.stack.length - 1]; }
    getMin(): number { return this.minStack[this.minStack.length - 1]; }
}`
          }
        ]
      }
    ]
  },
  {
    subCategory: "Queue",
    problems: [
      {
        title: "Implement Queue using Stacks",
        difficulty: "Easy",
        slug: "implement-queue-using-stacks",
        solutions: [
          {
            name: "Two Stacks Amortized",
            language: "typescript",
            code: `class MyQueue {
    s1: number[] = []; s2: number[] = [];
    push(x: number) { this.s1.push(x); }
    pop() { this.peek(); return this.s2.pop(); }
    peek() {
        if (!this.s2.length) while (this.s1.length) this.s2.push(this.s1.pop()!);
        return this.s2[this.s2.length - 1];
    }
    empty() { return !this.s1.length && !this.s2.length; }
}`
          }
        ]
      },
      {
        title: "Design Hit Counter",
        difficulty: "Medium",
        slug: "design-hit-counter",
        solutions: [
          {
            name: "Queue with Timestamps",
            language: "typescript",
            code: `class HitCounter {
    private times: number[] = [];
    hit(timestamp: number) { this.times.push(timestamp); }
    getHits(timestamp: number) {
        while (this.times.length && this.times[0] <= timestamp - 300) this.times.shift();
        return this.times.length;
    }
}`
          }
        ]
      }
    ]
  },
  {
    subCategory: "Deque",
    problems: [
      {
        title: "Sliding Window Maximum",
        difficulty: "Hard",
        slug: "sliding-window-maximum",
        solutions: [
          {
            name: "Monotonic Deque",
            language: "typescript",
            code: `function maxSlidingWindow(nums: number[], k: number): number[] {
    const deque: number[] = [];
    const res: number[] = [];
    for (let i = 0; i < nums.length; i++) {
        while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) deque.pop();
        deque.push(i);
        if (deque[0] === i - k) deque.shift();
        if (i >= k - 1) res.push(nums[deque[0]]);
    }
    return res;
};`
          }
        ]
      },
      {
        title: "Design Circular Deque",
        difficulty: "Medium",
        slug: "design-circular-deque",
        solutions: [
          {
            name: "Array with Pointers",
            language: "typescript",
            code: `class MyCircularDeque {
    private q: number[]; private k: number;
    constructor(k: number) { this.q = []; this.k = k; }
    insertFront(v: number) { if (this.q.length >= this.k) return false; this.q.unshift(v); return true; }
    insertLast(v: number) { if (this.q.length >= this.k) return false; this.q.push(v); return true; }
    deleteFront() { return this.q.shift() !== undefined; }
    deleteLast() { return this.q.pop() !== undefined; }
    getFront() { return this.q.length ? this.q[0] : -1; }
    getRear() { return this.q.length ? this.q[this.q.length-1] : -1; }
    isEmpty() { return !this.q.length; }
    isFull() { return this.q.length === this.k; }
}`
          }
        ]
      }
    ]
  },
  {
    subCategory: "Trees",
    problems: [
      {
        title: "Balanced Binary Tree",
        difficulty: "Easy",
        slug: "balanced-binary-tree",
        solutions: [
          {
            name: "Post-order Depth Check",
            language: "typescript",
            code: `function isBalanced(root: TreeNode | null): boolean {
    const checkHeight = (node: TreeNode | null): number => {
        if (!node) return 0;
        const left = checkHeight(node.left);
        const right = checkHeight(node.right);
        if (left === -1 || right === -1 || Math.abs(left - right) > 1) return -1;
        return Math.max(left, right) + 1;
    };
    return checkHeight(root) !== -1;
};`
          }
        ]
      },
      {
        title: "Subtree of Another Tree",
        difficulty: "Easy",
        slug: "subtree-of-another-tree",
        solutions: [
          {
            name: "Recursive Comparison",
            language: "typescript",
            code: `function isSubtree(root: TreeNode | null, subRoot: TreeNode | null): boolean {
    if (!root) return false;
    if (isSame(root, subRoot)) return true;
    return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}
function isSame(s: any, t: any): boolean {
    if (!s || !t) return s === t;
    return s.val === t.val && isSame(s.left, t.left) && isSame(s.right, t.right);
}`
          }
        ]
      }
    ]
  },
  {
    subCategory: "Binary Trees",
    problems: [
      {
        title: "Maximum Depth of Binary Tree",
        difficulty: "Easy",
        slug: "maximum-depth-of-binary-tree",
        solutions: [
          {
            name: "Recursive DFS",
            language: "typescript",
            code: `function maxDepth(root: TreeNode | null): number {
    if (!root) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
};`
          }
        ]
      },
      {
        title: "Binary Tree Inorder Traversal",
        difficulty: "Easy",
        slug: "binary-tree-inorder-traversal",
        solutions: [
          {
            name: "Recursive Approach",
            language: "typescript",
            code: `function inorderTraversal(root: TreeNode | null): number[] {
    const res: number[] = [];
    const traverse = (node: TreeNode | null) => {
        if (!node) return;
        traverse(node.left);
        res.push(node.val);
        traverse(node.right);
    };
    traverse(root);
    return res;
};`
          }
        ]
      }
    ]
  },
  {
    subCategory: "BST",
    problems: [
      {
        title: "Validate Binary Search Tree",
        difficulty: "Medium",
        slug: "validate-binary-search-tree",
        solutions: [
          {
            name: "Range Constraints",
            language: "typescript",
            code: `function isValidBST(root: TreeNode | null, min = -Infinity, max = Infinity): boolean {
    if (!root) return true;
    if (root.val <= min || root.val >= max) return false;
    return isValidBST(root.left, min, root.val) && isValidBST(root.right, root.val, max);
};`
          }
        ]
      },
      {
        title: "Insert into a Binary Search Tree",
        difficulty: "Medium",
        slug: "insert-into-a-binary-search-tree",
        solutions: [
          {
            name: "Recursive Search",
            language: "typescript",
            code: `function insertIntoBST(root: TreeNode | null, val: number): TreeNode | null {
    if (!root) return new TreeNode(val);
    if (val < root.val) root.left = insertIntoBST(root.left, val);
    else root.right = insertIntoBST(root.right, val);
    return root;
};`
          }
        ]
      }
    ]
  },
  {
    subCategory: "Heap",
    problems: [
      {
        title: "Kth Largest Element in an Array",
        difficulty: "Medium",
        slug: "kth-largest-element-in-an-array",
        solutions: [
          {
            name: "Min-Heap Optimization",
            language: "typescript",
            code: `function findKthLargest(nums: number[], k: number): number {
    // In TS, we'd use a PQ library or build one; here is the logic with sorting for reference
    return nums.sort((a, b) => b - a)[k - 1];
};`
          }
        ]
      },
      {
        title: "Top K Frequent Elements",
        difficulty: "Medium",
        slug: "top-k-frequent-elements",
        solutions: [
          {
            name: "Bucket Sort Approach",
            language: "typescript",
            code: `function topKFrequent(nums: number[], k: number): number[] {
    const map = new Map<number, number>();
    for (const num of nums) map.set(num, (map.get(num) || 0) + 1);
    const buckets = Array.from({ length: nums.length + 1 }, () => [] as number[]);
    for (const [num, freq] of map) buckets[freq].push(num);
    return buckets.flat().reverse().slice(0, k);
};`
          }
        ]
      }
    ]
  },
  {
    subCategory: "Graphs",
    problems: [
      {
        title: "Number of Islands",
        difficulty: "Medium",
        slug: "number-of-islands",
        solutions: [
          {
            name: "DFS Traversal",
            language: "typescript",
            code: `function numIslands(grid: string[][]): number {
    let count = 0;
    const dfs = (r: number, c: number) => {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] === '0') return;
        grid[r][c] = '0';
        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1);
    };
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
            if (grid[r][c] === '1') { count++; dfs(r, c); }
        }
    }
    return count;
};`
          }
        ]
      },
      {
        title: "Clone Graph",
        difficulty: "Medium",
        slug: "clone-graph",
        solutions: [
          {
            name: "DFS with Map",
            language: "typescript",
            code: `function cloneGraph(node: Node | null): Node | null {
    const visited = new Map();
    const dfs = (n: Node | null) => {
        if (!n) return null;
        if (visited.has(n)) return visited.get(n);
        const clone = new Node(n.val);
        visited.set(n, clone);
        clone.neighbors = n.neighbors.map(dfs);
        return clone;
    };
    return dfs(node);
};`
          }
        ]
      }
    ]
  },
  {
    subCategory: "Trie",
    problems: [
      {
        title: "Implement Trie (Prefix Tree)",
        difficulty: "Medium",
        slug: "implement-trie-prefix-tree",
        solutions: [
          {
            name: "Object-based TrieNode",
            language: "typescript",
            code: `class Trie {
    private nodes = {};
    insert(word: string) {
        let curr = this.nodes;
        for (const char of word) {
            if (!curr[char]) curr[char] = {};
            curr = curr[char];
        }
        curr['isEnd'] = true;
    }
    search(word: string) {
        let curr = this.nodes;
        for (const char of word) {
            if (!curr[char]) return false;
            curr = curr[char];
        }
        return !!curr['isEnd'];
    }
    startsWith(prefix: string) {
        let curr = this.nodes;
        for (const char of prefix) {
            if (!curr[char]) return false;
            curr = curr[char];
        }
        return true;
    }
}`
          }
        ]
      },
      {
        title: "Word Search II",
        difficulty: "Hard",
        slug: "word-search-ii",
        solutions: [
          {
            name: "Trie + Backtracking",
            language: "typescript",
            code: `// High-level logic: Load all words into Trie, then DFS on grid matching Trie paths`
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

        // 1. Ensure Data Structures Category exists and sub-categories are synced
        let dsCategory = await Category.findOne({ name: "Data Structures" });
        const dsSubCategories = [
          "Arrays", "Strings", "Linked List", "Stack", "Queue", 
          "Deque", "Trees", "Binary Trees", "BST", "Heap", "Graphs", "Trie"
        ];

        if (!dsCategory) {
            dsCategory = new Category({
                name: "Data Structures",
                subCategories: dsSubCategories
            });
            await dsCategory.save();
            console.log("✅ Created 'Data Structures' category.");
        } else {
            // Ensure all sub-categories exist for validation to pass
            dsCategory.subCategories = dsSubCategories;
            await dsCategory.save();
            console.log("✅ Updated 'Data Structures' sub-categories.");
        }

        // 2. Insert Problems and Solutions
        for (const group of SEED_DATA) {
            console.log(`\nProcessing ${group.subCategory}...`);
            for (const pData of group.problems) {
                // Check if problem already exists
                let problem = await Problem.findOne({ slug: pData.slug });
                if (problem) {
                    console.log(`- Problem ${pData.title} already exists. Skipping.`);
                    continue;
                }

                problem = new Problem({
                    title: pData.title,
                    difficulty: pData.difficulty,
                    slug: pData.slug,
                    category: dsCategory._id,
                    subCategory: group.subCategory,
                    description: `Reference implementation for ${pData.title}. Practice this to master ${group.subCategory}.`,
                    starred: false,
                    techniques: []
                });

                await problem.save();
                console.log(`- Created problem: ${pData.title}`);

                // Add solutions
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

        console.log("\n🎉 Seeding completed successfully.");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
};

run();
