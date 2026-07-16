import { Router } from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
  claimTask,
  getMyClaims,
  getTaskClaims,
  updateClaimStatus,
} from "../controllers/taskController";
import { protect } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();

// Public task routes
router.get("/", getTasks);
router.get("/employer/my-tasks", protect, requireRole("employer"), getMyTasks);
router.get("/:id", getTaskById);

// Employer task CRUD
router.post("/", protect, requireRole("employer"), createTask);
router.patch("/:id", protect, requireRole("employer"), updateTask);
router.delete("/:id", protect, requireRole("employer"), deleteTask);

// Claims
router.post(
  "/claims",
  protect,
  requireRole("jobseeker"),
  claimTask
);
router.get(
  "/claims/my",
  protect,
  requireRole("jobseeker"),
  getMyClaims
);
router.get(
  "/claims/task/:taskId",
  protect,
  requireRole("employer"),
  getTaskClaims
);
router.patch(
  "/claims/:id/status",
  protect,
  requireRole("employer"),
  updateClaimStatus
);

export default router;
