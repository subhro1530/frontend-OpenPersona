import DashboardManager from "@/components/dashboards/DashboardManager";
import SectionHeader from "@/components/ui/SectionHeader";

const DashboardsPage = () => (
  <div className="space-y-8">
    <SectionHeader
      eyebrow="Dashboards"
      title="Create, update, delete"
      description="Plan-aware builder."
    />
    <DashboardManager />
  </div>
);

export default DashboardsPage;
