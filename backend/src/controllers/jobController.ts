import { Request, Response } from "express";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { HireRequest } from "../models/HireRequest";
import { AuthRequest } from "../middlewares/authMiddleware";

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
        .populate("employer", "name company avatar")
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

// GET /api/v1/jobs/employer/my-jobs — employer's own jobs
export const getMyJobs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const jobs = await Job.find({ employer: req.user!._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: jobs });
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

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/applications/my — jobseeker's own applications
export const getMyApplications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const applications = await Application.find({ applicant: req.user!._id })
      .populate("job", "title salary salaryType location employer status")
      .populate({
        path: "job",
        populate: { path: "employer", select: "name company" },
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/applications/job/:jobId — employer views applicants for a job
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
      res
        .status(404)
        .json({ success: false, message: "Job not found or not authorized" });
      return;
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("applicant", "name email avatar title skills location")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: applications });
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
    const { jobseekerId, jobId, salary, message } = req.body;

    const hireRequest = await HireRequest.create({
      employer: req.user!._id,
      jobseeker: jobseekerId,
      job: jobId,
      salary,
      message,
    });

    res.status(201).json({ success: true, data: hireRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/hire-requests/my — jobseeker's hire requests
export const getMyHireRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const requests = await HireRequest.find({ jobseeker: req.user!._id })
      .populate("employer", "name company avatar")
      .populate("job", "title salary location")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
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
      .populate("jobseeker", "name email avatar title skills")
      .populate("job", "title salary location")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
