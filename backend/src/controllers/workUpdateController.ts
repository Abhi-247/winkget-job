import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { WorkUpdate, WorkRefType, IWorkStep } from "../models/WorkUpdate";
import { Application } from "../models/Application";
import { TaskClaim } from "../models/TaskClaim";
import { HireRequest } from "../models/HireRequest";
import { Job } from "../models/Job";
import { Task } from "../models/Task";
import mongoose from "mongoose";

const VALID_REF_TYPES: WorkRefType[] = ["application", "taskClaim", "hireRequest"];

// ─── Helper: resolve employer from refType + refId ─────────────────────────────
async function resolveEmployer(
  refType: WorkRefType,
  refId: string,
  jobseekerId: string
): Promise<{ employerId: string | null; error?: string }> {
  const oid = new mongoose.Types.ObjectId(refId);

  if (refType === "application") {
    const app = await Application.findOne({
      _id: oid,
      applicant: jobseekerId,
      status: "accepted",
    }).populate<{ job: { employer: mongoose.Types.ObjectId } }>("job", "employer");

    if (!app) return { employerId: null, error: "Accepted application not found or not yours" };

    const job = app.job as unknown as { employer: mongoose.Types.ObjectId };
    if (!job?.employer) return { employerId: null, error: "Job employer not found" };

    return { employerId: job.employer.toString() };
  }

  if (refType === "taskClaim") {
    const claim = await TaskClaim.findOne({
      _id: oid,
      claimant: jobseekerId,
      status: "approved",
    }).populate<{ task: { employer: mongoose.Types.ObjectId } }>("task", "employer");

    if (!claim) return { employerId: null, error: "Approved task claim not found or not yours" };

    const task = claim.task as unknown as { employer: mongoose.Types.ObjectId };
    if (!task?.employer) return { employerId: null, error: "Task employer not found" };

    return { employerId: task.employer.toString() };
  }

  if (refType === "hireRequest") {
    const hr = await HireRequest.findOne({
      _id: oid,
      jobseeker: jobseekerId,
      status: "accepted",
    });

    if (!hr) return { employerId: null, error: "Accepted hire request not found or not yours" };

    return { employerId: hr.employer.toString() };
  }

  return { employerId: null, error: "Invalid refType" };
}

// ─── Helper: verify caller can read a ref (is jobseeker who owns it OR employer) ──
async function verifyReadAccess(
  refType: WorkRefType,
  refId: string,
  user: { _id: string; role: string }
): Promise<boolean> {
  if (user.role === "admin") return true;

  const userId = user._id.toString();
  const oid = new mongoose.Types.ObjectId(refId);

  if (refType === "application") {
    const app = await Application.findById(oid).populate<{
      job: { employer: mongoose.Types.ObjectId };
    }>("job", "employer");
    if (app) {
      const employerId = (app.job as unknown as { employer: mongoose.Types.ObjectId })?.employer?.toString();
      if (app.applicant.toString() === userId || employerId === userId) return true;
    }

    // Check if refId is a Job ID
    const job = await Job.findById(oid);
    if (job && job.employer.toString() === userId) return true;

    return false;
  }

  if (refType === "taskClaim") {
    const claim = await TaskClaim.findById(oid).populate<{
      task: { employer: mongoose.Types.ObjectId };
    }>("task", "employer");
    if (claim) {
      const employerId = (claim.task as unknown as { employer: mongoose.Types.ObjectId })?.employer?.toString();
      if (claim.claimant.toString() === userId || employerId === userId) return true;
    }

    // Check if refId is a Task ID
    const task = await Task.findById(oid);
    if (task && task.employer.toString() === userId) return true;

    return false;
  }

  if (refType === "hireRequest") {
    const hr = await HireRequest.findById(oid);
    if (!hr) return false;
    return (
      hr.jobseeker.toString() === userId ||
      hr.employer.toString() === userId
    );
  }

  return false;
}

// ─── POST /api/v1/work-updates/plan — Jobseeker creates/updates execution plan ─
export const createOrUpdatePlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { refType, refId, steps } = req.body;

    if (!VALID_REF_TYPES.includes(refType)) {
      res.status(400).json({
        success: false,
        message: `refType must be one of: ${VALID_REF_TYPES.join(", ")}`,
      });
      return;
    }

    if (!Array.isArray(steps) || steps.length < 1) {
      res.status(400).json({
        success: false,
        message: "At least 1 step is required for the execution plan",
      });
      return;
    }

    const jobseekerId = req.user!._id.toString();
    const { employerId, error } = await resolveEmployer(refType, refId, jobseekerId);
    if (!employerId) {
      res.status(403).json({ success: false, message: error || "Access denied" });
      return;
    }

    // Auto-split logic & percentage validation
    let totalAllocatedPercent = 0;
    let unallocatedCount = 0;

    steps.forEach((s: any) => {
      const p = Number(s.percentage) || 0;
      if (p > 0) {
        totalAllocatedPercent += p;
      } else {
        unallocatedCount++;
      }
    });

    const remainingPercent = Math.max(0, 100 - totalAllocatedPercent);
    const splitPercentPerUnallocated =
      unallocatedCount > 0 ? Number((remainingPercent / unallocatedCount).toFixed(2)) : 0;

    let totalDays = 0;
    const processedSteps: Partial<IWorkStep>[] = steps.map((s: any, idx: number) => {
      const days = Math.max(1, Math.round(Number(s.estimatedDays) || 1));
      totalDays += days;

      let pct = Number(s.percentage) || 0;
      if (pct <= 0 && unallocatedCount > 0) {
        pct = splitPercentPerUnallocated;
        // Fix rounding on last item to hit exactly 100
        if (idx === steps.length - 1) {
          const currentSum = processedSteps.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
          pct = Number((100 - currentSum).toFixed(2));
        }
      }

      return {
        title: String(s.title || "").trim() || `Step ${idx + 1}`,
        estimatedDays: days,
        percentage: pct,
        completed: Boolean(s.completed),
        completedAt: s.completed ? new Date() : undefined,
      };
    });

    // Final total check
    const finalPercentSum = processedSteps.reduce((acc, s) => acc + (s.percentage || 0), 0);
    if (Math.abs(finalPercentSum - 100) > 1.5) {
      res.status(400).json({
        success: false,
        message: `Total percentage must equal 100%. Current sum: ${finalPercentSum}%`,
      });
      return;
    }

    // Find existing plan or create new
    let update = await WorkUpdate.findOne({
      refType,
      refId: new mongoose.Types.ObjectId(refId),
    });

    const overallProgress = processedSteps.reduce(
      (acc, s) => acc + (s.completed ? s.percentage || 0 : 0),
      0
    );

    if (update) {
      update.steps = processedSteps as any;
      update.totalDays = totalDays;
      update.overallProgress = Math.min(100, Math.round(overallProgress));
      update.planSubmitted = true;
      update.seenByEmployer = false;
      await update.save();
    } else {
      update = await WorkUpdate.create({
        refType,
        refId: new mongoose.Types.ObjectId(refId),
        jobseeker: req.user!._id,
        employer: new mongoose.Types.ObjectId(employerId),
        steps: processedSteps,
        totalDays,
        overallProgress: Math.min(100, Math.round(overallProgress)),
        planSubmitted: true,
        seenByEmployer: false,
      });
    }

    // Socket notification
    try {
      const { getIO } = require("../socket");
      const io = getIO();
      if (io) {
        io.to(`user:${employerId}`).emit("new_work_update", update.toObject());
      }
    } catch {
      // ignore socket errors
    }

    res.status(200).json({ success: true, data: update });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ─── PATCH /api/v1/work-updates/toggle-step — Jobseeker ticks step completion ─
export const toggleStepCompletion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { refType, refId, stepId } = req.body;

    if (!refId || !stepId) {
      res.status(400).json({ success: false, message: "refId and stepId are required" });
      return;
    }

    const update = await WorkUpdate.findOne({
      refType,
      refId: new mongoose.Types.ObjectId(refId),
      jobseeker: req.user!._id,
    });

    if (!update) {
      res.status(404).json({ success: false, message: "Work execution plan not found" });
      return;
    }

    const step = (update.steps as any).id(stepId);
    if (!step) {
      res.status(404).json({ success: false, message: "Step not found in plan" });
      return;
    }

    step.completed = !step.completed;
    step.completedAt = step.completed ? new Date() : undefined;

    // Recalculate progress
    const progress = update.steps.reduce(
      (acc, s) => acc + (s.completed ? s.percentage || 0 : 0),
      0
    );

    update.overallProgress = Math.min(100, Math.round(progress));
    update.seenByEmployer = false;
    await update.save();

    // Socket notification to employer
    try {
      const { getIO } = require("../socket");
      const io = getIO();
      if (io) {
        io.to(`user:${update.employer.toString()}`).emit("new_work_update", update.toObject());
      }
    } catch {
      // ignore
    }

    res.json({ success: true, data: update });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ─── POST /api/v1/work-updates — Legacy bullet points update ─────────────────
export const createWorkUpdate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { refType, refId, points, note } = req.body;

    if (!VALID_REF_TYPES.includes(refType)) {
      res.status(400).json({
        success: false,
        message: `refType must be one of: ${VALID_REF_TYPES.join(", ")}`,
      });
      return;
    }

    if (!Array.isArray(points) || points.length < 1 || points.length > 10) {
      res.status(400).json({
        success: false,
        message: "points must be an array of 1–10 strings",
      });
      return;
    }

    const cleanedPoints = points.map((p: string) => p.trim()).filter(Boolean);
    if (cleanedPoints.length === 0) {
      res.status(400).json({ success: false, message: "At least one non-empty point is required" });
      return;
    }

    const jobseekerId = req.user!._id.toString();
    const { employerId, error } = await resolveEmployer(refType, refId, jobseekerId);
    if (!employerId) {
      res.status(403).json({ success: false, message: error || "Access denied" });
      return;
    }

    const update = await WorkUpdate.create({
      refType,
      refId: new mongoose.Types.ObjectId(refId),
      jobseeker: req.user!._id,
      employer: new mongoose.Types.ObjectId(employerId),
      points: cleanedPoints,
      note: note?.trim() || undefined,
    });

    try {
      const { getIO } = require("../socket");
      const io = getIO();
      if (io) {
        io.to(`user:${employerId}`).emit("new_work_update", update.toObject());
      }
    } catch {
      // ignore
    }

    res.status(201).json({ success: true, data: update });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ─── GET /api/v1/work-updates?refType=&refId= — fetch plan & timeline ────────
export const getWorkUpdates = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { refType, refId } = req.query as { refType: WorkRefType; refId: string };

    if (!VALID_REF_TYPES.includes(refType)) {
      res.status(400).json({ success: false, message: "Invalid refType" });
      return;
    }

    const canRead = await verifyReadAccess(refType, refId, {
      _id: req.user!._id.toString(),
      role: req.user!.role,
    });
    if (!canRead) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const oid = new mongoose.Types.ObjectId(refId);
    let updates = await WorkUpdate.find({
      refType,
      refId: oid,
    })
      .populate("jobseeker", "name avatar")
      .sort({ createdAt: 1 });

    // Fallback: If refId was a Job ID or Task ID instead of Application or TaskClaim ID
    if (updates.length === 0) {
      if (refType === "application") {
        const app = await Application.findOne({
          job: oid,
          status: { $in: ["accepted", "completed"] },
        });
        if (app) {
          updates = await WorkUpdate.find({ refType: "application", refId: app._id })
            .populate("jobseeker", "name avatar")
            .sort({ createdAt: 1 });
        }
      } else if (refType === "taskClaim") {
        const claim = await TaskClaim.findOne({
          task: oid,
          status: { $in: ["approved", "completed"] },
        });
        if (claim) {
          updates = await WorkUpdate.find({ refType: "taskClaim", refId: claim._id })
            .populate("jobseeker", "name avatar")
            .sort({ createdAt: 1 });
        }
      }
    }

    res.json({ success: true, data: updates });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ─── PATCH /api/v1/work-updates/seen-all — employer marks all as seen ─────────
export const markAllSeen = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { refId } = req.body;

    if (!refId) {
      res.status(400).json({ success: false, message: "refId is required" });
      return;
    }

    await WorkUpdate.updateMany(
      {
        refId: new mongoose.Types.ObjectId(refId),
        employer: req.user!._id,
        seenByEmployer: false,
      },
      { seenByEmployer: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ─── GET /api/v1/work-updates/employer/unseen-count — sidebar badge count ─────
export const getUnseenCount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const count = await WorkUpdate.countDocuments({
      employer: req.user!._id,
      seenByEmployer: false,
    });

    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};
