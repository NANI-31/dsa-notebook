import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Problem from '../models/Problem';
import Solution from '../models/Solution';
import ActivityLog from '../models/ActivityLog';
import logger from '../utils/logger';
import { emitActivity } from '../utils/socket';

export const getProblems = async (req: Request, res: Response) => {
  try {
    const { search, difficulty, categories, techniques, subCategory, categoryName, folderId } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const query: any = {};
    let sort: any = { addedDate: -1 }; // Default sort

    if (folderId) {
      if (folderId === "root") {
        query.folderId = null;
      } else if (folderId !== "all") {
        query.folderId = folderId;
      }
    }

    if (search) {
      query.$text = { $search: search };
      // Priority scoring for text search
      sort = { score: { $meta: "textScore" } };
    }

    if (difficulty) {
      const difficulties = Array.isArray(difficulty) ? difficulty : (difficulty as string).split(',');
      query.difficulty = { $in: difficulties };
    }

    if (categories) {
      // 'categories' in the query currently refers to the sub-category strings
      const cats = Array.isArray(categories) ? categories : (categories as string).split(',');
      query.subCategory = { $in: cats };
    }

    if (subCategory) {
       const subCats = Array.isArray(subCategory) ? subCategory : (subCategory as string).split(',');
       query.subCategory = { $in: subCats };
    }

    if (categoryName) {
       // Lookup category ID by name
       const Category = mongoose.model("Category");
       const catDoc = await Category.findOne({ name: categoryName });
       if (catDoc) {
         query.category = catDoc._id;
       }
    }

    if (techniques) {
      const techs = Array.isArray(techniques) ? techniques : (techniques as string).split(',');
      query.techniques = { $in: techs };
    }

    // Parallel count and find
    const [problems, total] = await Promise.all([
      Problem.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select(
          "title difficulty slug starred categories techniques timeComplexity spaceComplexity folderId",
        )
        .populate("category", "name")
        .populate("techniques", "name"),
      Problem.countDocuments(query)
    ]);

    res.json({
      data: problems,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error: any) {
    logger.error("Error fetching problems:", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProblemBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug })
      .populate("category", "name")
      .populate("techniques", "name");
    if (!problem) {
       res.status(404).json({ message: 'Problem not found' });
       return;
    }

    const solutions = await Solution.find({ problemId: problem._id });

    // Reassemble with solutions
    const fullProblem = {
      ...problem.toObject(),
      variants: solutions.map(s => ({
        id: s._id.toString(),
        name: s.name,
        code: s.code,
        language: s.language,
        codes: s.codes ? Object.fromEntries(s.codes) : {}
      }))
    };

    res.json(fullProblem);
  } catch (error: any) {
    logger.error("Error fetching problem by slug:", { slug: req.params.slug, message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProblemCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { variants, ...updateData } = req.body;
    
    // 1. Perform metadata and content updates (Ensuring pre-save hooks trigger for validation)
    let problem = await Problem.findOne({ slug: req.params.slug });
    
    if (!problem) {
       res.status(404).json({ message: 'Problem not found' });
       return;
    }

    // Apply updates manually to trigger isModified and pre-save hooks
    Object.assign(problem, updateData);
    await problem.save();
    
    if (!problem) {
       res.status(404).json({ message: 'Problem not found' });
       return;
    }

    // 2. Perform solutions update only if 'variants' is provided
    if (variants !== undefined && Array.isArray(variants)) {
      await Solution.deleteMany({ problemId: problem._id });
      const solutionDocs = variants.map(v => ({
        problemId: problem._id,
        name: v.name,
        code: v.code,
        language: v.language,
        codes: v.codes || {}
      }));
      await Solution.insertMany(solutionDocs);
    }

    // Background Activity Logging
    try {
      const activity = await ActivityLog.create({
        action: 'update',
        itemType: 'problem',
        itemName: problem.title,
        itemId: problem._id.toString(),
        details: `Problem "${problem.title}" code templates updated.`
      });
      emitActivity(activity);
    } catch (logErr: any) {
      logger.error("Failed to log update activity:", logErr);
    }

    return getProblemBySlug(req, res);
  } catch (error: any) {
    logger.error("Error updating problem:", { slug: req.params.slug, message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createProblem = async (req: Request, res: Response) => {
  try {
    const { variants, ...problemData } = req.body;

    const newProblem = new Problem(problemData);
    await newProblem.save();

    if (variants && Array.isArray(variants)) {
      const solutionDocs = variants.map(v => ({
        problemId: newProblem._id,
        name: v.name,
        code: v.code,
        language: v.language,
        codes: v.codes || {}
      }));
      await Solution.insertMany(solutionDocs);
    }

    // Background Activity Logging
    try {
      const activity = await ActivityLog.create({
        action: 'create',
        itemType: 'problem',
        itemName: newProblem.title,
        itemId: newProblem._id.toString(),
        details: `Problem "${newProblem.title}" created with difficulty ${newProblem.difficulty}.`
      });
      emitActivity(activity);
    } catch (logErr: any) {
      logger.error("Failed to log create activity:", logErr);
    }

    res.status(201).json({ ...newProblem.toObject(), variants });
  } catch (error: any) {
    logger.error("Error creating problem:", { message: error.message, body: req.body });
    res.status(400).json({ message: error.message });
  }
};

export const deleteProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      res.status(404).json({ message: "Problem not found" });
      return;
    }

    // Delete associated solutions
    await Solution.deleteMany({ problemId: problem._id });

    // Delete the problem document
    await Problem.deleteOne({ _id: problem._id });

    // Background Activity Logging
    try {
      const activity = await ActivityLog.create({
        action: 'delete',
        itemType: 'problem',
        itemName: problem.title,
        itemId: problem._id.toString(),
        details: `Problem "${problem.title}" permanently deleted.`
      });
      emitActivity(activity);
    } catch (logErr: any) {
      logger.error("Failed to log delete activity:", logErr);
    }

    res.json({ message: "Problem successfully deleted" });
  } catch (error: any) {
    logger.error("Error deleting problem:", { slug: req.params.slug, message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};
