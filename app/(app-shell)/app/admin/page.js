import AdminConsole from "@/components/admin/AdminConsole";
import SectionHeader from "@/components/ui/SectionHeader";

const AdminPage = () => (
  <div className="space-y-8">
    <SectionHeader eyebrow="Admin" title="User directory" />
    <AdminConsole />
  </div>
);

export default AdminPage;
