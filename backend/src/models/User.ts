import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "jobseeker" | "employer" | "admin";
export type PlanType = "free" | "basic" | "pro";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  bannerUrl?: string;
  googleId?: string;
  company?: string;
  title?: string;
  skills: string[];
  location?: string;
  bio?: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  availability?: string;
  plan: PlanType;
  isActive: boolean;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  education?: Array<{
    school: string;
    degree: string;
    fieldOfStudy: string;
    startYear: string;
    endYear: string;
  }>;
  workExperience?: Array<{
    company: string;
    position: string;
    description: string;
    startYear: string;
    endYear: string;
  }>;
  achievements?: string[];
  category?: string;
  experienceLevel?: string;
  responseTime?: string;
  weeklyAvailability?: string;
  timezone?: string;
  languages?: string[];
  portfolio?: Array<{
    title: string;
    description: string;
    link?: string;
    image?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    year?: string;
  }>;
  jobsDoneCount?: number;
  jobSuccessRate?: number;
  onTimeDeliveryRate?: number;
  repeatClientsRate?: number;
  ratingAvg?: number;
  ratingCount?: number;

  // Employer Specific Dynamic Fields
  tagline?: string;
  companySize?: string;
  foundedYear?: string;
  industry?: string;
  companyQuote?: string;
  specialties?: string[];
  perksAndBenefits?: string[];
  phone?: string;
  contactEmail?: string;
  totalHires?: number;
  avgResponseTime?: string;
  repeatHireRate?: number;
  onTimePaymentRate?: number;

  // Verification & Badges
  isFeatured?: boolean;
  isVerified?: boolean;
  verificationStatus?: "none" | "pending" | "approved" | "rejected";
  verificationDoc?: string;
  verificationNote?: string;

  // Escrow & Financial Wallet
  escrowBalance?: number;
  walletBalance?: number;

  // Reset Password Fields
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["jobseeker", "employer", "admin"],
      default: "jobseeker",
    },
    avatar: { type: String },
    bannerUrl: { type: String },
    googleId: { type: String, sparse: true },
    company: { type: String, trim: true },
    title: { type: String, trim: true },
    skills: { type: [String], default: [] },
    location: { type: String, trim: true },
    bio: { type: String },
    hourlyRate: { type: Number, default: 0 },
    yearsOfExperience: { type: Number, default: 0 },
    availability: { type: String, default: "Immediately" },
    plan: {
      type: String,
      enum: ["free", "basic", "pro"],
      default: "free",
    },
    isActive: { type: Boolean, default: true },
    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    education: [
      {
        school: { type: String, default: "" },
        degree: { type: String, default: "" },
        fieldOfStudy: { type: String, default: "" },
        startYear: { type: String, default: "" },
        endYear: { type: String, default: "" },
      },
    ],
    workExperience: [
      {
        company: { type: String, default: "" },
        position: { type: String, default: "" },
        description: { type: String, default: "" },
        startYear: { type: String, default: "" },
        endYear: { type: String, default: "" },
      },
    ],
    achievements: { type: [String], default: [] },
    experienceLevel: { type: String, default: "" },
    responseTime: { type: String, default: "" },
    weeklyAvailability: { type: String, default: "" },
    timezone: { type: String, default: "" },
    languages: { type: [String], default: [] },
    portfolio: [
      {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        link: { type: String, default: "" },
        image: { type: String, default: "" },
      },
    ],
    certifications: [
      {
        name: { type: String, default: "" },
        issuer: { type: String, default: "" },
        year: { type: String, default: "" },
      },
    ],
    jobsDoneCount: { type: Number, default: 0 },
    jobSuccessRate: { type: Number, default: 100 },
    onTimeDeliveryRate: { type: Number, default: 100 },
    repeatClientsRate: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    // Employer Specific Dynamic Fields
    tagline: { type: String, default: "" },
    companySize: { type: String, default: "" },
    foundedYear: { type: String, default: "" },
    industry: { type: String, default: "" },
    companyQuote: { type: String, default: "" },
    specialties: { type: [String], default: [] },
    perksAndBenefits: { type: [String], default: [] },
    phone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    totalHires: { type: Number, default: 0 },
    avgResponseTime: { type: String, default: "" },
    repeatHireRate: { type: Number, default: 0 },
    onTimePaymentRate: { type: Number, default: 0 },

    // Verification & Badges
    isFeatured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
    verificationDoc: { type: String, default: "" },
    verificationNote: { type: String, default: "" },

    // Escrow & Financial Wallet
    escrowBalance: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },

    // Reset Password Fields
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Same email can register with different roles, but not twice for the same role
userSchema.index({ email: 1, role: 1 }, { unique: true });

// Hash password before saving
userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
