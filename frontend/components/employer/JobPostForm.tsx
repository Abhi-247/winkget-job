"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { jobsApi, authApi } from "@/lib/api";
import {
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  Users,
  User,
  FileText,
  HelpCircle,
  Bold,
  Italic,
  List,
  ListOrdered,
  Type,
  RotateCcw,
  RotateCw,
  Plus,
  X,
  Eye,
  Check,
} from "lucide-react";
import { StepIndicator } from "@/components/employer/StepIndicator";

// Types matching backend
type SalaryType = "monthly" | "annual" | "hourly" | "project";
type JobType = "office" | "field" | "hybrid";
type EmploymentType = "fullTime" | "partTime" | "contract" | "internship";
type WorkShift = "day" | "night" | "rotating" | "flexible";
type ExperienceLevel = "fresher" | "0-1" | "1-2" | "2-5" | "5-10" | "10+";
type EducationLevel = "any" | "highSchool" | "bachelor" | "master" | "phd";
type GenderPreference = "any" | "male" | "female";

interface FormData {
  // Step 1: Job Basics
  title: string;
  location: string;
  department: string;
  jobRole: string;
  category: string;

  // Step 2: Compensation & Job Type
  salaryMin: string;
  salaryMax: string;
  salaryType: SalaryType;
  jobVacancy: string;
  jobType: JobType;
  projectDuration: string;
  employmentType: EmploymentType;
  workShift: WorkShift;

  // Step 3: Candidate Requirements
  experienceLevel: ExperienceLevel;
  education: EducationLevel;
  genderPreference: GenderPreference;
  skills: string[];

  // Step 4: Description & Responsibilities
  description: string;
  responsibilities: string;

  // Step 5: Company Info
  companyName: string;
  companyAddress: string;
  postedBy: string;

  // Step 6: FAQ
  faqs: { question: string; answer: string }[];
}
const predefinedSkills = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "Java",
  "Laravel",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Figma",
  "UI/UX",
  "Excel",
  "Communication",
  "Leadership",
  "Sales",
  "Marketing",
  "SEO",
];

const departments = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "Customer Service",
  "Product",
];

const jobCategories = [
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
];

const projectDurations = [
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "1-2 years",
  "2+ years",
  "Ongoing",
];

export function JobPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editJobId = searchParams.get("edit");
  const { data: session } = useSession();
  const { success, error } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // Step 1
    title: "",
    location: "",
    department: "Engineering",
    jobRole: "",
    category: "Web Development",

    // Step 2
    salaryMin: "",
    salaryMax: "",
    salaryType: "monthly",
    jobVacancy: "1",
    jobType: "office",
    projectDuration: "1-3 months",
    employmentType: "fullTime",
    workShift: "day",

    // Step 3
    experienceLevel: "fresher",
    education: "any",
    genderPreference: "any",
    skills: [],

    // Step 4
    description: "",
    responsibilities: "",

    // Step 5
    companyName: "",
    companyAddress: "",
    postedBy: session?.user?.name || "",

    // Step 6
    faqs: [],
  });

  // Pre-fill company fields from the employer's profile on mount
  useEffect(() => {
    if (!session?.user.accessToken) return;
    authApi
      .getMe(session.user.accessToken)
      .then((res: any) => {
        if (res?.user) {
          setFormData((prev) => ({
            ...prev,
            companyName: res.user.company || prev.companyName,
            companyAddress: res.user.location || prev.companyAddress,
            postedBy: res.user.name || prev.postedBy,
          }));
        }
      })
      .catch(() => {}); // non-critical — form still works without it
  }, [session?.user.accessToken]);

  useEffect(() => {
    if (!editJobId || !session?.user.accessToken) return;

    const fetchJobToEdit = async () => {
      try {
        const res = (await jobsApi.getJobById(editJobId)) as {
          success: boolean;
          data: any;
        };
        const job = res.data;
        if (job) {
          setFormData({
            title: job.title || "",
            location: job.location || "",
            department: job.department || "Engineering",
            jobRole: job.jobRole || "",
            category: job.category || "Web Development",

            salaryMin: job.salaryMin ? String(job.salaryMin) : "",
            salaryMax: job.salaryMax
              ? String(job.salaryMax)
              : job.salary
                ? String(job.salary)
                : "",
            salaryType: job.salaryType || "monthly",
            jobVacancy: job.jobVacancy ? String(job.jobVacancy) : "1",
            jobType: job.jobType || "office",
            projectDuration: job.projectDuration || "1-3 months",
            employmentType: job.employmentType || "fullTime",
            workShift: job.workShift || "day",

            experienceLevel: job.experienceLevel || "fresher",
            education: job.education || "any",
            genderPreference: job.genderPreference || "any",
            skills: job.skills || [],

            description: job.description || "",
            responsibilities: job.responsibilities || "",

            companyName: job.companyName || "",
            companyAddress: job.companyAddress || "",
            postedBy: job.postedBy || session?.user?.name || "",

            faqs: job.faqs || [],
          });
        }
      } catch (err) {
        error("Failed to load job details for editing");
      }
    };

    fetchJobToEdit();
  }, [editJobId, session, error]);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      updateField("skills", [...formData.skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    updateField(
      "skills",
      formData.skills.filter((s) => s !== skill),
    );
  };
  const addFAQ = () => {
    updateField("faqs", [...formData.faqs, { question: "", answer: "" }]);
  };

  const updateFAQ = (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    const updatedFaqs = [...formData.faqs];
    updatedFaqs[index] = { ...updatedFaqs[index], [field]: value };
    updateField("faqs", updatedFaqs);
  };

  const removeFAQ = (index: number) => {
    updateField(
      "faqs",
      formData.faqs.filter((_, i) => i !== index),
    );
  };

  const nextStep = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Safety guard: never allow submission unless on Step 6
    if (currentStep !== 6) return;

    // Intercept Enter key submissions from inputs, selects, or other non-submit elements
    const nativeEvent = e.nativeEvent as SubmitEvent;
    const submitter = nativeEvent?.submitter;
    const activeEl =
      typeof document !== "undefined" ? document.activeElement : null;

    const isSubmitBtn =
      (submitter && submitter.getAttribute("type") === "submit") ||
      (activeEl && activeEl.getAttribute("type") === "submit");

    if (!isSubmitBtn) {
      return;
    }
    if (!session?.user.accessToken) return;

    setLoading(true);
    try {
      const jobData = {
        ...formData,
        salaryMin: Number(formData.salaryMin),
        salaryMax: Number(formData.salaryMax),
        jobVacancy: Number(formData.jobVacancy),
        // Map to legacy fields for backward compatibility
        salary: Number(formData.salaryMax),
      };

      if (editJobId) {
        await jobsApi.updateJob(session.user.accessToken, editJobId, jobData);
        success("Job updated successfully!");
      } else {
        await jobsApi.createJob(session.user.accessToken, jobData);
        success("Job posted successfully!");
      }
      router.push("/employer/my-jobs");
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save job");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: "Job Basics", icon: Briefcase },
    { num: 2, title: "Compensation & Job Type", icon: DollarSign },
    { num: 3, title: "Candidate Requirements", icon: Users },
    { num: 4, title: "Description & Responsibilities", icon: FileText },
    { num: 5, title: "About Company", icon: Building2 },
    { num: 6, title: "FAQ", icon: HelpCircle },
  ];

  // Shared preview card — used in both the sidebar (desktop) and the bottom sheet (mobile)
  const previewCard = (
    <div className="space-y-4">
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-[#edf2f7]0 rounded-full" />
        <span className="text-sm font-medium text-gray-700">Live Preview</span>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-[#1e3a5f] text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
          {formData.companyName.slice(0, 2).toUpperCase() || "CO"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {formData.companyName || "Your Company"}
          </p>
          <p className="text-sm text-gray-500">
            {formData.location || "Location not set"}
          </p>
        </div>
      </div>

      {/* Title */}
      <div>
        <p
          className={`font-semibold ${formData.title ? "text-gray-900" : "text-gray-400 italic"}`}
        >
          {formData.title || "Your job title here"}
        </p>
        <p className="text-sm text-gray-500 capitalize">
          {formData.department}
        </p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className="px-2 py-1 bg-blue-100 text-[#1e3a5f] rounded text-xs font-medium">
          {formData.employmentType === "fullTime"
            ? "Full Time"
            : formData.employmentType === "partTime"
              ? "Part Time"
              : formData.employmentType === "contract"
                ? "Contract"
                : "Internship"}
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
          {formData.jobType}
        </span>
        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
          {formData.workShift === "day"
            ? "Day Shift"
            : formData.workShift === "night"
              ? "Night Shift"
              : formData.workShift === "rotating"
                ? "Rotating"
                : "Flexible"}
        </span>
      </div>
      <p className="text-sm text-gray-500">
        {formData.experienceLevel === "fresher"
          ? "Fresher"
          : `${formData.experienceLevel} Years`}
      </p>

      {/* Completion */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700">Completion</span>
          <span className="text-sm font-semibold text-[#1e3a5f]">
            {Math.round((currentStep / 6) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#1e3a5f] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
        <ul className="mt-3 space-y-1.5 text-sm">
          {[
            { label: "Job title", done: !!formData.title },
            { label: "Location / Area", done: !!formData.location },
            { label: "Salary set", done: !!formData.salaryMax },
            { label: "Job vacancy set", done: currentStep >= 2 },
            { label: "Job role defined", done: !!formData.jobRole },
            {
              label: "Description added",
              done: formData.description.length >= 20,
            },
            {
              label: "Responsibilities (50+ chars)",
              done: formData.responsibilities.length >= 50,
            },
            { label: "Skills added", done: formData.skills.length > 0 },
          ].map(({ label, done }) => (
            <li key={label} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? "bg-[#edf2f7]0" : "bg-gray-300"}`}
              />
              <span className={done ? "text-gray-900" : "text-gray-400"}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Mobile bottom-sheet preview overlay ───────────────────────── */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPreviewOpen(false)}
          />
          {/* Sheet */}
          <div className="relative bg-white rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <span className="font-semibold text-gray-900">Live Preview</span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4">{previewCard}</div>
          </div>
        </div>
      )}

      <div className="flex gap-8 items-start">
        {/* ── Main Form ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editJobId ? "Edit Job" : "Post a Job"}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {editJobId
                    ? "Modify the details of your job listing below"
                    : "Fill in all details to attract the right candidates"}
                </p>
                {!editJobId && formData.companyName && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Posting as{" "}
                    <span className="font-medium text-[#1e3a5f]">
                      {formData.companyName}
                    </span>
                  </p>
                )}
              </div>
              {/* Preview button — mobile only; desktop sees the sidebar */}
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 flex-shrink-0"
              >
                <Eye size={15} />
                Preview
              </button>
            </div>

            {/* Step Indicator */}
            <div className="pb-4 border-b border-gray-200">
              <StepIndicator
                steps={steps}
                currentStep={currentStep}
                onStepClick={(n) => setCurrentStep(n)}
              />
            </div>
            {/* Step 1: Job Basics */}
            {currentStep === 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Job Basics
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div>
                    <Input
                      label="Job Title *"
                      placeholder="e.g. Senior React Developer"
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area / Location *
                    </label>
                    <div className="relative">
                      <MapPin
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder="e.g. Bangalore, Karnataka"
                        value={formData.location}
                        onChange={(e) =>
                          updateField("location", e.target.value)
                        }
                        required
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        updateField("department", e.target.value)
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => updateField("category", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                      required
                    >
                      {jobCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Input
                      label="Job Role"
                      placeholder="e.g. Frontend Developer, Sales Executive"
                      value={formData.jobRole}
                      onChange={(e) => updateField("jobRole", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Step 2: Compensation & Job Type */}
            {currentStep === 2 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Compensation & Job Type
                  </h3>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Salary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Salary (₹)
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">₹</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={formData.salaryMin}
                          onChange={(e) =>
                            updateField("salaryMin", e.target.value)
                          }
                          className="w-32 sm:w-40 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] text-sm"
                        />
                      </div>
                      <span className="text-gray-500 hidden sm:inline">to</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 sm:hidden">to ₹</span>
                        <span className="text-gray-500 hidden sm:inline">
                          ₹
                        </span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={formData.salaryMax}
                          onChange={(e) =>
                            updateField("salaryMax", e.target.value)
                          }
                          className="w-32 sm:w-40 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:flex gap-2">
                      {(
                        ["monthly", "annual", "hourly", "project"] as const
                      ).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateField("salaryType", type)}
                          className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            formData.salaryType === type
                              ? "bg-[#1e3a5f] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {type === "monthly"
                            ? "Monthly"
                            : type === "annual"
                              ? "Annual"
                              : type === "hourly"
                                ? "Hourly"
                                : "Project"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Job Vacancy */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Vacancy *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.jobVacancy}
                      onChange={(e) =>
                        updateField("jobVacancy", e.target.value)
                      }
                      className="w-24 sm:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f]"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Number of positions to fill.
                    </p>
                  </div>
                  {/* Job Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Job Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          value: "office",
                          label: "Office",
                          icon: Building2,
                          color: "blue",
                        },
                        {
                          value: "field",
                          label: "Field",
                          icon: MapPin,
                          color: "red",
                        },
                        {
                          value: "hybrid",
                          label: "Hybrid",
                          icon: Users,
                          color: "green",
                        },
                      ].map((option) => {
                        const Icon = option.icon;
                        const isSelected = formData.jobType === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateField("jobType", option.value)}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-3 rounded-lg border transition-all text-sm ${
                              isSelected
                                ? option.color === "blue"
                                  ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                                  : option.color === "red"
                                    ? "bg-red-500 text-white border-red-500"
                                    : "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <Icon size={16} />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Project Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Duration
                    </label>
                    <select
                      value={formData.projectDuration}
                      onChange={(e) =>
                        updateField("projectDuration", e.target.value)
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f]"
                    >
                      {projectDurations.map((duration) => (
                        <option key={duration} value={duration}>
                          {duration}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employment Type & Work Shift */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Employment Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {
                            value: "fullTime",
                            label: "Full Time",
                            color: "blue",
                          },
                          {
                            value: "partTime",
                            label: "Part Time",
                            color: "gray",
                          },
                          {
                            value: "contract",
                            label: "Contract",
                            color: "gray",
                          },
                          {
                            value: "internship",
                            label: "Internship",
                            color: "gray",
                          },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              updateField("employmentType", option.value)
                            }
                            className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                              formData.employmentType === option.value
                                ? option.color === "blue"
                                  ? "bg-[#1e3a5f] text-white"
                                  : "bg-gray-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Work Shift
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "day", label: "Day", color: "orange" },
                          { value: "night", label: "Night", color: "gray" },
                          {
                            value: "rotating",
                            label: "Rotating",
                            color: "gray",
                          },
                          {
                            value: "flexible",
                            label: "Flexible",
                            color: "gray",
                          },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              updateField("workShift", option.value)
                            }
                            className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                              formData.workShift === option.value
                                ? option.color === "orange"
                                  ? "bg-orange-500 text-white"
                                  : "bg-gray-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Candidate Requirements */}
            {currentStep === 3 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Candidate Requirements
                  </h3>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Experience Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Experience Required
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {[
                        { value: "fresher", label: "Fresher" },
                        { value: "0-1", label: "0-1 Years" },
                        { value: "1-2", label: "1-2 Years" },
                        { value: "2-5", label: "2-5 Years" },
                        { value: "5-10", label: "5-10 Years" },
                        { value: "10+", label: "10+ Years" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            updateField("experienceLevel", option.value)
                          }
                          className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            formData.experienceLevel === option.value
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Education & Gender */}
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Education
                      </label>
                      <select
                        value={formData.education}
                        onChange={(e) =>
                          updateField("education", e.target.value)
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f]"
                      >
                        <option value="any">Any</option>
                        <option value="highSchool">High School</option>
                        <option value="bachelor">Bachelor's Degree</option>
                        <option value="master">Master's Degree</option>
                        <option value="phd">PhD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Gender Preference
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            value: "any",
                            label: "Any",
                            icon: User,
                            color: "purple",
                          },
                          {
                            value: "male",
                            label: "Male",
                            icon: User,
                            color: "gray",
                          },
                          {
                            value: "female",
                            label: "Female",
                            icon: User,
                            color: "gray",
                          },
                        ].map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                updateField("genderPreference", option.value)
                              }
                              className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                formData.genderPreference === option.value
                                  ? option.color === "purple"
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-600 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              <Icon size={14} />
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Required Skills
                    </label>

                    {/* Predefined Skills */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                      {predefinedSkills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                            formData.skills.includes(skill)
                              ? "bg-[#1e3a5f] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>

                    {/* Custom skill input */}
                    <div className="flex flex-col gap-2 mb-4 sm:flex-row">
                      <input
                        type="text"
                        placeholder="Add a custom skill..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill(skillInput);
                          }
                        }}
                        className="min-w-0 w-full flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] text-sm"
                      />
                      <Button
                        type="button"
                        onClick={() => addSkill(skillInput)}
                        className="w-full shrink-0 bg-gray-800 hover:bg-gray-900 px-4 sm:w-auto"
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>

                    {/* Selected Skills */}
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="flex items-center gap-1 bg-blue-100 text-[#1e3a5f] rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="hover:text-blue-900"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Step 4: Description & Responsibilities */}
            {currentStep === 4 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center">
                    4
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Description & Responsibilities
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Job Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description *
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Provide an overview of the role and what makes this
                      opportunity exciting.
                    </p>
                    <textarea
                      rows={6}
                      placeholder="We are looking for a talented professional to join our team and help us build innovative solutions..."
                      value={formData.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  {/* Responsibilities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsibilities *
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      List specific duties and tasks the candidate will perform.
                    </p>
                    {/* Toolbar */}
                    <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <Bold size={16} className="text-gray-600" />
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <Italic size={16} className="text-gray-600" />
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <List size={16} className="text-gray-600" />
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <ListOrdered size={16} className="text-gray-600" />
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <Type size={16} className="text-gray-600" />
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <RotateCcw size={16} className="text-gray-600" />
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <RotateCw size={16} className="text-gray-600" />
                      </button>
                    </div>

                    {/* Editor */}
                    <textarea
                      rows={8}
                      placeholder="• Develop and maintain React-based web applications • Collaborate with designers to implement UI/UX • Write clean, scalable, and documented code • Participate in code reviews and agile ceremonies"
                      value={formData.responsibilities}
                      onChange={(e) =>
                        updateField("responsibilities", e.target.value)
                      }
                      className="w-full p-4 border-l border-r border-b border-gray-200 rounded-b-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none"
                      required
                    />

                    <p className="text-sm text-gray-500 mt-2">
                      Use the toolbar to format text with bold, lists, and
                      headings.
                      <span className="ml-8 text-gray-400">
                        {formData.responsibilities.length} chars
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: About Company — read-only, auto-filled from profile */}
            {currentStep === 5 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center">
                    5
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    About Company
                  </h3>
                </div>

                <div className="bg-[#edf2f7] border border-[#1e3a5f]/20 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-12 h-12 bg-[#1e3a5f] text-white rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {formData.companyName.slice(0, 2).toUpperCase() || "CO"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 break-words">
                        {formData.companyName || "—"}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5 break-words">
                        {formData.companyAddress || "No location set"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Posted by:{" "}
                        <span className="font-medium text-gray-700">
                          {formData.postedBy}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/employer/profile"
                    className="text-[#1e3a5f] text-sm font-medium hover:underline flex-shrink-0 self-start sm:self-auto"
                  >
                    Edit Profile →
                  </Link>
                </div>

                <p className="text-sm text-gray-500 mt-3">
                  This information is pulled from your{" "}
                  <Link
                    href="/employer/profile"
                    className="text-[#1e3a5f] hover:underline font-medium"
                  >
                    company profile
                  </Link>
                  . Update it there to reflect here.
                </p>
              </div>
            )}
            {/* Step 6: FAQ */}
            {currentStep === 6 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center">
                      6
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">FAQ</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Candidates often ask these questions
                  </p>
                </div>

                <div className="space-y-4">
                  {formData.faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                          Q{index + 1}
                        </label>
                        <button
                          type="button"
                          onClick={() => removeFAQ(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Is this a work-from-home position?"
                        value={faq.question}
                        onChange={(e) =>
                          updateFAQ(index, "question", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-[#1e3a5f]"
                      />

                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                          A
                        </label>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Type your answer here..."
                        value={faq.answer}
                        onChange={(e) =>
                          updateFAQ(index, "answer", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] resize-none"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addFAQ}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add FAQ
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="w-full sm:w-auto"
              >
                Back
              </Button>

              {currentStep < 6 ? (
                <Button
                  key="continue-btn"
                  type="button"
                  onClick={nextStep}
                  className="w-full sm:w-auto"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  key="submit-btn"
                  type="submit"
                  loading={loading}
                  className="bg-[#1e3a5f] hover:bg-[#152a45] w-full sm:w-auto"
                >
                  {editJobId ? "Save Changes" : "Post Job"}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* ── Live Preview Sidebar — desktop only ────────────────────── */}
        <div className="hidden lg:block w-80 flex-shrink-0 sticky top-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {previewCard}
          </div>
        </div>
      </div>
    </div>
  );
}
