import mongoose, { Document, Schema } from "mongoose";

export type ApplicationStatus = "pending" | "shortlisted" | "accepted" | "rejected";

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  coverLetter: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "accepted", "rejected"],
      default: "pending",
    },
    coverLetter: { type: String, default: "" },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>(
  "Application",
  applicationSchema
);
