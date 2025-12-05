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
const HeroSection = ({ data, onChange, isOwner, profile }) => (
  <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyber/20 via-aurora/10 to-pulse/20 p-12 text-center">
    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
    <div className="relative z-10 space-y-6">
      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-cyber to-aurora text-5xl shadow-2xl shadow-cyber/30">
        {profile?.avatar ? (
          <img
            src={profile.avatar}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span>{(profile?.name || data?.name || "U")[0].toUpperCase()}</span>
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-5xl font-bold">
          <EditableField
            value={data?.headline || profile?.name || "Your Name"}
            onChange={(v) => onChange({ ...data, headline: v })}
            isOwner={isOwner}
            placeholder="Your headline"
            textClassName="text-white"
          />
        </h1>
        <p className="text-xl">
          <EditableField
            value={data?.tagline || profile?.tagline || ""}
            onChange={(v) => onChange({ ...data, tagline: v })}
            isOwner={isOwner}
            placeholder="Add a tagline..."
            textClassName="text-white/70"
          />
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

const AboutSection = ({ data, onChange, isOwner, profile }) => (
  <section
    id="about"
    className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8"
  >
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aurora/20 text-xl">
        👤
      </div>
      <h2 className="text-2xl font-bold text-white">About Me</h2>
    </div>
    <div className="text-lg leading-relaxed">
      <EditableField
        value={data?.bio || profile?.bio || ""}
        onChange={(v) => onChange({ ...data, bio: v })}
        isOwner={isOwner}
        placeholder="Tell your story... What drives you? What's your background? Click to edit."
        multiline
        textClassName="text-white/80"
      />
    </div>
    {(data?.highlights || []).length > 0 && (
      <div className="grid gap-4 md:grid-cols-3">
        {data.highlights.map((h, i) => (
          <div key={i} className="rounded-xl bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-cyber">{h.value}</p>
            <p className="text-sm text-white/60">{h.label}</p>
          </div>
        ))}
      </div>
    )}
  </section>
);

const SkillsSection = ({ data, onChange, isOwner }) => {
  const skills = data?.skills || [];

  const addSkill = () => {
    const skill = prompt("Enter skill name:");
    if (skill?.trim()) {
      onChange({
        ...data,
        skills: [...skills, { name: skill.trim(), level: 80 }],
      });
    }
  };

  const removeSkill = (index) => {
    onChange({ ...data, skills: skills.filter((_, i) => i !== index) });
  };

  return (
    <section
      id="skills"
      className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber/20 text-xl">
            ⚡
          </div>
          <h2 className="text-2xl font-bold text-white">Skills & Expertise</h2>
        </div>
        {isOwner && (
          <button
            onClick={addSkill}
            className="rounded-full border border-cyber/50 px-4 py-1 text-sm text-cyber hover:bg-cyber/10"
          >
            + Add Skill
          </button>
        )}
      </div>

      {skills.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {skills.map((skill, i) => (
            <div key={i} className="group relative space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white">{skill.name}</span>
                <span className="text-white/50">{skill.level}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.level}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full bg-gradient-to-r from-cyber to-aurora"
                />
              </div>
              {isOwner && (
                <button
                  onClick={() => removeSkill(i)}
                  className="absolute -right-2 -top-2 hidden rounded-full bg-pulse/80 px-2 py-0.5 text-xs text-white group-hover:block"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-white/40">
          {isOwner
            ? "Click '+ Add Skill' to showcase your expertise"
            : "No skills added yet"}
        </p>
      )}
    </section>
  );
};

const ProjectsSection = ({ data, onChange, isOwner }) => {
  const projects = data?.projects || [];

  const addProject = () => {
    onChange({
      ...data,
      projects: [
        ...projects,
        {
          id: Date.now(),
          title: "New Project",
          description: "Click to edit description...",
          image: null,
          url: "#",
        },
      ],
    });
  };

  const updateProject = (index, updates) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], ...updates };
    onChange({ ...data, projects: updated });
  };

  const removeProject = (index) => {
    onChange({ ...data, projects: projects.filter((_, i) => i !== index) });
  };

  return (
    <section
      id="projects"
      className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pulse/20 text-xl">
            💼
          </div>
          <h2 className="text-2xl font-bold text-white">Projects & Work</h2>
        </div>
        {isOwner && (
          <button
            onClick={addProject}
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
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-cyber/20 to-aurora/20 text-4xl">
                {project.image ? (
                  <img
                    src={project.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "🖼️"
                )}
              </div>
              <div className="space-y-2 p-4">
                <h3 className="text-lg font-semibold">
                  <EditableField
                    value={project.title}
                    onChange={(v) => updateProject(i, { title: v })}
                    isOwner={isOwner}
                    placeholder="Project title"
                    textClassName="text-white"
                  />
                </h3>
                <p className="text-sm">
                  <EditableField
                    value={project.description}
                    onChange={(v) => updateProject(i, { description: v })}
                    isOwner={isOwner}
                    placeholder="Project description..."
                    textClassName="text-white/60"
                  />
                </p>
              </div>
              {isOwner && (
                <button
                  onClick={() => removeProject(i)}
                  className="absolute right-2 top-2 hidden rounded-full bg-pulse/80 px-2 py-1 text-xs text-white group-hover:block"
                >
                  Remove
                </button>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-white/40">
          {isOwner
            ? "Click '+ Add Project' to showcase your work"
            : "No projects added yet"}
        </p>
      )}
    </section>
  );
};

const ExperienceSection = ({ data, onChange, isOwner }) => {
  const experiences = data?.experiences || [];

  const addExperience = () => {
    onChange({
      ...data,
      experiences: [
        ...experiences,
        {
          id: Date.now(),
          role: "Job Title",
          company: "Company Name",
          period: "2023 - Present",
          description: "Click to add description...",
        },
      ],
    });
  };

  const updateExperience = (index, updates) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], ...updates };
    onChange({ ...data, experiences: updated });
  };

  const removeExperience = (index) => {
    onChange({
      ...data,
      experiences: experiences.filter((_, i) => i !== index),
    });
  };

  return (
    <section
      id="experience"
      className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aurora/20 text-xl">
            📈
          </div>
          <h2 className="text-2xl font-bold text-white">Experience</h2>
        </div>
        {isOwner && (
          <button
            onClick={addExperience}
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
              className="group relative border-l-2 border-cyber/50 pl-6"
            >
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-cyber" />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  <EditableField
                    value={exp.role}
                    onChange={(v) => updateExperience(i, { role: v })}
                    isOwner={isOwner}
                    placeholder="Job Title"
                    textClassName="text-white"
                  />
                </h3>
                <p className="text-cyber">
                  <EditableField
                    value={exp.company}
                    onChange={(v) => updateExperience(i, { company: v })}
                    isOwner={isOwner}
                    placeholder="Company Name"
                    textClassName="text-cyber"
                  />
                </p>
                <p className="text-sm text-white/50">
                  <EditableField
                    value={exp.period}
                    onChange={(v) => updateExperience(i, { period: v })}
                    isOwner={isOwner}
                    placeholder="2023 - Present"
                    textClassName="text-white/50"
                  />
                </p>
                <p className="mt-2">
                  <EditableField
                    value={exp.description}
                    onChange={(v) => updateExperience(i, { description: v })}
                    isOwner={isOwner}
                    placeholder="Describe your role..."
                    textClassName="text-white/70"
                  />
                </p>
              </div>
              {isOwner && (
                <button
                  onClick={() => removeExperience(i)}
                  className="absolute right-0 top-0 hidden rounded-full bg-pulse/80 px-2 py-1 text-xs text-white group-hover:block"
                >
                  Remove
                </button>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-white/40">
          {isOwner
            ? "Click '+ Add Experience' to add your work history"
            : "No experience added yet"}
        </p>
      )}
    </section>
  );
};

const ContactSection = ({ data, onChange, isOwner, profile }) => (
  <section
    id="contact"
    className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-cyber/10 to-aurora/10 p-8"
  >
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber/20 text-xl">
        📬
      </div>
      <h2 className="text-2xl font-bold text-white">Get In Touch</h2>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <p className="text-lg">
          <EditableField
            value={
              data?.contactMessage ||
              "I'm always open to new opportunities. Feel free to reach out!"
            }
            onChange={(v) => onChange({ ...data, contactMessage: v })}
            isOwner={isOwner}
            placeholder="Add a contact message..."
            multiline
            textClassName="text-white/80"
          />
        </p>

        <div className="space-y-2">
          {(data?.email || profile?.email) && (
            <a
              href={`mailto:${data?.email || profile?.email}`}
              className="flex items-center gap-3 text-white/70 hover:text-cyber"
            >
              <span>📧</span>
              <span>{data?.email || profile?.email}</span>
            </a>
          )}
        </div>
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [content, setContent] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const user = useAppStore((s) => s.user);
  const { notify } = useToast();

  const isOwner =
    user?.handle === params.handle || user?.username === params.handle;

  useEffect(() => {
    const load = async () => {
      try {
        const [dashData, profileData] = await Promise.all([
          api.public.dashboard(params.handle, params.slug).catch(() => null),
          api.public.profile(params.handle).catch(() => null),
        ]);

        if (!dashData && !profileData) {
          setError("Dashboard not found");
          return;
        }

        setDashboard(dashData || { title: params.slug, slug: params.slug });
        setProfile(profileData);
        setContent(dashData?.content || {});
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.handle, params.slug]);

  const updateContent = useCallback((section, data) => {
    setContent((prev) => ({ ...prev, [section]: data }));
    setHasChanges(true);
  }, []);

  const saveChanges = async () => {
    if (!isOwner || !hasChanges) return;
    setSaving(true);
    try {
      await api.dashboards.update(dashboard.id, { content });
      setHasChanges(false);
      notify({
        title: "Dashboard saved!",
        message: "Your changes have been saved.",
      });
    } catch (err) {
      notify({ title: "Save failed", message: err.message });
    } finally {
      setSaving(false);
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

  const sections = dashboard?.layout?.sections || [
    "hero",
    "about",
    "skills",
    "projects",
    "experience",
    "contact",
  ];

  return (
    <div className="min-h-screen bg-night">
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
            {isOwner && (
              <>
                <Tag tone="accent">Editing Mode</Tag>
                {hasChanges && (
                  <NeonButton onClick={saveChanges} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </NeonButton>
                )}
              </>
            )}
            <Tag tone="success">{dashboard?.visibility || "public"}</Tag>
          </div>
        </div>
      </header>

      {isOwner && (
        <div className="border-b border-cyber/30 bg-cyber/10 px-6 py-2 text-center text-sm text-cyber">
          ✏️ Edit mode active. Click on any text to edit. Your changes will be
          saved when you click Save.
        </div>
      )}

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-12">
        <AnimatePresence mode="wait">
          {sections.map((section, i) => {
            const key =
              typeof section === "string"
                ? section.toLowerCase()
                : section.type?.toLowerCase();
            return (
              <motion.div
                key={key || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {key?.includes("hero") && (
                  <HeroSection
                    data={content.hero}
                    onChange={(d) => updateContent("hero", d)}
                    isOwner={isOwner}
                    profile={profile}
                  />
                )}
                {key?.includes("about") && (
                  <AboutSection
                    data={content.about}
                    onChange={(d) => updateContent("about", d)}
                    isOwner={isOwner}
                    profile={profile}
                  />
                )}
                {key?.includes("skill") && (
                  <SkillsSection
                    data={content.skills}
                    onChange={(d) => updateContent("skills", d)}
                    isOwner={isOwner}
                  />
                )}
                {key?.includes("project") && (
                  <ProjectsSection
                    data={content.projects}
                    onChange={(d) => updateContent("projects", d)}
                    isOwner={isOwner}
                  />
                )}
                {key?.includes("experience") && (
                  <ExperienceSection
                    data={content.experience}
                    onChange={(d) => updateContent("experience", d)}
                    isOwner={isOwner}
                  />
                )}
                {key?.includes("contact") && (
                  <ContactSection
                    data={content.contact}
                    onChange={(d) => updateContent("contact", d)}
                    isOwner={isOwner}
                    profile={profile}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/10 py-8 text-center">
        <p className="text-sm text-white/40">
          Powered by{" "}
          <Link href="/" className="text-cyber hover:underline">
            OpenPersona
          </Link>
        </p>
      </footer>

      {isOwner && hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 md:hidden"
        >
          <NeonButton
            onClick={saveChanges}
            disabled={saving}
            className="shadow-lg shadow-cyber/30"
          >
            {saving ? "Saving..." : "💾 Save"}
          </NeonButton>
        </motion.div>
      )}
    </div>
  );
};

export default PublicDashboardPage;
