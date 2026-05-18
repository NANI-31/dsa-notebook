import { Request, Response } from 'express';
import ActivityLog from '../models/ActivityLog';
import logger from '../utils/logger';

export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(30);
    res.json(logs);
  } catch (error: any) {
    logger.error("Error fetching activity logs:", { message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};
