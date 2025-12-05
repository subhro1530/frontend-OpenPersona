import WorkspaceShell from "@/components/layout/WorkspaceShell";
import api from "@/lib/api-client";

export const dynamic = "force-dynamic";

const fetchBootstrap = async () => {
  try {
    const me = await api.auth.me();
    return { me };
  } catch (error) {
    return { me: null };
  }
};

const AppLayout = async ({ children }) => {
  const bootstrap = await fetchBootstrap();
  const identity = bootstrap?.me?.user || bootstrap?.me;
  const plan = bootstrap?.me?.plan || identity?.plan || "Free";
  const isAdmin = (bootstrap?.me?.role || identity?.role) === "admin";

  return (
    <WorkspaceShell user={identity} plan={plan} isAdmin={isAdmin}>
      {children}
    </WorkspaceShell>
  );
};

export default AppLayout;
