import { Router } from "express";
import {
  getStats,
  getAnalytics,
  getActivityLogs,
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
  toggleJobFeatured,
  toggleTaskFeatured,
  toggleUserFeatured,
  getVerificationRequests,
  updateUserVerification,
} from "../controllers/adminController";
import { protect } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, requireRole("admin"));

// Stats & recent
router.get("/stats",          getStats);
router.get("/analytics",      getAnalytics);
router.get("/activity-logs",  getActivityLogs);
router.get("/recent-signups", getRecentSignups);

// Users & Verifications
router.get("/users",                     getUsers);
router.get("/users/:id",                 getUserDetail);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.patch("/users/:id/featured",      toggleUserFeatured);
router.patch("/users/:id/verify",        updateUserVerification);
router.get("/verifications",             getVerificationRequests);
router.delete("/users/:id",              deleteUser);

// Jobs
router.get("/jobs",              getAllJobs);
router.patch("/jobs/:id/status", updateJobStatus);
router.patch("/jobs/:id/featured", toggleJobFeatured);
router.delete("/jobs/:id",       deleteJob);

// Tasks
router.get("/tasks",               getAllTasks);
router.patch("/tasks/:id/status",  updateTaskStatus);
router.patch("/tasks/:id/featured", toggleTaskFeatured);

// Applications
router.get("/applications",                getAllApplications);
router.patch("/applications/:id/status",   updateApplicationStatus);

// Hire Requests
router.get("/hire-requests",               getAllHireRequests);
router.patch("/hire-requests/:id/status",  updateHireRequestStatus);

export default router;
