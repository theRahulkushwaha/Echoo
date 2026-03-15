import { getSocket } from "./socket";

type Callback = (...args: any[]) => void;

const makeEvent = (emitEvent: string, listenEvent: string) => {
  return (payload: Callback | Record<string, any>, off = false) => {
    const socket = getSocket();
    if (!socket) {
      console.warn("Socket not connected");
      return;
    }
    if (off) {
      socket.off(listenEvent, payload as Callback);
    } else if (typeof payload === "function") {
      socket.on(listenEvent, payload as Callback);
    } else {
      socket.emit(emitEvent, payload);
    }
  };
};

export const testSocket = makeEvent("testsocket", "testSocket");
export const updateProfile = makeEvent(
  "updateProfile",
  "updateProfileResponse",
);
export const getConversations = makeEvent(
  "getConversations",
  "conversationsResponse",
);
export const getOrCreateConversation = makeEvent(
  "getOrCreateConversation",
  "conversationResponse",
);
export const getMessages = makeEvent("getMessages", "messagesResponse");
export const sendMessage = makeEvent("sendMessage", "newMessage");
export const markSeen = makeEvent("markSeen", "messagesSeen");
export const searchUsers = makeEvent("searchUsers", "searchUsersResponse");
export const createGroup = makeEvent("createGroup", "newGroup");
export const getStories = makeEvent("getStories", "storiesResponse");
export const createStory = makeEvent("createStory", "storyCreated");
export const viewStory = makeEvent("viewStory", "storyViewed");

// ── typing ────────────────────────────────────────────────────────────────────
export const emitTyping = (conversationId: string) => {
  getSocket()?.emit("typing", { conversationId });
};
export const emitStopTyping = (conversationId: string) => {
  getSocket()?.emit("stopTyping", { conversationId });
};
export const onUserTyping = (cb: Callback, off = false) => {
  const s = getSocket();
  off ? s?.off("userTyping", cb) : s?.on("userTyping", cb);
};
export const onUserStoppedTyping = (cb: Callback, off = false) => {
  const s = getSocket();
  off ? s?.off("userStoppedTyping", cb) : s?.on("userStoppedTyping", cb);
};

// ── online status ─────────────────────────────────────────────────────────────
export const onUserOnline = (cb: Callback, off = false) => {
  const s = getSocket();
  off ? s?.off("userOnline", cb) : s?.on("userOnline", cb);
};
export const onUserOffline = (cb: Callback, off = false) => {
  const s = getSocket();
  off ? s?.off("userOffline", cb) : s?.on("userOffline", cb);
};

// ── passive listeners ─────────────────────────────────────────────────────────
export const onNewMessage = (cb: Callback, off = false) => {
  const s = getSocket();
  off ? s?.off("newMessage", cb) : s?.on("newMessage", cb);
};
export const onConversationUpdated = (cb: Callback, off = false) => {
  const s = getSocket();
  off ? s?.off("conversationUpdated", cb) : s?.on("conversationUpdated", cb);
};

// ── join rooms ────────────────────────────────────────────────────────────────
export const joinMyRooms = () => {
  getSocket()?.emit("joinMyRooms");
};
