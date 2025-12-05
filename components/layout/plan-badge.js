import { Badge } from "../primitives/Badge";

const planCopy = {
  free: { label: "Free", desc: "1 dashboard", tone: "info" },
  growth: { label: "Growth 149", desc: "Up to 5 dashboards", tone: "success" },
  scale: { label: "Scale 250", desc: "Unlimited dashboards", tone: "success" },
};

const PlanBadge = ({ plan }) => {
  const key = typeof plan === "string" ? plan.toLowerCase() : "free";
  const meta = planCopy[key] || {
    label: "Unknown",
    desc: "Sync to refresh",
    tone: "warn",
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">
            Plan
          </p>
          <p className="text-lg font-semibold text-white">{meta.label}</p>
          <p className="text-xs text-white/60">{meta.desc}</p>
        </div>
        <Badge tone={meta.tone}>active</Badge>
      </div>
    </div>
  );
};

export default PlanBadge;
