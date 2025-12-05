import { emitUnauthorized } from "./auth-events";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

/** Internal token store for auth header injection */
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("op_token", token);
  }
};

export const getAuthToken = () => {
  if (authToken) return authToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("op_token");
  }
  return null;
};

export const clearAuthToken = () => {
  authToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("op_token");
  }
};

const request = async (path, options = {}) => {
  const url = `${API_BASE}${path}`;
  const token = getAuthToken();
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: "include",
    ...options,
  };

  const res = await fetch(url, config);

  if (!res.ok) {
    const message = await safeJson(res);
    const err = new Error(message?.error || res.statusText || "Request failed");
    err.status = res.status;
    err.body = message;
    if (res.status === 401) {
      emitUnauthorized();
    }
    throw err;
  }

  if (res.status === 204) return null;

  return safeJson(res);
};

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch (err) {
    return null;
  }
};

export const api = {
  diagnostics: {
    health: () => request("/health"),
    root: () => request("/"),
    pulse: () => request("/api/diagnostics/pulse"),
    vibe: (intent) =>
      request("/api/diagnostics/vibe", {
        method: "POST",
        body: JSON.stringify({ intent }),
      }),
  },
  auth: {
    register: (payload) =>
      request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    registerAdmin: (payload) =>
      request("/api/auth/register/admin", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    login: (payload) =>
      request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    me: () => request("/api/auth/me"),
    upgradeAdmin: (payload) =>
      request("/api/auth/upgrade/admin", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
  profile: {
    get: () => request("/api/profile"),
    update: (payload) =>
      request("/api/profile", { method: "PUT", body: JSON.stringify(payload) }),
    updateHandle: (payload) =>
      request("/api/profile/handle", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    updateTemplate: (payload) =>
      request("/api/profile/template", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  },
  templates: {
    list: () => request("/api/templates"),
    admin: {
      list: () => request("/api/admin/templates"),
      create: (payload) =>
        request("/api/admin/templates", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
      update: (slug, payload) =>
        request(`/api/admin/templates/${slug}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        }),
    },
  },
  dashboards: {
    list: () => request("/api/dashboards"),
    create: (payload) =>
      request("/api/dashboards/create", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    detail: (id) => request(`/api/dashboards/${id}`),
    update: (id, payload) =>
      request(`/api/dashboards/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id) => request(`/api/dashboards/${id}`, { method: "DELETE" }),
  },
  files: {
    list: () => request("/api/files"),
    signedUrl: (id) => request(`/api/files/${id}/url`),
    remove: (id) => request(`/api/files/${id}`, { method: "DELETE" }),
    upload: async ({ file, category, dashboardSlug }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      if (dashboardSlug) formData.append("dashboardSlug", dashboardSlug);

      const token = getAuthToken();

      const res = await fetch(`${API_BASE}/api/files/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        const message = await safeJson(res);
        throw new Error(message?.error || "Upload failed");
      }

      return safeJson(res);
    },
  },
  resume: {
    list: () => request("/api/resume"),
    upload: (file) => {
      const formData = new FormData();
      formData.append("resume", file);
      const token = getAuthToken();
      return fetch(`${API_BASE}/api/resume/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).then((res) => {
        if (!res.ok) {
          return safeJson(res).then((data) => {
            throw new Error(data?.error || "Upload failed");
          });
        }
        return safeJson(res);
      });
    },
    signedUrl: (id) => request(`/api/resume/${id}/url`),
    analyze: (payload) =>
      request("/api/resume/analyze", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
  portfolio: {
    blueprint: () => request("/api/portfolio/blueprint"),
    status: () => request("/api/portfolio/status"),
    templates: () => request("/api/portfolio/templates"),
    draft: (payload) =>
      request("/api/portfolio/draft", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    save: (payload) =>
      request("/api/portfolio/save", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    publish: () =>
      request("/api/portfolio/publish", {
        method: "POST",
      }),
    enhance: (payload) =>
      request("/api/portfolio/enhance-text", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    deleteDashboard: (id) =>
      request(`/api/portfolio/dashboard/${id}`, { method: "DELETE" }),
  },
  support: {
    highlights: () => request("/api/support/highlights"),
    jobMatch: (payload) =>
      request("/api/support/job-match", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    copilot: (payload) =>
      request("/api/support/copilot", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
  agent: {
    insights: () => request("/api/agent/profile-insights"),
    generateDashboard: (payload) =>
      request("/api/agent/generate-dashboard", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    suggestions: (payload) =>
      request("/api/agent/suggestions", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
  billing: {
    plans: () => request("/api/billing/plans"),
  },
  admin: {
    users: () => request("/api/admin/users"),
    updatePlan: (userId, payload) =>
      request(`/api/admin/users/${userId}/plan`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    blockUser: (userId, payload) =>
      request(`/api/admin/users/${userId}/block`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    deleteUser: (userId) =>
      request(`/api/admin/users/${userId}`, { method: "DELETE" }),
  },
  public: {
    profile: (handle) => request(`/api/public/profile/${handle}`),
    plan: (handle, plan) =>
      request(`/api/public/profile/${handle}/plan/${plan}`),
    dashboard: (handle, slug) =>
      request(`/api/public/dashboards/${handle}/${slug}`),
  },
};

export default api;
