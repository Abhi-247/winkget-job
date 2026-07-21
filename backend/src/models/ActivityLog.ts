import mongoose, { Document, Schema } from "mongoose";

export type ActivityAction =
  | "user_deleted"
  | "user_banned"
  | "user_activated"
  | "job_deleted"
  | "job_closed"
  | "job_reopened"
  | "task_closed"
  | "application_accepted"
  | "application_rejected"
  | "application_shortlisted"
  | "hire_request_accepted"
  | "hire_request_rejected";

export interface IActivityLog extends Document {
  action: ActivityAction;
  adminId: mongoose.Types.ObjectId;
  adminName: string;
  targetId: string;
  targetName: string;
  targetType: "user" | "job" | "task" | "application" | "hireRequest";
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    action:     { type: String, required: true },
    adminId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    adminName:  { type: String, required: true },
    targetId:   { type: String, required: true },
    targetName: { type: String, required: true },
    targetType: { type: String, required: true },
    meta:       { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Keep logs for 90 days then auto-expire
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
