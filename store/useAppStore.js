import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAuthToken } from "@/lib/api-client";
import { subscribeUnauthorized } from "@/lib/auth-events";
import { normalizeDashboardsPayload } from "@/lib/dashboard-utils";

let unauthorizedSubscribed = false;

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth & Identity
      user: null,
      token: null,
      plan: null,
      isAdmin: false,

      // Data stores
      dashboards: [],
      templates: [],
      files: [],
      resumes: [],
      blueprint: null,
      portfolioStatus: null,
      highlights: null,
      insights: null,

      // UI State
      enhancerModal: false,
      enhancerPayload: null,
      sidebarCollapsed: false,
      activeTab: "overview",
      notifications: [],
      isLoading: {},

      // Auth actions
      setUser: (user) =>
        set((state) => ({
          user,
          plan: user?.plan || state.plan,
          isAdmin: user?.role === "admin" || user?.isAdmin === true,
        })),
      setToken: (token) => set({ token }),
      setPlan: (plan) => set({ plan }),
      logout: () => {
        clearAuthToken();
        set({
          user: null,
          token: null,
          plan: null,
          isAdmin: false,
          dashboards: [],
          files: [],
          resumes: [],
          blueprint: null,
        });
      },

      // Data actions
      setDashboards: (dashboards) =>
        set({ dashboards: normalizeDashboardsPayload(dashboards) }),
      addDashboard: (dashboard) =>
        set((state) => ({ dashboards: [...state.dashboards, dashboard] })),
      updateDashboard: (id, updates) =>
        set((state) => ({
          dashboards: state.dashboards.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),
      removeDashboard: (id) =>
        set((state) => ({
          dashboards: state.dashboards.filter((d) => d.id !== id),
        })),

      setTemplates: (templates) => set({ templates }),
      setFiles: (files) => set({ files }),
      addFile: (file) => set((state) => ({ files: [...state.files, file] })),
      removeFile: (id) =>
        set((state) => ({ files: state.files.filter((f) => f.id !== id) })),

      setResumes: (resumes) => set({ resumes }),
      addResume: (resume) =>
        set((state) => ({ resumes: [...state.resumes, resume] })),

      setBlueprint: (blueprint) => set({ blueprint }),
      setPortfolioStatus: (portfolioStatus) => set({ portfolioStatus }),
      setHighlights: (highlights) => set({ highlights }),
      setInsights: (insights) => set({ insights }),

      // UI actions
      openEnhancer: (payload) =>
        set({ enhancerModal: true, enhancerPayload: payload || null }),
      closeEnhancer: () => set({ enhancerModal: false, enhancerPayload: null }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setActiveTab: (activeTab) => set({ activeTab }),

      // Loading states
      setLoading: (key, value) =>
        set((state) => ({ isLoading: { ...state.isLoading, [key]: value } })),
      isLoadingKey: (key) => get().isLoading[key] || false,

      // Notifications
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { id: crypto.randomUUID(), ...notification },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),

      // Computed
      dashboardCount: () => get().dashboards.length,
      planLimit: () => {
        const plan = get().plan;
        if (!plan) return 1;
        const key = plan.name?.toLowerCase() || plan;
        if (key === "scale" || key === "scale-250") return Infinity;
        if (key === "growth" || key === "growth-149") return 5;
        return 1;
      },
      canCreateDashboard: () => {
        const count = get().dashboards.length;
        const limit = get().planLimit();
        return count < limit;
      },
    }),
    {
      name: "openpersona-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        plan: state.plan,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

export default useAppStore;

if (typeof window !== "undefined" && !unauthorizedSubscribed) {
  unauthorizedSubscribed = true;
  subscribeUnauthorized(() => {
    const { logout, addNotification } = useAppStore.getState();
    logout();
    try {
      addNotification({
        title: "Session expired",
        message: "Please login again to continue.",
      });
    } catch (err) {
      console.warn("Failed to dispatch session notification", err);
    }
    if (!window.location.pathname.startsWith("/app/login")) {
      window.location.href = "/app/login?session=expired";
    }
  });
}
