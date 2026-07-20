import { Router } from "express";
import {
  getStats,
  getUsers,
  getUserDetail,
  toggleUserStatus,
  deleteUser,
  getAllJobs,
  updateJobStatus,
  deleteJob,
  getAllTasks,
  updateTaskStatus,
  getAllApplications,
  updateApplicationStatus,
  getAllHireRequests,
  updateHireRequestStatus,
  getRecentSignups,
} from "../controllers/adminController";
import { protect } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, requireRole("admin"));

// Stats & recent
router.get("/stats",          getStats);
router.get("/recent-signups", getRecentSignups);

// Users
router.get("/users",                     getUsers);
router.get("/users/:id",                 getUserDetail);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id",              deleteUser);

// Jobs
router.get("/jobs",              getAllJobs);
router.patch("/jobs/:id/status", updateJobStatus);
router.delete("/jobs/:id",       deleteJob);

// Tasks
router.get("/tasks",               getAllTasks);
router.patch("/tasks/:id/status",  updateTaskStatus);

// Applications
router.get("/applications",                getAllApplications);
router.patch("/applications/:id/status",   updateApplicationStatus);

// Hire Requests
router.get("/hire-requests",               getAllHireRequests);
router.patch("/hire-requests/:id/status",  updateHireRequestStatus);

export default router;
