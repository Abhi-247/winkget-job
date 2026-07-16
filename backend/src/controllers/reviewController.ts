import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Review } from "../models/Review";
import { User } from "../models/User";

export const createReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const reviewerId = req.user!._id;
    const { revieweeId, rating, comment, taskId, jobId } = req.body;

    if (!revieweeId || !rating || !comment) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    if (reviewerId.toString() === revieweeId.toString()) {
      res.status(400).json({ success: false, message: "You cannot review yourself" });
      return;
    }

    // Check if reviewee exists
    const reviewee = await User.findById(revieweeId);
    if (!reviewee) {
      res.status(404).json({ success: false, message: "Reviewee not found" });
      return;
    }

    // Check duplicate review
    const query: any = { reviewer: reviewerId, reviewee: revieweeId };
    if (taskId) query.task = taskId;
    if (jobId) query.job = jobId;

    if (taskId || jobId) {
      const existing = await Review.findOne(query);
      if (existing) {
        res.status(400).json({
          success: false,
          message: "You have already reviewed this user for this job/task",
        });
        return;
      }
    }

    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      comment,
      task: taskId || undefined,
      job: jobId || undefined,
    });

    // Recalculate average rating & update user document
    const allReviews = await Review.find({ reviewee: revieweeId });
    const count = allReviews.length;
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / count;

    await User.findByIdAndUpdate(revieweeId, {
      ratingAvg: Number(avg.toFixed(1)),
      ratingCount: count,
    });

    // Populate reviewer information before returning
    const populatedReview = await Review.findById(review._id).populate(
      "reviewer",
      "name company title"
    );

    res.status(201).json({ success: true, data: populatedReview });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "You have already reviewed this user for this job/task",
      });
      return;
    }
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const getUserReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "name company title")
      .sort({ createdAt: -1 });

    // Aggregate average rating
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    res.json({
      success: true,
      data: {
        reviews,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
