import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import "../models/Category";
import "../models/Problem";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const defaults = [
  { name: "Data Structures", subCategories: ["Arrays", "Strings", "Linked List", "Stacks", "Ques", "Trees", "Graphs"] },
  { name: "Algorithms", subCategories: ["Sorting", "Searching", "Recursion", "Backtracking", "DP", "Greedy", "D&C"] },
  { name: "Coding Problems", subCategories: ["General", "Bit Manipulation", "Math"] },
];

async function migrate() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("No Mongo URI found");
  await mongoose.connect(uri);
  const Category = mongoose.model("Category");
  const Problem = mongoose.model("Problem");
  let categories = await Category.find();
  if (categories.length === 0) categories = await Category.insertMany(defaults);
  const problems = await Problem.find();
  let count = 0;
  for (const p of problems) {
    const legacy = (p as any).categories || [];
    const match = categories.find(c => legacy.some((l: string) => l.toLowerCase() === c.name.toLowerCase()));
    if (match) {
      p.set("category", match._id);
      const sub = legacy.find((l: string) => match.subCategories.some((s: string) => s.toLowerCase() === l.toLowerCase()));
      p.set("subCategory", sub || match.subCategories[0]);
      await p.save();
      count++;
    }
  }
  console.log(`Updated ${count} problems.`);
  process.exit(0);
}
migrate().catch(err => { console.error(err); process.exit(1); });
