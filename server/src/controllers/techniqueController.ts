import { Request, Response } from "express";
import Technique from "../models/Technique";
import logger from "../utils/logger";

export const getTechniques = async (req: Request, res: Response) => {
  try {
    const techniques = await Technique.find().sort({ name: 1 });
    res.json(techniques);
  } catch (error: any) {
    logger.error("Error fetching techniques:", { message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createTechnique = async (req: Request, res: Response) => {
  try {
    const technique = new Technique(req.body);
    const saved = await technique.save();
    res.status(201).json(saved);
  } catch (error: any) {
    logger.error("Error creating technique:", { message: error.message, body: req.body });
    res.status(400).json({ message: error.message });
  }
};

export const updateTechnique = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Technique.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTechnique = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Technique.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
