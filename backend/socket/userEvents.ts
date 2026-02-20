import type { Socket, Server as SocketIOServer } from "socket.io";
import User from "../modals/User.js";
import { genrateToken } from "../utils/token.js";

export function registerUserEvents(io: SocketIOServer, socket: Socket) {
  socket.on("testsocket", () => {
    socket.emit("testSocket", { msg: "its working!!!" });
  });

  socket.on(
    "updateProfile",
    async (data: { name?: string; avatar?: string }) => {
      console.log("updateProfile event:", data);

      const userId = socket.data.userId;

      if (!userId) {
        return socket.emit("updateProfile", {
          success: false,
          msg: "Unauthorized",
        });
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            name: data.name,
            avatar: data.avatar,
          },
          { new: true },
        );

        if (!updatedUser) {
          return socket.emit("updateProfile", {
            success: false,
            msg: "User not found",
          });
        }

        const newToken = genrateToken(updatedUser);

        socket.emit("updateProfile", {
          success: true,
          data: { token: newToken },
          msg: "Profile updated successfully",
        });
      } catch (error) {
        console.error("Error updating profile:", error);

        socket.emit("updateProfile", {
          success: false,
          msg: "Error updating profile",
        });
      }
    },
  );
}
