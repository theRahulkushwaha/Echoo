import { Document, model, Schema, Types } from "mongoose";

export interface StoryDocument extends Document {
  userId: Types.ObjectId;
  media: string;
  mediaType: "image" | "text";
  caption?: string;
  backgroundColor?: string;
  viewers: Types.ObjectId[];
  expiresAt: Date;
  createdAt: Date;
}

const StorySchema = new Schema<StoryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    media: { type: String, default: "" },
    mediaType: { type: String, enum: ["image", "text"], default: "image" },
    caption: { type: String, default: "" },
    backgroundColor: { type: String, default: "#facc15" },
    viewers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  { timestamps: true },
);

// Auto-expire stories after 24h
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<StoryDocument>("Story", StorySchema);
