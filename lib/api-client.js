import { emitUnauthorized } from "./auth-events";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

/** Cookie helper functions for token persistence (7 days) */
const setCookie = (name, value, days = 7) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

const deleteCookie = (name) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

/** Internal token store for auth header injection */
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("op_token", token);
    setCookie("op_token", token, 7); // Store in cookie for 7 days
  }
};

export const getAuthToken = () => {
  if (authToken) return authToken;
  if (typeof window !== "undefined") {
    // Try localStorage first, then cookie
    const localToken = localStorage.getItem("op_token");
    if (localToken) return localToken;
    const cookieToken = getCookie("op_token");
    if (cookieToken) {
      // Sync to localStorage and memory
      localStorage.setItem("op_token", cookieToken);
      authToken = cookieToken;
      return cookieToken;
    }
  }
  return null;
};

export const clearAuthToken = () => {
  authToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("op_token");
    deleteCookie("op_token");
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
    downgradeAdmin: () =>
      request("/api/auth/downgrade/admin", {
        method: "POST",
      }),
    forgotPassword: (email) =>
      request("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token, newPassword) =>
      request("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      }),
    changePassword: (currentPassword, newPassword) =>
      request("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    requestVerification: () =>
      request("/api/auth/request-verification", { method: "POST" }),
    verifyEmail: (token) =>
      request("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token }),
      }),
    logout: () => request("/api/auth/logout", { method: "POST" }),
  },
  settings: {
    get: () => request("/api/settings"),
    update: (payload) =>
      request("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    updateNotifications: (payload) =>
      request("/api/settings/notifications", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    updatePrivacy: (payload) =>
      request("/api/settings/privacy", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    deleteAccount: (confirmPassword) =>
      request("/api/settings/account", {
        method: "DELETE",
        body: JSON.stringify({ confirmPassword }),
      }),
  },
  profile: {
    get: () => request("/api/profile"),
    update: (payload) =>
      request("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    updateHandle: (payload) =>
      request("/api/profile/handle", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  },
  links: {
    list: () => request("/api/links"),
    create: (payload) =>
      request("/api/links", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id, payload) =>
      request(`/api/links/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id) => request(`/api/links/${id}`, { method: "DELETE" }),
    reorder: (ids) =>
      request("/api/links/reorder", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
  },
  projects: {
    list: () => request("/api/projects"),
    get: (id) => request(`/api/projects/${id}`),
    create: (payload) =>
      request("/api/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id, payload) =>
      request(`/api/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id) => request(`/api/projects/${id}`, { method: "DELETE" }),
    reorder: (ids) =>
      request("/api/projects/reorder", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
  },
  experience: {
    list: () => request("/api/experience"),
    create: (payload) =>
      request("/api/experience", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id, payload) =>
      request(`/api/experience/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id) => request(`/api/experience/${id}`, { method: "DELETE" }),
    reorder: (ids) =>
      request("/api/experience/reorder", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
  },
  education: {
    list: () => request("/api/education"),
    create: (payload) =>
      request("/api/education", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id, payload) =>
      request(`/api/education/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id) => request(`/api/education/${id}`, { method: "DELETE" }),
    reorder: (ids) =>
      request("/api/education/reorder", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
  },
  certifications: {
    list: () => request("/api/certifications"),
    create: (payload) =>
      request("/api/certifications", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id, payload) =>
      request(`/api/certifications/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id) => request(`/api/certifications/${id}`, { method: "DELETE" }),
    reorder: (ids) =>
      request("/api/certifications/reorder", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
  },
  skills: {
    list: () => request("/api/skills"),
    create: (payload) =>
      request("/api/skills", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id, payload) =>
      request(`/api/skills/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id) => request(`/api/skills/${id}`, { method: "DELETE" }),
    reorder: (ids) =>
      request("/api/skills/reorder", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
  },
  socialLinks: {
    list: () => request("/api/social-links"),
    create: (payload) =>
      request("/api/social-links", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id, payload) =>
      request(`/api/social-links/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id) => request(`/api/social-links/${id}`, { method: "DELETE" }),
    reorder: (ids) =>
      request("/api/social-links/reorder", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
  },
  testimonials: {
    list: () => request("/api/testimonials"),
    create: (payload) =>
      request("/api/testimonials", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id, payload) =>
      request(`/api/testimonials/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id) => request(`/api/testimonials/${id}`, { method: "DELETE" }),
    reorder: (ids) =>
      request("/api/testimonials/reorder", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
  },
  notifications: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/notifications${query ? `?${query}` : ""}`);
    },
    markRead: (id) =>
      request(`/api/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () =>
      request("/api/notifications/read-all", { method: "PATCH" }),
    remove: (id) => request(`/api/notifications/${id}`, { method: "DELETE" }),
    clearAll: () => request("/api/notifications", { method: "DELETE" }),
  },
  analytics: {
    trackView: (dashboardId) =>
      request(`/api/analytics/${dashboardId}/track/view`, { method: "POST" }),
    trackClick: (dashboardId, linkId, linkUrl) =>
      request(`/api/analytics/${dashboardId}/track/click`, {
        method: "POST",
        body: JSON.stringify({ linkId, linkUrl }),
      }),
    getDashboard: (dashboardId, period = "7d") =>
      request(`/api/analytics/${dashboardId}/analytics?period=${period}`),
    getOverall: (period = "30d") =>
      request(`/api/analytics/analytics?period=${period}`),
    createShareLink: (dashboardId, options = {}) =>
      request(`/api/analytics/${dashboardId}/share`, {
        method: "POST",
        body: JSON.stringify(options),
      }),
    getByShareToken: (token) => request(`/api/analytics/share/${token}`),
    revokeShareLink: (dashboardId, shareId) =>
      request(`/api/analytics/${dashboardId}/share/${shareId}`, {
        method: "DELETE",
      }),
    duplicateDashboard: (dashboardId, newSlug) =>
      request(`/api/analytics/${dashboardId}/duplicate`, {
        method: "POST",
        body: JSON.stringify({ newSlug }),
      }),
    reorderDashboards: (order) =>
      request("/api/analytics/reorder", {
        method: "POST",
        body: JSON.stringify({ order }),
      }),
  },
  search: {
    profiles: (q, limit = 20) =>
      request(`/api/search/profiles?q=${encodeURIComponent(q)}&limit=${limit}`),
    content: (q, type) =>
      request(
        `/api/search/content?q=${encodeURIComponent(q)}${
          type ? `&type=${type}` : ""
        }`
      ),
    admin: (q, entity) =>
      request(
        `/api/search/admin?q=${encodeURIComponent(q)}${
          entity ? `&entity=${entity}` : ""
        }`
      ),
  },
  dataExport: {
    exportJson: () => request("/api/data/export?format=json"),
    exportCsv: () => request("/api/data/export?format=csv"),
    importData: (data, overwrite = false) =>
      request("/api/data/import", {
        method: "POST",
        body: JSON.stringify({ data, overwrite }),
      }),
  },
  templates: {
    list: () => request("/api/templates"),
    get: (slug) => request(`/api/templates/${slug}`),
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
    current: () => request("/api/dashboards/current"),
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
    fullSave: (id, payload) =>
      request(`/api/dashboards/${id}/save`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id) => request(`/api/dashboards/${id}`, { method: "DELETE" }),
    setTemplate: (id, templateId) =>
      request(`/api/dashboards/${id}/template`, {
        method: "PUT",
        body: JSON.stringify({ templateId }),
      }),
    setVisibility: (id, visibility) =>
      request(`/api/dashboards/${id}/visibility`, {
        method: "PUT",
        body: JSON.stringify({ visibility }),
      }),
    setSectionVisibility: (id, section, visible) =>
      request(`/api/dashboards/${id}/section-visibility`, {
        method: "PUT",
        body: JSON.stringify({ section, visible }),
      }),
    setPrimary: (id) =>
      request(`/api/dashboards/${id}/primary`, { method: "PUT" }),
    setImage: (id, imageType, imageUrl) =>
      request(`/api/dashboards/${id}/image`, {
        method: "PUT",
        body: JSON.stringify({ imageType, imageUrl }),
      }),
    // Skills
    addSkill: (id, payload) =>
      request(`/api/dashboards/${id}/skills`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateSkill: (id, skillId, payload) =>
      request(`/api/dashboards/${id}/skills/${skillId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    deleteSkill: (id, skillId) =>
      request(`/api/dashboards/${id}/skills/${skillId}`, { method: "DELETE" }),
    // Projects
    addProject: (id, payload) =>
      request(`/api/dashboards/${id}/projects`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateProject: (id, projectId, payload) =>
      request(`/api/dashboards/${id}/projects/${projectId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    deleteProject: (id, projectId) =>
      request(`/api/dashboards/${id}/projects/${projectId}`, {
        method: "DELETE",
      }),
    // Experiences
    addExperience: (id, payload) =>
      request(`/api/dashboards/${id}/experiences`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateExperience: (id, expId, payload) =>
      request(`/api/dashboards/${id}/experiences/${expId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    deleteExperience: (id, expId) =>
      request(`/api/dashboards/${id}/experiences/${expId}`, {
        method: "DELETE",
      }),
    // Education
    addEducation: (id, payload) =>
      request(`/api/dashboards/${id}/education`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateEducation: (id, eduId, payload) =>
      request(`/api/dashboards/${id}/education/${eduId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    deleteEducation: (id, eduId) =>
      request(`/api/dashboards/${id}/education/${eduId}`, { method: "DELETE" }),
    // Links
    addLink: (id, payload) =>
      request(`/api/dashboards/${id}/links`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateLink: (id, linkId, payload) =>
      request(`/api/dashboards/${id}/links/${linkId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    deleteLink: (id, linkId) =>
      request(`/api/dashboards/${id}/links/${linkId}`, { method: "DELETE" }),
    // Reorder
    reorder: (id, type, ids) =>
      request(`/api/dashboards/${id}/reorder`, {
        method: "POST",
        body: JSON.stringify({ type, ids }),
      }),
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
    subscription: () => request("/api/billing/subscription"),
    history: (limit = 20) => request(`/api/billing/history?limit=${limit}`),
    upgrade: (planTier, paymentMethod) =>
      request("/api/billing/upgrade", {
        method: "POST",
        body: JSON.stringify({ planTier, paymentMethod }),
      }),
    cancel: (reason) =>
      request("/api/billing/cancel", {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    getInvoice: (invoiceId) => request(`/api/billing/invoices/${invoiceId}`),
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
    profile: (handle) => request(`/api/public/@${handle}`),
    dashboard: (handle, slug) => request(`/api/public/@${handle}/${slug}`),
  },
};

export default api;
