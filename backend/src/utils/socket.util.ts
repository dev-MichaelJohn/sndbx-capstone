import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  AnonymousSubmissionEvent,
} from "@/types/socket.type.js";
import { logger } from "@/utils/logger.util.js";

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

export const initSocket = (httpServer: HTTPServer) => {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  logger.info("🔌 Socket.io server initialized and active");

  io.use((socket, next) => {
    // Authenticate handshake via cookies or auth header token[cite: 5]
    const token = socket.handshake.auth?.token;
    if (!token) {
      logger.warn(
        `❌ Socket connection rejected: Missing authentication token for client [id: ${socket.id}]`,
      );
      return next(new Error("Authentication required"));
    }
    return next();
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`🟢 Client connected via WebSocket [id: ${socket.id}]`);

    socket.on("sys-admin:join", () => {
      logger.info(`🛡️ Client [id: ${socket.id}] joined SYS_ADMIN_ROOM`);
      socket.join("SYS_ADMIN_ROOM");
    });

    socket.on("disconnect", (reason) => {
      logger.info(`🔴 Client disconnected [id: ${socket.id}] - Reason: ${reason}`);
    });
  });

  return io;
};

export const emitLiveSubmission = (payload: AnonymousSubmissionEvent) => {
  if (!io) return;
  io.to("SYS_ADMIN_ROOM").emit("evaluation:submitted", payload);
};
