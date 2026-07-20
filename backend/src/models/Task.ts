import mongoose, { Document, Schema } from "mongoose";

export type TaskStatus = "open" | "assigned" | "completed" | "closed";
export type TaskType =
  | "quick-fix"
  | "data-entry"
  | "content-writing"
  | "design"
  | "testing"
  | "research"
  | "development"
  | "marketing"
  | "video-editing"
  | "translation"
  | "customer-support"
  | "finance-accounting"
  | "legal"
  | "social-media"
  | "photo-editing"
  | "virtual-assistant"
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
  startDate?: Date;
  endDate?: Date;
  deadline?: Date; // kept for backward compat — mirrors endDate
  location: string;
  deliverables: string;
  status: TaskStatus;
  claimCount: number;
  maxClaims: number;
  companyName: string;
  companyAddress: string;
  postedBy: string;
  durationType?: "date" | "hours";
  durationHours?: number;
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
        "development",
        "marketing",
        "video-editing",
        "translation",
        "customer-support",
        "finance-accounting",
        "legal",
        "social-media",
        "photo-editing",
        "virtual-assistant",
        "other",
      ],
      default: "other",
    },
    skills: { type: [String], default: [] },
    budget: { type: Number, required: true, min: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    deadline: { type: Date }, // kept for backward compat — mirrors endDate on save
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
    durationType: { type: String, enum: ["date", "hours"], default: "date" },
    durationHours: { type: Number },
  },
  { timestamps: true }
);

taskSchema.index({ title: "text", description: "text", skills: "text" });
taskSchema.index({ employer: 1, status: 1 });
taskSchema.index({ category: 1, status: 1 });

// Keep legacy `deadline` field in sync with endDate
taskSchema.pre("save", function (next) {
  if (this.endDate) this.deadline = this.endDate;
  next();
});

export const Task = mongoose.model<ITask>("Task", taskSchema);
