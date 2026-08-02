import mongoose, { Document, Schema } from "mongoose";

export type EscrowStatus =
  | "funded"
  | "unfunded"
  | "released"
  | "refunded"
  | "unfunded_completed";

export interface IEscrow extends Document {
  _id: mongoose.Types.ObjectId;
  task: mongoose.Types.ObjectId;
  claim: mongoose.Types.ObjectId;
  employer: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  initialBudget: number;
  finalBidAmount: number;
  lockedAmount: number;
  status: EscrowStatus;
  platformGuarantee: boolean;
  disclaimerAccepted: boolean;
  disclaimerText: string;
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const escrowSchema = new Schema<IEscrow>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    claim: { type: Schema.Types.ObjectId, ref: "TaskClaim", required: true },
    employer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    freelancer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    initialBudget: { type: Number, required: true },
    finalBidAmount: { type: Number, required: true },
    lockedAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["funded", "unfunded", "released", "refunded", "unfunded_completed"],
      default: "unfunded",
    },
    platformGuarantee: { type: Boolean, default: false },
    disclaimerAccepted: { type: Boolean, default: false },
    disclaimerText: { type: String, default: "" },
    releasedAt: { type: Date },
  },
  { timestamps: true }
);

escrowSchema.index({ task: 1 });
escrowSchema.index({ employer: 1, status: 1 });
escrowSchema.index({ freelancer: 1, status: 1 });

export const Escrow = mongoose.model<IEscrow>("Escrow", escrowSchema);
