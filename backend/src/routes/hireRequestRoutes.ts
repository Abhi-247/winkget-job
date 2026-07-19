import { Router } from "express";
import {
  createHireRequest,
  getMyHireRequests,
  updateHireRequestStatus,
  getEmployerHireRequests,
  withdrawHireRequest,
} from "../controllers/jobController";
import { protect } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();

router.post("/", protect, requireRole("employer"), createHireRequest);
router.get("/my", protect, requireRole("jobseeker"), getMyHireRequests);
router.get("/employer", protect, requireRole("employer"), getEmployerHireRequests);
router.patch("/:id/status", protect, requireRole("jobseeker"), updateHireRequestStatus);
router.post("/:id/withdraw", protect, requireRole("employer"), withdrawHireRequest);

export default router;
