import AgentDeck from "@/components/agent/AgentDeck";
import SectionHeader from "@/components/ui/SectionHeader";

const AgentPage = () => (
  <div className="space-y-8">
    <SectionHeader
      eyebrow="Agents"
      title="Profile insights, dashboard designer, suggestions"
    />
    <AgentDeck />
  </div>
);

export default AgentPage;
