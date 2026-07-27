import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { User, IUser } from "../models/User";
import { AuthRequest } from "../middlewares/authMiddleware";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    const existing = await User.findOne({ email: normalizedEmail, role: userRole });
    if (existing) {
      res
        .status(400)
        .json({ success: false, message: `An account with email '${normalizedEmail}' is already registered as a ${userRole}` });
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
      res.status(400).json({ success: false, message: `An account with this email is already registered as a ${req.body.role || "jobseeker"}` });
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

// POST /api/v1/auth/google
export const googleAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { idToken, role } = req.body;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ success: false, message: "Invalid Google token" });
      return;
    }

    const { email, name, sub: googleId, picture } = payload;

    let user = await User.findOne({ email, role: role || "jobseeker" }).select("-avatar");

    if (!user) {
      user = await User.create({
        name: name || email,
        email,
        googleId,
        avatar: picture,
        role: role || "jobseeker",
      });
    } else {
      // Update googleId if logging in with Google for first time on existing account
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: "Account is banned" });
      return;
    }

    const token = signToken(user._id.toString());
    res.json({ success: true, token, user: userResponse(user) });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Google authentication failed", error });
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
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const {
      name, title, skills, location, bio, company,
      avatar, bannerUrl, hourlyRate, yearsOfExperience, availability,
      socialLinks, education, workExperience, achievements,
      category, experienceLevel, responseTime, weeklyAvailability,
      timezone, languages, portfolio, certifications,
      jobsDoneCount, jobSuccessRate, onTimeDeliveryRate, repeatClientsRate,
      tagline, companySize, foundedYear, industry, companyQuote,
      specialties, perksAndBenefits, phone, contactEmail,
      totalHires, avgResponseTime, repeatHireRate, onTimePaymentRate,
    } = req.body;

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        ...(name !== undefined && { name }),
        ...(title !== undefined && { title }),
        ...(skills !== undefined && { skills }),
        ...(location !== undefined && { location }),
        ...(bio !== undefined && { bio }),
        ...(company !== undefined && { company }),
        ...(avatar !== undefined && { avatar }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(yearsOfExperience !== undefined && { yearsOfExperience }),
        ...(availability !== undefined && { availability }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(education !== undefined && { education }),
        ...(workExperience !== undefined && { workExperience }),
        ...(achievements !== undefined && { achievements }),
        ...(category !== undefined && { category }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(responseTime !== undefined && { responseTime }),
        ...(weeklyAvailability !== undefined && { weeklyAvailability }),
        ...(timezone !== undefined && { timezone }),
        ...(languages !== undefined && { languages }),
        ...(portfolio !== undefined && { portfolio }),
        ...(certifications !== undefined && { certifications }),
        ...(jobsDoneCount !== undefined && { jobsDoneCount }),
        ...(jobSuccessRate !== undefined && { jobSuccessRate }),
        ...(onTimeDeliveryRate !== undefined && { onTimeDeliveryRate }),
        ...(repeatClientsRate !== undefined && { repeatClientsRate }),
        ...(tagline !== undefined && { tagline }),
        ...(companySize !== undefined && { companySize }),
        ...(foundedYear !== undefined && { foundedYear }),
        ...(industry !== undefined && { industry }),
        ...(companyQuote !== undefined && { companyQuote }),
        ...(specialties !== undefined && { specialties }),
        ...(perksAndBenefits !== undefined && { perksAndBenefits }),
        ...(phone !== undefined && { phone }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(totalHires !== undefined && { totalHires }),
        ...(avgResponseTime !== undefined && { avgResponseTime }),
        ...(repeatHireRate !== undefined && { repeatHireRate }),
        ...(onTimePaymentRate !== undefined && { onTimePaymentRate }),
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user: userResponse(updated!, true) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// PATCH /api/v1/auth/change-password
export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!._id).select("+password -avatar");

    if (!user || !user.password) {
      res.status(400).json({
        success: false,
        message: "Cannot change password for Google accounts",
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
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select(
      "name email avatar title skills location bio hourlyRate yearsOfExperience availability plan company role socialLinks education workExperience achievements category experienceLevel responseTime weeklyAvailability timezone languages portfolio certifications jobsDoneCount jobSuccessRate onTimeDeliveryRate repeatClientsRate ratingAvg ratingCount createdAt"
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
  res: Response
): Promise<void> => {
  try {
    const {
      search, category, availableOnly,
      minRate, maxRate, experience, sort,
      page = "1", limit = "12",
    } = req.query as Record<string, string>;

    // Base filter: active jobseekers only
    const filter: Record<string, unknown> = { role: "jobseeker", isActive: true };

    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { skills: { $elemMatch: { $regex: search, $options: "i" } } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      const CATEGORY_KEYWORDS: Record<string, string[]> = {
        "web development":    ["react", "next", "vue", "angular", "node", "express", "javascript", "typescript", "html", "css", "frontend", "backend", "fullstack", "full-stack", "developer", "software", "web", "api"],
        "design":             ["design", "ui", "ux", "figma", "adobe", "sketch", "branding", "graphic", "visual", "motion", "illustrator", "photoshop"],
        "marketing":          ["marketing", "seo", "sem", "digital", "social media", "ppc", "ads", "email", "campaign", "growth", "analytics", "content"],
        "writing":            ["writing", "copywriting", "content", "blog", "article", "editor", "proofreading", "journalist", "translation"],
        "data science":       ["data", "machine learning", "ml", "ai", "python", "r", "statistics", "tensorflow", "nlp", "deep learning", "analytics", "data science"],
        "mobile development": ["mobile", "ios", "android", "flutter", "react native", "swift", "kotlin", "xamarin", "app"],
        "video & animation":  ["video", "animation", "after effects", "premiere", "motion", "editing"],
        "finance":            ["finance", "accounting", "bookkeeping", "tax", "audit", "financial", "excel", "tally"],
        "customer service":   ["customer service", "support", "helpdesk", "crm", "chat", "virtual assistant"],
      };
      const catKey = category.toLowerCase();
      const aliases = CATEGORY_KEYWORDS[catKey] || [catKey];
      filter.$or = [
        ...aliases.map(kw => ({ skills: { $elemMatch: { $regex: kw, $options: "i" } } })),
        ...aliases.map(kw => ({ title: { $regex: kw, $options: "i" } })),
        ...aliases.map(kw => ({ bio: { $regex: kw, $options: "i" } })),
      ];
    }

    if (availableOnly === "true") {
      filter.availability = "Immediately";
    }

    if (minRate || maxRate) {
      const rateFilter: Record<string, number> = {};
      if (minRate) rateFilter.$gte = Number(minRate);
      if (maxRate) rateFilter.$lte = Number(maxRate);
      filter.hourlyRate = rateFilter;
    }

    if (experience) {
      const expMap: Record<string, { $gte: number; $lt?: number }> = {
        entry:  { $gte: 0, $lt: 2  },
        mid:    { $gte: 2, $lt: 5  },
        senior: { $gte: 5, $lt: 10 },
        expert: { $gte: 10 },
      };
      const levels = experience.split(",").map(e => e.trim()).filter(Boolean);
      if (levels.length === 1 && expMap[levels[0]]) {
        filter.yearsOfExperience = expMap[levels[0]];
      } else if (levels.length > 1) {
        // For multiple levels, build an $or of the ranges
        const rangeConditions = levels
          .filter(l => expMap[l])
          .map(l => ({ yearsOfExperience: expMap[l] }));
        if (rangeConditions.length > 0) {
          // Merge with existing $or if present (category may have set it)
          if (filter.$or) {
            filter.$and = [{ $or: filter.$or as object[] }, { $or: rangeConditions }];
            delete filter.$or;
          } else {
            filter.$or = rangeConditions;
          }
        }
      }
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      rate_high: { hourlyRate: -1 },
      rate_low:  { hourlyRate:  1 },
      newest:    { createdAt:  -1 },
    };
    const sortOrder = sortMap[sort] ?? { createdAt: -1 };

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(48, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      User.find(filter)
        .select("name title skills location bio hourlyRate yearsOfExperience availability plan ratingAvg ratingCount createdAt")
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
      page:  pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
