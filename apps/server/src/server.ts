/**
 * @file This file is the main entry point for the Node.js server.
 * It sets up an Hono server with Socket.IO for real-time communication.
 * @requires @hono/node-server
 * @requires ./index
 * @requires ./socket
 */
import { serve } from "@hono/node-server";
import app from "./index";
import { initSocket } from "./socket";

/**
 * The HTTP server instance.
 * @type {import('http').Server}
 */
const server = serve({
  fetch: app.fetch,
  port: parseInt(process.env.PORT || "3001", 10),
});

/**
 * The port number the server will listen on.
 * @type {number}
 */
const PORT = process.env.PORT || 3001;

/**
 * A map to store the mapping of user IDs to socket IDs.
 * @type {Map<string, string>}
 */
export const userMap = new Map<string, string>();

/**
 * The Socket.IO server instance.
 * @type {import('socket.io').Server}
 */
const io = initSocket(server);

/**
 * Event listener for new socket connections.
 * @param {string} "connection" - The event name.
 * @param {function} callback - The callback function for a new connection.
 * @param {import('socket.io').Socket} callback.socket - The socket instance for the connected client.
 */
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  /**
   * Event listener for a user joining.
   * This maps a user ID to their socket ID.
   * @param {string} "join" - The event name.
   * @param {function} callback - The callback function.
   * @param {object} callback.data - The data received.
   * @param {string} callback.data.userId - The user's ID.
   */
  socket.on("join", ({ userId }: { userId: string }) => {
    userMap.set(userId, socket.id);
    console.log("user map", userMap);
    console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
  });

  /**
   * Event listener for a socket joining a room.
   * @param {string} "join-room" - The event name.
   * @param {function} callback - The callback function.
   * @param {object} callback.data - The data received.
   * @param {string} callback.data.room - The room to join.
   */
  socket.on("join-room", ({ room }: { room: string }) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  /**
   * Event listener for container-related events.
   * Forwards the event to a specific room.
   * @param {string} "container" - The event name.
   * @param {function} callback - The callback function.
   * @param {object} callback.data - The data received, including the room.
   */
  socket.on("container", (data) => {
    const { room, ...payload } = data;
    socket.to(room).emit("container", payload);
  });

  /**
   * Event listener for extraction-related events.
   * Forwards the event to a specific room.
   * @param {string} "extraction" - The event name.
   * @param {function} callback - The callback function.
   * @param {object} callback.data - The data received, including the room.
   */
  socket.on("extraction", (data) => {
    const { room, ...payload } = data;
    socket.to(room).emit("extraction", payload);
  });

  /**
   * Event listener for file synchronization events.
   * Forwards the event to a specific room.
   * @param {string} "fileSync" - The event name.
   * @param {function} callback - The callback function.
   * @param {object} callback.data - The data received, including the room.
   */
  socket.on("fileSync", (data) => {
    const { room, ...payload } = data;
    socket.to(room).emit("fileSync", payload);
  });

  /**
   * Event listener for when a user disconnects.
   * Removes the user from the user map.
   * @param {string} "disconnect" - The event name.
   * @param {function} callback - The callback function.
   */
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    for (const [userId, sId] of userMap.entries()) {
      if (sId === socket.id) {
        userMap.delete(userId);
        console.log(`User unregistered: ${userId}`);
        break;
      }
    }
  });
});

/**
 * Starts the server and listens on the specified port.
 * @param {number} PORT - The port to listen on.
 * @param {function} callback - The callback function to execute when the server starts.
 */
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
