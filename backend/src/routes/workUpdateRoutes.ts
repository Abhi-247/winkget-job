import { Router } from "express";
import {
  createWorkUpdate,
  createOrUpdatePlan,
  toggleStepCompletion,
  getWorkUpdates,
  markAllSeen,
  getUnseenCount,
} from "../controllers/workUpdateController";
import { protect } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();

// All routes require authentication

// GET  /api/v1/work-updates/employer/unseen-count  — employer sidebar badge
router.get(
  "/employer/unseen-count",
  protect,
  requireRole("employer"),
  getUnseenCount
);

// PATCH /api/v1/work-updates/seen-all — employer marks all seen for a ref
router.patch("/seen-all", protect, requireRole("employer"), markAllSeen);

// POST  /api/v1/work-updates/plan — create or update execution plan
router.post("/plan", protect, requireRole("jobseeker"), createOrUpdatePlan);

// PATCH /api/v1/work-updates/toggle-step — toggle step completed tick
router.patch("/toggle-step", protect, requireRole("jobseeker"), toggleStepCompletion);

// POST  /api/v1/work-updates — jobseeker posts legacy update
router.post("/", protect, requireRole("jobseeker"), createWorkUpdate);

// GET   /api/v1/work-updates?refType=&refId= — fetch timeline
router.get("/", protect, getWorkUpdates);

export default router;
