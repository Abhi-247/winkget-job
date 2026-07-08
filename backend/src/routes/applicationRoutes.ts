import { Router } from "express";
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from "../controllers/jobController";
import { protect } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();

router.post("/", protect, requireRole("jobseeker"), applyToJob);
router.get("/my", protect, requireRole("jobseeker"), getMyApplications);
router.get(
  "/job/:jobId",
  protect,
  requireRole("employer"),
  getJobApplications
);
router.patch(
  "/:id/status",
  protect,
  requireRole("employer"),
  updateApplicationStatus
);

export default router;
