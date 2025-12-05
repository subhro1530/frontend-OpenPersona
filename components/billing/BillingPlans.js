"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import NeonButton from "@/components/ui/NeonButton";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import api from "@/lib/api-client";
import { useToast } from "@/components/ui/ToastProvider";
import useAppStore from "@/store/useAppStore";

/* ─────────────────────────────────────────────────────────── */
/* Plan card                                                    */
/* ─────────────────────────────────────────────────────────── */
const PlanCard = ({ plan, current, onSelect }) => {
  const isCurrent = current === plan.name?.toLowerCase() || current === plan.id;
  const isPopular = plan.name?.toLowerCase().includes("growth");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-3xl border p-6 transition ${
        isCurrent
          ? "border-aurora bg-aurora/5"
          : isPopular
          ? "border-cyber bg-cyber/5"
          : "border-white/10 bg-white/5"
      }`}
    >
      {isPopular && !isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyber px-3 py-1 text-xs font-bold text-night">
          Popular
        </span>
      )}

      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            {plan.name || plan.label}
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">
              {plan.price === 0 ? "Free" : `₹${plan.price || plan.amount}`}
            </span>
            {plan.price > 0 && <span className="text-white/50">/mo</span>}
          </div>
        </div>

        <p className="text-sm text-white/70">{plan.description}</p>

        {/* Features */}
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm text-white/80">
            <span className="text-aurora">✓</span>
            {plan.dashboardLimit === -1 || plan.dashboardLimit === Infinity
              ? "Unlimited dashboards"
              : `${plan.dashboardLimit || 1} dashboard${
                  (plan.dashboardLimit || 1) > 1 ? "s" : ""
                }`}
          </li>
          {plan.features?.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 text-sm text-white/80"
            >
              <span className="text-aurora">✓</span>
              {feature}
            </li>
          ))}
        </ul>

        {isCurrent ? (
          <div className="flex items-center justify-center rounded-full border border-aurora/50 py-3 text-sm text-aurora">
            Current Plan
          </div>
        ) : (
          <NeonButton
            className="w-full justify-center"
            onClick={() => onSelect(plan)}
          >
            Upgrade
          </NeonButton>
        )}
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Upgrade modal                                                */
/* ─────────────────────────────────────────────────────────── */
const UpgradeModal = ({ plan, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(plan);
    setLoading(false);
  };

  if (!plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-night p-6"
      >
        <h2 className="text-xl font-semibold text-white">
          Upgrade to {plan.name}
        </h2>
        <p className="text-sm text-white/70">
          You're about to upgrade to the {plan.name} plan at ₹
          {plan.price || plan.amount}/month.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-widest text-white/50">
            What you'll get
          </p>
          <ul className="mt-2 space-y-1 text-sm text-white/80">
            <li>• {plan.dashboardLimit || "Unlimited"} dashboards</li>
            {plan.features?.map((f, i) => (
              <li key={i}>• {f}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <NeonButton onClick={handleConfirm} disabled={loading}>
            {loading ? "Processing..." : "Confirm Upgrade"}
          </NeonButton>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Main component                                               */
/* ─────────────────────────────────────────────────────────── */
const BillingPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const currentPlan = useAppStore((s) => s.plan);
  const setPlan = useAppStore((s) => s.setPlan);
  const { notify } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.billing.plans();
        // Normalize plan data
        const normalized = (Array.isArray(data) ? data : []).map((p) => ({
          ...p,
          price: p.price || p.amount || 0,
          dashboardLimit: p.dashboardLimit || p.limit || 1,
          features: p.features || [],
        }));
        setPlans(normalized);
      } catch (err) {
        notify({ title: "Plan fetch failed", message: err.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [notify]);

  const handleUpgrade = async (plan) => {
    try {
      // In a real app, this would integrate with a payment provider
      // For now, we'll just update the store
      setPlan({ name: plan.name, ...plan });
      notify({
        title: "Upgrade successful!",
        message: `You're now on the ${plan.name} plan`,
      });
      setSelectedPlan(null);
    } catch (err) {
      notify({ title: "Upgrade failed", message: err.message });
    }
  };

  const currentPlanKey = currentPlan?.name?.toLowerCase() || "free";

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Billing"
        title="Upgrade to unlock more power"
        description="Choose the plan that fits your identity needs. All plans include AI features."
      />

      {/* Current plan banner */}
      <GlowCard className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">
            Current plan
          </p>
          <p className="text-xl font-semibold text-white">
            {currentPlan?.name || "Free"}
          </p>
          {currentPlan?.dashboardLimit && (
            <p className="mt-1 text-sm text-white/60">
              {currentPlan.dashboardLimit === -1 ||
              currentPlan.dashboardLimit === Infinity
                ? "Unlimited dashboards"
                : `${currentPlan.dashboardLimit} dashboard limit`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Tag tone="positive">{currentPlan ? "Active" : "Free tier"}</Tag>
          {(!currentPlan || currentPlan?.name?.toLowerCase() === "free") && (
            <NeonButton
              onClick={() => {
                // Scroll to plans
                const plansGrid = document.querySelector("[data-plans-grid]");
                plansGrid?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              🚀 Upgrade Now
            </NeonButton>
          )}
        </div>
      </GlowCard>

      {/* Plans grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-8 w-8 rounded-full border-2 border-cyber border-t-transparent"
          />
        </div>
      ) : (
        <div data-plans-grid className="grid gap-6 md:grid-cols-3">
          <AnimatePresence>
            {plans.map((plan, idx) => (
              <PlanCard
                key={plan.id || plan.name || idx}
                plan={plan}
                current={currentPlanKey}
                onSelect={setSelectedPlan}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* FAQ or info */}
      <GlowCard className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-white/50">
          Billing FAQ
        </p>
        <div className="space-y-3 text-sm text-white/70">
          <p>
            <strong className="text-white">How do I upgrade?</strong> Click the
            Upgrade button on your desired plan. Payment is processed securely
            via our payment partner.
          </p>
          <p>
            <strong className="text-white">Can I downgrade?</strong> Yes, you
            can downgrade at any time. Your extra dashboards will be archived
            until you upgrade again.
          </p>
          <p>
            <strong className="text-white">
              What payment methods are accepted?
            </strong>{" "}
            We accept all major credit cards and UPI for Indian users.
          </p>
        </div>
      </GlowCard>

      {/* Upgrade modal */}
      {selectedPlan && (
        <UpgradeModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onConfirm={handleUpgrade}
        />
      )}
    </div>
  );
};

export default BillingPlans;
