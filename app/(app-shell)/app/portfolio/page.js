import PortfolioBuilder from "@/components/portfolio/PortfolioBuilder";
import SectionHeader from "@/components/ui/SectionHeader";

const PortfolioPage = () => (
  <div className="space-y-10">
    <SectionHeader
      eyebrow="Builder"
      title="Blueprint + drafts + composer"
      description="Blend AI with craft."
    />
    <PortfolioBuilder />
  </div>
);

export default PortfolioPage;
