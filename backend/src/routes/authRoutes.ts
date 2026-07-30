import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  getUserById,
  getFreelancers,
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import { authLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.patch("/change-password", protect, changePassword);
// Public routes — no auth required
router.get("/users", getFreelancers);
router.get("/users/:id", getUserById);

export default router;
