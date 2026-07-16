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
  ratingAvg?: number;
  ratingCount?: number;
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
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
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
