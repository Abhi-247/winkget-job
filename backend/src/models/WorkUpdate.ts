import mongoose, { Document, Schema } from "mongoose";

export type WorkRefType = "application" | "taskClaim" | "hireRequest";

export interface IWorkUpdate extends Document {
  _id: mongoose.Types.ObjectId;
  refType: WorkRefType;
  refId: mongoose.Types.ObjectId;
  jobseeker: mongoose.Types.ObjectId;
  employer: mongoose.Types.ObjectId;
  points: string[];
  note?: string;
  seenByEmployer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workUpdateSchema = new Schema<IWorkUpdate>(
  {
    refType: {
      type: String,
      enum: ["application", "taskClaim", "hireRequest"],
      required: true,
    },
    refId: { type: Schema.Types.ObjectId, required: true },
    jobseeker: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    points: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length >= 1 && arr.length <= 10,
        message: "Points must have between 1 and 10 items",
      },
    },
    note: { type: String },
    seenByEmployer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

workUpdateSchema.index({ refId: 1, createdAt: -1 });
workUpdateSchema.index({ employer: 1, seenByEmployer: 1 });

export const WorkUpdate = mongoose.model<IWorkUpdate>(
  "WorkUpdate",
  workUpdateSchema
);
