import mongoose, { Document, Schema } from "mongoose";

export type JobStatus = "open" | "closed" | "draft";
export type SalaryType = "fixed" | "hourly" | "monthly" | "annual" | "project";
export type JobCategory =
  | "Web Development"
  | "Mobile Development"
  | "Design"
  | "Data Science"
  | "Marketing"
  | "Writing"
  | "Video & Animation"
  | "Finance"
  | "Engineering"
  | "Sales"
  | "Customer Service"
  | "Other";

export type JobType = "office" | "field" | "hybrid";
export type EmploymentType = "fullTime" | "partTime" | "contract" | "internship";
export type WorkShift = "day" | "night" | "rotating" | "flexible";
export type ExperienceLevel = "fresher" | "0-1" | "1-2" | "2-5" | "5-10" | "10+";
export type EducationLevel = "any" | "highSchool" | "bachelor" | "master" | "phd";
export type GenderPreference = "any" | "male" | "female";

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  employer: mongoose.Types.ObjectId;
  location: string;
  department: string;
  jobRole: string;
  
  // Compensation & Job Type
  salaryMin: number;
  salaryMax: number;
  salaryType: SalaryType;
  jobVacancy: number;
  jobType: JobType;
  projectDuration: string;
  employmentType: EmploymentType;
  workShift: WorkShift;
  
  // Candidate Requirements
  experienceLevel: ExperienceLevel;
  education: EducationLevel;
  genderPreference: GenderPreference;
  skills: string[];
  
  // Content
  responsibilities: string;
  
  // Company Info (auto-filled from profile)
  companyName: string;
  companyAddress: string;
  postedBy: string;
  
  // FAQ
  faqs: { question: string; answer: string }[];
  
  // Legacy fields for backward compatibility
  description: string;
  category: JobCategory;
  salary: number;
  status: JobStatus;
  isFeatured?: boolean;
  isUrgent?: boolean;
  applicantCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    employer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: { type: String, default: "Remote" },
    department: { type: String, default: "General" },
    jobRole: { type: String, default: "Specialist" },
    
    // Compensation & Job Type
    salaryMin: { type: Number, required: true, min: 0, default: 0 },
    salaryMax: { type: Number, required: true, min: 0, default: 0 },
    salaryType: {
      type: String,
      enum: ["fixed", "hourly", "monthly", "annual", "project"],
      default: "monthly",
    },
    jobVacancy: { type: Number, required: true, min: 1, default: 1 },
    jobType: {
      type: String,
      enum: ["office", "field", "hybrid"],
      default: "office",
    },
    projectDuration: { type: String, default: "1-3 months" },
    employmentType: {
      type: String,
      enum: ["fullTime", "partTime", "contract", "internship"],
      default: "fullTime",
    },
    workShift: {
      type: String,
      enum: ["day", "night", "rotating", "flexible"],
      default: "day",
    },
    
    // Candidate Requirements
    experienceLevel: {
      type: String,
      enum: ["fresher", "0-1", "1-2", "2-5", "5-10", "10+"],
      default: "fresher",
    },
    education: {
      type: String,
      enum: ["any", "highSchool", "bachelor", "master", "phd"],
      default: "any",
    },
    genderPreference: {
      type: String,
      enum: ["any", "male", "female"],
      default: "any",
    },
    skills: { type: [String], default: [] },
    
    // Content
    responsibilities: { type: String, default: "" },
    
    // Company Info
    companyName: { type: String, default: "Company" },
    companyAddress: { type: String, default: "Remote" },
    postedBy: { type: String, default: "Employer" },
    
    // FAQ
    faqs: {
      type: [{
        question: { type: String, default: "" },
        answer: { type: String, default: "" },
      }],
      default: [],
    },
    
    // Legacy fields for backward compatibility
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: [
        "Web Development",
        "Mobile Development", 
        "Design",
        "Data Science",
        "Marketing",
        "Writing",
        "Video & Animation",
        "Finance",
        "Engineering",
        "Sales",
        "Customer Service",
        "Other",
      ],
      default: "Other",
    },
    salary: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "open",
    },
    isFeatured: { type: Boolean, default: false },
    isUrgent: { type: Boolean, default: false },
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text", skills: "text" });
jobSchema.index({ employer: 1, status: 1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ status: 1, createdAt: -1 });

export const Job = mongoose.model<IJob>("Job", jobSchema);
