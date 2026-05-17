import mongoose from "mongoose";
import dotenv from "dotenv";
import Problem from "../models/Problem";
import Category from "../models/Category";
import Solution from "../models/Solution";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dsa-tracker";

const MULTI_SOLUTION_DATA = {
  subCategory: "Strings",
  problem: {
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    slug: "longest-palindromic-substring",
    description: "Given a string s, return the longest palindromic substring in s.",
    timeComplexity: "O(N^2)",
    spaceComplexity: "O(1)",
    techniques: ["Sliding Window", "Dynamic Programming"],
    solutions: [
      {
        name: "Brute Force",
        language: "typescript",
        description: "Check every possible substring and verify if it's a palindrome.",
        code: `function longestPalindrome(s: string): string {
    if (s.length < 2) return s;
    let max = "";
    
    for (let i = 0; i < s.length; i++) {
        for (let j = i + 1; j <= s.length; j++) {
            const sub = s.slice(i, j);
            if (sub.length > max.length && isPalindrome(sub)) {
                max = sub;
            }
        }
    }
    return max;
}

function isPalindrome(s: string): boolean {
    let l = 0, r = s.length - 1;
    while (l < r) {
        if (s[l++] !== s[r--]) return false;
    }
    return true;
}`
      },
      {
        name: "Expand Around Center",
        language: "typescript",
        description: "Treat every character (and every space between) as a potential center and expand outward.",
        code: `function longestPalindrome(s: string): string {
    if (s.length < 2) return s;
    let start = 0, end = 0;

    for (let i = 0; i < s.length; i++) {
        const len1 = expand(s, i, i);
        const len2 = expand(s, i, i + 1);
        const len = Math.max(len1, len2);
        
        if (len > end - start) {
            start = i - Math.floor((len - 1) / 2);
            end = i + Math.floor(len / 2);
        }
    }
    return s.substring(start, end + 1);
}

function expand(s: string, l: number, r: number): number {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
        l--;
        r++;
    }
    return r - l - 1;
}`
      },
      {
        name: "Dynamic Programming",
        language: "typescript",
        description: "Store palindrome status in a 2D table to avoid recomputing overlapping sub-palindromes.",
        code: `function longestPalindrome(s: string): string {
    if (s.length < 2) return s;
    const n = s.length;
    const dp = Array.from({ length: n }, () => new Array(n).fill(false));
    let start = 0, maxLen = 1;

    for (let i = 0; i < n; i++) dp[i][i] = true;

    for (let len = 2; len <= n; len++) {
        for (let i = 0; i <= n - len; i++) {
            const j = i + len - 1;
            if (s[i] === s[j]) {
                if (len === 2 || dp[i + 1][j - 1]) {
                    dp[i][j] = true;
                    if (len > maxLen) {
                        maxLen = len;
                        start = i;
                    }
                }
            }
        }
    }
    return s.substring(start, start + maxLen);
}`
      }
    ]
  }
};

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected.");

        const category = await Category.findOne({ name: "Data Structures" });
        if (!category) {
            console.error("❌ Category not found.");
            return;
        }

        const pData = MULTI_SOLUTION_DATA.problem;
        
        // Find and clean existing problem + solutions safely
        const existing = await Problem.findOne({ slug: pData.slug });
        if (existing) {
            await Solution.deleteMany({ problemId: existing._id });
            await Problem.deleteOne({ _id: existing._id });
            console.log(`- Cleaned existing problem: ${pData.title}`);
        }

        const problem = new Problem({
            title: pData.title,
            difficulty: pData.difficulty as any,
            slug: pData.slug,
            category: category._id as any,
            subCategory: MULTI_SOLUTION_DATA.subCategory,
            description: pData.description,
            timeComplexity: pData.timeComplexity,
            spaceComplexity: pData.spaceComplexity,
            starred: true,
            techniques: []
        });

        await problem.save();
        console.log(`✅ Created Multi-Solution Problem: ${pData.title}`);

        for (const sData of pData.solutions) {
            const solution = new Solution({
                problemId: problem._id as any,
                name: sData.name,
                language: sData.language,
                code: sData.code
            });
            await solution.save();
            console.log(`- Added variant: ${sData.name}`);
        }

        console.log("\n🎉 Multi-solution seeding completed successfully.");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
