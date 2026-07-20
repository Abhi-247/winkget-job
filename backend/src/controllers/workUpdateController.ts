import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { WorkUpdate, WorkRefType } from "../models/WorkUpdate";import { Application } from "../models/Application";
import { TaskClaim } from "../models/TaskClaim";
import { HireRequest } from "../models/HireRequest";
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
  userId: string
): Promise<boolean> {
  const oid = new mongoose.Types.ObjectId(refId);

  if (refType === "application") {
    const app = await Application.findById(oid).populate<{
      job: { employer: mongoose.Types.ObjectId };
    }>("job", "employer");
    if (!app) return false;
    const employerId = (app.job as unknown as { employer: mongoose.Types.ObjectId })?.employer?.toString();
    return (
      app.applicant.toString() === userId ||
      employerId === userId
    );
  }

  if (refType === "taskClaim") {
    const claim = await TaskClaim.findById(oid).populate<{
      task: { employer: mongoose.Types.ObjectId };
    }>("task", "employer");
    if (!claim) return false;
    const employerId = (claim.task as unknown as { employer: mongoose.Types.ObjectId })?.employer?.toString();
    return (
      claim.claimant.toString() === userId ||
      employerId === userId
    );
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

// ─── POST /api/v1/work-updates — jobseeker posts update ───────────────────────
export const createWorkUpdate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { refType, refId, points, note } = req.body;

    // Validate refType
    if (!VALID_REF_TYPES.includes(refType)) {
      res.status(400).json({
        success: false,
        message: `refType must be one of: ${VALID_REF_TYPES.join(", ")}`,
      });
      return;
    }

    // Validate points
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

    // Resolve employer and verify ownership
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

    // Notify employer via Socket.IO
    try {
      const { getIO } = require("../socket");
      const io = getIO();
      if (io) {
        io.to(`user:${employerId}`).emit("new_work_update", update.toObject());
      }
    } catch {
      // Non-fatal: socket not available in tests
    }

    res.status(201).json({ success: true, data: update });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ─── GET /api/v1/work-updates?refType=&refId= — timeline for one assignment ───
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

    const userId = req.user!._id.toString();
    const canRead = await verifyReadAccess(refType, refId, userId);
    if (!canRead) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const updates = await WorkUpdate.find({
      refType,
      refId: new mongoose.Types.ObjectId(refId),
    })
      .populate("jobseeker", "name avatar")
      .sort({ createdAt: 1 });

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
