import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category';
import logger from '../utils/logger';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    
    // If no categories exist, return the default ones for now
    if (categories.length === 0) {
      const defaults = [
        {
          name: "Data Structures",
          subCategories: [
            "Arrays", "Strings", "Linked List", "Stack", "Queue", 
            "Deque", "Trees", "Binary Trees", "BST", "Heap", 
            "Graphs", "Trie"
          ]
        },
        {
          name: "Algorithms",
          subCategories: ["Sorting", "Searching", "Recursion", "Backtracking", "DP", "Greedy", "D&C"]
        },
        {
          name: "Coding Problems",
          subCategories: ["General", "Bit Manipulation", "Math"]
        }
      ];
      return res.json(defaults);
    }

    res.json(categories);
  } catch (error: any) {
    logger.error("Error fetching categories:", { message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error: any) {
    logger.error("Error creating category:", { message: error.message, body: req.body });
    res.status(400).json({ message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getTaxonomyStats = async (req: Request, res: Response) => {
  try {
    const CategoryModel = mongoose.model("Category");
    const ProblemModel = mongoose.model("Problem");

    // Get all categories with lean() and explicit typing
    const categories = (await CategoryModel.find().lean()) as any[];

    // Aggregate counts from Problem collection by category, subCategory, AND difficulty
    const stats = await ProblemModel.aggregate([
      {
        $group: {
          _id: {
            category: "$category",
            subCategory: "$subCategory",
            difficulty: "$difficulty",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the result: map stats back to category structure
    const taxonomyData = categories.map((cat) => {
      const subStats = (cat.subCategories || []).map((sub: string) => {
        // Map all matching difficulties for this subCategory
        const difficulties = ["Easy", "Medium", "Hard"].reduce((acc: any, diff) => {
          const match = stats.find(
            (s) =>
              s._id.category &&
              s._id.category.toString() === cat._id.toString() &&
              s._id.subCategory === sub &&
              s._id.difficulty === diff,
          );
          acc[diff] = match ? match.count : 0;
          return acc;
        }, {});

        const totalForSub = Object.values(difficulties).reduce(
          (sum: any, val: any) => sum + val,
          0,
        ) as number;

        return {
          name: sub,
          count: totalForSub,
          difficulties, // Added difficulty breakdown
        };
      });

      return {
        id: cat._id,
        name: cat.name,
        subCategories: subStats,
        totalCount: subStats.reduce(
          (acc: number, curr: any) => acc + curr.count,
          0,
        ),
      };
    });

    res.json(taxonomyData);
  } catch (error: any) {
    logger.error("Error fetching taxonomy stats:", { message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};
