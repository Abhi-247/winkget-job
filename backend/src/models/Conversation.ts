import mongoose, { Document, Schema } from "mongoose";

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  jobContext?: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    jobContext: { type: Schema.Types.ObjectId, ref: "Job" },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Fast lookup: "all conversations for this user"
conversationSchema.index({ participants: 1, lastActivity: -1 });

// Prevent duplicate conversations between the same pair of users
// We store participants sorted so [A,B] and [B,A] produce the same key.
// Enforced at the application layer in getOrCreateConversation.
conversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);
