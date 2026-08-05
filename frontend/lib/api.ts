const API_BASE = "/api/proxy";

interface FetchOptions extends RequestInit {
  token?: string;
  skipCache?: boolean;
}

const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 60 seconds cache duration for instant page transitions

/** Manually clear the frontend API cache */
export function clearApiCache() {
  apiCache.clear();
}

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, headers, skipCache, ...rest } = options;
  const method = (options.method || "GET").toUpperCase();
  const isAuthenticatedRequest = Boolean(token);

  // Clear cache on write operations (POST, PATCH, PUT, DELETE)
  if (method !== "GET") {
    apiCache.clear();
  }

  // Authenticated requests are proxied with the session cookie and should not reuse public cache entries.
  const isCacheable = method === "GET" && !skipCache && !isAuthenticatedRequest;
  const cacheKey = endpoint;

  if (isCacheable) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as T;
    }
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "same-origin",
    headers: { ...defaultHeaders, ...(headers as Record<string, string>) },
    ...rest,
  });

  const contentType = res.headers.get("content-type");
  let data: any;

  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}: ${text.slice(0, 150)}`);
    }
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON response received from server");
    }
  }

  if (!res.ok) {
    throw new Error(data?.message || "API request failed");
  }

  if (isCacheable) {
    apiCache.set(cacheKey, { data, timestamp: Date.now() });
  }

  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: Record<string, unknown>) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (email: string, password: string) =>
    apiFetch<{ success: boolean; token: string; user: unknown }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  forgotPassword: (email: string, role?: string) =>
    apiFetch<{ success: boolean; message: string; otpCode?: string }>(
      "/auth/forgot-password",
      { method: "POST", body: JSON.stringify({ email, role }) }
    ),

  resetPassword: (body: { email: string; role?: string; token: string; newPassword: string }) =>
    apiFetch<{ success: boolean; message: string }>(
      "/auth/reset-password",
      { method: "POST", body: JSON.stringify(body) }
    ),

  getMe: (token: string) => apiFetch("/auth/me", { token }),

  updateMe: (token: string, body: Record<string, unknown>) =>
    apiFetch("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    }),

  changePassword: (
    token: string,
    currentPassword: string,
    newPassword: string
  ) =>
    apiFetch("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
      token,
    }),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const jobsApi = {
  getJobs: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/jobs${qs}`);
  },

  getJobById: (id: string) => apiFetch(`/jobs/${id}`),

  createJob: (token: string, body: Record<string, unknown>) =>
    apiFetch("/jobs", { method: "POST", body: JSON.stringify(body), token }),

  updateJob: (token: string, id: string, body: Record<string, unknown>) =>
    apiFetch(`/jobs/${id}`, { method: "PATCH", body: JSON.stringify(body), token }),

  deleteJob: (token: string, id: string) =>
    apiFetch(`/jobs/${id}`, { method: "DELETE", token }),

  getMyJobs: (token: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/jobs/employer/my-jobs${qs}`, { token });
  },

  getByIds: (ids: string[]) =>
    apiFetch("/jobs/by-ids", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),

  getEmployerStats: (token: string) =>
    apiFetch("/jobs/employer/stats", { token }),

  getJobseekerStats: (token: string) =>
    apiFetch("/jobs/jobseeker/stats", { token }),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasksApi = {
  getTasks: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/tasks${qs}`);
  },

  getTaskById: (id: string) => apiFetch(`/tasks/${id}`),

  createTask: (token: string, body: Record<string, unknown>) =>
    apiFetch("/tasks", { method: "POST", body: JSON.stringify(body), token }),

  updateTask: (token: string, id: string, body: Record<string, unknown>) =>
    apiFetch(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    }),

  deleteTask: (token: string, id: string) =>
    apiFetch(`/tasks/${id}`, { method: "DELETE", token }),

  getMyTasks: (token: string) =>
    apiFetch("/tasks/employer/my-tasks", { token }),

  claimTask: (token: string, taskId: string, message?: string, bidAmount?: number) =>
    apiFetch("/tasks/claims", {
      method: "POST",
      body: JSON.stringify({ taskId, message, bidAmount }),
      token,
    }),

  getMyClaims: (token: string) =>
    apiFetch("/tasks/claims/my", { token }),

  getTaskClaims: (token: string, taskId: string) =>
    apiFetch(`/tasks/claims/task/${taskId}`, { token }),

  updateClaimStatus: (
    token: string,
    id: string,
    status: "pending" | "approved" | "rejected" | "completed"
  ) =>
    apiFetch(`/tasks/claims/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    }),
};

// ─── Escrow ───────────────────────────────────────────────────────────────────

export const escrowApi = {
  getSummary: (token: string) =>
    apiFetch("/escrow/summary", { token }),

  deposit: (token: string, amount: number) =>
    apiFetch("/escrow/deposit", {
      method: "POST",
      body: JSON.stringify({ amount }),
      token,
    }),

  getTransactions: (token: string) =>
    apiFetch("/escrow/transactions", { token }),

  createRazorpayOrder: (token: string, amount: number, currency = "INR") =>
    apiFetch<{
      success: boolean;
      data: {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      };
    }>("/escrow/razorpay/create-order", {
      method: "POST",
      body: JSON.stringify({ amount, currency }),
      token,
    }),

  verifyRazorpayPayment: (
    token: string,
    payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      amount: number;
    }
  ) =>
    apiFetch<{
      success: boolean;
      message: string;
      data: {
        paymentId: string;
        orderId: string;
        escrowBalance: number;
        walletBalance: number;
      };
    }>("/escrow/razorpay/verify", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  withdraw: (
    token: string,
    payload: {
      amount: number;
      payoutMethod: string;
      upiId?: string;
      bankAccount?: string;
      ifscCode?: string;
    }
  ) =>
    apiFetch<{
      success: boolean;
      message: string;
      data: { walletBalance: number; escrowBalance: number; payoutRef: string };
    }>("/escrow/withdraw", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),
};


// ─── Applications ─────────────────────────────────────────────────────────────

export const applicationsApi = {
  apply: (token: string, jobId: string, coverLetter: string) =>
    apiFetch("/applications", {
      method: "POST",
      body: JSON.stringify({ jobId, coverLetter }),
      token,
    }),

  getMyApplications: (token: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/applications/my${qs}`, { token });
  },

  getJobApplications: (token: string, jobId: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/applications/job/${jobId}${qs}`, { token });
  },

  updateStatus: (token: string, id: string, status: "pending" | "shortlisted" | "accepted" | "rejected") =>
    apiFetch(`/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    }),
};

// ─── Hire Requests ────────────────────────────────────────────────────────────

export const hireRequestsApi = {
  create: (
    token: string,
    body: {
      jobseekerId: string;
      jobId?: string;
      hireType?: "job" | "freelance";
      salary: number;
      message?: string;
      projectTitle?: string;
      projectDescription?: string;
      projectSkills?: string[];
    }
  ) =>
    apiFetch("/hire-requests", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),

  getMy: (token: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/hire-requests/my${qs}`, { token });
  },

  getEmployerRequests: (token: string) =>
    apiFetch("/hire-requests/employer", { token }),

  updateStatus: (token: string, id: string, status: string) =>
    apiFetch(`/hire-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    }),

  withdraw: (token: string, id: string) =>
    apiFetch(`/hire-requests/${id}/withdraw`, {
      method: "POST",
      token,
    }),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  getUserById: (token: string, id: string) =>
    apiFetch(`/auth/users/${id}`, { token }),
};

// ─── Freelancers (public) ─────────────────────────────────────────────────────

export const freelancersApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params && Object.keys(params).length
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return apiFetch(`/auth/users${qs}`);
  },

  getById: (id: string) => apiFetch(`/auth/users/${id}`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  getStats: (token: string) =>
    apiFetch("/admin/stats", { token }),

  getRecentSignups: (token: string) =>
    apiFetch("/admin/recent-signups", { token }),

  // Users
  getUsers: (token: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/admin/users${qs}`, { token });
  },

  getUserDetail: (token: string, id: string) =>
    apiFetch(`/admin/users/${id}`, { token }),

  toggleUserStatus: (token: string, userId: string) =>
    apiFetch(`/admin/users/${userId}/toggle-status`, { method: "PATCH", token }),

  deleteUser: (token: string, id: string) =>
    apiFetch(`/admin/users/${id}`, { method: "DELETE", token }),

  // Jobs
  getAllJobs: (token: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/admin/jobs${qs}`, { token });
  },

  updateJobStatus: (token: string, jobId: string, status: string) =>
    apiFetch(`/admin/jobs/${jobId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    }),

  deleteJob: (token: string, id: string) =>
    apiFetch(`/admin/jobs/${id}`, { method: "DELETE", token }),

  // Tasks
  getAllTasks: (token: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/admin/tasks${qs}`, { token });
  },

  updateTaskStatus: (token: string, id: string, status: string) =>
    apiFetch(`/admin/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    }),

  // Applications
  getAllApplications: (token: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/admin/applications${qs}`, { token });
  },

  updateApplicationStatus: (token: string, id: string, status: string) =>
    apiFetch(`/admin/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    }),

  // Hire Requests
  getAllHireRequests: (token: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/admin/hire-requests${qs}`, { token });
  },

  updateHireRequestStatus: (token: string, id: string, status: string) =>
    apiFetch(`/admin/hire-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    }),

  // Analytics & logs
  getAnalytics: (token: string) =>
    apiFetch("/admin/analytics", { token }),

  getActivityLogs: (token: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/admin/activity-logs${qs}`, { token });
  },

  // Featured & Pin Toggles
  toggleJobFeatured: (token: string, id: string, data: { isFeatured?: boolean; isUrgent?: boolean }) =>
    apiFetch(`/admin/jobs/${id}/featured`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  toggleTaskFeatured: (token: string, id: string, data: { isFeatured?: boolean; isUrgent?: boolean }) =>
    apiFetch(`/admin/tasks/${id}/featured`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  toggleUserFeatured: (token: string, id: string, data: { isFeatured?: boolean }) =>
    apiFetch(`/admin/users/${id}/featured`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  // Verifications & Badges
  getVerifications: (token: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/admin/verifications${qs}`, { token });
  },

  updateUserVerification: (token: string, id: string, data: { isVerified?: boolean; verificationStatus?: string; verificationNote?: string }) =>
    apiFetch(`/admin/users/${id}/verify`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),
};

// ─── Contact Requests ─────────────────────────────────────────────────────────

export const contactApi = {
  // Public — submit contact form
  submit: (body: { name: string; email: string; phone?: string; inquiryType?: string; subject: string; message: string }) =>
    apiFetch("/contact", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Admin — list all contact requests
  getAll: (token: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/contact${qs}`, { token });
  },

  // Admin — update status / add note
  update: (token: string, id: string, data: { status?: string; adminNote?: string }) =>
    apiFetch(`/contact/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  // Admin — delete
  delete: (token: string, id: string) =>
    apiFetch(`/contact/${id}`, {
      method: "DELETE",
      token,
    }),
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messagesApi = {
  getOrCreateConversation: (
    token: string,
    body: { participantId: string; jobId?: string }
  ) =>
    apiFetch("/messages/conversations", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),

  getConversations: (token: string) =>
    apiFetch("/messages/conversations", { token }),

  getMessages: (token: string, convId: string) =>
    apiFetch(`/messages/conversations/${convId}/messages`, { token }),

  sendMessage: (token: string, convId: string, text: string) =>
    apiFetch(`/messages/conversations/${convId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
      token,
    }),

  markRead: (token: string, convId: string) =>
    apiFetch(`/messages/conversations/${convId}/read`, {
      method: "PATCH",
      token,
    }),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  getNotifications: (token: string) =>
    apiFetch("/notifications", { token }),

  markRead: (token: string, id: string) =>
    apiFetch(`/notifications/${id}/read`, {
      method: "PATCH",
      token,
    }),

  markAllRead: (token: string) =>
    apiFetch("/notifications/read-all", {
      method: "PATCH",
      token,
    }),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const reviewsApi = {
  create: (
    token: string,
    body: { revieweeId: string; rating: number; comment: string; taskId?: string; jobId?: string }
  ) =>
    apiFetch("/reviews", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),

  getUserReviews: (userId: string) =>
    apiFetch(`/reviews/user/${userId}`),
};

// ─── Work Updates ─────────────────────────────────────────────────────────────

import type { WorkRefType } from "@/types";

export const workUpdatesApi = {
  createPlan: (
    token: string,
    body: {
      refType: WorkRefType;
      refId: string;
      steps: Array<{
        title: string;
        estimatedDays: number;
        percentage?: number;
      }>;
    }
  ) =>
    apiFetch("/work-updates/plan", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),

  toggleStep: (
    token: string,
    body: {
      refType: WorkRefType;
      refId: string;
      stepId: string;
    }
  ) =>
    apiFetch("/work-updates/toggle-step", {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    }),

  post: (
    token: string,
    body: {
      refType: WorkRefType;
      refId: string;
      points: string[];
      note?: string;
    }
  ) =>
    apiFetch("/work-updates", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),

  getByRef: (token: string, refType: WorkRefType, refId: string) =>
    apiFetch(`/work-updates?refType=${refType}&refId=${refId}`, { token }),

  markAllSeen: (token: string, refId: string) =>
    apiFetch("/work-updates/seen-all", {
      method: "PATCH",
      body: JSON.stringify({ refId }),
      token,
    }),

  getUnseenCount: (token: string) =>
    apiFetch("/work-updates/employer/unseen-count", { token }),
};
