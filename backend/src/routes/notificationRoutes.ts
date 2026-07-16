import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  getMyNotifications,
  markRead,
  markAllRead,
} from "../controllers/notificationController";

const router = Router();

router.get("/", protect, getMyNotifications);
router.patch("/read-all", protect, markAllRead);
router.patch("/:id/read", protect, markRead);

export default router;
