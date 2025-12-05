import AppNav from "./AppNav";
import PlanBadge from "./plan-badge";
import { ProfileSummary } from "./profile-summary";
import ThemeToggle from "./ThemeToggle";

const WorkspaceShell = ({ children, user, plan, isAdmin }) => (
  <div className="grid min-h-screen grid-cols-1 gap-6 bg-night/90 pb-16 lg:grid-cols-[280px,1fr]">
    <aside className="relative flex flex-col gap-6 px-6 py-8">
      <div className="gradient-ring absolute inset-0 opacity-40" />
      <div className="relative z-10 space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">
            OpenPersona
          </p>
          <h1 className="text-2xl font-semibold text-white">Identity OS</h1>
        </div>
        <ProfileSummary user={user} />
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <PlanBadge plan={plan} />
          </div>
          <ThemeToggle />
        </div>
        <AppNav isAdmin={isAdmin} />
      </div>
    </aside>
    <main className="relative z-10 space-y-10 px-6 py-10">{children}</main>
  </div>
);

export default WorkspaceShell;
