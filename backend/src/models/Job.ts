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
    location: { type: String, required: true },
    department: { type: String, required: true },
    jobRole: { type: String, required: true },
    
    // Compensation & Job Type
    salaryMin: { type: Number, required: true, min: 0 },
    salaryMax: { type: Number, required: true, min: 0 },
    salaryType: {
      type: String,
      enum: ["fixed", "hourly", "monthly", "annual", "project"],
      required: true,
    },
    jobVacancy: { type: Number, required: true, min: 1, default: 1 },
    jobType: {
      type: String,
      enum: ["office", "field", "hybrid"],
      required: true,
    },
    projectDuration: { type: String, required: true },
    employmentType: {
      type: String,
      enum: ["fullTime", "partTime", "contract", "internship"],
      required: true,
    },
    workShift: {
      type: String,
      enum: ["day", "night", "rotating", "flexible"],
      required: true,
    },
    
    // Candidate Requirements
    experienceLevel: {
      type: String,
      enum: ["fresher", "0-1", "1-2", "2-5", "5-10", "10+"],
      required: true,
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
    responsibilities: { type: String, required: true },
    
    // Company Info
    companyName: { type: String, required: true },
    companyAddress: { type: String, required: true },
    postedBy: { type: String, required: true },
    
    // FAQ
    faqs: [{
      question: { type: String, required: true },
      answer: { type: String, required: true },
    }],
    
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
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text", skills: "text" });
jobSchema.index({ employer: 1, status: 1 });
jobSchema.index({ category: 1, status: 1 });

export const Job = mongoose.model<IJob>("Job", jobSchema);
