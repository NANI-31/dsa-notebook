import { Request, Response } from 'express';
import TelemetryLog from '../models/TelemetryLog';
import logger from '../utils/logger';
import { getIO } from '../utils/socket';

export const createTelemetryLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reports } = req.body;
    if (!reports || !Array.isArray(reports)) {
      res.status(400).json({ message: "Invalid payload: 'reports' array required." });
      return;
    }

    const saved = [];
    for (const report of reports) {
      const { metric, value, rating, timestamp } = report;
      const log = new TelemetryLog({
        metric,
        value,
        rating,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      });
      await log.save();
      saved.push(log);

      // Emit over WebSocket stream in real time!
      try {
        const io = getIO();
        io.emit("telemetry", log);
      } catch (wsErr) {
        // Socket.io is not initialized yet or not running, ignore
      }
    }

    res.status(201).json({
      message: `Successfully batch uploaded ${saved.length} performance reports.`,
      data: saved
    });
  } catch (error: any) {
    logger.error("Error saving telemetry logs:", { message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTelemetryLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await TelemetryLog.find()
      .sort({ timestamp: -1 })
      .limit(100);

    // Compute averages by metric for the dashboard summary
    const summary = await TelemetryLog.aggregate([
      { $sort: { timestamp: -1 } },
      { $limit: 1000 },
      {
        $group: {
          _id: "$metric",
          avgValue: { $avg: "$value" },
          count: { $sum: 1 },
          ratings: { $push: "$rating" }
        }
      }
    ]);

    // Format the summary response
    const averages = summary.reduce((acc: any, item: any) => {
      // Find the most frequent rating
      const ratingCounts = item.ratings.reduce((counts: any, r: string) => {
        counts[r] = (counts[r] || 0) + 1;
        return counts;
      }, {});
      let topRating = "good";
      let maxCount = 0;
      for (const [r, count] of Object.entries(ratingCounts)) {
        if ((count as number) > maxCount) {
          maxCount = count as number;
          topRating = r;
        }
      }

      acc[item._id] = {
        value: parseFloat(item.avgValue.toFixed(3)),
        rating: topRating,
        count: item.count
      };
      return acc;
    }, {});

    res.json({ logs, averages });
  } catch (error: any) {
    logger.error("Error fetching telemetry logs:", { message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};
