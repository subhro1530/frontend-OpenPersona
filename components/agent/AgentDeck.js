"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import NeonButton from "@/components/ui/NeonButton";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import api from "@/lib/api-client";
import { useToast } from "@/components/ui/ToastProvider";

/* ─────────────────────────────────────────────────────────── */
/* Insight card                                                 */
/* ─────────────────────────────────────────────────────────── */
const InsightCard = ({ insight, index }) => {
  const icons = ["🎯", "💡", "📊", "🚀", "✨", "🔮"];
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-start gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-4"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber/20 text-xl">
        {icons[index % icons.length]}
      </div>
      <div className="flex-1">
        <p className="font-medium text-white">
          {insight.title || insight.type}
        </p>
        <p className="mt-1 text-sm text-white/60">
          {insight.description || insight.content}
        </p>
        {insight.score && (
          <div className="mt-2">
            <Tag tone={insight.score > 70 ? "success" : "warning"}>
              Score: {insight.score}
            </Tag>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Layout preview                                               */
/* ─────────────────────────────────────────────────────────── */
const LayoutPreview = ({ layout }) => {
  if (!layout?.sections?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-cyber/30 bg-cyber/5 p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold text-cyber">Generated layout preview</p>
        <Tag tone="accent">AI-generated</Tag>
      </div>

      <div className="grid gap-3">
        {layout.sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aurora/20 text-sm font-bold text-aurora">
              {i + 1}
            </div>
            <p className="text-sm text-white">{section}</p>
          </motion.div>
        ))}
      </div>

      {layout.style && (
        <div className="mt-4 flex gap-2">
          <Tag tone="neutral">{layout.style}</Tag>
          {layout.colorScheme && <Tag tone="neutral">{layout.colorScheme}</Tag>}
        </div>
      )}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Suggestion pill                                              */
/* ─────────────────────────────────────────────────────────── */
const SuggestionPill = ({ suggestion, index, onApply }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20"
  >
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-aurora/20 text-sm">
        💬
      </div>
      <p className="text-sm text-white">
        {typeof suggestion === "string" ? suggestion : suggestion.text}
      </p>
    </div>
    <button
      onClick={() => onApply(suggestion)}
      className="rounded-full border border-cyber/50 px-3 py-1 text-xs text-cyber transition hover:bg-cyber/10"
    >
      Apply
    </button>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────── */
/* Main component                                               */
/* ─────────────────────────────────────────────────────────── */
const AgentDeck = () => {
  const [activeTab, setActiveTab] = useState("insights");
  const [insights, setInsights] = useState([]);
  const [dashboardIdea, setDashboardIdea] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [suggestSubject, setSuggestSubject] = useState("");
  const [suggestData, setSuggestData] = useState("");
  const [loading, setLoading] = useState({
    insights: false,
    dashboard: false,
    suggestions: false,
  });
  const { notify } = useToast();

  const tabs = [
    { id: "insights", label: "Profile insights", icon: "📊" },
    { id: "dashboard", label: "Dashboard generator", icon: "🎨" },
    { id: "suggestions", label: "Smart suggestions", icon: "💡" },
  ];

  const runInsights = async () => {
    setLoading((l) => ({ ...l, insights: true }));
    try {
      const data = await api.agent.insights();
      const insightsArray = Array.isArray(data)
        ? data
        : data?.insights || [data];
      setInsights(insightsArray);
      notify({ title: "Insights synced" });
    } catch (err) {
      notify({ title: "Insights failed", message: err.message });
    } finally {
      setLoading((l) => ({ ...l, insights: false }));
    }
  };

  const generateDashboard = async () => {
    setLoading((l) => ({ ...l, dashboard: true }));
    try {
      const data = await api.agent.generateDashboard({
        subject,
        data: { priority: "case-study", notes },
      });
      setDashboardIdea(data);
      notify({ title: "Dashboard layout generated" });
    } catch (err) {
      notify({ title: "Dashboard idea failed", message: err.message });
    } finally {
      setLoading((l) => ({ ...l, dashboard: false }));
    }
  };

  const getSuggestions = async () => {
    setLoading((l) => ({ ...l, suggestions: true }));
    try {
      const data = await api.agent.suggestions({
        subject: suggestSubject,
        data: suggestData,
      });
      setSuggestions(data?.suggestions || data || []);
      notify({ title: "Suggestions received" });
    } catch (err) {
      notify({ title: "Suggestions failed", message: err.message });
    } finally {
      setLoading((l) => ({ ...l, suggestions: false }));
    }
  };

  const handleApplySuggestion = (suggestion) => {
    const text = typeof suggestion === "string" ? suggestion : suggestion.text;
    notify({ title: "Suggestion applied", message: text });
    // Could integrate with portfolio builder here
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="AI agent"
        title="Intelligent assistant deck"
        description="Let AI analyze your profile, generate dashboard layouts, and suggest improvements."
      />

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
              activeTab === tab.id
                ? "bg-cyber text-night"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Insights tab */}
      <AnimatePresence mode="wait">
        {activeTab === "insights" && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <GlowCard className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white">Profile insights</p>
                <p className="text-sm text-white/60">
                  Analyze your profile to discover improvement opportunities
                </p>
              </div>
              <NeonButton onClick={runInsights} disabled={loading.insights}>
                {loading.insights ? "Analyzing..." : "Run analysis"}
              </NeonButton>
            </GlowCard>

            {loading.insights ? (
              <div className="flex items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="h-8 w-8 rounded-full border-2 border-cyber border-t-transparent"
                />
              </div>
            ) : insights.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} index={i} />
                ))}
              </div>
            ) : (
              <GlowCard className="py-16 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyber/20 to-aurora/20">
                  <span className="text-4xl">🔍</span>
                </div>
                <p className="mt-4 font-medium text-white">
                  Discover profile insights
                </p>
                <p className="mt-2 text-sm text-white/60">
                  AI will analyze your profile and suggest improvements for
                  visibility and engagement.
                </p>
              </GlowCard>
            )}
          </motion.div>
        )}

        {/* Dashboard generator tab */}
        {activeTab === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <GlowCard className="space-y-4">
              <div>
                <label className="text-xs text-white/60">Subject</label>
                <input
                  className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="What's the dashboard focus?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-white/60">
                  Notes & preferences
                </label>
                <textarea
                  className="mt-1 min-h-[120px] w-full resize-none rounded-2xl bg-white/5 p-4 text-white outline-none"
                  placeholder="Describe what you want to emphasize, any specific requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <NeonButton
                  onClick={generateDashboard}
                  disabled={loading.dashboard}
                >
                  {loading.dashboard ? "Generating..." : "Generate layout"}
                </NeonButton>
              </div>
            </GlowCard>

            {loading.dashboard ? (
              <div className="flex items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="h-8 w-8 rounded-full border-2 border-cyber border-t-transparent"
                />
              </div>
            ) : dashboardIdea ? (
              <div className="space-y-4">
                <LayoutPreview layout={dashboardIdea.layout || dashboardIdea} />

                <div className="flex gap-3">
                  <NeonButton
                    onClick={() => {
                      notify({ title: "Layout applied to portfolio builder" });
                    }}
                  >
                    Apply to portfolio
                  </NeonButton>
                  <button
                    onClick={() => setDashboardIdea(null)}
                    className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/60 hover:bg-white/5"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <GlowCard className="py-16 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyber/20 to-aurora/20">
                  <span className="text-4xl">🎨</span>
                </div>
                <p className="mt-4 font-medium text-white">
                  Generate custom layouts
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Describe your goals and let AI create a personalized dashboard
                  layout for you.
                </p>
              </GlowCard>
            )}
          </motion.div>
        )}

        {/* Suggestions tab */}
        {activeTab === "suggestions" && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <GlowCard className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs text-white/60">
                    Suggestion subject
                  </label>
                  <input
                    className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
                    placeholder="What to optimize?"
                    value={suggestSubject}
                    onChange={(e) => setSuggestSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60">Context data</label>
                  <input
                    className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
                    placeholder="Additional context..."
                    value={suggestData}
                    onChange={(e) => setSuggestData(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <NeonButton
                  onClick={getSuggestions}
                  disabled={loading.suggestions}
                >
                  {loading.suggestions ? "Getting..." : "Get suggestions"}
                </NeonButton>
              </div>
            </GlowCard>

            {loading.suggestions ? (
              <div className="flex items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="h-8 w-8 rounded-full border-2 border-cyber border-t-transparent"
                />
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-3">
                {suggestions.map((suggestion, i) => (
                  <SuggestionPill
                    key={i}
                    suggestion={suggestion}
                    index={i}
                    onApply={handleApplySuggestion}
                  />
                ))}
              </div>
            ) : (
              <GlowCard className="py-16 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyber/20 to-aurora/20">
                  <span className="text-4xl">💡</span>
                </div>
                <p className="mt-4 font-medium text-white">
                  Get smart suggestions
                </p>
                <p className="mt-2 text-sm text-white/60">
                  AI will provide actionable recommendations to improve your
                  profile and visibility.
                </p>
              </GlowCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentDeck;
