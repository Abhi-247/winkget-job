"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { tasksApi } from "@/lib/api";
import {
  MapPin,
  Building2,
  DollarSign,
  Users,
  FileText,
  Plus,
  X,
  Eye,
  Check,
  Calendar,
} from "lucide-react";
import { StepIndicator } from "@/components/employer/StepIndicator";

type TaskType = "quick-fix" | "data-entry" | "content-writing" | "design" | "testing" | "research" | "other";

interface FormData {
  // Step 1: Basics & Budget
  title: string;
  category: string;
  taskType: TaskType;
  location: string;
  budget: string;
  deadline: string;
  maxClaims: string;

  // Step 2: Description & Skills
  description: string;
  deliverables: string;
  skills: string[];

  // Step 3: Company Info
  companyName: string;
  companyAddress: string;
  postedBy: string;
}

const predefinedSkills = [
  "React", "Next.js", "TypeScript", "Node.js", "Python", "Java", "Laravel", "MongoDB",
  "PostgreSQL", "AWS", "Docker", "Figma", "UI/UX", "Excel", "Communication", "Leadership",
  "Sales", "Marketing", "SEO"
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
  "Other"
];

const taskTypes = [
  { value: "quick-fix", label: "Quick Fix" },
  { value: "data-entry", label: "Data Entry" },
  { value: "content-writing", label: "Content Writing" },
  { value: "design", label: "Design Task" },
  { value: "testing", label: "Testing" },
  { value: "research", label: "Research" },
  { value: "other", label: "Other" }
];

export function TaskPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editTaskId = searchParams.get("edit");
  const { data: session } = useSession();
  const { success, error } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "Web Development",
    taskType: "other",
    location: "Remote",
    budget: "",
    deadline: "",
    maxClaims: "1",
    description: "",
    deliverables: "",
    skills: [],
    companyName: "",
    companyAddress: "",
    postedBy: session?.user?.name || ""
  });

  useEffect(() => {
    if (!editTaskId || !session?.user.accessToken) return;

    const fetchTaskToEdit = async () => {
      try {
        const res = await tasksApi.getTaskById(editTaskId) as { success: boolean; data: any };
        const task = res.data;
        if (task) {
          // Format deadline to yyyy-MM-dd for HTML input date
          const dateStr = task.deadline ? new Date(task.deadline).toISOString().substring(0, 10) : "";
          setFormData({
            title: task.title || "",
            category: task.category || "Web Development",
            taskType: task.taskType || "other",
            location: task.location || "Remote",
            budget: task.budget ? String(task.budget) : "",
            deadline: dateStr,
            maxClaims: task.maxClaims ? String(task.maxClaims) : "1",
            description: task.description || "",
            deliverables: task.deliverables || "",
            skills: task.skills || [],
            companyName: task.companyName || "",
            companyAddress: task.companyAddress || "",
            postedBy: task.postedBy || session?.user?.name || ""
          });
        }
      } catch (err) {
        error("Failed to load task details for editing");
      }
    };

    fetchTaskToEdit();
  }, [editTaskId, session, error]);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      updateField("skills", [...formData.skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    updateField("skills", formData.skills.filter(s => s !== skill));
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (currentStep !== 3) return;

    const nativeEvent = e.nativeEvent as SubmitEvent;
    const submitter = nativeEvent?.submitter;
    const activeEl = typeof document !== "undefined" ? document.activeElement : null;

    const isSubmitBtn = (submitter && submitter.getAttribute("type") === "submit") ||
                        (activeEl && activeEl.getAttribute("type") === "submit");

    if (!isSubmitBtn) {
      return;
    }

    if (!session?.user.accessToken) return;

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        budget: Number(formData.budget),
        maxClaims: Number(formData.maxClaims),
        deadline: new Date(formData.deadline)
      };

      if (editTaskId) {
        await tasksApi.updateTask(session.user.accessToken, editTaskId, taskData);
        success("Task updated successfully!");
      } else {
        await tasksApi.createTask(session.user.accessToken, taskData);
        success("Task posted successfully!");
      }
      router.push("/employer/my-tasks");
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: "Basics & Budget", icon: DollarSign },
    { num: 2, title: "Instructions & Skills", icon: FileText },
    { num: 3, title: "Company & Submit", icon: Building2 }
  ];

  const previewCard = (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-[#d4a017] rounded-full animate-ping" />
        <span className="text-sm font-medium text-gray-700">Live Task Preview</span>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-[#1e3a5f] text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
          {formData.companyName ? formData.companyName.slice(0, 2).toUpperCase() : "TK"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{formData.companyName || "Your Company"}</p>
          <p className="text-sm text-gray-500">{formData.location || "Remote"}</p>
        </div>
      </div>

      <div>
        <p className={`font-semibold ${formData.title ? "text-gray-900" : "text-gray-400 italic"}`}>
          {formData.title || "Your task title here"}
        </p>
        <p className="text-sm text-gray-500 capitalize">{formData.category}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-semibold uppercase">
          {formData.taskType}
        </span>
        <span className="px-2 py-1 bg-blue-100 text-[#1e3a5f] rounded text-xs font-medium">
          ₹{formData.budget || "Budget not set"}
        </span>
      </div>

      {formData.deadline && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar size={12} />
          Deadline: {new Date(formData.deadline).toLocaleDateString()}
        </p>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700">Completion</span>
          <span className="text-sm font-semibold text-[#1e3a5f]">{Math.round((currentStep / 3) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#1e3a5f] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
        <ul className="mt-3 space-y-1.5 text-sm">
          {[
            { label: "Task title", done: !!formData.title },
            { label: "Budget set", done: !!formData.budget },
            { label: "Deadline set", done: !!formData.deadline },
            { label: "Detailed instructions", done: formData.description.length >= 20 },
            { label: "Required skills added", done: formData.skills.length > 0 },
            { label: "Company name", done: !!formData.companyName }
          ].map(({ label, done }) => (
            <li key={label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? "bg-[#d4a017]" : "bg-gray-300"}`} />
              <span className={done ? "text-gray-900" : "text-gray-400"}>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {previewOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPreviewOpen(false)} />
          <div className="relative bg-white rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <span className="font-semibold text-gray-900">Live Task Preview</span>
              <button type="button" onClick={() => setPreviewOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4">{previewCard}</div>
          </div>
        </div>
      )}

      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editTaskId ? "Edit Task" : "Post a Task"}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {editTaskId
                    ? "Modify the details of your task below"
                    : "Post a short-term task or project for freelancers"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 flex-shrink-0"
              >
                <Eye size={15} />
                Preview
              </button>
            </div>

            <div className="pb-4 border-b border-gray-200">
              <StepIndicator
                steps={steps}
                currentStep={currentStep}
                onStepClick={(n) => setCurrentStep(n)}
              />
            </div>

            {/* Step 1: Basics & Budget */}
            {currentStep === 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Task Basics & Budget</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div>
                    <Input
                      label="Task Title *"
                      placeholder="e.g. Design a Landing Page banner, Data entry of 100 rows"
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => updateField("category", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                        required
                      >
                        {jobCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Task Type *
                      </label>
                      <select
                        value={formData.taskType}
                        onChange={(e) => updateField("taskType", e.target.value as TaskType)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                        required
                      >
                        {taskTypes.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Input
                        label="Location"
                        placeholder="e.g. Remote, Bangalore"
                        value={formData.location}
                        onChange={(e) => updateField("location", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Input
                        label="Fixed Budget (₹) *"
                        type="number"
                        placeholder="e.g. 5000"
                        value={formData.budget}
                        onChange={(e) => updateField("budget", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deadline *
                      </label>
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => updateField("deadline", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Max Claimants (Freelancers who can claim/work on this) *"
                      type="number"
                      min="1"
                      value={formData.maxClaims}
                      onChange={(e) => updateField("maxClaims", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Description & Skills */}
            {currentStep === 2 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Task Details & Skills</h3>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailed Instructions / Description *
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Describe exactly what needs to be done. Be as detailed as possible."
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deliverables
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. A Github repository link, a high-res PDF file, an Excel document"
                      value={formData.deliverables}
                      onChange={(e) => updateField("deliverables", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Required Skills
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
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

                    <div className="flex gap-2 mb-4">
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] text-sm"
                      />
                      <Button
                        type="button"
                        onClick={() => addSkill(skillInput)}
                        className="bg-gray-800 hover:bg-gray-900 px-4"
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>

                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="flex items-center gap-1 bg-blue-100 text-[#1e3a5f] rounded-full px-2.5 py-1 text-xs sm:text-sm"
                          >
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-900">
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

            {/* Step 3: Company & Review */}
            {currentStep === 3 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Company & Contact Info</h3>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Company/Organization Name *"
                    placeholder="Your company or team name"
                    value={formData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    required
                  />

                  <Input
                    label="Company Address"
                    placeholder="e.g. Building 12, Tech Park, City"
                    value={formData.companyAddress}
                    onChange={(e) => updateField("companyAddress", e.target.value)}
                  />

                  <Input
                    label="Posted By *"
                    placeholder="Your name"
                    value={formData.postedBy}
                    onChange={(e) => updateField("postedBy", e.target.value)}
                    required
                  />
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

              {currentStep < 3 ? (
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
                  {editTaskId ? "Save Changes" : "Post Task"}
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="hidden lg:block w-80 flex-shrink-0 sticky top-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {previewCard}
          </div>
        </div>
      </div>
    </div>
  );
}
