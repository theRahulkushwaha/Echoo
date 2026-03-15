import { model, Schema, Types } from "mongoose";
import type { ConversationProps } from "../types.js";

const ConversationSchema = new Schema<ConversationProps>(
  {
    type: { type: String, enum: ["direct", "group"], required: true },
    name: { type: String },
    avatar: { type: String, default: "" },
    participants: [{ type: Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: Types.ObjectId, ref: "Message", default: null },
    createdBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default model<ConversationProps>("Conversation", ConversationSchema);
