import { Router } from "express";
import {
  getStats,
  getUsers,
  toggleUserStatus,
  getAllJobs,
  updateJobStatus,
  getRecentSignups,
} from "../controllers/adminController";
import { protect } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();

// All admin routes require admin role
router.use(protect, requireRole("admin"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.get("/jobs", getAllJobs);
router.patch("/jobs/:id/status", updateJobStatus);
router.get("/recent-signups", getRecentSignups);

export default router;
