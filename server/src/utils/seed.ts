import mongoose from 'mongoose';
import Problem from '../models/Problem';
import Solution from '../models/Solution';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nani:nani@cluster0.nkgeayy.mongodb.net/dsa-tracker?retryWrites=true&w=majority";

const problems = [
  {
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    categories: ['Coding Problems', 'LeetCode-style'],
    starred: true,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    techniques: ['Two Pointers', 'Hash Map'],
    description: '### Goal\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\n### Constraints\n- `2 <= nums.length <= 104`\n- `-109 <= nums[i] <= 109`\n- `-109 <= target <= 109`\n- **Only one valid answer exists.**',
    explanation: '#### The Strategy\n1. Initialize an empty **Hash Map** to store values and their indices.\n2. Iterate through the array. For each number, calculate its `complement` (`target - num`).\n3. If the `complement` is already in the map, we\'ve found our pair!\n4. Otherwise, add the current number to the map.',
    notes: '- The hash map approach is `O(n)` because we only pass through the list once.\n- Space complexity is `O(n)` to store the map.',
    variants: [
      { 
        name: 'Hash Map (Optimal)', 
        language: 'python',
        code: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test implementation
print(twoSum([2, 7, 11, 15], 9))`
      },
      { 
        name: 'Brute Force', 
        language: 'python',
        code: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i + j, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

print(twoSum([3, 2, 4], 6))`
      }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding (Two Collections)...');
    
    // Clear all related collections
    await Promise.all([
      Problem.deleteMany({}),
      Solution.deleteMany({})
    ]);

    for (const p of problems) {
      const { variants, ...problemData } = p;
      
      const newProblem = new Problem(problemData);
      await newProblem.save();

      if (variants && Array.isArray(variants)) {
        const solutionDocs = variants.map(v => ({
          problemId: newProblem._id,
          name: v.name,
          code: v.code,
          language: v.language
        }));
        await Solution.insertMany(solutionDocs);
      }
    }
    
    console.log('Database Seeded with Two-Collection Structure! ✅');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
