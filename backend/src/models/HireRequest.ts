import mongoose, { Document, Schema } from "mongoose";

export type HireRequestStatus = "pending" | "accepted" | "rejected";

export interface IHireRequest extends Document {
  _id: mongoose.Types.ObjectId;
  employer: mongoose.Types.ObjectId;
  jobseeker: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  status: HireRequestStatus;
  salary: number;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const hireRequestSchema = new Schema<IHireRequest>(
  {
    employer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobseeker: { type: Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    salary: { type: Number, required: true, min: 0 },
    message: { type: String },
  },
  { timestamps: true }
);

export const HireRequest = mongoose.model<IHireRequest>(
  "HireRequest",
  hireRequestSchema
);
