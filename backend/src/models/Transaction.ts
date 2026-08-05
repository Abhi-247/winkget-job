import mongoose, { Document, Schema } from "mongoose";

export type TransactionType = "deposit" | "escrow_lock" | "escrow_release" | "withdrawal" | "refund";

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  currency: string;
  paymentMethod: "razorpay" | "wallet" | "escrow";
  paymentId?: string;
  orderId?: string;
  status: "completed" | "pending" | "failed";
  description: string;
  task?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["deposit", "escrow_lock", "escrow_release", "withdrawal", "refund"],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentMethod: { type: String, enum: ["razorpay", "wallet", "escrow"], default: "razorpay" },
    paymentId: { type: String, default: "" },
    orderId: { type: String, default: "" },
    status: { type: String, enum: ["completed", "pending", "failed"], default: "completed" },
    description: { type: String, default: "" },
    task: { type: Schema.Types.ObjectId, ref: "Task" },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);
