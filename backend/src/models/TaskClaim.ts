import mongoose, { Document, Schema } from "mongoose";

export type ClaimStatus = "pending" | "approved" | "rejected" | "completed";

export interface ITaskClaim extends Document {
  _id: mongoose.Types.ObjectId;
  task: mongoose.Types.ObjectId;
  claimant: mongoose.Types.ObjectId;
  status: ClaimStatus;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskClaimSchema = new Schema<ITaskClaim>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    claimant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

// Prevent duplicate claims
taskClaimSchema.index({ task: 1, claimant: 1 }, { unique: true });

export const TaskClaim = mongoose.model<ITaskClaim>("TaskClaim", taskClaimSchema);
