import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { createReview, getUserReviews } from "../controllers/reviewController";

const router = Router();

router.post("/", protect, createReview);
router.get("/user/:userId", getUserReviews);

export default router;
