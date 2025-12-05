"use client";

import AppNav from "./AppNav";
import PlanBadge from "./plan-badge";
import { ProfileSummary } from "./profile-summary";
import ThemeToggle from "./ThemeToggle";
import useAppStore from "@/store/useAppStore";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const logout = useAppStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/app/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-pulse/30 bg-pulse/5 px-4 py-3 text-sm font-medium text-pulse transition hover:border-pulse/50 hover:bg-pulse/10"
    >
      <span>🚪</span>
      <span>Logout</span>
    </button>
  );
};

const WorkspaceShell = ({ children, user, plan, isAdmin }) => (
  <div className="grid h-screen grid-cols-1 gap-0 bg-night/90 lg:grid-cols-[280px,1fr]">
    <aside className="relative flex h-screen flex-col overflow-hidden border-r border-white/5">
      <div className="gradient-ring absolute inset-0 opacity-40" />
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden px-6 py-8">
        <div className="shrink-0">
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">
            OpenPersona
          </p>
          <h1 className="text-2xl font-semibold text-white">Identity OS</h1>
        </div>
        <div className="mt-6 shrink-0">
          <ProfileSummary user={user} />
        </div>
        <div className="mt-4 flex shrink-0 items-center justify-between gap-4">
          <div className="flex-1">
            <PlanBadge plan={plan} />
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-6 flex-1 overflow-y-auto overflow-x-hidden">
          <AppNav isAdmin={isAdmin} />
        </div>
        <div className="mt-4 shrink-0">
          <LogoutButton />
        </div>
      </div>
    </aside>
    <main className="relative z-10 h-screen overflow-y-auto overflow-x-hidden px-6 py-10">
      <div className="space-y-10 pb-16">{children}</div>
    </main>
  </div>
);

export default WorkspaceShell;
