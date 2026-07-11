import { Router } from "express";
import {
  register,
  login,
  googleAuth,
  getMe,
  updateMe,
  changePassword,
  getUserById,
  getFreelancers,
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.patch("/change-password", protect, changePassword);
// Public routes — no auth required
router.get("/users", getFreelancers);
router.get("/users/:id", getUserById);

export default router;
