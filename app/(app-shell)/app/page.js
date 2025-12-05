"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";
import NeonButton from "@/components/ui/NeonButton";
import Tag from "@/components/ui/Tag";
import api from "@/lib/api-client";
import {
  sanitizeHighlightsPayload,
  getHighlightDetail,
} from "@/lib/highlight-utils";
import { interpretReadiness, describeMissing } from "@/lib/readiness-utils";
import { normalizeDashboardsPayload } from "@/lib/dashboard-utils";
import useAppStore from "@/store/useAppStore";

/* ─────────────────────────────────────────────────────────── */
/* Stat card                                                    */
/* ─────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, color = "cyber", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-5"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-widest text-white/50">
          {label}
        </p>
        <p className={`mt-1 text-3xl font-bold text-${color}`}>{value}</p>
      </div>
      <div className={`text-3xl text-${color}/50`}>{icon}</div>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────── */
/* Quick action card                                            */
/* ─────────────────────────────────────────────────────────── */
const QuickAction = ({ href, icon, label, description }) => (
  <Link href={href}>
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyber/30 hover:bg-cyber/5"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyber/20 to-aurora/20 text-2xl">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-white group-hover:text-cyber">{label}</p>
        <p className="text-sm text-white/50">{description}</p>
      </div>
      <div className="text-white/30 group-hover:text-cyber">→</div>
    </motion.div>
  </Link>
);

/* ─────────────────────────────────────────────────────────── */
/* Dashboard mini card                                          */
/* ─────────────────────────────────────────────────────────── */
const DashboardMini = ({ dashboard, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20"
  >
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-aurora/20 text-lg">
        📊
      </div>
      <div>
        <p className="font-medium text-white">{dashboard.title}</p>
        <p className="text-xs text-white/50">/{dashboard.slug}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Tag tone={dashboard.visibility === "public" ? "success" : "neutral"}>
        {dashboard.visibility}
      </Tag>
      <Link
        href={`/app/dashboards`}
        className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/60 opacity-0 transition group-hover:opacity-100"
      >
        Edit
      </Link>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────── */
/* Activity item                                                */
/* ─────────────────────────────────────────────────────────── */
const ActivityItem = ({ activity, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-center gap-3 border-b border-white/5 py-3 last:border-0"
  >
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-sm">
      {activity.icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-white">{activity.text}</p>
      <p className="text-xs text-white/40">{activity.time}</p>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────── */
/* Highlight detail renderer                                   */
/* ─────────────────────────────────────────────────────────── */
const renderMomentDetail = (detail) => {
  if (detail === null || detail === undefined) return null;

  if (typeof detail === "string" || typeof detail === "number") {
    return <p className="text-sm text-white/60">{detail}</p>;
  }

  if (Array.isArray(detail)) {
    return (
      <ul className="list-disc pl-5 text-sm text-white/60">
        {detail.map((item, idx) => (
          <li key={idx}>
            {typeof item === "string"
              ? item
              : item?.label || JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof detail === "object") {
    const ready = Object.prototype.hasOwnProperty.call(detail, "ready")
      ? detail.ready
      : undefined;
    const missing = Array.isArray(detail.missing) ? detail.missing : [];
    const requirements = Array.isArray(detail.requirements)
      ? detail.requirements
      : [];
    const fallbackText =
      detail.summary || detail.description || JSON.stringify(detail, null, 2);

    return (
      <div className="space-y-2 text-sm text-white/60">
        {typeof ready !== "undefined" && (
          <p>
            Status:{" "}
            <span className={ready ? "text-aurora" : "text-pulse"}>
              {ready ? "Ready" : "Needs attention"}
            </span>
          </p>
        )}
        {missing.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-white/40">
              Missing
            </p>
            <ul className="list-disc pl-5 text-white/70">
              {missing.map((item, idx) => (
                <li key={idx}>
                  {typeof item === "string"
                    ? item
                    : item?.label || JSON.stringify(item)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {requirements.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-white/40">
              Requirements
            </p>
            <ul className="list-disc pl-5 text-white/70">
              {requirements.map((item, idx) => (
                <li key={idx}>
                  {typeof item === "string"
                    ? item
                    : item?.label || JSON.stringify(item)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {missing.length === 0 &&
          requirements.length === 0 &&
          typeof ready === "undefined" && (
            <pre className="overflow-x-auto rounded-2xl bg-black/30 p-3 text-xs text-white/60">
              {fallbackText}
            </pre>
          )}
      </div>
    );
  }

  return <p className="text-sm text-white/60">{String(detail)}</p>;
};

/* ─────────────────────────────────────────────────────────── */
/* Main component                                               */
/* ─────────────────────────────────────────────────────────── */
const OverviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dashboards: 0,
    sections: 0,
    insights: 0,
    files: 0,
  });
  const [dashboards, setDashboards] = useState([]);
  const [highlights, setHighlights] = useState(null);
  const [highlightsError, setHighlightsError] = useState(null);
  const [portfolioStatus, setPortfolioStatus] = useState(null);
  const user = useAppStore((s) => s.user);
  const readinessInfo = interpretReadiness(portfolioStatus?.readiness);
  const readinessMissing = describeMissing(readinessInfo.missing);

  useEffect(() => {
    const load = async () => {
      try {
        const [blueprint, hl, dashes, status, files] = await Promise.all([
          api.portfolio.blueprint().catch(() => null),
          api.support.highlights().catch(() => null),
          api.dashboards.list().catch(() => []),
          api.portfolio.status().catch(() => null),
          api.files.list().catch(() => []),
        ]);

        const normalizedDashboards = normalizeDashboardsPayload(dashes);
        setDashboards(normalizedDashboards);
        const sanitizedHighlights = sanitizeHighlightsPayload(hl);
        setHighlights(sanitizedHighlights);
        setHighlightsError(
          sanitizedHighlights
            ? null
            : "AI highlights offline. Check Gemini API access."
        );
        setPortfolioStatus(status);
        setStats({
          dashboards: normalizedDashboards.length,
          sections: blueprint?.sections?.length || 0,
          insights: sanitizedHighlights?.talkingPoints?.length || 0,
          files: files?.length || 0,
        });
      } catch (err) {
        console.error("Overview load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Dynamic activity based on actual data
  const generateActivities = () => {
    const items = [];
    if (dashboards.length > 0) {
      const latest = dashboards[0];
      items.push({
        icon: "📊",
        text: `Dashboard active: ${latest.title || latest.slug}`,
        time: "Active",
      });
    }
    if (stats.files > 0) {
      items.push({
        icon: "📄",
        text: `${stats.files} file${stats.files > 1 ? "s" : ""} uploaded`,
        time: "Ready",
      });
    }
    if (highlights?.talkingPoints?.length > 0) {
      items.push({
        icon: "✨",
        text: `${highlights.talkingPoints.length} AI insights available`,
        time: "New",
      });
    }
    if (user?.handle) {
      items.push({
        icon: "🔗",
        text: `Public profile: @${user.handle}`,
        time: "Live",
      });
    }
    if (portfolioStatus?.readiness) {
      items.push({
        icon: readinessInfo.score >= 70 ? "🚀" : "📝",
        text: `Portfolio readiness: ${readinessInfo.score}%`,
        time: readinessInfo.status,
      });
    }
    // Add some helpful prompts if empty
    if (items.length === 0) {
      items.push(
        {
          icon: "👋",
          text: "Welcome! Start by completing your profile",
          time: "Get started",
        },
        {
          icon: "📊",
          text: "Create your first dashboard to showcase work",
          time: "Recommended",
        },
        { icon: "📄", text: "Upload a resume for AI analysis", time: "Try it" }
      );
    }
    return items;
  };

  const activities = generateActivities();

  const quickActions = [
    {
      href: "/app/portfolio",
      icon: "🎨",
      label: "Portfolio Builder",
      description: "Compose and publish your portfolio",
    },
    {
      href: "/app/resume",
      icon: "📄",
      label: "Resume Intelligence",
      description: "Upload and analyze resumes",
    },
    {
      href: "/app/dashboards",
      icon: "📊",
      label: "Dashboards",
      description: "Manage your public dashboards",
    },
    {
      href: "/app/agent",
      icon: "🤖",
      label: "AI Agent",
      description: "Get insights and suggestions",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-10 w-10 rounded-full border-2 border-cyber border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero section */}
      <GlowCard variant="hero" className="relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-6">
          <SectionHeader
            eyebrow="Mission control"
            title={`Welcome back${user?.name ? `, ${user.name}` : ""}`}
            description="Your OpenPersona command center. Build portfolios, analyze resumes, and manage dashboards."
            actions={
              <Link href="/app/portfolio" className="inline-flex">
                <NeonButton as="span">Open Builder</NeonButton>
              </Link>
            }
          />

          {/* Stats grid */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="Dashboards"
              value={stats.dashboards}
              icon="📊"
              delay={0}
            />
            <StatCard
              label="Sections"
              value={stats.sections}
              icon="📑"
              delay={0.1}
            />
            <StatCard
              label="AI insights"
              value={stats.insights}
              icon="💡"
              delay={0.2}
            />
            <StatCard label="Files" value={stats.files} icon="📁" delay={0.3} />
          </div>
        </div>

        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyber/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-aurora/10 blur-3xl" />
      </GlowCard>

      {/* Quick actions */}
      <section className="space-y-4">
        <SectionHeader
          title="Quick actions"
          description="Jump to the most used features"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <QuickAction key={action.href} {...action} />
          ))}
        </div>
      </section>

      {/* Main grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Dashboards */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <SectionHeader title="Active dashboards" />
            <Link
              href="/app/dashboards"
              className="text-sm text-cyber hover:underline"
            >
              View all →
            </Link>
          </div>
          {dashboards.length > 0 ? (
            <div className="space-y-3">
              {dashboards.slice(0, 4).map((dash, i) => (
                <DashboardMini key={dash.id} dashboard={dash} index={i} />
              ))}
            </div>
          ) : (
            <GlowCard className="py-12 text-center">
              <div className="text-4xl">📊</div>
              <p className="mt-4 text-white/60">No dashboards yet.</p>
              <Link href="/app/dashboards">
                <NeonButton className="mt-4">Create your first</NeonButton>
              </Link>
            </GlowCard>
          )}
        </div>

        {/* Activity feed */}
        <div className="space-y-4">
          <SectionHeader title="Recent activity" />
          <GlowCard className="space-y-1">
            {activities.map((activity, i) => (
              <ActivityItem key={i} activity={activity} index={i} />
            ))}
          </GlowCard>
        </div>
      </div>

      {/* Highlights section */}
      {highlights?.moments?.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            title="Momentum highlights"
            description="AI-powered insights from your profile"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.moments.map((moment, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlowCard className="space-y-3">
                  <Tag tone="positive">Moment</Tag>
                  <h3 className="text-lg font-semibold text-white">
                    {moment.title}
                  </h3>
                  {renderMomentDetail(getHighlightDetail(moment))}
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </section>
      )}
      {!highlights && highlightsError && (
        <GlowCard className="border border-white/10 bg-pulse/10 p-6 text-sm text-white/80">
          {highlightsError}
        </GlowCard>
      )}

      {/* Portfolio status */}
      {portfolioStatus && (
        <section className="space-y-4">
          <SectionHeader title="Portfolio status" />
          <GlowCard>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-white/50">Status</p>
                <Tag
                  tone={portfolioStatus.published ? "success" : "warning"}
                  className="mt-1"
                >
                  {portfolioStatus.published ? "Published" : "Draft"}
                </Tag>
              </div>
              {portfolioStatus.lastPublished && (
                <div>
                  <p className="text-xs text-white/50">Last published</p>
                  <p className="text-sm text-white">
                    {new Date(
                      portfolioStatus.lastPublished
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
              {portfolioStatus.readiness && (
                <div>
                  <p className="text-xs text-white/50">Readiness</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-cyber"
                        style={{ width: `${readinessInfo.percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60">
                      {readinessInfo.percent}%
                    </span>
                  </div>
                  {readinessMissing.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-xs text-white/60">
                      {readinessMissing.map((item) => (
                        <li key={item.id}>{item.label}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <Link href="/app/portfolio" className="ml-auto">
                <NeonButton>Go to builder</NeonButton>
              </Link>
            </div>
          </GlowCard>
        </section>
      )}
    </div>
  );
};

export default OverviewPage;
