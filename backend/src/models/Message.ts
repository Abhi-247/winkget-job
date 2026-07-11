import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true, maxlength: 2000, trim: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Primary query pattern: fetch messages in a conversation ordered by time
messageSchema.index({ conversation: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
