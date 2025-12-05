import TemplatesShowcase from "@/components/templates/TemplatesShowcase";
import SectionHeader from "@/components/ui/SectionHeader";

const TemplatesPage = () => (
  <div className="space-y-8">
    <SectionHeader eyebrow="Templates" title="Switch visual systems" />
    <TemplatesShowcase />
  </div>
);

export default TemplatesPage;
