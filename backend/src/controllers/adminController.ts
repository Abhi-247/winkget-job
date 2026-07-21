import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { User } from "../models/User";
import { Job } from "../models/Job";
import { Task } from "../models/Task";
import { Application } from "../models/Application";
import { HireRequest } from "../models/HireRequest";
import { TaskClaim } from "../models/TaskClaim";
import { ActivityLog, ActivityAction } from "../models/ActivityLog";

// ─── Helper: record an activity log entry ─────────────────────────────────────
async function log(
  req: AuthRequest,
  action: ActivityAction,
  targetId: string,
  targetName: string,
  targetType: "user" | "job" | "task" | "application" | "hireRequest",
  meta?: Record<string, unknown>
) {
  try {
    await ActivityLog.create({
      action,
      adminId:    req.user?._id,
      adminName:  req.user?.name || "Admin",
      targetId,
      targetName,
      targetType,
      meta,
    });
  } catch {
    // non-critical — never block the main response
  }
}

// ─── GET /api/v1/admin/stats ──────────────────────────────────────────────────
export const getStats = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      totalUsers, totalJobs, totalTasks, totalApplications,
      totalHireRequests, totalEmployers, totalJobseekers, activeJobs,
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
        totalUsers, totalJobs, totalTasks, totalApplications,
        totalHireRequests, totalEmployers, totalJobseekers, activeJobs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/analytics ─────────────────────────────────────────────
export const getAnalytics = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Monthly user signups for last 12 months
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Monthly job postings for last 12 months
    const jobGrowth = await Job.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Application status breakdown
    const appBreakdown = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Job status breakdown
    const jobBreakdown = await Job.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Task status breakdown
    const taskBreakdown = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Top 5 employers by job count
    const topEmployers = await Job.aggregate([
      { $group: { _id: "$employer", jobCount: { $sum: 1 } } },
      { $sort: { jobCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "employer",
        },
      },
      { $unwind: "$employer" },
      {
        $project: {
          name:     "$employer.name",
          company:  "$employer.company",
          jobCount: 1,
        },
      },
    ]);

    // Hire request status breakdown
    const hireBreakdown = await HireRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Build a full 12-month label array
    const months: { year: number; month: number; label: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year:  d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      });
    }

    const toMap = (arr: { _id: { year: number; month: number }; count: number }[]) =>
      Object.fromEntries(arr.map((x) => [`${x._id.year}-${x._id.month}`, x.count]));

    const userMap = toMap(userGrowth);
    const jobMap  = toMap(jobGrowth);

    const growthData = months.map((m) => ({
      label:    m.label,
      users:    userMap[`${m.year}-${m.month}`] || 0,
      jobs:     jobMap[`${m.year}-${m.month}`]  || 0,
    }));

    const toBreakdown = (arr: { _id: string; count: number }[]) =>
      Object.fromEntries(arr.map((x) => [x._id, x.count]));

    res.json({
      success: true,
      data: {
        growthData,
        appBreakdown:  toBreakdown(appBreakdown),
        jobBreakdown:  toBreakdown(jobBreakdown),
        taskBreakdown: toBreakdown(taskBreakdown),
        hireBreakdown: toBreakdown(hireBreakdown),
        topEmployers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/activity-logs ─────────────────────────────────────────
export const getActivityLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "30", action, targetType } = req.query;
    const query: Record<string, unknown> = {};
    if (action)     query.action     = action;
    if (targetType) query.targetType = targetType;

    const pageNum  = parseInt(page  as string);
    const limitNum = parseInt(limit as string);

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      ActivityLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/users ──────────────────────────────────────────────────
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const pageNum  = parseInt(page  as string);
    const limitNum = parseInt(limit as string);
    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum).limit(limitNum),
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

// ─── GET /api/v1/admin/users/:id ─────────────────────────────────────────────
export const getUserDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [user, jobs, tasks, applications, hireRequests, taskClaims] = await Promise.all([
      User.findById(id).select("-password"),
      Job.find({ employer: id }).sort({ createdAt: -1 }).limit(10),
      Task.find({ employer: id }).sort({ createdAt: -1 }).limit(10),
      Application.find({ applicant: id }).populate("job", "title salary").sort({ createdAt: -1 }).limit(10),
      HireRequest.find({ $or: [{ jobseeker: id }, { employer: id }] }).populate("job", "title").sort({ createdAt: -1 }).limit(10),
      TaskClaim.find({ claimant: id }).populate("task", "title budget").sort({ createdAt: -1 }).limit(10),
    ]);
    if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
    res.json({ success: true, data: { user, jobs, tasks, applications, hireRequests, taskClaims } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── PATCH /api/v1/admin/users/:id/toggle-status ─────────────────────────────
export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
    user.isActive = !user.isActive;
    await user.save();
    await log(req, user.isActive ? "user_activated" : "user_banned", user._id.toString(), user.name, "user");
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── DELETE /api/v1/admin/users/:id ──────────────────────────────────────────
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
    const userName = user.name;
    await Promise.all([
      User.findByIdAndDelete(id),
      Job.deleteMany({ employer: id }),
      Application.deleteMany({ applicant: id }),
      HireRequest.deleteMany({ $or: [{ employer: id }, { jobseeker: id }] }),
      TaskClaim.deleteMany({ claimant: id }),
      Task.deleteMany({ employer: id }),
    ]);
    await log(req, "user_deleted", id, userName, "user");
    res.json({ success: true, message: "User and all associated data deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/jobs ───────────────────────────────────────────────────
export const getAllJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20", status, search } = req.query;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) query.$text = { $search: search as string };
    const pageNum  = parseInt(page  as string);
    const limitNum = parseInt(limit as string);
    const [jobs, total] = await Promise.all([
      Job.find(query).populate("employer", "name company").sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum).limit(limitNum),
      Job.countDocuments(query),
    ]);
    res.json({ success: true, data: jobs, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── PATCH /api/v1/admin/jobs/:id/status ─────────────────────────────────────
export const updateJobStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const job = await Job.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!job) { res.status(404).json({ success: false, message: "Job not found" }); return; }
    const action: ActivityAction = status === "open" ? "job_reopened" : "job_closed";
    await log(req, action, job._id.toString(), job.title, "job");
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── DELETE /api/v1/admin/jobs/:id ───────────────────────────────────────────
export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) { res.status(404).json({ success: false, message: "Job not found" }); return; }
    await Application.deleteMany({ job: req.params.id });
    await log(req, "job_deleted", req.params.id, job.title, "job");
    res.json({ success: true, message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/tasks ──────────────────────────────────────────────────
export const getAllTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20", status } = req.query;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    const pageNum  = parseInt(page  as string);
    const limitNum = parseInt(limit as string);
    const [tasks, total] = await Promise.all([
      Task.find(query).populate("employer", "name company").sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum).limit(limitNum),
      Task.countDocuments(query),
    ]);
    res.json({ success: true, data: tasks, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── PATCH /api/v1/admin/tasks/:id/status ────────────────────────────────────
export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!task) { res.status(404).json({ success: false, message: "Task not found" }); return; }
    if (status === "closed") await log(req, "task_closed", task._id.toString(), task.title, "task");
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/applications ──────────────────────────────────────────
export const getAllApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20", status, jobId } = req.query;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (jobId)  query.job    = jobId;
    const pageNum  = parseInt(page  as string);
    const limitNum = parseInt(limit as string);
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate("job",       "title salary employer category")
        .populate("applicant", "name email title skills location avatar")
        .sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Application.countDocuments(query),
    ]);
    res.json({ success: true, data: applications, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── PATCH /api/v1/admin/applications/:id/status ─────────────────────────────
export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const app = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate("applicant", "name");
    if (!app) { res.status(404).json({ success: false, message: "Application not found" }); return; }
    const applicantName = typeof app.applicant === "object" ? (app.applicant as { name: string }).name : "Applicant";
    const action: ActivityAction =
      status === "accepted"    ? "application_accepted"    :
      status === "rejected"    ? "application_rejected"    :
      status === "shortlisted" ? "application_shortlisted" : "application_accepted";
    await log(req, action, app._id.toString(), applicantName, "application");
    res.json({ success: true, data: app });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/hire-requests ─────────────────────────────────────────
export const getAllHireRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20", status } = req.query;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    const pageNum  = parseInt(page  as string);
    const limitNum = parseInt(limit as string);
    const [hireRequests, total] = await Promise.all([
      HireRequest.find(query)
        .populate("employer",  "name company avatar")
        .populate("jobseeker", "name title avatar")
        .populate("job",       "title")
        .sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      HireRequest.countDocuments(query),
    ]);
    res.json({ success: true, data: hireRequests, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── PATCH /api/v1/admin/hire-requests/:id/status ────────────────────────────
export const updateHireRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const hr = await HireRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!hr) { res.status(404).json({ success: false, message: "Hire request not found" }); return; }
    if (status === "accepted" || status === "rejected") {
      const action: ActivityAction = status === "accepted" ? "hire_request_accepted" : "hire_request_rejected";
      await log(req, action, hr._id.toString(), hr.projectTitle || "Hire Request", "hireRequest");
    }
    res.json({ success: true, data: hr });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ─── GET /api/v1/admin/recent-signups ────────────────────────────────────────
export const getRecentSignups = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find()
      .select("name email role createdAt isActive avatar")
      .sort({ createdAt: -1 }).limit(8);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
