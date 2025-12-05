"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";
import NeonButton from "@/components/ui/NeonButton";
import EmptyState from "@/components/ui/EmptyState";
import Tag from "@/components/ui/Tag";
import { useToast } from "@/components/ui/ToastProvider";
import api from "@/lib/api-client";
import useAppStore from "@/store/useAppStore";
import { interpretReadiness, describeMissing } from "@/lib/readiness-utils";

/* ─────────────────────────────────────────────────────────── */
/* Blueprint section cards                                      */
/* ─────────────────────────────────────────────────────────── */
const SectionList = ({ title, items, onEdit }) => (
  <GlowCard className="space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-sm uppercase tracking-[0.4em] text-white/50">
        {title}
      </p>
      {onEdit && (
        <button onClick={onEdit} className="text-xs text-cyber hover:underline">
          Edit
        </button>
      )}
    </div>
    <div className="flex flex-wrap gap-3">
      {items?.length ? (
        items.map((item, idx) => (
          <Tag key={item.id || idx} tone="neutral">
            {item.label || item.name || item.title || item.company || item}
          </Tag>
        ))
      ) : (
        <p className="text-sm text-white/60">No entries yet</p>
      )}
    </div>
  </GlowCard>
);

/* ─────────────────────────────────────────────────────────── */
/* Readiness indicator                                          */
/* ─────────────────────────────────────────────────────────── */
const ReadinessPanel = ({ status }) => {
  if (!status) return null;
  const readiness = interpretReadiness(status.readiness);
  const fallbackMissing = Array.isArray(status.requirements)
    ? status.requirements.filter((r) => !r.met)
    : [];
  const missingList = describeMissing(
    readiness.missing.length > 0 ? readiness.missing : fallbackMissing
  );
  const percent = readiness.percent || 0;
  return (
    <GlowCard className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.4em] text-white/50">
          Publish readiness
        </p>
        <span
          className={`text-2xl font-bold ${
            percent >= 100 ? "text-aurora" : "text-pulse"
          }`}
        >
          {percent}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className="h-full bg-gradient-to-r from-aurora to-cyber"
        />
      </div>
      {missingList.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-white/70">
          {missingList.map((req) => (
            <li key={req.id}>{req.label}</li>
          ))}
        </ul>
      )}
      {readiness.summary && (
        <p className="text-xs uppercase tracking-widest text-white/40">
          {readiness.summary}
        </p>
      )}
      {status.links && (
        <div className="space-y-1 text-xs text-white/60">
          <p>
            Profile: <span className="text-cyber">{status.links.profile}</span>
          </p>
          <p>
            Dashboard:{" "}
            <span className="text-cyber">{status.links.dashboard}</span>
          </p>
        </div>
      )}
    </GlowCard>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Template picker                                               */
/* ─────────────────────────────────────────────────────────── */
const TemplatePicker = ({ templates, active, onSelect }) => (
  <div className="flex flex-wrap gap-4">
    {templates.map((t) => (
      <button
        key={t.slug}
        onClick={() => onSelect(t.slug)}
        className={`rounded-2xl border px-5 py-3 text-sm transition ${
          active === t.slug
            ? "border-cyber bg-cyber/10 text-white"
            : "border-white/10 text-white/70 hover:border-white/30"
        }`}
      >
        {t.label || t.name || t.slug}
      </button>
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────── */
/* Text enhancer modal                                          */
/* ─────────────────────────────────────────────────────────── */
const EnhancerModal = ({ open, onClose, initialText, onApply }) => {
  const [text, setText] = useState(initialText || "");
  const [tone, setTone] = useState("executive");
  const [persona, setPersona] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  const enhance = async () => {
    setLoading(true);
    try {
      const data = await api.portfolio.enhance({ text, tone, persona });
      setResult(data);
    } catch (err) {
      notify({ title: "Enhance failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl space-y-4 rounded-3xl border border-white/10 bg-night p-6"
      >
        <h2 className="text-xl font-semibold text-white">AI Text Enhancer</h2>
        <textarea
          className="min-h-[120px] w-full rounded-2xl bg-white/5 p-4 text-white outline-none"
          placeholder="Paste your copy here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex flex-wrap gap-4">
          <select
            className="rounded-2xl bg-white/5 px-4 py-3 text-white"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="executive">Executive</option>
            <option value="friendly">Friendly</option>
            <option value="bold">Bold</option>
            <option value="minimal">Minimal</option>
          </select>
          <input
            className="flex-1 rounded-2xl bg-white/5 px-4 py-3 text-white"
            placeholder="Persona (optional)"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
          />
        </div>
        <NeonButton onClick={enhance} disabled={loading}>
          {loading ? "Enhancing..." : "Enhance with Gemini"}
        </NeonButton>
        {result && (
          <div className="space-y-3 rounded-2xl border border-white/10 p-4">
            <p className="text-xs uppercase tracking-widest text-white/50">
              Enhanced
            </p>
            <p className="text-white">{result.enhancedText}</p>
            {result.headline && (
              <p className="text-sm text-cyber">
                Suggested headline: {result.headline}
              </p>
            )}
            {result.suggestions?.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-white/70">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
            <NeonButton
              onClick={() => {
                onApply(result.enhancedText);
                onClose();
              }}
            >
              Apply to composer
            </NeonButton>
          </div>
        )}
        <button
          className="mt-2 text-sm text-white/60 hover:text-white"
          onClick={onClose}
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Main builder                                                 */
/* ─────────────────────────────────────────────────────────── */
const PortfolioBuilder = () => {
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notes, setNotes] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [manual, setManual] = useState({
    headline: "",
    summary: "",
    experiences: [],
    skills: [],
    certifications: [],
    projects: [],
  });
  const [status, setStatus] = useState(null);
  const [portfolioTemplates, setPortfolioTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState("spotlight");
  const [deleteId, setDeleteId] = useState("");
  const [enhancerOpen, setEnhancerOpen] = useState(false);
  const [enhancerField, setEnhancerField] = useState("summary");

  const blueprint = useAppStore((s) => s.blueprint);
  const setBlueprint = useAppStore((s) => s.setBlueprint);
  const resumes = useAppStore((s) => s.resumes);
  const setResumes = useAppStore((s) => s.setResumes);
  const { notify } = useToast();

  /* ───────── Load blueprint, status, templates, resumes ───────── */
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [bp, st, tpl, res] = await Promise.all([
          api.portfolio.blueprint().catch(() => null),
          api.portfolio.status().catch(() => null),
          api.portfolio.templates().catch(() => []),
          api.resume.list().catch(() => []),
        ]);
        if (!mounted) return;
        if (bp) {
          setBlueprint(bp);
          setManual({
            headline: bp.profile?.headline || "",
            summary: bp.profile?.bio || bp.summary || "",
            experiences: bp.experiences || [],
            skills: bp.skills || [],
            certifications: bp.certifications || [],
            projects: bp.projects || [],
          });
        }
        setStatus(st);
        setPortfolioTemplates(Array.isArray(tpl) ? tpl : []);
        setResumes(res || []);
        if (res?.length) setResumeId(res[0].id);
      } catch (err) {
        notify({ title: "Load failed", message: err.message });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [notify, setBlueprint, setResumes]);

  /* ───────── Draft from resume ───────── */
  const handleDraft = async () => {
    if (!resumeId) {
      notify({ title: "Select a resume first" });
      return;
    }
    setDrafting(true);
    try {
      const data = await api.portfolio.draft({ resumeId, notes });
      setManual((prev) => ({
        ...prev,
        summary: data?.summary || prev.summary,
        experiences: data?.experiences || prev.experiences,
        skills: data?.skills || prev.skills,
      }));
      notify({
        title: "Draft ready",
        message: "Gemini generated your blueprint",
      });
    } catch (err) {
      notify({ title: "Draft error", message: err.message });
    } finally {
      setDrafting(false);
    }
  };

  /* ───────── Save portfolio ───────── */
  const handleSave = async (publish = false) => {
    setSaving(true);
    try {
      const payload = {
        profile: { headline: manual.headline },
        summary: manual.summary,
        experiences: manual.experiences,
        skills: manual.skills,
        certifications: manual.certifications,
        projects: manual.projects,
        publish,
      };
      const result = await api.portfolio.save(payload);
      setStatus(result?.readiness ? result : status);
      notify({
        title: publish ? "Published!" : "Saved",
        message: "Portfolio updated",
      });
    } catch (err) {
      notify({ title: "Save failed", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  /* ───────── Publish explicitly ───────── */
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const result = await api.portfolio.publish();
      setStatus(result?.readiness ? result : status);
      notify({ title: "Published!", message: "Your portfolio is live" });
    } catch (err) {
      notify({ title: "Publish failed", message: err.message });
    } finally {
      setPublishing(false);
    }
  };

  /* ───────── Delete dashboard ───────── */
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.portfolio.deleteDashboard(deleteId);
      notify({ title: "Dashboard removed" });
      setDeleteId("");
    } catch (err) {
      notify({ title: "Delete failed", message: err.message });
    }
  };

  /* ───────── Enhancer apply ───────── */
  const applyEnhanced = (text) => {
    setManual((prev) => ({ ...prev, [enhancerField]: text }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-cyber border-t-transparent"
        />
      </div>
    );
  }

  if (!blueprint) {
    return (
      <EmptyState
        title="No blueprint yet"
        message="Upload a resume to generate your identity blueprint."
        action={<NeonButton onClick={handleDraft}>Generate</NeonButton>}
      />
    );
  }

  return (
    <div className="space-y-12">
      {/* ────────── Readiness + Templates ────────── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <ReadinessPanel status={status} />
        <GlowCard className="space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">
            Portfolio template
          </p>
          <TemplatePicker
            templates={portfolioTemplates}
            active={activeTemplate}
            onSelect={setActiveTemplate}
          />
        </GlowCard>
      </section>

      {/* ────────── Blueprint view ────────── */}
      <section className="space-y-6">
        <SectionHeader
          title="Blueprint view"
          description="Live snapshot from /api/portfolio/blueprint"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <SectionList title="Experiences" items={blueprint.experiences} />
          <SectionList title="Projects" items={blueprint.projects} />
          <SectionList title="Skills" items={blueprint.skills} />
          <SectionList
            title="Certifications"
            items={blueprint.certifications}
          />
          <SectionList title="Education" items={blueprint.education} />
          <SectionList title="Achievements" items={blueprint.achievements} />
        </div>
      </section>

      {/* ────────── Draft generator ────────── */}
      <section className="space-y-6">
        <SectionHeader
          title="Draft generator"
          description="POST /api/portfolio/draft with Gemini"
          actions={
            <NeonButton onClick={handleDraft} disabled={drafting}>
              {drafting ? "Generating..." : "Run draft"}
            </NeonButton>
          }
        />
        <GlowCard className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-white/70">Resume</label>
              <select
                className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white"
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.filename}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/70">Notes to Gemini</label>
              <input
                className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white"
                placeholder="Emphasize AI leadership"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </GlowCard>
      </section>

      {/* ────────── Manual composer ────────── */}
      <section className="space-y-6">
        <SectionHeader
          title="Manual composer"
          description="Edit headline, summary, skills, experiences manually"
          actions={
            <div className="flex gap-3">
              <NeonButton onClick={() => handleSave(false)} disabled={saving}>
                {saving ? "Saving..." : "Save draft"}
              </NeonButton>
              <NeonButton onClick={handlePublish} disabled={publishing}>
                {publishing ? "Publishing..." : "Publish now"}
              </NeonButton>
            </div>
          }
        />
        <GlowCard className="space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/70">Headline</label>
              <button
                className="text-xs text-cyber"
                onClick={() => {
                  setEnhancerField("headline");
                  setEnhancerOpen(true);
                }}
              >
                ✨ Enhance
              </button>
            </div>
            <input
              className="mt-2 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyber"
              value={manual.headline}
              onChange={(e) =>
                setManual((prev) => ({ ...prev, headline: e.target.value }))
              }
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/70">Summary / Bio</label>
              <button
                className="text-xs text-cyber"
                onClick={() => {
                  setEnhancerField("summary");
                  setEnhancerOpen(true);
                }}
              >
                ✨ Enhance
              </button>
            </div>
            <textarea
              className="mt-2 min-h-[120px] w-full rounded-2xl bg-white/5 p-4 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyber"
              value={manual.summary}
              onChange={(e) =>
                setManual((prev) => ({ ...prev, summary: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-sm text-white/70">
              Skills (comma separated)
            </label>
            <input
              className="mt-2 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
              placeholder="AI Strategy, Product, Go-to-market"
              value={manual.skills.map((s) => s.name || s).join(", ")}
              onChange={(e) =>
                setManual((prev) => ({
                  ...prev,
                  skills: e.target.value
                    .split(",")
                    .filter(Boolean)
                    .map((name) => ({ name: name.trim(), level: "Pro" })),
                }))
              }
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Experiences (JSON)</label>
            <textarea
              className="mt-2 min-h-[180px] w-full rounded-2xl bg-white/5 p-4 font-mono text-xs text-white outline-none"
              value={JSON.stringify(manual.experiences, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setManual((prev) => ({ ...prev, experiences: parsed }));
                } catch (_) {}
              }}
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Projects (JSON)</label>
            <textarea
              className="mt-2 min-h-[140px] w-full rounded-2xl bg-white/5 p-4 font-mono text-xs text-white outline-none"
              value={JSON.stringify(manual.projects, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setManual((prev) => ({ ...prev, projects: parsed }));
                } catch (_) {}
              }}
            />
          </div>
          <div>
            <label className="text-sm text-white/70">
              Certifications (JSON)
            </label>
            <textarea
              className="mt-2 min-h-[100px] w-full rounded-2xl bg-white/5 p-4 font-mono text-xs text-white outline-none"
              value={JSON.stringify(manual.certifications, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setManual((prev) => ({ ...prev, certifications: parsed }));
                } catch (_) {}
              }}
            />
          </div>
        </GlowCard>
      </section>

      {/* ────────── Delete dashboard ────────── */}
      <section className="space-y-4">
        <SectionHeader
          title="Remove portfolio dashboard"
          description="DELETE /api/portfolio/dashboard/{id}"
        />
        <GlowCard className="flex flex-col gap-4 md:flex-row">
          <input
            className="flex-1 rounded-2xl bg-white/5 px-4 py-3 text-white"
            placeholder="Dashboard ID"
            value={deleteId}
            onChange={(e) => setDeleteId(e.target.value)}
          />
          <NeonButton onClick={handleDelete} className="justify-center">
            Delete dashboard
          </NeonButton>
        </GlowCard>
      </section>

      {/* ────────── Enhancer modal ────────── */}
      <EnhancerModal
        open={enhancerOpen}
        onClose={() => setEnhancerOpen(false)}
        initialText={manual[enhancerField]}
        onApply={applyEnhanced}
      />
    </div>
  );
};

export default PortfolioBuilder;
