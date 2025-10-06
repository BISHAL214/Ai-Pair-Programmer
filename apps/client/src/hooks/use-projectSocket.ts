"use client";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/utils";
import { INFO, useProjectStore } from "@/zustand/useProjectStore";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";

// Custom hook to manage project-related WebSocket connections and events
export function useProjectSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth(supabase);
  const { projectId, setInfo, userId } = useProjectStore();

  useEffect(() => {
    if (!user?.id) return;

    // Connect only once per user
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_SERVER_URL, {
        transports: ["websocket"], // skip polling
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    const socketIo = socketRef.current;

    socketIo.on("connect", () => {
      console.log("✅ Socket connected:", socketIo.id);

      // Register user
      socketIo.emit("join", { userId: user.id });

      // Join room if project info is available
      if (projectId && userId && user.id === userId) {
        const room = `${projectId}:${userId}`;
        socketIo.emit("join-room", { room });
        console.log(`✅ Socket joined room: ${room}`);
      }
    });

    // Event listeners
    socketIo.on("extraction", (data: INFO["extraction"]) => {
      setInfo("extraction", data);
      console.log("📦 Extraction update:", data);
    });

    socketIo.on("container", (data: INFO["container"]) => {
      setInfo("container", data);
      console.log("📦 Container update:", data);
    });

    socketIo.on("fileSync", (data: INFO["fileSync"]) => {
      setInfo("fileSync", data);
      console.log("📦 File sync update:", data);
    });

    // Cleanup on unmount
    return () => {
      socketIo.off("connect");
      socketIo.off("extraction");
      socketIo.off("container");
      socketIo.off("fileSync");
      socketIo.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, projectId, userId, setInfo]);

  return socketRef.current;
}
