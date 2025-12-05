"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";
import NeonButton from "@/components/ui/NeonButton";
import Tag from "@/components/ui/Tag";
import api from "@/lib/api-client";
import { useToast } from "@/components/ui/ToastProvider";
import useAppStore from "@/store/useAppStore";
import {
  sanitizeHighlightsPayload,
  getHighlightDetail,
  getHighlightContext,
  getMomentumDetail,
} from "@/lib/highlight-utils";

/* ─────────────────────────────────────────────────────────── */
/* Highlight detail renderer                                   */
/* ─────────────────────────────────────────────────────────── */
const renderHighlightDetail = (detail) => {
  if (detail === null || detail === undefined) return null;

  if (typeof detail === "string" || typeof detail === "number") {
    return <p className="text-sm text-white/70">{detail}</p>;
  }

  if (Array.isArray(detail)) {
    return (
      <ul className="list-disc pl-5 text-sm text-white/70">
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
      <div className="space-y-2 text-sm text-white/70">
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

  return <p className="text-sm text-white/70">{String(detail)}</p>;
};

/* ─────────────────────────────────────────────────────────── */
/* Highlights cards                                             */
/* ─────────────────────────────────────────────────────────── */
const MomentCard = ({ moment, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="rounded-2xl border border-white/10 bg-white/5 p-4"
  >
    <Tag tone="positive" className="mb-2">
      {moment.type || "moment"}
    </Tag>
    <p className="text-lg font-semibold text-white">{moment.title}</p>
    <div className="mt-2">
      {renderHighlightDetail(getHighlightDetail(moment))}
    </div>
  </motion.div>
);

const TalkingPointCard = ({ point }) => (
  <div className="rounded-2xl border border-white/10 p-3">
    <div className="text-sm text-white">
      {renderHighlightDetail(getHighlightDetail(point))}
    </div>
    {getHighlightContext(point) && (
      <div className="mt-1 text-xs text-white/50">
        {renderHighlightDetail(getHighlightContext(point))}
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────── */
/* Job match panel                                              */
/* ─────────────────────────────────────────────────────────── */
const JobMatchPanel = ({ result }) => {
  if (!result) return null;

  const scoreColor =
    result.matchScore >= 80
      ? "text-aurora"
      : result.matchScore >= 50
      ? "text-cyber"
      : "text-pulse";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Score */}
      <div className="flex items-center gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">
            Match score
          </p>
          <p className={`text-5xl font-bold ${scoreColor}`}>
            {result.matchScore}
          </p>
        </div>
        <div className="flex-1">
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.matchScore}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-aurora to-cyber"
            />
          </div>
        </div>
      </div>

      {/* Strengths */}
      {result.strengths?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">
            Strengths
          </p>
          <ul className="mt-2 space-y-1">
            {result.strengths.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-white/80"
              >
                <span className="text-aurora">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps */}
      {result.gaps?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">
            Gaps
          </p>
          <ul className="mt-2 space-y-1">
            {result.gaps.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-white/80"
              >
                <span className="text-pulse">○</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {result.actions?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">
            Next steps
          </p>
          <ul className="mt-2 space-y-1">
            {result.actions.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-white/80"
              >
                <span className="text-cyber">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Copilot chat                                                 */
/* ─────────────────────────────────────────────────────────── */
const CopilotChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("executive");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { notify } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await api.support.copilot({ question: input, tone });
      const assistantMessage = {
        role: "assistant",
        content: data.answer,
        followUps: data.followUps,
        inspirations: data.inspirations,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      notify({ title: "Copilot error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[500px] flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-white/50">
            Ask the identity copilot anything about your career, positioning, or
            pitch.
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-4 ${
                msg.role === "user"
                  ? "ml-auto max-w-[80%] bg-cyber/20 text-white"
                  : "mr-auto max-w-[90%] border border-white/10 bg-white/5"
              }`}
            >
              <p className="text-sm text-white">{msg.content}</p>
              {msg.followUps?.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-white/50">Follow-ups:</p>
                  {msg.followUps.map((fu, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(fu)}
                      className="block text-left text-xs text-cyber hover:underline"
                    >
                      → {fu}
                    </button>
                  ))}
                </div>
              )}
              {msg.inspirations?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.inspirations.map((insp, i) => (
                    <Tag key={i} tone="neutral">
                      {insp}
                    </Tag>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-cyber"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-cyber border-t-transparent"
            />
            Thinking...
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-3">
          <select
            className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-white"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="executive">Executive</option>
            <option value="friendly">Friendly</option>
            <option value="concise">Concise</option>
            <option value="storytelling">Storytelling</option>
          </select>
          <textarea
            className="min-h-[44px] flex-1 resize-none rounded-2xl bg-white/5 px-4 py-2 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyber"
            placeholder="Ask about your pitch, positioning, or career..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <NeonButton onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
          </NeonButton>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Main component                                               */
/* ─────────────────────────────────────────────────────────── */
const SupportSuite = () => {
  const [activeTab, setActiveTab] = useState("highlights");
  const [highlights, setHighlights] = useState(null);
  const [highlightsError, setHighlightsError] = useState(null);
  const [loadingHighlights, setLoadingHighlights] = useState(false);
  const [jobMatch, setJobMatch] = useState(null);
  const [loadingJobMatch, setLoadingJobMatch] = useState(false);
  const [form, setForm] = useState({
    jobTitle: "",
    company: "",
    jobDescription: "",
    focus: "",
  });
  const setStoreHighlights = useAppStore((s) => s.setHighlights);
  const { notify } = useToast();

  const tabs = [
    { id: "highlights", label: "Highlights" },
    { id: "jobmatch", label: "Job Match" },
    { id: "copilot", label: "Copilot" },
  ];

  const loadHighlights = async () => {
    setLoadingHighlights(true);
    try {
      const data = await api.support.highlights();
      const sanitized = sanitizeHighlightsPayload(data);
      setHighlights(sanitized);
      setStoreHighlights(sanitized);
      setHighlightsError(
        sanitized ? null : "AI highlights offline. Check Gemini API key."
      );
    } catch (err) {
      notify({ title: "Highlights failed", message: err.message });
      setHighlights(null);
      setHighlightsError("AI highlights offline. Please retry later.");
    } finally {
      setLoadingHighlights(false);
    }
  };

  const runJobMatch = async () => {
    if (!form.jobTitle || !form.company) {
      notify({
        title: "Fill required fields",
        message: "Job title and company are required",
      });
      return;
    }
    setLoadingJobMatch(true);
    try {
      const data = await api.support.jobMatch(form);
      setJobMatch(data);
    } catch (err) {
      notify({ title: "Job match failed", message: err.message });
    } finally {
      setLoadingJobMatch(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Support AI"
        title="Identity intelligence suite"
        description="Highlights, job matching, and conversational copilot powered by Gemini."
      />

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-cyber text-night"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Highlights tab */}
      {activeTab === "highlights" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/70">
              GET /api/support/highlights – moments, momentum, talking points
            </p>
            <NeonButton onClick={loadHighlights} disabled={loadingHighlights}>
              {loadingHighlights ? "Loading..." : "Refresh"}
            </NeonButton>
          </div>

          {highlights ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Moments */}
              <GlowCard className="space-y-4">
                <p className="text-xs uppercase tracking-widest text-white/50">
                  Moments
                </p>
                <div className="space-y-3">
                  {highlights.moments?.map((moment, idx) => (
                    <MomentCard key={idx} moment={moment} index={idx} />
                  ))}
                </div>
              </GlowCard>

              {/* Momentum + Talking Points */}
              <div className="space-y-6">
                {highlights.momentum && (
                  <GlowCard className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-white/50">
                      Momentum
                    </p>
                    <div>
                      {renderHighlightDetail(getMomentumDetail(highlights))}
                    </div>
                  </GlowCard>
                )}
                <GlowCard className="space-y-3">
                  <p className="text-xs uppercase tracking-widest text-white/50">
                    Talking Points
                  </p>
                  <div className="space-y-2">
                    {highlights.talkingPoints?.map((point, idx) => (
                      <TalkingPointCard key={idx} point={point} />
                    ))}
                  </div>
                </GlowCard>
              </div>
            </div>
          ) : (
            <GlowCard className="py-12 text-center text-white/60">
              {highlightsError ||
                "Click Refresh to load AI-generated highlights from your identity data."}
            </GlowCard>
          )}
        </div>
      )}

      {/* Job Match tab */}
      {activeTab === "jobmatch" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <GlowCard className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-white/50">
              Job details
            </p>
            <div className="space-y-3">
              <input
                className="w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyber"
                placeholder="Job title *"
                value={form.jobTitle}
                onChange={(e) =>
                  setForm((p) => ({ ...p, jobTitle: e.target.value }))
                }
              />
              <input
                className="w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyber"
                placeholder="Company *"
                value={form.company}
                onChange={(e) =>
                  setForm((p) => ({ ...p, company: e.target.value }))
                }
              />
              <input
                className="w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
                placeholder="Focus (optional)"
                value={form.focus}
                onChange={(e) =>
                  setForm((p) => ({ ...p, focus: e.target.value }))
                }
              />
              <textarea
                className="min-h-[140px] w-full rounded-2xl bg-white/5 p-4 text-white outline-none"
                placeholder="Paste job description..."
                value={form.jobDescription}
                onChange={(e) =>
                  setForm((p) => ({ ...p, jobDescription: e.target.value }))
                }
              />
              <NeonButton onClick={runJobMatch} disabled={loadingJobMatch}>
                {loadingJobMatch ? "Analyzing..." : "Generate Brief"}
              </NeonButton>
            </div>
          </GlowCard>

          <GlowCard className="min-h-[300px]">
            {loadingJobMatch ? (
              <div className="flex h-full items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="h-8 w-8 rounded-full border-2 border-cyber border-t-transparent"
                />
              </div>
            ) : jobMatch ? (
              <JobMatchPanel result={jobMatch} />
            ) : (
              <div className="flex h-full items-center justify-center text-white/60">
                Fill the job details and click Generate Brief to see match
                analysis.
              </div>
            )}
          </GlowCard>
        </div>
      )}

      {/* Copilot tab */}
      {activeTab === "copilot" && (
        <GlowCard className="overflow-hidden">
          <CopilotChat />
        </GlowCard>
      )}
    </div>
  );
};

export default SupportSuite;
