import type { Socket, Server as SocketIOServer } from "socket.io";

export function registerUserEvents(io: SocketIOServer, socket: Socket) {
  socket.on("testsocket", (data) => {
    socket.emit("testSocket", { msg: "its working!!!" });
  });
}
