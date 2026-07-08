import { Router } from "express";
import {
  register,
  login,
  googleAuth,
  getMe,
  updateMe,
  changePassword,
  getUserById,
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.patch("/change-password", protect, changePassword);
router.get("/users/:id", protect, getUserById);

export default router;
