"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";
import NeonButton from "@/components/ui/NeonButton";
import EmptyState from "@/components/ui/EmptyState";
import Tag from "@/components/ui/Tag";
import api from "@/lib/api-client";
import { useToast } from "@/components/ui/ToastProvider";
import useAppStore from "@/store/useAppStore";

/* ─────────────────────────────────────────────────────────── */
/* Resume card                                                  */
/* ─────────────────────────────────────────────────────────── */
const ResumeCard = ({ resume, onSelect, onGetUrl, selected }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className={`space-y-3 rounded-2xl border p-4 transition ${
      selected ? "border-cyber bg-cyber/5" : "border-white/10"
    }`}
  >
    <button className="w-full text-left" onClick={() => onSelect(resume)}>
      <p className="text-sm font-semibold text-white">{resume.filename}</p>
      <p className="text-xs text-white/50">
        {new Date(resume.createdAt).toLocaleDateString()}
      </p>
      {resume.analysis && (
        <Tag tone="positive" className="mt-2">
          Analyzed
        </Tag>
      )}
    </button>
    <div className="flex flex-wrap gap-2">
      <NeonButton className="text-xs" onClick={() => onGetUrl(resume.id)}>
        Signed URL
      </NeonButton>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────── */
/* Analysis panel                                               */
/* ─────────────────────────────────────────────────────────── */
const AnalysisPanel = ({ analysis, onPush }) => {
  if (!analysis) {
    return (
      <div className="flex h-full items-center justify-center text-white/60">
        Select a resume and run analysis to view extracted data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contact */}
      {analysis.contact && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/50">
            Contact
          </p>
          <div className="grid gap-2 text-sm text-white/80 md:grid-cols-2">
            {analysis.contact.name && <p>Name: {analysis.contact.name}</p>}
            {analysis.contact.email && <p>Email: {analysis.contact.email}</p>}
            {analysis.contact.phone && <p>Phone: {analysis.contact.phone}</p>}
            {analysis.contact.location && (
              <p>Location: {analysis.contact.location}</p>
            )}
          </div>
        </div>
      )}

      {/* Skills */}
      {analysis.skills?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/50">
            Skills
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.skills.map((skill, idx) => (
              <Tag key={idx} tone="neutral">
                {skill.name || skill}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {analysis.experience?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/50">
            Experience
          </p>
          <div className="space-y-3">
            {analysis.experience.slice(0, 4).map((exp, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 p-3">
                <p className="font-semibold text-white">
                  {exp.role || exp.title}
                </p>
                <p className="text-sm text-cyber">{exp.company}</p>
                <p className="text-xs text-white/50">
                  {exp.startDate} – {exp.endDate || "Present"}
                </p>
                {exp.summary && (
                  <p className="mt-1 text-xs text-white/70">{exp.summary}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {analysis.education?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/50">
            Education
          </p>
          <div className="space-y-2">
            {analysis.education.map((edu, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 p-3">
                <p className="font-semibold text-white">{edu.degree}</p>
                <p className="text-sm text-white/70">{edu.institution}</p>
                {edu.year && (
                  <p className="text-xs text-white/50">{edu.year}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {analysis.keywords?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/50">
            Keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((kw, idx) => (
              <Tag key={idx}>{kw}</Tag>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {analysis.achievements?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/50">
            Achievements
          </p>
          <ul className="list-disc pl-5 text-sm text-white/80">
            {analysis.achievements.slice(0, 5).map((ach, idx) => (
              <li key={idx}>{ach}</li>
            ))}
          </ul>
        </div>
      )}

      <NeonButton onClick={onPush}>Push to Portfolio Builder</NeonButton>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Main component                                               */
/* ─────────────────────────────────────────────────────────── */
const ResumeIntelligence = () => {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [strategy, setStrategy] = useState("full");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef();
  const { notify } = useToast();
  const setResumes = useAppStore((s) => s.setResumes);

  const load = async () => {
    try {
      const data = await api.resume.list();
      setItems(data || []);
      setResumes(data || []);
    } catch (err) {
      notify({ title: "Resume fetch failed", message: err.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.resume.upload(file);
      notify({ title: "Resume uploaded", message: file.name });
      load();
      if (result?.id) setSelected(result);
    } catch (err) {
      notify({ title: "Upload failed", message: err.message });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const analyze = async () => {
    if (!selected) return;
    setAnalyzing(true);
    try {
      const data = await api.resume.analyze({
        resumeId: selected.id,
        strategy,
        notes,
      });
      setSelected({ ...selected, analysis: data });
      // Update in list
      setItems((prev) =>
        prev.map((r) => (r.id === selected.id ? { ...r, analysis: data } : r))
      );
      notify({ title: "Analysis complete" });
    } catch (err) {
      notify({ title: "Analysis failed", message: err.message });
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchUrl = async (id) => {
    try {
      const data = await api.resume.signedUrl(id);
      setDownloadUrl(data?.url || "");
      notify({ title: "Signed URL ready" });
    } catch (err) {
      notify({ title: "Signed URL failed", message: err.message });
    }
  };

  const pushToBuilder = async () => {
    if (!selected?.id) return;
    try {
      await api.portfolio.draft({ resumeId: selected.id, notes });
      notify({
        title: "Pushed to builder",
        message: "Navigate to portfolio builder",
      });
    } catch (err) {
      notify({ title: "Push failed", message: err.message });
    }
  };

  if (!items.length && !uploading) {
    return (
      <EmptyState
        title="Upload your first resume"
        message="POST /api/resume/upload – Gemini will extract structure"
        action={
          <NeonButton onClick={() => fileInputRef.current?.click()}>
            Upload resume
          </NeonButton>
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleUpload}
        />
      </EmptyState>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Resume vault"
        title="AI-powered resume analysis"
        description="Upload resumes, run Gemini extraction, and push insights to the portfolio builder."
        actions={
          <div className="flex gap-3">
            <NeonButton
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </NeonButton>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        {/* Resume list */}
        <GlowCard className="max-h-[600px] space-y-4 overflow-y-auto">
          <AnimatePresence>
            {items.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                selected={selected?.id === resume.id}
                onSelect={setSelected}
                onGetUrl={fetchUrl}
              />
            ))}
          </AnimatePresence>
        </GlowCard>

        {/* Analysis panel */}
        <GlowCard className="min-h-[400px]">
          {selected ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">
                    {selected.filename}
                  </p>
                  <p className="text-xs text-white/50">
                    Uploaded {new Date(selected.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <NeonButton onClick={analyze} disabled={analyzing}>
                  {analyzing ? "Analyzing..." : "Analyze"}
                </NeonButton>
              </div>

              {/* Analysis options */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-xs text-white/60">Strategy</label>
                  <select
                    className="mt-1 rounded-2xl bg-white/5 px-4 py-2 text-white"
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                  >
                    <option value="full">Full extraction</option>
                    <option value="quick">Quick scan</option>
                    <option value="skills">Skills focus</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/60">
                    Notes to Gemini
                  </label>
                  <input
                    className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-2 text-white"
                    placeholder="Highlight fintech achievements"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {analyzing && (
                <div className="flex items-center gap-3 text-sm text-cyber">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="h-5 w-5 rounded-full border-2 border-cyber border-t-transparent"
                  />
                  Running Gemini analysis...
                </div>
              )}

              <AnalysisPanel
                analysis={selected.analysis}
                onPush={pushToBuilder}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-white/60">
              Select a resume to view details and run analysis.
            </div>
          )}
        </GlowCard>
      </div>

      {/* Signed URL display */}
      {downloadUrl && (
        <GlowCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/50">
            Signed URL
          </p>
          <div className="flex items-center gap-4">
            <p className="flex-1 break-all text-sm text-cyber">{downloadUrl}</p>
            <NeonButton
              className="text-xs"
              onClick={() => {
                navigator.clipboard.writeText(downloadUrl);
                notify({ title: "Copied to clipboard" });
              }}
            >
              Copy
            </NeonButton>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/20 px-4 py-2 text-xs text-white hover:bg-white/5"
            >
              Open
            </a>
          </div>
        </GlowCard>
      )}
    </div>
  );
};

export default ResumeIntelligence;
