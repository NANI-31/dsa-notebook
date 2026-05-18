import { Request, Response } from "express";
import Folder from "../models/Folder";
import Problem from "../models/Problem";
import logger from "../utils/logger";

// Fetch all folders
export const getFolders = async (req: Request, res: Response): Promise<void> => {
  try {
    const folders = await Folder.find({}).sort({ addedDate: 1 });
    res.json(folders);
  } catch (error: any) {
    logger.error("Error fetching folders:", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create a new folder
export const createFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, parentFolder } = req.body;
    if (!name) {
      res.status(400).json({ message: "Folder name is required" });
      return;
    }

    const folder = new Folder({
      name,
      parentFolder: parentFolder || null,
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error: any) {
    logger.error("Error creating folder:", { message: error.message, body: req.body });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update folder (rename or move)
export const updateFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, parentFolder } = req.body;

    const folder = await Folder.findById(id);
    if (!folder) {
      res.status(404).json({ message: "Folder not found" });
      return;
    }

    if (name !== undefined) folder.name = name;
    if (parentFolder !== undefined) folder.parentFolder = parentFolder || null;

    await folder.save();
    res.json(folder);
  } catch (error: any) {
    logger.error("Error updating folder:", { id: req.params.id, message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Recursive helper to get all subfolders of a list of folder IDs
const getAllChildFolderIds = async (folderIds: string[]): Promise<string[]> => {
  const children = await Folder.find({ parentFolder: { $in: folderIds } });
  if (children.length === 0) {
    return folderIds;
  }
  const childIds = children.map((c) => c._id.toString());
  const recursiveIds = await getAllChildFolderIds(childIds);
  return [...folderIds, ...recursiveIds];
};

// Delete folder recursively
export const deleteFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const folderToDelete = await Folder.findById(id);
    if (!folderToDelete) {
      res.status(404).json({ message: "Folder not found" });
      return;
    }

    const parentId = folderToDelete.parentFolder;

    // 1. Recursively find all child subfolder IDs under this folder
    const allFolderIdsToDelete = await getAllChildFolderIds([id]);

    // 2. Update all problems in these deleted folders to bubble up to the deleted folder's parent
    await Problem.updateMany(
      { folderId: { $in: allFolderIdsToDelete } },
      { $set: { folderId: parentId || null } }
    );

    // 3. Delete all of these folders
    await Folder.deleteMany({ _id: { $in: allFolderIdsToDelete } });

    res.json({
      message: "Folder and all its subfolders deleted successfully. Problems moved up.",
      deletedFolderIds: allFolderIdsToDelete,
    });
  } catch (error: any) {
    logger.error("Error deleting folder:", { id: req.params.id, message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};
