import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Socket, Server as SocketIOServer } from "socket.io";
import { registerUserEvents } from "./userEvents.js";

dotenv.config();

export function initializeSocket(server: any): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication error: no token provided"));
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          return next(new Error("Authentication error: invalid token"));
        }

        socket.data.user = decoded.user;
        next();
      },
    );
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.user?.id;

    console.log(`User connected: ${userId}, username: ${socket.data.name}`);

    registerUserEvents(io, socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
}
