// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = "jobseeker" | "employer" | "admin";
export type PlanType = "free" | "basic" | "pro";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
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
  createdAt: string;
  updatedAt: string;
}

// ─── Job ─────────────────────────────────────────────────────────────────────

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

export interface Job {
  _id: string;
  title: string;
  employer: User | string;
  location: string;
  department?: string;
  jobRole?: string;
  
  // Compensation & Job Type
  salaryMin?: number;
  salaryMax?: number;
  salaryType: SalaryType;
  jobVacancy?: number;
  jobType?: "office" | "field" | "hybrid";
  projectDuration?: string;
  employmentType?: "fullTime" | "partTime" | "contract" | "internship";
  workShift?: "day" | "night" | "rotating" | "flexible";
  
  // Candidate Requirements
  experienceLevel?: "fresher" | "0-1" | "1-2" | "2-5" | "5-10" | "10+";
  education?: "any" | "highSchool" | "bachelor" | "master" | "phd";
  genderPreference?: "any" | "male" | "female";
  skills: string[];
  
  // Content
  responsibilities?: string;
  
  // Company Info
  companyName?: string;
  companyAddress?: string;
  postedBy?: string;
  
  // FAQ
  faqs?: { question: string; answer: string }[];
  
  // Legacy fields for backward compatibility
  description: string;
  category: JobCategory;
  salary: number;
  status: JobStatus;
  applicantCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Application ─────────────────────────────────────────────────────────────

export type ApplicationStatus = "pending" | "shortlisted" | "accepted" | "rejected";

export interface Application {
  _id: string;
  job: Job | string;
  applicant: User | string;
  status: ApplicationStatus;
  coverLetter: string;
  createdAt: string;
  updatedAt: string;
}

// ─── HireRequest ─────────────────────────────────────────────────────────────

export type HireRequestStatus = "pending" | "accepted" | "rejected";

export interface HireRequest {
  _id: string;
  employer: User | string;
  jobseeker: User | string;
  job: Job | string;
  status: HireRequestStatus;
  salary: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: unknown;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser extends User {
  accessToken: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface JobSeekerStats {
  activeJobs: number;
  earnings: number;
  pendingApplications: number;
  hireRequests: number;
  completedJobs: number;
}

export interface EmployerStats {
  totalPosted: number;
  totalReceived: number;
  acceptedApplicants: number;
  activeContracts: number;
}

export interface AdminStats {
  totalUsers: number;
  activeJobs: number;
  totalEmployers: number;
  totalJobseekers: number;
}
