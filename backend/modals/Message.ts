import { Document, model, Schema, Types } from "mongoose";

export interface MessageDocument extends Document {
  conversationId: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  image?: string | null;
  seenBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<MessageDocument>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    image: { type: String, default: null },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export default model<MessageDocument>("Message", MessageSchema);
