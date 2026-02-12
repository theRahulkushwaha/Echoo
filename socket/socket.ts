import { API_URL } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export async function connectSocket(): Promise<Socket> {
  if (socket) return socket; // prevent multiple connections

  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No token found. User not authenticated.");
  }

  socket = io(API_URL, {
    auth: { token },
    transports: ["websocket"], // important for React Native
  });

  await new Promise<void>((resolve, reject) => {
    socket?.on("connect", () => {
      console.log("Socket connected:", socket?.id);
      resolve();
    });

    socket?.on("connect_error", (err) => {
      console.log("Socket connection error:", err.message);
      reject(err);
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
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
