import SupportSuite from "@/components/support/SupportSuite";
import SectionHeader from "@/components/ui/SectionHeader";

const SupportPage = () => (
  <div className="space-y-8">
    <SectionHeader
      eyebrow="Support AI"
      title="Highlights, job match, copilot"
    />
    <SupportSuite />
  </div>
);

export default SupportPage;
