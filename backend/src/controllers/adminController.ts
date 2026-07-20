import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { User } from "../models/User";
import { Job } from "../models/Job";
import { Task } from "../models/Task";
import { Application } from "../models/Application";
import { HireRequest } from "../models/HireRequest";
import { TaskClaim } from "../models/TaskClaim";

// ─── GET /api/v1/admin/stats ──────────────────────────────────────────────────
export const getStats = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      totalUsers,
      totalJobs,
      totalTasks,
      totalApplications,
      totalHireRequests,
      totalEmployers,
      totalJobseekers,
      activeJobs,
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Task.countDocuments(),
      Application.countDocuments(),
      HireRequest.countDocuments(),
      User.countDocuments({ role: "employer" }),
      User.countDocuments({ role: "jobseeker" }),
      Job.countDocuments({ status: "open" }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        totalTasks,
        totalApplications,
        totalHireRequests,
        totalEmployers,
        totalJobseekers,
        activeJobs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/users ──────────────────────────────────────────────────
export const getUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "20", role, search } = req.query;
    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search as string, "i") },
        { email: new RegExp(search as string, "i") },
      ];
    }
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      User.countDocuments(query),
    ]);
    res.json({
      success: true,
      data: users,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/users/:id ──────────────────────────────────────────────
export const getUserDetail = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const [user, jobs, applications, hireRequests, taskClaims] = await Promise.all([
      User.findById(id).select("-password"),
      Job.find({ employer: id }).sort({ createdAt: -1 }).limit(10),
      Application.find({ applicant: id })
        .populate("job", "title salary")
        .sort({ createdAt: -1 })
        .limit(10),
      HireRequest.find({ $or: [{ jobseeker: id }, { employer: id }] })
        .populate("job", "title")
        .sort({ createdAt: -1 })
        .limit(10),
      TaskClaim.find({ claimant: id })
        .populate("task", "title budget")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      data: { user, jobs, applications, hireRequests, taskClaims },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── PATCH /api/v1/admin/users/:id/toggle-status ─────────────────────────────
export const toggleUserStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── DELETE /api/v1/admin/users/:id ──────────────────────────────────────────
export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    // Cascade delete all user data
    await Promise.all([
      User.findByIdAndDelete(id),
      Job.deleteMany({ employer: id }),
      Application.deleteMany({ applicant: id }),
      HireRequest.deleteMany({ $or: [{ employer: id }, { jobseeker: id }] }),
      TaskClaim.deleteMany({ claimant: id }),
      Task.deleteMany({ employer: id }),
    ]);
    res.json({ success: true, message: "User and all associated data deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/jobs ───────────────────────────────────────────────────
export const getAllJobs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "20", status, search } = req.query;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) query.$text = { $search: search as string };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("employer", "name company")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Job.countDocuments(query),
    ]);
    res.json({
      success: true,
      data: jobs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── PATCH /api/v1/admin/jobs/:id/status ─────────────────────────────────────
export const updateJobStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const job = await Job.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── DELETE /api/v1/admin/jobs/:id ───────────────────────────────────────────
export const deleteJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }
    // Cascade: remove applications for this job
    await Application.deleteMany({ job: req.params.id });
    res.json({ success: true, message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/tasks ──────────────────────────────────────────────────
export const getAllTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "20", status } = req.query;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate("employer", "name company")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Task.countDocuments(query),
    ]);
    res.json({
      success: true,
      data: tasks,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── PATCH /api/v1/admin/tasks/:id/status ────────────────────────────────────
export const updateTaskStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!task) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/applications ──────────────────────────────────────────
export const getAllApplications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "20", status, jobId } = req.query;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (jobId) query.job = jobId;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate("job", "title salary employer category")
        .populate("applicant", "name email title skills location avatar")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Application.countDocuments(query),
    ]);
    res.json({
      success: true,
      data: applications,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── PATCH /api/v1/admin/applications/:id/status ─────────────────────────────
export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!app) {
      res.status(404).json({ success: false, message: "Application not found" });
      return;
    }
    res.json({ success: true, data: app });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/hire-requests ─────────────────────────────────────────
export const getAllHireRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "20", status } = req.query;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const [hireRequests, total] = await Promise.all([
      HireRequest.find(query)
        .populate("employer", "name company avatar")
        .populate("jobseeker", "name title avatar")
        .populate("job", "title")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      HireRequest.countDocuments(query),
    ]);
    res.json({
      success: true,
      data: hireRequests,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── PATCH /api/v1/admin/hire-requests/:id/status ────────────────────────────
export const updateHireRequestStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const hr = await HireRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!hr) {
      res.status(404).json({ success: false, message: "Hire request not found" });
      return;
    }
    res.json({ success: true, data: hr });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/recent-signups ────────────────────────────────────────
export const getRecentSignups = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find()
      .select("name email role createdAt isActive avatar")
      .sort({ createdAt: -1 })
      .limit(8);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
