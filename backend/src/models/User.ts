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
