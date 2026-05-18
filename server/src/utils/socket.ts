import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import logger from "./logger";

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};

export const emitActivity = (activity: any) => {
  if (io) {
    logger.info(`📡 Emitting activity telemetry to clients: ${activity.action} - ${activity.itemName}`);
    io.emit("activity", activity);
  }
};
