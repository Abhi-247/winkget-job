import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { User } from "../models/User";
import { Job } from "../models/Job";
import { Application } from "../models/Application";

// GET /api/v1/admin/stats
export const getStats = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [totalUsers, totalJobs, totalEmployers, totalJobseekers, activeJobs] =
      await Promise.all([
        User.countDocuments(),
        Job.countDocuments(),
        User.countDocuments({ role: "employer" }),
        User.countDocuments({ role: "jobseeker" }),
        Job.countDocuments({ status: "open" }),
      ]);

    res.json({
      success: true,
      data: { totalUsers, totalJobs, totalEmployers, totalJobseekers, activeJobs },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/admin/users
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

// PATCH /api/v1/admin/users/:id/toggle-status
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

// GET /api/v1/admin/jobs
export const getAllJobs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const [jobs, total] = await Promise.all([
      Job.find()
        .populate("employer", "name company")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Job.countDocuments(),
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

// PATCH /api/v1/admin/jobs/:id/status
export const updateJobStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/admin/recent-signups
export const getRecentSignups = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find()
      .select("name email role createdAt isActive")
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
