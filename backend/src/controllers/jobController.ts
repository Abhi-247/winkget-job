import { Request, Response } from "express";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { HireRequest } from "../models/HireRequest";
import { Task } from "../models/Task";
import { Escrow } from "../models/Escrow";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createSystemNotification } from "../utils/notification";

// Helper to escape regex special characters
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/v1/jobs — public browse with advanced multi-field search + database filtering
export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchStr = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const categoryStr = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const locationStr = typeof req.query.location === "string" ? req.query.location.trim() : "";
    const salaryMinStr = typeof req.query.salaryMin === "string" ? req.query.salaryMin.trim() : "";
    const salaryMaxStr = typeof req.query.salaryMax === "string" ? req.query.salaryMax.trim() : "";
    const salaryTypeVal = req.query.salaryType;
    const experienceLevelVal = req.query.experienceLevel;
    const jobTypeVal = req.query.jobType;
    const employmentTypeVal = req.query.employmentType;
    const workShiftStr = typeof req.query.workShift === "string" ? req.query.workShift.trim() : "";
    const sortStr = typeof req.query.sort === "string" ? req.query.sort.trim() : "latest";
    const pageStr = typeof req.query.page === "string" ? req.query.page : "1";
    const limitStr = typeof req.query.limit === "string" ? req.query.limit : "12";

    const query: Record<string, unknown> = { status: "open" };
    const andConditions: Record<string, unknown>[] = [];

    // 1. Multi-field Tokenized Search Algorithm
    if (searchStr) {
      const tokens = searchStr.split(/\s+/).filter(Boolean);
      tokens.forEach((token) => {
        const regex = new RegExp(escapeRegex(token), "i");
        andConditions.push({
          $or: [
            { title: regex },
            { description: regex },
            { category: regex },
            { skills: { $elemMatch: { $regex: escapeRegex(token), $options: "i" } } },
            { companyName: regex },
            { location: regex },
            { department: regex },
            { jobRole: regex },
          ],
        });
      });
    }

    // 2. Category Keyword Aliases & Matching
    if (categoryStr) {
      const CATEGORY_KEYWORDS: Record<string, string[]> = {
        "web development":    ["web", "developer", "frontend", "backend", "fullstack", "full-stack", "react", "next", "vue", "angular", "node", "express", "javascript", "typescript", "html", "css", "software", "engineer", "api", "saas"],
        "design":             ["design", "ui", "ux", "figma", "adobe", "sketch", "branding", "graphic", "visual", "motion", "illustrator", "photoshop"],
        "marketing":          ["marketing", "seo", "sem", "digital", "social media", "content", "ppc", "ads", "email", "campaign", "growth", "analytics"],
        "writing":            ["writing", "copywriting", "content", "blog", "article", "editor", "proofreading", "journalist"],
        "data science":       ["data", "science", "analytics", "machine learning", "ml", "ai", "python", "statistics", "big data", "tensorflow", "nlp"],
        "mobile development": ["mobile", "ios", "android", "flutter", "react native", "swift", "kotlin", "xamarin"],
        "video & animation":  ["video", "animation", "motion", "editing", "after effects", "premiere"],
        "finance":            ["finance", "accounting", "bookkeeping", "tax", "audit", "tally", "excel"],
        "customer service":   ["customer service", "support", "helpdesk", "chat", "virtual assistant"],
      };

      const catKey = categoryStr.toLowerCase();
      const aliases = CATEGORY_KEYWORDS[catKey] || [catKey];
      const regexes = aliases.map((kw) => new RegExp(escapeRegex(kw), "i"));

      andConditions.push({
        $or: [
          { category: new RegExp(escapeRegex(categoryStr), "i") },
          ...regexes.map((r) => ({ category: r })),
          ...regexes.map((r) => ({ title: r })),
          ...regexes.map((r) => ({ skills: { $elemMatch: { $regex: r.source, $options: "i" } } })),
        ],
      });
    }

    // 3. Location Filter
    if (locationStr) {
      andConditions.push({ location: new RegExp(escapeRegex(locationStr), "i") });
    }

    // 4. Salary Filters
    if (salaryMinStr || salaryMaxStr) {
      const salaryCond: Record<string, unknown> = {};
      if (salaryMinStr) salaryCond.$gte = Number(salaryMinStr);
      if (salaryMaxStr && salaryMaxStr !== "5000+") salaryCond.$lte = Number(salaryMaxStr);
      if (Object.keys(salaryCond).length > 0) {
        andConditions.push({
          $or: [
            { salaryMax: salaryCond },
            { salary: salaryCond },
            { salaryMin: salaryCond },
          ],
        });
      }
    }

    // 5. Salary Type / Job Payment Type
    const salaryTypeList: string[] = Array.isArray(salaryTypeVal)
      ? (salaryTypeVal as string[])
      : typeof salaryTypeVal === "string"
      ? salaryTypeVal.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    if (salaryTypeList.length > 0) {
      andConditions.push({ salaryType: { $in: salaryTypeList } });
    }

    // 6. Experience Level Mapping
    const expList: string[] = Array.isArray(experienceLevelVal)
      ? (experienceLevelVal as string[])
      : typeof experienceLevelVal === "string"
      ? experienceLevelVal.split(",").map((e) => e.trim()).filter(Boolean)
      : [];
    if (expList.length > 0) {
      const EXP_MAP: Record<string, string[]> = {
        Entry: ["fresher", "0-1"],
        Mid: ["1-2", "2-5"],
        Senior: ["2-5", "5-10"],
        Expert: ["5-10", "10+"],
      };
      const mappedEnums = expList.flatMap((exp) => EXP_MAP[exp] || [exp.toLowerCase()]);
      if (mappedEnums.length > 0) {
        andConditions.push({ experienceLevel: { $in: mappedEnums } });
      }
    }

    // 7. Job Work Type (office, field, hybrid, remote)
    const jobTypeList: string[] = Array.isArray(jobTypeVal)
      ? (jobTypeVal as string[])
      : typeof jobTypeVal === "string"
      ? jobTypeVal.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    if (jobTypeList.length > 0) {
      const typeConditions: Record<string, unknown>[] = [];
      jobTypeList.forEach((t) => {
        const lower = t.toLowerCase();
        if (lower === "remote") {
          typeConditions.push({ location: new RegExp("remote", "i") });
        } else if (lower === "on-site" || lower === "office") {
          typeConditions.push({ jobType: "office" });
        } else if (lower === "hybrid") {
          typeConditions.push({ jobType: "hybrid" });
        } else {
          typeConditions.push({ jobType: lower });
        }
      });
      if (typeConditions.length > 0) {
        andConditions.push({ $or: typeConditions });
      }
    }

    // 8. Employment Type & Work Shift
    const empList: string[] = Array.isArray(employmentTypeVal)
      ? (employmentTypeVal as string[])
      : typeof employmentTypeVal === "string"
      ? employmentTypeVal.split(",").map((e) => e.trim()).filter(Boolean)
      : [];
    if (empList.length > 0) {
      andConditions.push({ employmentType: { $in: empList } });
    }
    if (workShiftStr) {
      andConditions.push({ workShift: workShiftStr });
    }

    // Combine all conditions into query
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // Sort order
    let sortOrder: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortStr === "salary-high") {
      sortOrder = { salaryMax: -1, salary: -1, createdAt: -1 };
    } else if (sortStr === "salary-low") {
      sortOrder = { salaryMin: 1, salary: 1, createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(pageStr, 10));
    const limitNum = Math.min(48, Math.max(1, parseInt(limitStr, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("employer", "name company avatar")
        .sort(sortOrder)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
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
      description: req.body.description || "",
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

    // Parameter filtering to prevent mass assignment security issue
    const allowedFields = [
      "title",
      "description",
      "category",
      "location",
      "salary",
      "salaryMin",
      "salaryMax",
      "salaryType",
      "skills",
      "experienceLevel",
      "employmentType",
      "jobType",
      "status",
      "requirements",
      "responsibilities",
      "projectDuration"
    ];
    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    Object.assign(job, updates);
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
    let filter: any = {};
    if (req.params.jobId !== "all") {
      const job = await Job.findOne({
        _id: req.params.jobId,
        employer: req.user!._id,
      });
      if (!job) {
        res.status(404).json({ success: false, message: "Job not found or not authorized" });
        return;
      }
      filter = { job: req.params.jobId };
    } else {
      const employerJobs = await Job.find({ employer: req.user!._id }).select("_id");
      const jobIds = employerJobs.map((j) => j._id);
      filter = { job: { $in: jobIds } };
    }

    const { page = "1", limit = "10" } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate("job", "title")
        .populate("applicant", "name email title skills location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Application.countDocuments(filter),
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
    const userId = req.user!._id;
    const [applications, hireRequests, escrows, user] = await Promise.all([
      Application.find({ applicant: userId }).populate("job"),
      HireRequest.find({ jobseeker: userId }),
      Escrow.find({ freelancer: userId }),
      User.findById(userId),
    ]);

    const activeJobs = applications.filter((app) => app.status === "accepted").length;
    const pendingApplications = applications.filter((app) => app.status === "pending").length;
    const pendingHireRequests = hireRequests.filter((req) => req.status === "pending").length;
    const completedJobs = applications.filter((app) => {
      const job = app.job as any;
      return job && job.status === "closed";
    }).length;

    // Calculate earnings from accepted applications (using job salary)
    const jobEarnings = applications
      .filter((app) => app.status === "accepted")
      .reduce((sum, app) => {
        const job = app.job as any;
        return sum + (job?.salary || 0);
      }, 0);

    // Calculate earnings from released Task Escrows
    const releasedEscrows = escrows.filter((e) => e.status === "released");
    const taskEarnings = releasedEscrows.reduce(
      (sum, e) => sum + (e.finalBidAmount || 0),
      0
    );

    const walletBalance = user?.walletBalance || 0;
    const totalEarnings = Math.max(jobEarnings + taskEarnings, walletBalance);

    res.json({
      success: true,
      data: {
        activeJobs,
        earnings: totalEarnings,
        walletBalance,
        taskEarnings,
        pendingApplications,
        hireRequests: pendingHireRequests,
        completedJobs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
