import { io, Socket } from "socket.io-client";
import { BACKEND_BASE_API } from "./api.lib";

export const socket: Socket = io(BACKEND_BASE_API, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  auth: (cb) => {
    const token = localStorage.getItem("access_token");
    cb({ token });
  },
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
