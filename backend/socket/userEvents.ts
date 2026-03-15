import { Types } from "mongoose";
import type { Socket, Server as SocketIOServer } from "socket.io";
import Conversation from "../modals/Conversation.js";
import Message from "../modals/Message.js";
import Story from "../modals/Story.js";
import User from "../modals/User.js";
import { genrateToken } from "../utils/token.js";

export function registerUserEvents(io: SocketIOServer, socket: Socket) {
  const userId = socket.data.user?.id;

  // ── get stories ───────────────────────────────────────────────────────────
  socket.on("getStories", async () => {
    if (!userId) return;
    try {
      // Get all users this user has conversations with
      const conversations = await Conversation.find({ participants: userId });
      const contactIds = conversations.flatMap((c) =>
        c.participants.map((p) => p.toString()).filter((p) => p !== userId),
      );

      // Include current user's own stories
      const allUserIds = [userId, ...contactIds];

      const stories = await Story.find({
        userId: { $in: allUserIds },
        expiresAt: { $gt: new Date() },
      })
        .populate("userId", "name avatar")
        .sort({ createdAt: -1 });

      // Group by user
      const grouped: Record<string, any> = {};
      stories.forEach((s) => {
        const uid = s.userId._id.toString();
        if (!grouped[uid]) {
          grouped[uid] = {
            user: s.userId,
            stories: [],
            hasUnread: false,
          };
        }
        grouped[uid].stories.push(s);
        if (!s.viewers.map((v) => v.toString()).includes(userId)) {
          grouped[uid].hasUnread = true;
        }
      });

      socket.emit("storiesResponse", {
        success: true,
        data: Object.values(grouped),
      });
    } catch (error) {
      console.error("getStories error:", error);
      socket.emit("storiesResponse", {
        success: false,
        msg: "Error fetching stories",
      });
    }
  });

  // ── create story ──────────────────────────────────────────────────────────
  socket.on(
    "createStory",
    async (data: {
      media: string;
      mediaType: "image" | "text";
      caption?: string;
      backgroundColor?: string;
    }) => {
      if (!userId) return;
      try {
        const story = await Story.create({
          userId,
          media: data.media,
          mediaType: data.mediaType,
          caption: data.caption || "",
          backgroundColor: data.backgroundColor || "#facc15",
          viewers: [],
        });

        const populated = await story.populate("userId", "name avatar");
        socket.emit("storyCreated", { success: true, data: populated });
      } catch (error) {
        socket.emit("storyCreated", {
          success: false,
          msg: "Error creating story",
        });
      }
    },
  );

  // ── view story ────────────────────────────────────────────────────────────
  socket.on("viewStory", async ({ storyId }: { storyId: string }) => {
    if (!userId) return;
    try {
      await Story.findByIdAndUpdate(storyId, {
        $addToSet: { viewers: userId },
      });
      socket.emit("storyViewed", { success: true, storyId });
    } catch (error) {
      console.error("viewStory error:", error);
    }
  });

  socket.on("joinMyRooms", async () => {
    const convos = await Conversation.find({ participants: userId });
    convos.forEach((c) => socket.join(c._id.toString()));
    socket.emit("joinedRooms", { count: convos.length });
  });

  socket.on("testsocket", () => {
    socket.emit("testSocket", { msg: "its working!!!" });
  });

  socket.on(
    "updateProfile",
    async (data: { name?: string; avatar?: string }) => {
      if (!userId) {
        return socket.emit("updateProfileResponse", {
          success: false,
          msg: "Unauthorized",
        });
      }
      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { name: data.name, avatar: data.avatar },
          { new: true },
        );
        if (!updatedUser) {
          return socket.emit("updateProfileResponse", {
            success: false,
            msg: "User not found",
          });
        }
        const newToken = genrateToken(updatedUser);
        socket.emit("updateProfileResponse", {
          success: true,
          data: { token: newToken },
          msg: "Profile updated successfully",
        });
      } catch (error) {
        socket.emit("updateProfileResponse", {
          success: false,
          msg: "Error updating profile",
        });
      }
    },
  );

  socket.on("getConversations", async () => {
    if (!userId)
      return socket.emit("conversationsResponse", {
        success: false,
        msg: "Unauthorized",
      });
    try {
      const conversations = await Conversation.find({ participants: userId })
        .populate("participants", "name email avatar")
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "name avatar" },
        })
        .sort({ updatedAt: -1 });

      socket.emit("conversationsResponse", {
        success: true,
        data: conversations,
      });
    } catch (error) {
      socket.emit("conversationsResponse", {
        success: false,
        msg: "Error fetching conversations",
      });
    }
  });

  socket.on(
    "getOrCreateConversation",
    async ({ targetUserId }: { targetUserId: string }) => {
      if (!userId) {
        return socket.emit("conversationResponse", {
          success: false,
          msg: "Unauthorized",
        });
      }
      try {
        const userObjId = new Types.ObjectId(userId);
        const targetObjId = new Types.ObjectId(targetUserId);

        let conversation = await Conversation.findOne({
          type: "direct",
          participants: { $all: [userObjId, targetObjId], $size: 2 },
        }).populate("participants", "name email avatar");

        if (!conversation) {
          const created = await Conversation.create({
            type: "direct",
            participants: [userObjId, targetObjId],
          });
          conversation = (await Conversation.findById(created._id).populate(
            "participants",
            "name email avatar",
          )) as any;
        }

        socket.join(conversation!._id.toString());
        socket.emit("conversationResponse", {
          success: true,
          data: conversation,
        });
      } catch (error) {
        console.error("getOrCreateConversation error:", error);
        socket.emit("conversationResponse", {
          success: false,
          msg: "Error creating conversation",
        });
      }
    },
  );

  socket.on(
    "getMessages",
    async ({
      conversationId,
      page = 1,
    }: {
      conversationId: string;
      page?: number;
    }) => {
      if (!userId)
        return socket.emit("messagesResponse", {
          success: false,
          msg: "Unauthorized",
        });
      try {
        const limit = 30;
        const messages = await Message.find({ conversationId })
          .populate("sender", "name avatar")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        socket.emit("messagesResponse", {
          success: true,
          data: messages.reverse(),
          page,
        });
      } catch (error) {
        socket.emit("messagesResponse", {
          success: false,
          msg: "Error fetching messages",
        });
      }
    },
  );

  socket.on(
    "sendMessage",
    async ({
      conversationId,
      text,
      image,
    }: {
      conversationId: string;
      text?: string;
      image?: string;
    }) => {
      if (!userId) return;
      try {
        const message = await Message.create({
          conversationId,
          sender: userId,
          text: text || "",
          image: image || null,
          seenBy: [userId],
        });

        const populated = await message.populate("sender", "name avatar");

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        io.to(conversationId).emit("newMessage", {
          success: true,
          data: populated,
        });

        const convo = await Conversation.findById(conversationId);
        convo?.participants.forEach((participantId) => {
          const participantSockets = Array.from(
            io.sockets.sockets.values(),
          ).filter((s) => s.data.user?.id === participantId.toString());
          participantSockets.forEach((s) =>
            s.emit("conversationUpdated", { conversationId }),
          );
        });
      } catch (error) {
        console.error("sendMessage error:", error);
      }
    },
  );

  socket.on(
    "markSeen",
    async ({ conversationId }: { conversationId: string }) => {
      if (!userId) return;
      try {
        await Message.updateMany(
          { conversationId, seenBy: { $ne: userId } },
          { $addToSet: { seenBy: userId } },
        );
        io.to(conversationId).emit("messagesSeen", {
          conversationId,
          seenBy: userId,
        });
      } catch (error) {
        console.error("markSeen error:", error);
      }
    },
  );

  socket.on("typing", ({ conversationId }: { conversationId: string }) => {
    socket
      .to(conversationId)
      .emit("userTyping", { conversationId, user: socket.data.user });
  });

  socket.on("stopTyping", ({ conversationId }: { conversationId: string }) => {
    socket
      .to(conversationId)
      .emit("userStoppedTyping", { conversationId, userId });
  });

  socket.broadcast.emit("userOnline", { userId });

  socket.on("disconnect", async () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    rooms.forEach((roomId) =>
      socket.to(roomId).emit("userOffline", { userId }),
    );
  });

  // ✅ KEY FIX — map _id to id so frontend UserProps matches
  socket.on("searchUsers", async ({ query }: { query: string }) => {
    if (!userId) return;
    try {
      const users = await User.find({
        _id: { $ne: userId },
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      })
        .select("name email avatar")
        .limit(20)
        .lean();

      const mapped = (users as any[]).map((u) => ({
        id: u._id.toString(), // ✅ _id → id
        name: u.name,
        email: u.email,
        avatar: u.avatar || null,
      }));

      socket.emit("searchUsersResponse", { success: true, data: mapped });
    } catch (error) {
      socket.emit("searchUsersResponse", {
        success: false,
        msg: "Search failed",
      });
    }
  });

  socket.on(
    "createGroup",
    async ({
      name,
      memberIds,
      avatar,
    }: {
      name: string;
      memberIds: string[];
      avatar?: string;
    }) => {
      if (!userId) return;
      try {
        const participants = [userId, ...memberIds];
        const group = await Conversation.create({
          type: "group",
          name,
          participants,
          createdBy: userId,
          avatar: avatar || "",
        });

        const populated = await Conversation.findById(group._id).populate(
          "participants",
          "name email avatar",
        );

        participants.forEach((pid) => {
          const memberSockets = Array.from(io.sockets.sockets.values()).filter(
            (s) => s.data.user?.id === pid.toString(),
          );
          memberSockets.forEach((s) => {
            s.join(group._id.toString());
            s.emit("newGroup", { success: true, data: populated });
          });
        });
      } catch (error) {
        socket.emit("newGroup", {
          success: false,
          msg: "Error creating group",
        });
      }
    },
  );
}
