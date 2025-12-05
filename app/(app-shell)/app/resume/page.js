import ResumeIntelligence from "@/components/resume/ResumeIntelligence";
import SectionHeader from "@/components/ui/SectionHeader";

const ResumePage = () => (
  <div className="space-y-8">
    <SectionHeader
      eyebrow="Resume intelligence"
      title="Upload, analyze, push to builder"
    />
    <ResumeIntelligence />
  </div>
);

export default ResumePage;
