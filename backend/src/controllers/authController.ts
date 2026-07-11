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

const userResponse = (user: IUser) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
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
  createdAt: user.createdAt,
});

// POST /api/v1/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, company } = req.body;

    const userRole = role || "jobseeker";

    const existing = await User.findOne({ email, role: userRole });
    if (existing) {
      res
        .status(400)
        .json({ success: false, message: "Email already registered for this role" });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      company: userRole === "employer" ? company : undefined,
    });

    const token = signToken(user._id.toString());
    res.status(201).json({ success: true, token, user: userResponse(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// POST /api/v1/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    // Build query: if role is provided, match exact {email, role}; otherwise find any account with this email
    const query: Record<string, unknown> = { email };
    if (role) query.role = role;

    const user = await User.findOne(query).select("+password");
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

    let user = await User.findOne({ email, role: role || "jobseeker" });

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
    const user = req.user!;
    res.json({ success: true, user: userResponse(user) });
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
      avatar, hourlyRate, yearsOfExperience, availability,
      socialLinks, education, workExperience, achievements,
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
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(yearsOfExperience !== undefined && { yearsOfExperience }),
        ...(availability !== undefined && { availability }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(education !== undefined && { education }),
        ...(workExperience !== undefined && { workExperience }),
        ...(achievements !== undefined && { achievements }),
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user: userResponse(updated!) });
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
    const user = await User.findById(req.user!._id).select("+password");

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
      "name email avatar title skills location bio hourlyRate yearsOfExperience availability plan company role socialLinks education workExperience achievements createdAt"
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
      ];
    }

    if (category) {
      filter.skills = { $elemMatch: { $regex: category, $options: "i" } };
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
      if (expMap[experience]) filter.yearsOfExperience = expMap[experience];
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
        .select("name avatar title skills location bio hourlyRate yearsOfExperience availability plan createdAt")
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
