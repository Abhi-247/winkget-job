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

// ─── Task ─────────────────────────────────────────────────────────────────────

export type TaskStatus = "open" | "assigned" | "completed" | "closed";
export type TaskType =
  | "quick-fix"
  | "data-entry"
  | "content-writing"
  | "design"
  | "testing"
  | "research"
  | "other";

export interface Task {
  _id: string;
  title: string;
  employer: User | string;
  description: string;
  category: JobCategory;
  taskType: TaskType;
  skills: string[];
  budget: number;
  startDate: string;
  endDate: string;
  deadline?: string; // legacy — mirrors endDate
  location: string;
  deliverables: string;
  status: TaskStatus;
  claimCount: number;
  maxClaims: number;
  companyName: string;
  companyAddress: string;
  postedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── TaskClaim ─────────────────────────────────────────────────────────────────

export interface TaskClaim {
  _id: string;
  task: Task | string;
  claimant: User | string;
  status: "pending" | "approved" | "rejected" | "completed";
  message: string;
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
export type HireRequestType = "job" | "freelance";

export interface HireRequest {
  _id: string;
  employer: User | string;
  jobseeker: User | string;
  job?: Job | string;
  hireType: HireRequestType;
  status: HireRequestStatus;
  salary: number;
  message?: string;
  // Freelance-specific fields
  projectTitle?: string;
  projectDescription?: string;
  projectSkills?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Conversation & Message ──────────────────────────────────────────────────

export interface Conversation {
  _id: string;
  participants: User[];
  jobContext?: { _id: string; title: string };
  lastMessage?: {
    _id: string;
    text: string;
    sender: { _id: string; name: string } | string;
    createdAt: string;
  };
  lastActivity: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: User;
  text: string;
  readBy: string[];
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
  activeTasks: number;
}

export interface AdminStats {
  totalUsers: number;
  activeJobs: number;
  totalEmployers: number;
  totalJobseekers: number;
}

// ─── Notification & Review Types ──────────────────────────────────────────────

export type NotificationType =
  | "claim_status"
  | "new_claim"
  | "hire_request"
  | "new_message"
  | "general";

export interface SystemNotification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  reviewer: User;
  reviewee: string;
  rating: number;
  comment: string;
  task?: string;
  job?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

