import { API_URL } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket;

  // reset if disconnected
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No token found. User not authenticated.");
  }

  console.log("Connecting to socket:", API_URL);

  socket = io(API_URL, {
    auth: { token },
    transports: ["websocket"],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  await new Promise<void>((resolve, reject) => {
    // timeout after 10 seconds
    const timer = setTimeout(() => {
      reject(new Error("Socket connection timeout — check API_URL"));
    }, 10000);

    socket?.on("connect", () => {
      clearTimeout(timer);
      console.log("✅ Socket connected:", socket?.id);
      resolve();
    });

    socket?.on("connect_error", (err) => {
      clearTimeout(timer);
      console.log("❌ Socket connection error:", err.message);
      console.log("API_URL is:", API_URL);
      reject(err);
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
