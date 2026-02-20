import { getSocket } from "./socket";

/**
 * Test socket event
 */
export const testSocket = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket is not connected");
    return;
  }

  if (off) {
    socket.off("testSocket", payload);
  } else if (typeof payload === "function") {
    socket.on("testSocket", payload);
  } else {
    socket.emit("testSocket", payload);
  }
};

/**
 * Update profile socket event
 */
export const updateProfile = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket is not connected");
    return;
  }

  if (off) {
    // Remove listener for "updateProfileResponse"
    socket.off("updateProfileResponse", payload);
  } else if (typeof payload === "function") {
    // Listen for server response
    socket.on("updateProfileResponse", payload);
  } else {
    // Emit update request
    socket.emit("updateProfile", payload);
  }
};
