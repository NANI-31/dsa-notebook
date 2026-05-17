import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import Technique from "../models/Technique";
import Problem from "../models/Problem";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function migrate() {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/dsa-tracker";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const defaultTechs = [
      "Hash Map",
      "Two Pointers",
      "Brute Force",
      "Sliding Window",
      "Prefix Sum",
      "Binary Search on Answer",
      "Recursion Patterns",
      "DP Patterns",
      "Graph Traversal (BFS/DFS)",
      "Topological Sorting",
      "Greedy",
      "Backtracking",
      "Bit Manipulation",
      "Trie",
      "Segment Tree",
      "Union Find",
    ];

    console.log("Seeding techniques...");
    const techMap: Record<string, mongoose.Types.ObjectId> = {};

    for (const name of defaultTechs) {
      let tech = await Technique.findOne({ name });
      if (!tech) {
        tech = await Technique.create({ name });
        console.log(`Created technique: ${name}`);
      }
      techMap[name] = tech._id as mongoose.Types.ObjectId;
    }

    console.log("Migrating problems...");
    const problems = await Problem.find({});

    for (const problem of problems) {
      const oldTechs = (problem as any).techniques as any[];
      if (oldTechs && oldTechs.length > 0 && typeof oldTechs[0] === "string") {
        const newTechIds: mongoose.Types.ObjectId[] = [];

        for (const techName of oldTechs) {
          if (techMap[techName]) {
            newTechIds.push(techMap[techName]);
          } else {
            let tech = await Technique.findOne({ name: techName });
            if (!tech) {
              tech = await Technique.create({ name: techName });
              console.log(`Created missing technique: ${techName}`);
            }
            techMap[techName] = tech._id as mongoose.Types.ObjectId;
            newTechIds.push(tech._id as mongoose.Types.ObjectId);
          }
        }

        problem.techniques = newTechIds;
        await problem.save();
        console.log(`Updated problem: ${problem.title}`);
      }
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
