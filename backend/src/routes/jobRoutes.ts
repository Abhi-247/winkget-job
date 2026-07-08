import { Router } from "express";
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  createHireRequest,
  getMyHireRequests,
  updateHireRequestStatus,
  getEmployerHireRequests,
} from "../controllers/jobController";
import { protect } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();

// Public job routes
router.get("/", getJobs);
router.get("/employer/my-jobs", protect, requireRole("employer"), getMyJobs);
router.get("/:id", getJobById);

// Employer job CRUD
router.post("/", protect, requireRole("employer"), createJob);
router.patch("/:id", protect, requireRole("employer"), updateJob);
router.delete("/:id", protect, requireRole("employer"), deleteJob);

// Applications
router.post(
  "/applications",
  protect,
  requireRole("jobseeker"),
  applyToJob
);
router.get(
  "/applications/my",
  protect,
  requireRole("jobseeker"),
  getMyApplications
);
router.get(
  "/applications/job/:jobId",
  protect,
  requireRole("employer"),
  getJobApplications
);
router.patch(
  "/applications/:id/status",
  protect,
  requireRole("employer"),
  updateApplicationStatus
);

// Hire Requests
router.post(
  "/hire-requests",
  protect,
  requireRole("employer"),
  createHireRequest
);
router.get(
  "/hire-requests/my",
  protect,
  requireRole("jobseeker"),
  getMyHireRequests
);
router.get(
  "/hire-requests/employer",
  protect,
  requireRole("employer"),
  getEmployerHireRequests
);
router.patch(
  "/hire-requests/:id/status",
  protect,
  requireRole("jobseeker"),
  updateHireRequestStatus
);

export default router;
