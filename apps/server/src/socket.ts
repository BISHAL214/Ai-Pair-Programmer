/**
 * @file This file initializes and exports a Socket.IO server instance.
 * It provides functions to initialize the socket server and to get the instance.
 * @requires socket.io
 */
import { Server } from "socket.io";

/**
 * The singleton Socket.IO server instance.
 * It is initialized to null and gets assigned when `initSocket` is called.
 * @type {Server | null}
 */
let io: Server | null = null;

/**
 * Initializes the Socket.IO server with the given HTTP server.
 * This function should be called once to set up the socket server.
 * @param {any} server - The HTTP server instance to attach Socket.IO to.
 * @returns {Server} The created Socket.IO server instance.
 */
export function initSocket(server: any) {
  io = new Server(server, {
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

/**
 * Returns the existing Socket.IO server instance.
 * Throws an error if the socket server has not been initialized via `initSocket`.
 * @returns {Server} The Socket.IO server instance.
 * @throws {Error} If `initSocket()` has not been called before.
 */
export function getIO() {
  if (!io) {
    throw new Error("❌ Socket.io not initialized. Call initSocket() first.");
  }
  return io;
}
