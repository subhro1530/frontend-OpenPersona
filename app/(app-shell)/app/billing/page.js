import BillingPlans from "@/components/billing/BillingPlans";
import SectionHeader from "@/components/ui/SectionHeader";

const BillingPage = () => (
  <div className="space-y-8">
    <SectionHeader eyebrow="Billing" title="Plan matrix + upgrade" />
    <BillingPlans />
  </div>
);

export default BillingPage;
