import { env, connectDB } from "./config";
import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import http from "http";
import { initSocket } from "./utils/socket";
import logger from "./utils/logger";

// Connect to the database
connectDB();

const PORT = env.PORT || 5000;

// Wrap express application inside standard HTTP server to support WebSocket channels
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
});
