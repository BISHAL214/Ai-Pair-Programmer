import { Server } from "socket.io";

let io: Server | null = null;

export function initSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
    transports: ["websocket"],
  });
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("❌ Socket.io not initialized. Call initSocket() first.");
  }
  return io;
}
