import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { AuthRequest } from "../middlewares/authMiddleware";

const SELF_SERVICE_PROFILE_FIELDS = [
  "name",
  "title",
  "skills",
  "location",
  "bio",
  "company",
  "avatar",
  "bannerUrl",
  "hourlyRate",
  "yearsOfExperience",
  "availability",
  "socialLinks",
  "education",
  "workExperience",
  "achievements",
  "category",
  "experienceLevel",
  "responseTime",
  "weeklyAvailability",
  "timezone",
  "languages",
  "portfolio",
  "certifications",
  "tagline",
  "companySize",
  "foundedYear",
  "industry",
  "companyQuote",
  "specialties",
  "perksAndBenefits",
  "phone",
  "contactEmail",
] as const;

const SYSTEM_MANAGED_PROFILE_FIELDS = [
  "jobsDoneCount",
  "jobSuccessRate",
  "onTimeDeliveryRate",
  "repeatClientsRate",
  "ratingAvg",
  "ratingCount",
  "totalHires",
  "avgResponseTime",
  "repeatHireRate",
  "onTimePaymentRate",
] as const;

const PUBLIC_PROFILE_SELECT =
  "name avatar title skills location bio hourlyRate yearsOfExperience availability plan company role socialLinks education workExperience achievements category experienceLevel responseTime weeklyAvailability timezone languages portfolio certifications jobsDoneCount jobSuccessRate onTimeDeliveryRate repeatClientsRate ratingAvg ratingCount createdAt";

const signToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as jwt.SignOptions);
};

const userResponse = (user: IUser, includeAvatar = false) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  ...(includeAvatar && { avatar: user.avatar }),
  bannerUrl: user.bannerUrl,
  company: user.company,
  title: user.title,
  skills: user.skills,
  location: user.location,
  bio: user.bio,
  hourlyRate: user.hourlyRate,
  yearsOfExperience: user.yearsOfExperience,
  availability: user.availability,
  plan: user.plan,
  socialLinks: user.socialLinks,
  education: user.education,
  workExperience: user.workExperience,
  achievements: user.achievements,
  category: user.category,
  experienceLevel: user.experienceLevel,
  responseTime: user.responseTime,
  weeklyAvailability: user.weeklyAvailability,
  timezone: user.timezone,
  languages: user.languages,
  portfolio: user.portfolio,
  certifications: user.certifications,
  jobsDoneCount: user.jobsDoneCount,
  jobSuccessRate: user.jobSuccessRate,
  onTimeDeliveryRate: user.onTimeDeliveryRate,
  repeatClientsRate: user.repeatClientsRate,
  ratingAvg: user.ratingAvg,
  ratingCount: user.ratingCount,
  // Employer Fields
  tagline: user.tagline,
  companySize: user.companySize,
  foundedYear: user.foundedYear,
  industry: user.industry,
  companyQuote: user.companyQuote,
  specialties: user.specialties,
  perksAndBenefits: user.perksAndBenefits,
  phone: user.phone,
  contactEmail: user.contactEmail,
  totalHires: user.totalHires,
  avgResponseTime: user.avgResponseTime,
  repeatHireRate: user.repeatHireRate,
  onTimePaymentRate: user.onTimePaymentRate,
  createdAt: user.createdAt,
});

// POST /api/v1/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, company } = req.body;

    const userRole = role || "jobseeker";
    const normalizedEmail = email ? email.trim().toLowerCase() : "";

    const existing = await User.findOne({
      email: normalizedEmail,
      role: userRole,
    });
    if (existing) {
      res
        .status(400)
        .json({
          success: false,
          message: `An account with email '${normalizedEmail}' is already registered as a ${userRole}`,
        });
      return;
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: userRole,
      company: userRole === "employer" ? company : undefined,
    });

    const token = signToken(user._id.toString());
    res.status(201).json({ success: true, token, user: userResponse(user) });
  } catch (error: any) {
    if (error?.code === 11000) {
      res
        .status(400)
        .json({
          success: false,
          message: `An account with this email is already registered as a ${req.body.role || "jobseeker"}`,
        });
      return;
    }
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// POST /api/v1/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : "";

    // Query by email and specific role if role is provided
    const query: Record<string, unknown> = { email: normalizedEmail };
    if (role) query.role = role;

    const user = await User.findOne(query).select("+password -avatar");
    if (!user || !user.password) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: "Account is banned" });
      return;
    }

    const token = signToken(user._id.toString());
    res.json({ success: true, token, user: userResponse(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({ success: true, user: userResponse(user, true) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// PATCH /api/v1/auth/me
export const updateMe = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const forbiddenFields = SYSTEM_MANAGED_PROFILE_FIELDS.filter(
      (field) => req.body[field] !== undefined,
    );

    if (forbiddenFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `These fields are system-managed and cannot be updated directly: ${forbiddenFields.join(", ")}`,
      });
      return;
    }

    const updates = Object.fromEntries(
      SELF_SERVICE_PROFILE_FIELDS.filter(
        (field) => req.body[field] !== undefined,
      ).map((field) => [field, req.body[field]]),
    );

    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user: userResponse(updated!, true) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// PATCH /api/v1/auth/change-password
export const changePassword = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!._id).select("+password -avatar");

    if (!user || !user.password) {
      res.status(400).json({
        success: false,
        message: "Invalid account or password not set",
      });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
      return;
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/auth/users/:id — fetch any user's public profile (no auth required)
export const getUserById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select(
      PUBLIC_PROFILE_SELECT,
    );
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// GET /api/v1/auth/users — paginated public freelancer listing
export const getFreelancers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      search,
      category,
      availableOnly,
      minRate,
      maxRate,
      experience,
      sort = "newest",
      page = "1",
      limit = "12",
    } = req.query as Record<string, string>;

    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Base filter: active jobseekers only
    const filter: Record<string, unknown> = {
      role: "jobseeker",
      isActive: true,
    };
    const andConditions: Record<string, unknown>[] = [];

    // 1. Multi-field Tokenized Search Algorithm
    if (search && search.trim()) {
      const tokens = search.trim().split(/\s+/).filter(Boolean);
      tokens.forEach((token) => {
        const regex = new RegExp(escapeRegex(token), "i");
        andConditions.push({
          $or: [
            { name: regex },
            { title: regex },
            { skills: { $elemMatch: { $regex: escapeRegex(token), $options: "i" } } },
            { bio: regex },
            { location: regex },
          ],
        });
      });
    }

    // 2. Category Keyword Aliases & Matching
    if (category && category.trim()) {
      const CATEGORY_KEYWORDS: Record<string, string[]> = {
        "web development": [
          "react", "next", "vue", "angular", "node", "express",
          "javascript", "typescript", "html", "css", "frontend",
          "backend", "fullstack", "full-stack", "developer", "software", "web", "api"
        ],
        design: [
          "design", "ui", "ux", "figma", "adobe", "sketch",
          "branding", "graphic", "visual", "motion", "illustrator", "photoshop"
        ],
        marketing: [
          "marketing", "seo", "sem", "digital", "social media",
          "ppc", "ads", "email", "campaign", "growth", "analytics", "content"
        ],
        writing: [
          "writing", "copywriting", "content", "blog", "article",
          "editor", "proofreading", "journalist", "translation"
        ],
        "data science": [
          "data", "machine learning", "ml", "ai", "python", "r",
          "statistics", "tensorflow", "nlp", "deep learning", "analytics", "data science"
        ],
        "mobile development": [
          "mobile", "ios", "android", "flutter", "react native",
          "swift", "kotlin", "xamarin", "app"
        ],
        "video & animation": [
          "video", "animation", "after effects", "premiere", "motion", "editing"
        ],
        finance: [
          "finance", "accounting", "bookkeeping", "tax", "audit", "financial", "excel", "tally"
        ],
        "customer service": [
          "customer service", "support", "helpdesk", "crm", "chat", "virtual assistant"
        ],
      };
      const catKey = category.trim().toLowerCase();
      const aliases = CATEGORY_KEYWORDS[catKey] || [catKey];
      andConditions.push({
        $or: [
          ...aliases.map((kw) => ({
            skills: { $elemMatch: { $regex: escapeRegex(kw), $options: "i" } },
          })),
          ...aliases.map((kw) => ({ title: { $regex: escapeRegex(kw), $options: "i" } })),
          ...aliases.map((kw) => ({ bio: { $regex: escapeRegex(kw), $options: "i" } })),
        ],
      });
    }

    // 3. Availability Filter
    if (availableOnly === "true") {
      filter.availability = "Immediately";
    }

    // 4. Hourly Rate Min & Max Filter
    if (minRate || maxRate) {
      const rateFilter: Record<string, number> = {};
      if (minRate && minRate !== "3000") rateFilter.$gte = Number(minRate);
      if (maxRate) rateFilter.$lte = Number(maxRate);
      if (minRate === "3000") rateFilter.$gte = 3000;
      if (Object.keys(rateFilter).length > 0) {
        filter.hourlyRate = rateFilter;
      }
    }

    // 5. Experience Levels Filter
    if (experience) {
      const expMap: Record<string, { $gte: number; $lt?: number }> = {
        entry: { $gte: 0, $lt: 2 },
        mid: { $gte: 2, $lt: 5 },
        senior: { $gte: 5, $lt: 10 },
        expert: { $gte: 10 },
      };
      const levels = experience
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const rangeConditions = levels
        .filter((l) => expMap[l])
        .map((l) => ({ yearsOfExperience: expMap[l] }));

      if (rangeConditions.length === 1) {
        filter.yearsOfExperience = rangeConditions[0].yearsOfExperience;
      } else if (rangeConditions.length > 1) {
        andConditions.push({ $or: rangeConditions });
      }
    }

    // Combine all conditions into query
    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    // Sort order
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      rate_high: { hourlyRate: -1, createdAt: -1 },
      rate_low: { hourlyRate: 1, createdAt: -1 },
      top_rated: { ratingAvg: -1, createdAt: -1 },
      newest: { createdAt: -1 },
    };
    const sortOrder = sortMap[sort] ?? { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(48, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      User.find(filter)
        .select(
          "name title skills location bio hourlyRate yearsOfExperience availability plan ratingAvg ratingCount createdAt avatar",
        )
        .sort(sortOrder)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// POST /api/v1/auth/forgot-password
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, role } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : "";

    const query: Record<string, unknown> = { email: normalizedEmail };
    if (role) query.role = role;

    const user = await User.findOne(query);
    if (!user) {
      res.json({
        success: true,
        message: "If an account with that email exists, a password reset OTP has been sent.",
        otpCode: "123456",
      });
      return;
    }

    // Generate 6-digit OTP reset token
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otpCode;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    res.json({
      success: true,
      message: `Password reset OTP generated. Code: ${otpCode}`,
      otpCode,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// POST /api/v1/auth/reset-password
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, role, token, newPassword } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : "";

    if (!token || !newPassword || newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long and valid OTP is required.",
      });
      return;
    }

    const query: Record<string, unknown> = {
      email: normalizedEmail,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    };
    if (role) query.role = role;

    const user = await User.findOne(query).select("+resetPasswordToken +resetPasswordExpires");
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired OTP code. Please request a new code.",
      });
      return;
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
