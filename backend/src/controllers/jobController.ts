import { Request, Response } from "express";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { HireRequest } from "../models/HireRequest";
import { Task } from "../models/Task";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createSystemNotification } from "../utils/notification";

// GET /api/v1/jobs — public browse with search + filter
export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      location,
      salaryMin,
      salaryMax,
      salaryType,
      page = "1",
      limit = "12",
    } = req.query;

    const query: Record<string, unknown> = { status: "open" };

    if (search) {
      query.$text = { $search: search as string };
    }
    if (category) query.category = category;
    if (location) query.location = new RegExp(location as string, "i");
    if (salaryType) query.salaryType = salaryType;
    if (salaryMin || salaryMax) {
      query.salary = {};
      if (salaryMin) (query.salary as Record<string, unknown>).$gte = Number(salaryMin);
      if (salaryMax) (query.salary as Record<string, unknown>).$lte = Number(salaryMax);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("employer", "name company")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/jobs/:id — public job detail
export const getJobById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "employer",
      "name company avatar location"
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

// POST /api/v1/jobs — employer create job
export const createJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const jobData = {
      ...req.body,
      employer: req.user!._id,
      // Set legacy fields for backward compatibility
      salary: req.body.salaryMax || req.body.salary || 0,
      description: req.body.responsibilities || req.body.description || "",
    };
    
    const job = await Job.create(jobData);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// PATCH /api/v1/jobs/:id — employer update job
export const updateJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employer: req.user!._id,
    });
    if (!job) {
      res
        .status(404)
        .json({ success: false, message: "Job not found or not authorized" });
      return;
    }
    Object.assign(job, req.body);
    await job.save();
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// DELETE /api/v1/jobs/:id — employer delete job
export const deleteJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      employer: req.user!._id,
    });
    if (!job) {
      res
        .status(404)
        .json({ success: false, message: "Job not found or not authorized" });
      return;
    }
    res.json({ success: true, message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// POST /api/v1/jobs/by-ids — fetch specific jobs by array of IDs (for Saved Jobs)
export const getJobsByIds = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      res.json({ success: true, data: [] });
      return;
    }
    const jobs = await Job.find({ _id: { $in: ids } })
      .populate("employer", "name company")
      .lean();
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/jobs/employer/my-jobs — employer's own jobs (paginated)
export const getMyJobs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "10" } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find({ employer: req.user!._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments({ employer: req.user!._id }),
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// POST /api/v1/applications — jobseeker apply
export const applyToJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { jobId, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job || job.status !== "open") {
      res
        .status(404)
        .json({ success: false, message: "Job not found or closed" });
      return;
    }

    const existing = await Application.findOne({
      job: jobId,
      applicant: req.user!._id,
    });
    if (existing) {
      res
        .status(400)
        .json({ success: false, message: "Already applied to this job" });
      return;
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user!._id,
      coverLetter,
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    // Send notification to employer
    if (job.employer) {
      await createSystemNotification({
        recipient: job.employer,
        title: "New Job Application 📄",
        message: `${req.user!.name} has applied for your job post: "${job.title}".`,
        type: "new_claim",
        link: `/employer/applications?jobId=${job._id}`,
      });
    }

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/applications/my — jobseeker's own applications (paginated)
export const getMyApplications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "10" } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find({ applicant: req.user!._id })
        .populate("job", "title salary salaryType location employer status")
        .populate({
          path: "job",
          populate: { path: "employer", select: "name company" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Application.countDocuments({ applicant: req.user!._id }),
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/applications/job/:jobId — employer views applicants for a job (paginated)
export const getJobApplications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      employer: req.user!._id,
    });
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found or not authorized" });
      return;
    }

    const { page = "1", limit = "10" } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find({ job: req.params.jobId })
        .populate("applicant", "name email title skills location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Application.countDocuments({ job: req.params.jobId }),
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// PATCH /api/v1/applications/:id/status — employer accept/reject
export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate(
      "job"
    );

    if (!application) {
      res
        .status(404)
        .json({ success: false, message: "Application not found" });
      return;
    }

    const job = application.job as unknown as { employer: string };
    if (job.employer.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    application.status = status;
    await application.save();

    // Notify applicant
    const jobDetail = application.job as any;
    if (jobDetail) {
      await createSystemNotification({
        recipient: application.applicant,
        title: `Application Status: ${status.toUpperCase()} 💼`,
        message: `Your application for the job "${jobDetail.title}" is now "${status}".`,
        type: "claim_status",
        link: "/jobseeker/applications",
      });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// POST /api/v1/hire-requests — employer sends hire request
export const createHireRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { jobseekerId, jobId, hireType, salary, message, projectTitle, projectDescription, projectSkills } = req.body;

    // Validate based on hire type
    if (hireType === "job") {
      if (!jobId) {
        res.status(400).json({ success: false, message: "Job ID is required for job-based hiring" });
        return;
      }
    } else if (hireType === "freelance") {
      if (!projectTitle) {
        res.status(400).json({ success: false, message: "Project title is required for freelance hiring" });
        return;
      }
      if (!projectDescription) {
        res.status(400).json({ success: false, message: "Project description is required for freelance hiring" });
        return;
      }
    }

    let jobTitle = "a position";
    if (hireType === "job" && jobId) {
      const job = await Job.findById(jobId);
      jobTitle = job ? job.title : "a job position";
    } else if (hireType === "freelance") {
      jobTitle = projectTitle;
    }

    const hireRequest = await HireRequest.create({
      employer: req.user!._id,
      jobseeker: jobseekerId,
      job: hireType === "job" ? jobId : undefined,
      hireType: hireType || "job",
      salary,
      message,
      projectTitle: hireType === "freelance" ? projectTitle : undefined,
      projectDescription: hireType === "freelance" ? projectDescription : undefined,
      projectSkills: hireType === "freelance" ? projectSkills : undefined,
    });

    await createSystemNotification({
      recipient: jobseekerId,
      title: "New Direct Hire Offer ✉️",
      message: `An employer (${req.user!.company || req.user!.name}) offered you a contract for: "${jobTitle}".`,
      type: "hire_request",
      link: "/jobseeker/proposals",
    });

    res.status(201).json({ success: true, data: hireRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/hire-requests/my — jobseeker's hire requests (paginated)
export const getMyHireRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "10" } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      HireRequest.find({ jobseeker: req.user!._id })
        .populate("employer", "name company")
        .populate("job", "title salary location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      HireRequest.countDocuments({ jobseeker: req.user!._id }),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// PATCH /api/v1/hire-requests/:id/status — jobseeker responds to hire request
export const updateHireRequestStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const request = await HireRequest.findOne({
      _id: req.params.id,
      jobseeker: req.user!._id,
    });

    if (!request) {
      res
        .status(404)
        .json({ success: false, message: "Hire request not found" });
      return;
    }

    request.status = status;
    await request.save();

    await createSystemNotification({
      recipient: request.employer,
      title: `Hire Offer Update: ${status.toUpperCase()} 🤝`,
      message: `The freelancer has ${status} your direct hire offer.`,
      type: "claim_status",
      link: "/employer/dashboard",
    });

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/hire-requests/employer — employer's sent hire requests
export const getEmployerHireRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const requests = await HireRequest.find({ employer: req.user!._id })
      .populate("jobseeker", "name email title skills avatar")
      .populate("job", "title salary location")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// POST /api/v1/hire-requests/:id/withdraw — employer withdraws a hire request
export const withdrawHireRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const request = await HireRequest.findOne({
      _id: req.params.id,
      employer: req.user!._id,
    });

    if (!request) {
      res
        .status(404)
        .json({ success: false, message: "Hire request not found" });
      return;
    }

    if (request.status !== "pending") {
      res
        .status(400)
        .json({ success: false, message: "Can only withdraw pending requests" });
      return;
    }

    request.status = "rejected";
    await request.save();

    await createSystemNotification({
      recipient: request.jobseeker,
      title: "Hire Offer Withdrawn 🤝",
      message: "The employer has withdrawn their direct hire offer.",
      type: "claim_status",
      link: "/jobseeker/proposals",
    });

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/jobs/employer/stats — employer dashboard statistics
export const getEmployerStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [totalPosted, jobs, acceptedApps, activeTasks] = await Promise.all([
      Job.countDocuments({ employer: req.user!._id }),
      Job.find({ employer: req.user!._id }).select("applicantCount status"),
      Application.find({ status: "accepted" }).populate("job"),
      Task.countDocuments({ employer: req.user!._id, status: "open" }),
    ]);

    const totalReceived = jobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0);
    const acceptedApplicants = acceptedApps.filter(
      (app) => (app.job as any)?.employer?.toString() === req.user!._id.toString()
    ).length;
    const activeContracts = jobs.filter((job) => job.status === "open").length;

    res.json({
      success: true,
      data: {
        totalPosted,
        totalReceived,
        acceptedApplicants,
        activeContracts,
        activeTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/applications/jobseeker/stats — jobseeker dashboard statistics
export const getJobseekerStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [applications, hireRequests] = await Promise.all([
      Application.find({ applicant: req.user!._id }).populate("job"),
      HireRequest.find({ jobseeker: req.user!._id }),
    ]);

    const activeJobs = applications.filter((app) => app.status === "accepted").length;
    const pendingApplications = applications.filter((app) => app.status === "pending").length;
    const pendingHireRequests = hireRequests.filter((req) => req.status === "pending").length;
    const completedJobs = applications.filter((app) => {
      const job = app.job as any;
      return job && job.status === "closed";
    }).length;

    // Calculate earnings from accepted applications (using job salary)
    const earnings = applications
      .filter((app) => app.status === "accepted")
      .reduce((sum, app) => {
        const job = app.job as any;
        return sum + (job?.salary || 0);
      }, 0);

    res.json({
      success: true,
      data: {
        activeJobs,
        earnings,
        pendingApplications,
        hireRequests: pendingHireRequests,
        completedJobs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
