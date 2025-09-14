import { serve } from "@hono/node-server";
import app from "./index";
import { initSocket } from "./socket";

const server = serve({
  fetch: app.fetch,
  port: parseInt(process.env.PORT || "3001", 10),
});
const PORT = process.env.PORT || 3001;
export const userMap = new Map<string, string>();
const io = initSocket(server);

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("join", ({ userId }: { userId: string }) => {
    userMap.set(userId, socket.id);
    console.log("user map", userMap);
    console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
  });

  socket.on("join-room", ({ room }: { room: string }) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on("container", (data) => {
    const { room, ...payload } = data;
    socket.to(room).emit("container", payload);
  });

  socket.on("extraction", (data) => {
    const { room, ...payload } = data;
    socket.to(room).emit("extraction", payload);
  });

  socket.on("fileSync", (data) => {
    const { room, ...payload } = data;
    socket.to(room).emit("fileSync", payload);
  });

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

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
