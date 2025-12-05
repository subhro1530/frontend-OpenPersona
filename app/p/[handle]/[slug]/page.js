"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api-client";
import Tag from "@/components/ui/Tag";
import NeonButton from "@/components/ui/NeonButton";
import useAppStore from "@/store/useAppStore";
import { useToast } from "@/components/ui/ToastProvider";

/* ─────────────────────────────────────────────────────────── */
/* Template Style Configurations                                */
/* ─────────────────────────────────────────────────────────── */
const TEMPLATE_STYLES = {
  "neon-developer": {
    gradient: "from-cyber/20 via-aurora/10 to-pulse/20",
    cardBg: "bg-white/5",
    borderColor: "border-cyber",
    accentFrom: "from-cyber",
    accentTo: "to-aurora",
    headingColor: "text-white",
    textColor: "text-white/70",
    iconBg: "bg-cyber/20",
  },
  "minimal-portfolio": {
    gradient: "from-gray-800/50 via-gray-900/50 to-slate-900/50",
    cardBg: "bg-slate-800/30",
    borderColor: "border-slate-600",
    accentFrom: "from-slate-400",
    accentTo: "to-gray-300",
    headingColor: "text-gray-100",
    textColor: "text-gray-400",
    iconBg: "bg-slate-700/50",
  },
  "creative-showcase": {
    gradient: "from-pink-500/20 via-purple-500/20 to-indigo-500/20",
    cardBg: "bg-purple-900/20",
    borderColor: "border-pink-500/50",
    accentFrom: "from-pink-500",
    accentTo: "to-purple-500",
    headingColor: "text-white",
    textColor: "text-pink-200/70",
    iconBg: "bg-pink-500/20",
  },
  "hire-me": {
    gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
    cardBg: "bg-emerald-900/10",
    borderColor: "border-emerald-500/50",
    accentFrom: "from-emerald-500",
    accentTo: "to-teal-400",
    headingColor: "text-white",
    textColor: "text-emerald-200/70",
    iconBg: "bg-emerald-500/20",
  },
  default: {
    gradient: "from-cyber/20 via-aurora/10 to-pulse/20",
    cardBg: "bg-white/5",
    borderColor: "border-cyber",
    accentFrom: "from-cyber",
    accentTo: "to-aurora",
    headingColor: "text-white",
    textColor: "text-white/70",
    iconBg: "bg-cyber/20",
  },
};

const getStyle = (templateSlug) =>
  TEMPLATE_STYLES[templateSlug] || TEMPLATE_STYLES.default;

/* ─────────────────────────────────────────────────────────── */
/* Custom Modal Component                                       */
/* ─────────────────────────────────────────────────────────── */
const CustomModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-night p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Skill Modal with Expertise Slider                            */
/* ─────────────────────────────────────────────────────────── */
const SkillModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState("");
  const [level, setLevel] = useState(75);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setLevel(initialData.level || 75);
    } else {
      setName("");
      setLevel(75);
    }
  }, [initialData, isOpen]);

  const getLevelLabel = (l) => {
    if (l >= 90) return "Expert 🔥";
    if (l >= 75) return "Advanced ⚡";
    if (l >= 50) return "Intermediate 📈";
    if (l >= 25) return "Beginner 🌱";
    return "Learning 📚";
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), level });
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Skill" : "Add New Skill"}
    >
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm text-white/70">Skill Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., JavaScript, React, Python..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-cyber focus:outline-none"
            autoFocus
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm text-white/70">Expertise Level</label>
            <span className="rounded-full bg-cyber/20 px-3 py-1 text-sm font-medium text-cyber">
              {level}% - {getLevelLabel(level)}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyber"
          />
          <div className="mt-2 flex justify-between text-xs text-white/40">
            <span>Beginner</span>
            <span>Intermediate</span>
            <span>Advanced</span>
            <span>Expert</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/20 py-3 text-sm text-white/70 transition hover:bg-white/5"
          >
            Cancel
          </button>
          <NeonButton onClick={handleSubmit} className="flex-1 justify-center">
            {initialData ? "Update Skill" : "Add Skill"}
          </NeonButton>
        </div>
      </div>
    </CustomModal>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Project Modal                                                */
/* ─────────────────────────────────────────────────────────── */
const ProjectModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    projectUrl: "",
    githubUrl: "",
    tags: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        imageUrl: initialData.imageUrl || initialData.image || "",
        projectUrl: initialData.projectUrl || initialData.url || "",
        githubUrl: initialData.githubUrl || "",
        tags: Array.isArray(initialData.tags)
          ? initialData.tags.join(", ")
          : "",
      });
    } else {
      setForm({
        title: "",
        description: "",
        imageUrl: "",
        projectUrl: "",
        githubUrl: "",
        tags: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSave({
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Project" : "Add New Project"}
    >
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
        <div>
          <label className="mb-1 block text-sm text-white/70">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyber focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyber focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">Image URL</label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, imageUrl: e.target.value }))
            }
            placeholder="https://example.com/image.png"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyber focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-white/70">Live URL</label>
            <input
              type="url"
              value={form.projectUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, projectUrl: e.target.value }))
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyber focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">GitHub</label>
            <input
              type="url"
              value={form.githubUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, githubUrl: e.target.value }))
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyber focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
            placeholder="React, Node.js, MongoDB"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyber focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-white/20 py-3 text-sm text-white/70 hover:bg-white/5"
        >
          Cancel
        </button>
        <NeonButton onClick={handleSubmit} className="flex-1 justify-center">
          {initialData ? "Update" : "Add Project"}
        </NeonButton>
      </div>
    </CustomModal>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Experience Modal                                             */
/* ─────────────────────────────────────────────────────────── */
const ExperienceModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    jobTitle: "",
    company: "",
    description: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        jobTitle: initialData.jobTitle || initialData.role || "",
        company: initialData.company || "",
        description: initialData.description || "",
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        isCurrent: initialData.isCurrent || false,
      });
    } else {
      setForm({
        jobTitle: "",
        company: "",
        description: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (!form.jobTitle.trim() || !form.company.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Experience" : "Add Experience"}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-white/70">
            Job Title *
          </label>
          <input
            type="text"
            value={form.jobTitle}
            onChange={(e) =>
              setForm((p) => ({ ...p, jobTitle: e.target.value }))
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyber focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">Company *</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) =>
              setForm((p) => ({ ...p, company: e.target.value }))
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyber focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyber focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-white/70">
              Start Date
            </label>
            <input
              type="month"
              value={form.startDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, startDate: e.target.value }))
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyber focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">End Date</label>
            <input
              type="month"
              value={form.endDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, endDate: e.target.value }))
              }
              disabled={form.isCurrent}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyber focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={form.isCurrent}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                isCurrent: e.target.checked,
                endDate: "",
              }))
            }
            className="rounded accent-cyber"
          />
          I currently work here
        </label>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-white/20 py-3 text-sm text-white/70 hover:bg-white/5"
        >
          Cancel
        </button>
        <NeonButton onClick={handleSubmit} className="flex-1 justify-center">
          {initialData ? "Update" : "Add Experience"}
        </NeonButton>
      </div>
    </CustomModal>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Link Modal                                                   */
/* ─────────────────────────────────────────────────────────── */
const LinkModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({ label: "", url: "", icon: "link" });
  const icons = [
    "github",
    "linkedin",
    "twitter",
    "instagram",
    "youtube",
    "website",
    "email",
    "link",
  ];

  useEffect(() => {
    if (initialData) {
      setForm({
        label: initialData.label || "",
        url: initialData.url || "",
        icon: initialData.icon || "link",
      });
    } else {
      setForm({ label: "", url: "", icon: "link" });
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (!form.label.trim() || !form.url.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Link" : "Add Link"}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-white/70">Label *</label>
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
            placeholder="GitHub"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyber focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">URL *</label>
          <input
            type="url"
            value={form.url}
            onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            placeholder="https://github.com/username"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyber focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">Icon Type</label>
          <div className="flex flex-wrap gap-2">
            {icons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setForm((p) => ({ ...p, icon }))}
                className={`rounded-lg px-3 py-2 text-sm capitalize transition ${
                  form.icon === icon
                    ? "bg-cyber text-night"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-white/20 py-3 text-sm text-white/70 hover:bg-white/5"
        >
          Cancel
        </button>
        <NeonButton onClick={handleSubmit} className="flex-1 justify-center">
          {initialData ? "Update" : "Add Link"}
        </NeonButton>
      </div>
    </CustomModal>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Delete Confirmation Modal                                    */
/* ─────────────────────────────────────────────────────────── */
const DeleteModal = ({ isOpen, onClose, onConfirm, itemName }) => (
  <CustomModal isOpen={isOpen} onClose={onClose} title="Confirm Delete">
    <div className="space-y-4">
      <p className="text-white/70">
        Are you sure you want to delete{" "}
        <span className="font-medium text-white">{itemName}</span>? This action
        cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-white/20 py-3 text-sm text-white/70 hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-pulse py-3 text-sm font-medium text-white transition hover:bg-pulse/80"
        >
          Delete
        </button>
      </div>
    </div>
  </CustomModal>
);

/* ─────────────────────────────────────────────────────────── */
/* Editable Field Component                                     */
/* ─────────────────────────────────────────────────────────── */
const EditableField = ({
  value,
  onChange,
  isOwner,
  placeholder,
  multiline = false,
  className = "",
  textClassName = "text-white",
}) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");

  useEffect(() => {
    setTempValue(value || "");
  }, [value]);

  if (!isOwner) {
    return (
      <span className={`${textClassName} ${className}`}>
        {value || placeholder}
      </span>
    );
  }

  if (editing) {
    return multiline ? (
      <textarea
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onChange(tempValue);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setEditing(false);
            setTempValue(value || "");
          }
        }}
        autoFocus
        placeholder={placeholder}
        className={`w-full resize-none rounded-lg border border-cyber bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-cyber ${className}`}
        rows={4}
      />
    ) : (
      <input
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onChange(tempValue);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEditing(false);
            onChange(tempValue);
          }
          if (e.key === "Escape") {
            setEditing(false);
            setTempValue(value || "");
          }
        }}
        autoFocus
        placeholder={placeholder}
        className={`w-full rounded-lg border border-cyber bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-cyber ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-pointer rounded-lg border border-transparent px-1 transition hover:border-cyber/50 hover:bg-cyber/10 ${textClassName} ${className} ${
        !value ? "italic text-white/40" : ""
      }`}
      title="Click to edit"
    >
      {value || placeholder}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Section Components                                           */
/* ─────────────────────────────────────────────────────────── */
const HeroSection = ({ data, profile, isOwner, style, onEditProfile }) => (
  <section
    className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${style.gradient} p-12 text-center`}
  >
    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
    <div className="relative z-10 space-y-6">
      {/* Profile Image */}
      <div className="group relative mx-auto h-32 w-32">
        <div
          className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${style.accentFrom} ${style.accentTo} text-5xl shadow-2xl overflow-hidden`}
        >
          {data?.profileImage || profile?.avatar ? (
            <img
              src={data?.profileImage || profile?.avatar}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-white">
              {(profile?.name || data?.title || "U")[0].toUpperCase()}
            </span>
          )}
        </div>
        {isOwner && (
          <button
            onClick={() => onEditProfile?.("profileImage")}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <span className="text-sm text-white">📷 Change</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        <h1 className={`text-5xl font-bold ${style.headingColor}`}>
          {data?.title || profile?.name || "Your Name"}
        </h1>
        <p className={`text-xl ${style.textColor}`}>
          {data?.tagline ||
            profile?.headline ||
            profile?.tagline ||
            "Your tagline here"}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <NeonButton
          onClick={() =>
            document
              .getElementById("contact")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Contact Me
        </NeonButton>
        <button
          onClick={() =>
            document
              .getElementById("projects")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="rounded-full border border-white/30 px-6 py-2 text-white/80 hover:bg-white/10"
        >
          View Work
        </button>
      </div>
    </div>
  </section>
);

const AboutSection = ({ data, profile, isOwner, style }) => (
  <section
    id="about"
    className={`space-y-6 rounded-3xl border border-white/10 ${style.cardBg} p-8`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.iconBg} text-xl`}
      >
        👤
      </div>
      <h2 className={`text-2xl font-bold ${style.headingColor}`}>About Me</h2>
    </div>
    <p className={`text-lg leading-relaxed ${style.textColor}`}>
      {data?.aboutMe || data?.bio || profile?.bio || "Tell your story here..."}
    </p>
  </section>
);

const SkillsSection = ({
  skills = [],
  isOwner,
  style,
  onAdd,
  onEdit,
  onDelete,
}) => (
  <section
    id="skills"
    className={`space-y-6 rounded-3xl border border-white/10 ${style.cardBg} p-8`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.iconBg} text-xl`}
        >
          ⚡
        </div>
        <h2 className={`text-2xl font-bold ${style.headingColor}`}>
          Skills & Expertise
        </h2>
      </div>
      {isOwner && (
        <button
          onClick={onAdd}
          className="rounded-full border border-cyber/50 px-4 py-1 text-sm text-cyber hover:bg-cyber/10"
        >
          + Add Skill
        </button>
      )}
    </div>

    {skills.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2">
        {skills.map((skill, i) => (
          <div key={skill.id || i} className="group relative space-y-2">
            <div className="flex justify-between text-sm">
              <span className={style.headingColor}>{skill.name}</span>
              <span className={style.textColor}>{skill.level}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.level}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className={`h-full bg-gradient-to-r ${style.accentFrom} ${style.accentTo}`}
              />
            </div>
            {isOwner && (
              <div className="absolute -right-2 -top-2 hidden gap-1 group-hover:flex">
                <button
                  onClick={() => onEdit(skill)}
                  className="rounded-full bg-cyber/80 px-2 py-0.5 text-xs text-night"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(skill)}
                  className="rounded-full bg-pulse/80 px-2 py-0.5 text-xs text-white"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className={`py-8 text-center ${style.textColor}`}>
        {isOwner
          ? "Click '+ Add Skill' to showcase your expertise"
          : "No skills added yet"}
      </p>
    )}
  </section>
);

const ProjectsSection = ({
  projects = [],
  isOwner,
  style,
  onAdd,
  onEdit,
  onDelete,
}) => (
  <section
    id="projects"
    className={`space-y-6 rounded-3xl border border-white/10 ${style.cardBg} p-8`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.iconBg} text-xl`}
        >
          💼
        </div>
        <h2 className={`text-2xl font-bold ${style.headingColor}`}>
          Projects & Work
        </h2>
      </div>
      {isOwner && (
        <button
          onClick={onAdd}
          className="rounded-full border border-cyber/50 px-4 py-1 text-sm text-cyber hover:bg-cyber/10"
        >
          + Add Project
        </button>
      )}
    </div>

    {projects.length > 0 ? (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <motion.div
            key={project.id || i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          >
            <div
              className={`flex aspect-video items-center justify-center bg-gradient-to-br ${style.accentFrom}/20 ${style.accentTo}/20 text-4xl`}
            >
              {project.imageUrl || project.image ? (
                <img
                  src={project.imageUrl || project.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                "🖼️"
              )}
            </div>
            <div className="space-y-2 p-4">
              <h3 className={`text-lg font-semibold ${style.headingColor}`}>
                {project.title}
              </h3>
              <p className={`text-sm line-clamp-2 ${style.textColor}`}>
                {project.description}
              </p>
              {project.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag, j) => (
                    <span
                      key={j}
                      className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                {(project.projectUrl || project.url) && (
                  <a
                    href={project.projectUrl || project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyber hover:underline"
                  >
                    Live Demo →
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/60 hover:underline"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>
            {isOwner && (
              <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
                <button
                  onClick={() => onEdit(project)}
                  className="rounded-full bg-cyber/80 px-2 py-1 text-xs text-night"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(project)}
                  className="rounded-full bg-pulse/80 px-2 py-1 text-xs text-white"
                >
                  ×
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    ) : (
      <p className={`py-8 text-center ${style.textColor}`}>
        {isOwner
          ? "Click '+ Add Project' to showcase your work"
          : "No projects added yet"}
      </p>
    )}
  </section>
);

const ExperienceSection = ({
  experiences = [],
  isOwner,
  style,
  onAdd,
  onEdit,
  onDelete,
}) => (
  <section
    id="experience"
    className={`space-y-6 rounded-3xl border border-white/10 ${style.cardBg} p-8`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.iconBg} text-xl`}
        >
          📈
        </div>
        <h2 className={`text-2xl font-bold ${style.headingColor}`}>
          Experience
        </h2>
      </div>
      {isOwner && (
        <button
          onClick={onAdd}
          className="rounded-full border border-cyber/50 px-4 py-1 text-sm text-cyber hover:bg-cyber/10"
        >
          + Add Experience
        </button>
      )}
    </div>

    {experiences.length > 0 ? (
      <div className="space-y-6">
        {experiences.map((exp, i) => (
          <motion.div
            key={exp.id || i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`group relative border-l-2 ${style.borderColor}/50 pl-6`}
          >
            <div
              className={`absolute -left-2 top-0 h-4 w-4 rounded-full bg-gradient-to-r ${style.accentFrom} ${style.accentTo}`}
            />
            <div className="space-y-1">
              <h3 className={`text-lg font-semibold ${style.headingColor}`}>
                {exp.jobTitle || exp.role}
              </h3>
              <p className="text-cyber">{exp.company}</p>
              <p className={`text-sm ${style.textColor}`}>
                {exp.startDate} -{" "}
                {exp.isCurrent ? "Present" : exp.endDate || exp.period}
              </p>
              {exp.description && (
                <p className={`mt-2 ${style.textColor}`}>{exp.description}</p>
              )}
            </div>
            {isOwner && (
              <div className="absolute right-0 top-0 hidden gap-1 group-hover:flex">
                <button
                  onClick={() => onEdit(exp)}
                  className="rounded-full bg-cyber/80 px-2 py-1 text-xs text-night"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(exp)}
                  className="rounded-full bg-pulse/80 px-2 py-1 text-xs text-white"
                >
                  ×
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    ) : (
      <p className={`py-8 text-center ${style.textColor}`}>
        {isOwner
          ? "Click '+ Add Experience' to add your work history"
          : "No experience added yet"}
      </p>
    )}
  </section>
);

const LinksSection = ({
  links = [],
  isOwner,
  style,
  onAdd,
  onEdit,
  onDelete,
  dashboardId,
}) => {
  const getIconEmoji = (icon) => {
    const icons = {
      github: "💻",
      linkedin: "💼",
      twitter: "🐦",
      instagram: "📸",
      youtube: "🎬",
      website: "🌐",
      email: "📧",
      link: "🔗",
    };
    return icons[icon] || "🔗";
  };

  return (
    <section
      id="links"
      className={`space-y-6 rounded-3xl border border-white/10 ${style.cardBg} p-8`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.iconBg} text-xl`}
          >
            🔗
          </div>
          <h2 className={`text-2xl font-bold ${style.headingColor}`}>Links</h2>
        </div>
        {isOwner && (
          <button
            onClick={onAdd}
            className="rounded-full border border-cyber/50 px-4 py-1 text-sm text-cyber hover:bg-cyber/10"
          >
            + Add Link
          </button>
        )}
      </div>

      {links.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {links.map((link, i) => (
            <a
              key={link.id || i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                dashboardId &&
                api.analytics
                  ?.trackClick?.(dashboardId, link.id, link.url)
                  .catch(() => {})
              }
              className={`group relative flex items-center gap-3 rounded-xl border border-white/10 ${style.cardBg} p-4 transition hover:border-cyber/50 hover:bg-white/5`}
            >
              <span className="text-xl">{getIconEmoji(link.icon)}</span>
              <span className={style.headingColor}>{link.label}</span>
              {isOwner && (
                <div
                  className="absolute right-2 hidden gap-1 group-hover:flex"
                  onClick={(e) => e.preventDefault()}
                >
                  <button
                    onClick={() => onEdit(link)}
                    className="rounded-full bg-cyber/80 px-2 py-0.5 text-xs text-night"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(link)}
                    className="rounded-full bg-pulse/80 px-2 py-0.5 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              )}
            </a>
          ))}
        </div>
      ) : (
        <p className={`py-8 text-center ${style.textColor}`}>
          {isOwner
            ? "Click '+ Add Link' to add your social links"
            : "No links added yet"}
        </p>
      )}
    </section>
  );
};

const ContactSection = ({ data, profile, isOwner, style }) => (
  <section
    id="contact"
    className={`space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br ${style.accentFrom}/10 ${style.accentTo}/10 p-8`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.iconBg} text-xl`}
      >
        📬
      </div>
      <h2 className={`text-2xl font-bold ${style.headingColor}`}>
        Get In Touch
      </h2>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <p className={`text-lg ${style.textColor}`}>
          {data?.contactMessage ||
            "I'm always open to new opportunities. Feel free to reach out!"}
        </p>
        {(data?.contactEmail || profile?.email) && (
          <a
            href={`mailto:${data?.contactEmail || profile?.email}`}
            className={`flex items-center gap-3 ${style.textColor} hover:text-cyber`}
          >
            <span>📧</span>
            <span>{data?.contactEmail || profile?.email}</span>
          </a>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Your Name"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-cyber focus:outline-none"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-cyber focus:outline-none"
          />
          <textarea
            placeholder="Your Message"
            rows={4}
            className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-cyber focus:outline-none"
          />
          <NeonButton className="w-full justify-center">
            Send Message
          </NeonButton>
        </form>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────── */
/* Main Dashboard Page                                          */
/* ─────────────────────────────────────────────────────────── */
const PublicDashboardPage = ({ params }) => {
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [skillModal, setSkillModal] = useState({ open: false, data: null });
  const [projectModal, setProjectModal] = useState({ open: false, data: null });
  const [expModal, setExpModal] = useState({ open: false, data: null });
  const [linkModal, setLinkModal] = useState({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: null,
    item: null,
  });

  const user = useAppStore((s) => s.user);
  const { notify } = useToast();

  const isOwner =
    user?.handle === params.handle || user?.username === params.handle;

  // Get template style
  const templateSlug =
    dashboard?.template?.slug || dashboard?.templateId || "default";
  const style = getStyle(templateSlug);

  // Load dashboard data
  useEffect(() => {
    const load = async () => {
      try {
        const [dashData, profileData] = await Promise.all([
          api.public.dashboard(params.handle, params.slug).catch(() => null),
          api.public.profile(params.handle).catch(() => null),
        ]);

        if (!dashData) {
          setError("Dashboard not found");
          return;
        }

        setDashboard(dashData);
        setProfile(profileData);

        // Track view (non-blocking)
        if (dashData.id) {
          api.analytics?.trackView?.(dashData.id).catch(() => {});
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.handle, params.slug]);

  // Reload dashboard after changes
  const reload = async () => {
    try {
      const data = await api.dashboards.detail(dashboard.id);
      setDashboard(data);
    } catch (err) {
      console.error("Failed to reload dashboard:", err);
    }
  };

  /* ─────────────── SKILL HANDLERS ─────────────── */
  const handleAddSkill = async (skill) => {
    try {
      await api.dashboards.addSkill(dashboard.id, skill);
      notify({
        title: "Skill added! ⚡",
        message: `${skill.name} (${skill.level}% expertise)`,
      });
      reload();
    } catch (err) {
      notify({ title: "Failed to add skill", message: err.message });
    }
  };

  const handleUpdateSkill = async (skill) => {
    try {
      await api.dashboards.updateSkill(dashboard.id, skillModal.data.id, skill);
      notify({
        title: "Skill updated! ✨",
        message: `${skill.name} is now at ${skill.level}%`,
      });
      reload();
    } catch (err) {
      notify({ title: "Failed to update skill", message: err.message });
    }
  };

  /* ─────────────── PROJECT HANDLERS ─────────────── */
  const handleSaveProject = async (project) => {
    try {
      if (projectModal.data?.id) {
        await api.dashboards.updateProject(
          dashboard.id,
          projectModal.data.id,
          project
        );
        notify({ title: "Project updated! 💼", message: project.title });
      } else {
        await api.dashboards.addProject(dashboard.id, project);
        notify({ title: "Project added! 🚀", message: project.title });
      }
      reload();
    } catch (err) {
      notify({ title: "Failed to save project", message: err.message });
    }
  };

  /* ─────────────── EXPERIENCE HANDLERS ─────────────── */
  const handleSaveExperience = async (exp) => {
    try {
      if (expModal.data?.id) {
        await api.dashboards.updateExperience(
          dashboard.id,
          expModal.data.id,
          exp
        );
        notify({
          title: "Experience updated! 📈",
          message: `${exp.jobTitle} at ${exp.company}`,
        });
      } else {
        await api.dashboards.addExperience(dashboard.id, exp);
        notify({
          title: "Experience added! ✅",
          message: `${exp.jobTitle} at ${exp.company}`,
        });
      }
      reload();
    } catch (err) {
      notify({ title: "Failed to save experience", message: err.message });
    }
  };

  /* ─────────────── LINK HANDLERS ─────────────── */
  const handleSaveLink = async (link) => {
    try {
      if (linkModal.data?.id) {
        await api.dashboards.updateLink(dashboard.id, linkModal.data.id, link);
        notify({ title: "Link updated! 🔗", message: link.label });
      } else {
        await api.dashboards.addLink(dashboard.id, link);
        notify({ title: "Link added! 🌐", message: link.label });
      }
      reload();
    } catch (err) {
      notify({ title: "Failed to save link", message: err.message });
    }
  };

  /* ─────────────── DELETE HANDLER ─────────────── */
  const handleDelete = async () => {
    const { type, item } = deleteModal;
    try {
      switch (type) {
        case "skill":
          await api.dashboards.deleteSkill(dashboard.id, item.id);
          notify({
            title: "Skill removed",
            message: `${item.name} has been deleted`,
          });
          break;
        case "project":
          await api.dashboards.deleteProject(dashboard.id, item.id);
          notify({
            title: "Project removed",
            message: `${item.title} has been deleted`,
          });
          break;
        case "experience":
          await api.dashboards.deleteExperience(dashboard.id, item.id);
          notify({
            title: "Experience removed",
            message: `${item.jobTitle || item.role} has been deleted`,
          });
          break;
        case "link":
          await api.dashboards.deleteLink(dashboard.id, item.id);
          notify({
            title: "Link removed",
            message: `${item.label} has been deleted`,
          });
          break;
      }
      setDeleteModal({ open: false, type: null, item: null });
      reload();
    } catch (err) {
      notify({ title: "Failed to delete", message: err.message });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-10 w-10 rounded-full border-2 border-cyber border-t-transparent"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-night p-6">
        <div className="text-6xl">📊</div>
        <h1 className="text-2xl font-bold text-white">Dashboard not found</h1>
        <p className="text-white/60">{error}</p>
        <div className="flex gap-4">
          <Link
            href={`/p/${params.handle}`}
            className="rounded-full border border-cyber px-6 py-2 text-cyber hover:bg-cyber/10"
          >
            View profile
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/20 px-6 py-2 text-white/60 hover:bg-white/5"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const sectionVisibility = dashboard?.sectionVisibility || {
    hero: true,
    about: true,
    skills: true,
    projects: true,
    experience: true,
    links: true,
    contact: true,
  };

  return (
    <div className="min-h-screen bg-night">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-night/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/p/${params.handle}`}
              className="flex items-center gap-2 text-white/60 transition hover:text-white"
            >
              <span>←</span>
              <span>@{params.handle}</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="font-semibold text-white">{dashboard?.title}</span>
          </div>
          <div className="flex items-center gap-4">
            {isOwner && <Tag tone="accent">✏️ Edit Mode</Tag>}
            <Tag
              tone={dashboard?.visibility === "public" ? "positive" : "neutral"}
            >
              {dashboard?.visibility || "public"}
            </Tag>
          </div>
        </div>
      </header>

      {/* Edit Mode Banner */}
      {isOwner && (
        <div className="border-b border-cyber/30 bg-cyber/10 px-6 py-2 text-center text-sm text-cyber">
          ✏️ You're editing your dashboard. Use the + buttons to add content.
          Changes save automatically.
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Hero Section */}
          {sectionVisibility.hero !== false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <HeroSection
                data={dashboard}
                profile={profile}
                isOwner={isOwner}
                style={style}
              />
            </motion.div>
          )}

          {/* About Section */}
          {sectionVisibility.about !== false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AboutSection
                data={dashboard}
                profile={profile}
                isOwner={isOwner}
                style={style}
              />
            </motion.div>
          )}

          {/* Skills Section */}
          {sectionVisibility.skills !== false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SkillsSection
                skills={dashboard?.skills || []}
                isOwner={isOwner}
                style={style}
                onAdd={() => setSkillModal({ open: true, data: null })}
                onEdit={(skill) => setSkillModal({ open: true, data: skill })}
                onDelete={(skill) =>
                  setDeleteModal({ open: true, type: "skill", item: skill })
                }
              />
            </motion.div>
          )}

          {/* Projects Section */}
          {sectionVisibility.projects !== false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ProjectsSection
                projects={dashboard?.projects || []}
                isOwner={isOwner}
                style={style}
                onAdd={() => setProjectModal({ open: true, data: null })}
                onEdit={(project) =>
                  setProjectModal({ open: true, data: project })
                }
                onDelete={(project) =>
                  setDeleteModal({ open: true, type: "project", item: project })
                }
              />
            </motion.div>
          )}

          {/* Experience Section */}
          {sectionVisibility.experience !== false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ExperienceSection
                experiences={dashboard?.experiences || []}
                isOwner={isOwner}
                style={style}
                onAdd={() => setExpModal({ open: true, data: null })}
                onEdit={(exp) => setExpModal({ open: true, data: exp })}
                onDelete={(exp) =>
                  setDeleteModal({ open: true, type: "experience", item: exp })
                }
              />
            </motion.div>
          )}

          {/* Links Section */}
          {sectionVisibility.links !== false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <LinksSection
                links={dashboard?.links || []}
                isOwner={isOwner}
                style={style}
                onAdd={() => setLinkModal({ open: true, data: null })}
                onEdit={(link) => setLinkModal({ open: true, data: link })}
                onDelete={(link) =>
                  setDeleteModal({ open: true, type: "link", item: link })
                }
                dashboardId={dashboard?.id}
              />
            </motion.div>
          )}

          {/* Contact Section */}
          {sectionVisibility.contact !== false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <ContactSection
                data={dashboard}
                profile={profile}
                isOwner={isOwner}
                style={style}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center">
        <p className="text-sm text-white/40">
          Powered by{" "}
          <Link href="/" className="text-cyber hover:underline">
            OpenPersona
          </Link>
        </p>
      </footer>

      {/* Modals */}
      <SkillModal
        isOpen={skillModal.open}
        onClose={() => setSkillModal({ open: false, data: null })}
        onSave={skillModal.data ? handleUpdateSkill : handleAddSkill}
        initialData={skillModal.data}
      />
      <ProjectModal
        isOpen={projectModal.open}
        onClose={() => setProjectModal({ open: false, data: null })}
        onSave={handleSaveProject}
        initialData={projectModal.data}
      />
      <ExperienceModal
        isOpen={expModal.open}
        onClose={() => setExpModal({ open: false, data: null })}
        onSave={handleSaveExperience}
        initialData={expModal.data}
      />
      <LinkModal
        isOpen={linkModal.open}
        onClose={() => setLinkModal({ open: false, data: null })}
        onSave={handleSaveLink}
        initialData={linkModal.data}
      />
      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: null, item: null })}
        onConfirm={handleDelete}
        itemName={
          deleteModal.item?.name ||
          deleteModal.item?.title ||
          deleteModal.item?.label ||
          deleteModal.item?.jobTitle ||
          "this item"
        }
      />
    </div>
  );
};

export default PublicDashboardPage;
