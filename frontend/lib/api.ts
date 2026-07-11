const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, headers, ...rest } = options;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { ...defaultHeaders, ...(headers as Record<string, string>) },
    ...rest,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "API request failed");
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

  googleAuth: (idToken: string, role?: string) =>
    apiFetch("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken, role }),
    }),

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
    apiFetch(`/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    }),

  deleteJob: (token: string, id: string) =>
    apiFetch(`/jobs/${id}`, { method: "DELETE", token }),

  getMyJobs: (token: string) =>
    apiFetch("/jobs/employer/my-jobs", { token }),
};

// ─── Applications ─────────────────────────────────────────────────────────────

export const applicationsApi = {
  apply: (token: string, jobId: string, coverLetter: string) =>
    apiFetch("/applications", {
      method: "POST",
      body: JSON.stringify({ jobId, coverLetter }),
      token,
    }),

  getMyApplications: (token: string) =>
    apiFetch("/applications/my", { token }),

  getJobApplications: (token: string, jobId: string) =>
    apiFetch(`/applications/job/${jobId}`, { token }),

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
    body: { jobseekerId: string; jobId: string; salary: number; message?: string }
  ) =>
    apiFetch("/hire-requests", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),

  getMy: (token: string) => apiFetch("/hire-requests/my", { token }),

  getEmployerRequests: (token: string) =>
    apiFetch("/hire-requests/employer", { token }),

  updateStatus: (token: string, id: string, status: string) =>
    apiFetch(`/hire-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
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
  getStats: (token: string) => apiFetch("/admin/stats", { token }),

  getUsers: (token: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/admin/users${qs}`, { token });
  },

  toggleUserStatus: (token: string, userId: string) =>
    apiFetch(`/admin/users/${userId}/toggle-status`, {
      method: "PATCH",
      token,
    }),

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

  getRecentSignups: (token: string) =>
    apiFetch("/admin/recent-signups", { token }),
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
