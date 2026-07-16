import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  task?: mongoose.Types.ObjectId;
  job?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews from the same reviewer for a given task/job
reviewSchema.index({ reviewer: 1, reviewee: 1, task: 1 }, { unique: true, sparse: true });
reviewSchema.index({ reviewer: 1, reviewee: 1, job: 1 }, { unique: true, sparse: true });

export const Review = mongoose.model<IReview>("Review", reviewSchema);
