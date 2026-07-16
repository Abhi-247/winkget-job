import mongoose, { Document, Schema } from "mongoose";

export type TaskStatus = "open" | "assigned" | "completed" | "closed";
export type TaskType =
  | "quick-fix"
  | "data-entry"
  | "content-writing"
  | "design"
  | "testing"
  | "research"
  | "other";

export type TaskCategory =
  | "Web Development"
  | "Mobile Development"
  | "Design"
  | "Data Science"
  | "Marketing"
  | "Writing"
  | "Video & Animation"
  | "Finance"
  | "Engineering"
  | "Sales"
  | "Customer Service"
  | "Other";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  employer: mongoose.Types.ObjectId;
  description: string;
  category: TaskCategory;
  taskType: TaskType;
  skills: string[];
  budget: number;
  deadline: Date;
  location: string;
  deliverables: string;
  status: TaskStatus;
  claimCount: number;
  maxClaims: number;
  companyName: string;
  companyAddress: string;
  postedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    employer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Web Development",
        "Mobile Development",
        "Design",
        "Data Science",
        "Marketing",
        "Writing",
        "Video & Animation",
        "Finance",
        "Engineering",
        "Sales",
        "Customer Service",
        "Other",
      ],
      default: "Other",
    },
    taskType: {
      type: String,
      enum: [
        "quick-fix",
        "data-entry",
        "content-writing",
        "design",
        "testing",
        "research",
        "other",
      ],
      default: "other",
    },
    skills: { type: [String], default: [] },
    budget: { type: Number, required: true, min: 0 },
    deadline: { type: Date, required: true },
    location: { type: String, default: "Remote" },
    deliverables: { type: String, default: "" },
    status: {
      type: String,
      enum: ["open", "assigned", "completed", "closed"],
      default: "open",
    },
    claimCount: { type: Number, default: 0 },
    maxClaims: { type: Number, default: 1, min: 1 },
    companyName: { type: String, required: true },
    companyAddress: { type: String, default: "" },
    postedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

taskSchema.index({ title: "text", description: "text", skills: "text" });
taskSchema.index({ employer: 1, status: 1 });
taskSchema.index({ category: 1, status: 1 });

export const Task = mongoose.model<ITask>("Task", taskSchema);
