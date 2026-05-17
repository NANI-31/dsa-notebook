import { env, connectDB } from "./config";
import dotenv from "dotenv";
dotenv.config();
import app from "./app";
// Connect to the database
connectDB();

import logger from "./utils/logger";

const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
});
