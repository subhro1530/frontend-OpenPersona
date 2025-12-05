"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";
import NeonButton from "@/components/ui/NeonButton";
import Tag from "@/components/ui/Tag";
import api from "@/lib/api-client";
import { useToast } from "@/components/ui/ToastProvider";

/* ─────────────────────────────────────────────────────────── */
/* Profile card preview                                         */
/* ─────────────────────────────────────────────────────────── */
const ProfileCard = ({ profile }) => {
  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyber/5 to-aurora/5"
    >
      {/* Banner */}
      <div
        className="relative h-32"
        style={{
          background: profile.bannerUrl
            ? `url(${profile.bannerUrl}) center/cover`
            : "linear-gradient(135deg, #5c4dff 0%, #00f7ff 100%)",
        }}
      >
        {/* Avatar */}
        <div className="absolute -bottom-10 left-6">
          <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-night bg-white/10">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">
                👤
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-14">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">
              {profile.name || profile.handle}
            </h3>
            <p className="text-sm text-cyber">@{profile.handle}</p>
          </div>
          <Tag
            tone={
              profile.plan === "scale"
                ? "accent"
                : profile.plan === "growth"
                ? "success"
                : "neutral"
            }
          >
            {profile.plan || "free"}
          </Tag>
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm text-white/60">{profile.bio}</p>
        )}

        {profile.socialLinks?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/60 hover:bg-white/5"
              >
                {link.platform}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Dashboard preview                                            */
/* ─────────────────────────────────────────────────────────── */
const DashboardPreview = ({ dashboard }) => {
  if (!dashboard) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{dashboard.title}</h3>
          <p className="text-sm text-white/50">/{dashboard.slug}</p>
        </div>
        <Tag tone={dashboard.visibility === "public" ? "success" : "neutral"}>
          {dashboard.visibility}
        </Tag>
      </div>

      {dashboard.layout && (
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs text-white/40">Layout configuration</p>
          <pre className="mt-2 max-h-40 overflow-auto text-xs text-white/60">
            {JSON.stringify(dashboard.layout, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-white/50">
        {dashboard.createdAt && (
          <span>
            Created: {new Date(dashboard.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Plan preview                                                 */
/* ─────────────────────────────────────────────────────────── */
const PlanPreview = ({ planData }) => {
  if (!planData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-aurora/30 bg-aurora/5 p-6"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-aurora/20 text-3xl">
          💎
        </div>
        <div>
          <h3 className="text-xl font-bold text-white capitalize">
            {planData.plan || planData.name} Plan
          </h3>
          <p className="text-sm text-white/50">
            {planData.dashboardLimit || "Unlimited"} dashboards
          </p>
        </div>
      </div>

      {planData.features && (
        <div className="mt-4 grid gap-2">
          {planData.features.map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-white/70"
            >
              <span className="text-aurora">✓</span>
              {feature}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Share link generator                                         */
/* ─────────────────────────────────────────────────────────── */
const ShareLinks = ({ handle, dashboard }) => {
  const { notify } = useToast();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const links = [
    {
      label: "Profile",
      url: `${baseUrl}/p/${handle}`,
      icon: "👤",
    },
    {
      label: "Dashboard",
      url: `${baseUrl}/p/${handle}/${dashboard}`,
      icon: "📊",
    },
  ];

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    notify({ title: "Link copied to clipboard" });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/60">Shareable links</p>
      <div className="grid gap-3 md:grid-cols-2">
        {links.map((link) => (
          <div
            key={link.label}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <span className="text-xl">{link.icon}</span>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs text-white/50">{link.label}</p>
              <p className="truncate text-sm text-cyber">{link.url}</p>
            </div>
            <button
              onClick={() => copyLink(link.url)}
              className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/60 hover:bg-white/5"
            >
              Copy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Main component                                               */
/* ─────────────────────────────────────────────────────────── */
const PublicPreview = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [handle, setHandle] = useState("ava");
  const [plan, setPlan] = useState("growth");
  const [dashboard, setDashboard] = useState("hire-me");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "plan", label: "Plan", icon: "💎" },
  ];

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api.public.profile(handle);
      setPreview({ type: "profile", data });
      setActiveTab("profile");
    } catch (err) {
      notify({ title: "Public profile failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const data = await api.public.plan(handle, plan);
      setPreview({ type: "plan", data });
      setActiveTab("plan");
    } catch (err) {
      notify({ title: "Plan preview failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.public.dashboard(handle, dashboard);
      setPreview({ type: "dashboard", data });
      setActiveTab("dashboard");
    } catch (err) {
      notify({ title: "Dashboard preview failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Public catalog"
        title="Shareable profiles & dashboards"
        description="Preview and share public profiles, dashboards, and plan views."
      />

      {/* Input section */}
      <GlowCard className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs text-white/60">Handle</label>
            <input
              className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="username"
            />
          </div>
          <div>
            <label className="text-xs text-white/60">Plan</label>
            <select
              className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="free">Free</option>
              <option value="growth">Growth</option>
              <option value="scale">Scale</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/60">Dashboard slug</label>
            <input
              className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
              value={dashboard}
              onChange={(e) => setDashboard(e.target.value)}
              placeholder="hire-me"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <NeonButton onClick={fetchProfile} disabled={loading}>
            {loading ? "Loading..." : "Load profile"}
          </NeonButton>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="rounded-full border border-aurora/50 px-5 py-2 text-sm text-aurora transition hover:bg-aurora/10 disabled:opacity-50"
          >
            Load dashboard
          </button>
          <button
            onClick={fetchPlan}
            disabled={loading}
            className="rounded-full border border-cyber/50 px-5 py-2 text-sm text-cyber transition hover:bg-cyber/10 disabled:opacity-50"
          >
            Load plan view
          </button>
        </div>

        <ShareLinks handle={handle} dashboard={dashboard} />
      </GlowCard>

      {/* Preview section */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-8 w-8 rounded-full border-2 border-cyber border-t-transparent"
          />
        </div>
      ) : preview ? (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Visual preview */}
          <div className="space-y-4">
            <p className="text-sm text-white/60">Visual preview</p>
            <AnimatePresence mode="wait">
              {preview.type === "profile" && (
                <ProfileCard key="profile" profile={preview.data} />
              )}
              {preview.type === "dashboard" && (
                <DashboardPreview key="dashboard" dashboard={preview.data} />
              )}
              {preview.type === "plan" && (
                <PlanPreview key="plan" planData={preview.data} />
              )}
            </AnimatePresence>
          </div>

          {/* JSON preview */}
          <div className="space-y-4">
            <p className="text-sm text-white/60">JSON response</p>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/60">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                <div className="flex gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === "profile") fetchProfile();
                        else if (tab.id === "dashboard") fetchDashboard();
                        else fetchPlan();
                      }}
                      className={`rounded-lg px-3 py-1 text-xs transition ${
                        activeTab === tab.id
                          ? "bg-white/10 text-white"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(preview.data, null, 2)
                    );
                    notify({ title: "JSON copied" });
                  }}
                  className="text-xs text-white/50 hover:text-white"
                >
                  Copy
                </button>
              </div>
              <pre className="max-h-[400px] overflow-auto p-4 text-xs text-white/70">
                {JSON.stringify(preview.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <GlowCard className="py-16 text-center">
          <div className="text-4xl">🔍</div>
          <p className="mt-4 text-white/60">
            Enter a handle and load a preview to see public content.
          </p>
        </GlowCard>
      )}
    </div>
  );
};

export default PublicPreview;
