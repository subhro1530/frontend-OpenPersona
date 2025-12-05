import PublicPreview from "@/components/public/PublicPreview";
import SectionHeader from "@/components/ui/SectionHeader";

const PublicPage = () => (
  <div className="space-y-8">
    <SectionHeader eyebrow="Public" title="Share links & catalog" />
    <PublicPreview />
  </div>
);

export default PublicPage;
