import { Request, Response } from 'express';
import UserSetting from '../models/UserSetting';
import logger from '../utils/logger';

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await UserSetting.findOne();
    if (!settings) {
      settings = await UserSetting.create({});
    }
    res.json(settings);
  } catch (error: any) {
    logger.error("Error fetching settings:", { message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    // Ensure body is an object to prevent spread errors or JSON primitive issues
    if (typeof req.body !== 'object' || req.body === null || Array.isArray(req.body)) {
      res.status(400).json({ message: 'Invalid settings payload. Expected a JSON object.' });
      return;
    }

    const settings = await UserSetting.findOneAndUpdate(
      {},
      { ...req.body, updatedAt: new Date() },
      { upsert: true, returnDocument: 'after' }
    );
    res.json(settings);
  } catch (error: any) {
    logger.error("Error updating settings:", { message: error.message, body: req.body });
    res.status(500).json({ message: "Internal Server Error" });
  }
};
