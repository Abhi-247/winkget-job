import mongoose, { Document, Schema } from "mongoose";

export type WorkRefType = "application" | "taskClaim" | "hireRequest";

export interface IWorkStep {
  _id?: mongoose.Types.ObjectId;
  title: string;
  estimatedDays: number;
  percentage: number;
  completed: boolean;
  completedAt?: Date;
}

export interface IWorkUpdate extends Document {
  _id: mongoose.Types.ObjectId;
  refType: WorkRefType;
  refId: mongoose.Types.ObjectId;
  jobseeker: mongoose.Types.ObjectId;
  employer: mongoose.Types.ObjectId;
  steps: IWorkStep[];
  totalDays: number;
  overallProgress: number;
  planSubmitted: boolean;
  points?: string[];
  note?: string;
  seenByEmployer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workStepSchema = new Schema<IWorkStep>(
  {
    title: { type: String, required: true },
    estimatedDays: { type: Number, required: true, default: 1 },
    percentage: { type: Number, required: true, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

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
    steps: [workStepSchema],
    totalDays: { type: Number, default: 0 },
    overallProgress: { type: Number, default: 0 },
    planSubmitted: { type: Boolean, default: false },
    points: { type: [String], default: [] },
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
