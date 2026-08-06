import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  AnonymousSubmissionEvent,
} from "@/types/socket.type.js";

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

export const initSocket = (httpServer: HTTPServer) => {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    // Authenticate handshake via cookies or auth header token
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    return next();
  });

  io.on("connection", (socket: Socket) => {
    socket.on("sys-admin:join", () => {
      socket.join("SYS_ADMIN_ROOM");
    });
  });

  return io;
};

export const emitLiveSubmission = (payload: AnonymousSubmissionEvent) => {
  if (!io) return;
  io.to("SYS_ADMIN_ROOM").emit("evaluation:submitted", payload);
};
