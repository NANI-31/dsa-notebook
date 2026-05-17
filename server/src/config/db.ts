import mongoose from "mongoose";
import { env } from "./env";
import logger from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);

    logger.info("✅ MongoDB connected");

    mongoose.connection.on("error", (err) => {
      logger.error("❌ MongoDB error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️ MongoDB disconnected");
    });
  } catch (error: any) {
    logger.error("❌ MongoDB connection failed:", { message: error.message });
    process.exit(1);
  }
};
