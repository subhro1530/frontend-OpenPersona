"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import NeonButton from "@/components/ui/NeonButton";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import api from "@/lib/api-client";
import { useToast } from "@/components/ui/ToastProvider";
import useAppStore from "@/store/useAppStore";

const templateVisuals = {
  "Neon Portfolio": {
    gradient: "linear-gradient(135deg, #5c4dff 0%, #00f7ff 100%)",
    accent: "#00f7ff",
    sections: [
      "Hero",
      "Experience",
      "Skills",
      "Projects",
      "Education",
      "Certifications",
      "Contact",
    ],
  },
  "Case Study Atlas": {
    gradient: "linear-gradient(135deg, #ff7ee2 0%, #ffb347 100%)",
    accent: "#ff7ee2",
    sections: [
      "Timeline",
      "Experience",
      "Gallery",
      "Projects",
      "Testimonials",
      "Links",
      "CTA",
    ],
  },
  "Minimal Noir": {
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    accent: "#e94560",
    sections: [
      "Introduction",
      "Experience",
      "Skills",
      "Projects",
      "Resume Links",
      "Contact",
    ],
  },
  "Creative Canvas": {
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    accent: "#667eea",
    sections: [
      "Hero banner",
      "Portfolio grid",
      "Experience",
      "Certifications",
      "About",
      "Social links",
    ],
  },
};

const defaultTemplates = [
  {
    id: "portfolio",
    label: "Neon Portfolio",
    description: "Complete portfolio with experience, skills, and projects",
    slug: "portfolio",
    isPremium: false,
  },
  {
    id: "case-study",
    label: "Case Study Atlas",
    description: "Timeline-based with gallery and testimonials",
    slug: "case-study",
    isPremium: false,
  },
  {
    id: "minimal",
    label: "Minimal Noir",
    description: "Clean, dark, elegant with resume links",
    slug: "minimal",
    isPremium: true,
  },
  {
    id: "creative",
    label: "Creative Canvas",
    description: "Artistic layout with certification showcase",
    slug: "creative",
    isPremium: true,
  },
];

/* ─────────────────────────────────────────────────────────── */
/* Template card                                                */
/* ─────────────────────────────────────────────────────────── */
const TemplateCard = ({
  template,
  isActive,
  onSelect,
  onPreview,
  onPremiumClick,
}) => {
  const visual = templateVisuals[template.label] || {
    gradient: "linear-gradient(135deg, #5c4dff 0%, #ff7ee2 100%)",
    accent: "#5c4dff",
    sections: ["Section 1", "Section 2"],
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`group relative overflow-hidden rounded-3xl border-2 transition ${
        isActive
          ? "border-cyber bg-cyber/5"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      {/* Preview header */}
      <div
        className="relative h-48 overflow-hidden"
        style={{ background: visual.gradient }}
      >
        {/* Mock layout */}
        <div className="absolute inset-4 flex flex-col gap-2 rounded-xl border border-white/20 bg-black/30 p-3">
          <div className="h-3 w-24 rounded-full bg-white/40" />
          <div className="h-2 w-16 rounded-full bg-white/20" />
          <div className="mt-auto flex gap-2">
            {visual.sections.slice(0, 3).map((s, i) => (
              <div key={i} className="h-6 flex-1 rounded bg-white/10" />
            ))}
          </div>
        </div>

        {/* Premium badge */}
        {template.isPremium && (
          <div className="absolute right-3 top-3">
            <Tag tone="accent">Premium</Tag>
          </div>
        )}

        {/* Selected badge */}
        {isActive && (
          <div className="absolute left-3 top-3">
            <Tag tone="success">Selected</Tag>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => onPreview(template)}
            className="rounded-full border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Preview
          </button>
          <button
            onClick={() => onSelect(template)}
            className="rounded-full bg-cyber px-4 py-2 text-sm text-night"
          >
            Select
          </button>
        </div>
      </div>

      {/* Info footer */}
      <div className="p-4">
        <p className="font-semibold text-white">
          {template.label || template.name}
        </p>
        <p className="mt-1 text-sm text-white/60">{template.description}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {visual.sections.map((section, i) => (
            <span
              key={i}
              className="rounded-full bg-white/5 px-2 py-1 text-xs text-white/50"
            >
              {section}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Preview modal                                                */
/* ─────────────────────────────────────────────────────────── */
const PreviewModal = ({ template, onClose, onApply }) => {
  if (!template) return null;

  const visual = templateVisuals[template.label] || {
    gradient: "linear-gradient(135deg, #5c4dff 0%, #ff7ee2 100%)",
    accent: "#5c4dff",
    sections: ["Section 1", "Section 2", "Section 3"],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-night"
      >
        {/* Header */}
        <div
          className="relative h-64 p-6"
          style={{ background: visual.gradient }}
        >
          <div className="absolute inset-6 flex flex-col rounded-2xl border border-white/20 bg-black/30 p-6">
            <div className="mb-4 h-8 w-48 rounded-lg bg-white/30" />
            <div className="h-4 w-32 rounded bg-white/20" />
            <div className="mt-auto grid grid-cols-4 gap-4">
              {visual.sections.map((section, i) => (
                <div
                  key={i}
                  className="flex h-20 flex-col items-center justify-center rounded-xl bg-white/10"
                >
                  <div className="h-3 w-12 rounded bg-white/30" />
                  <p className="mt-2 text-xs text-white/60">{section}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-white">
                {template.label || template.name}
              </p>
              <p className="mt-1 text-white/60">{template.description}</p>
              {template.isPremium && (
                <div className="mt-3">
                  <Tag tone="accent">Premium template</Tag>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="rounded-full border border-white/20 px-5 py-2 text-white/70 hover:bg-white/5"
              >
                Close
              </button>
              <NeonButton onClick={() => onApply(template)}>
                Apply template
              </NeonButton>
            </div>
          </div>

          {/* Sections */}
          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="text-sm text-white/60">Included sections</p>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {visual.sections.map((section, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: visual.accent }}
                  />
                  <span className="text-sm text-white">{section}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Apply confirmation modal                                     */
/* ─────────────────────────────────────────────────────────── */
const ApplyModal = ({ template, onConfirm, onClose, loading }) => {
  if (!template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-night p-6"
      >
        <div>
          <p className="text-lg font-semibold text-white">Apply template?</p>
          <p className="mt-1 text-sm text-white/60">
            This will update your profile to use the{" "}
            <span className="text-cyber">{template.label}</span> template.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">
            Your current portfolio will be:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-white/80">
            <li>• Restyled with new layout</li>
            <li>• Updated with new sections</li>
            <li>• Content preserved</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <NeonButton onClick={onConfirm} disabled={loading}>
            {loading ? "Applying..." : "Confirm"}
          </NeonButton>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Main component                                               */
/* ─────────────────────────────────────────────────────────── */
const TemplatesShowcase = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState(defaultTemplates);
  const [active, setActive] = useState("portfolio");
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [applyTemplate, setApplyTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [adminTemplates, setAdminTemplates] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminForm, setAdminForm] = useState({
    slug: "",
    name: "",
    description: "",
    previewUrl: "",
    category: "General",
    tags: "",
    status: "active",
    isPremium: false,
    themeConfig: JSON.stringify(
      {
        fonts: { heading: "Space Grotesk", body: "Inter" },
        colors: { primary: "#0f172a", accent: "#22d3ee" },
        spacing: { section: "80px", block: "32px" },
      },
      null,
      2
    ),
    componentSnippets: JSON.stringify(
      {
        hero: {
          language: "tsx",
          code: '<Hero title="Ship bold work" badge="Admin test" />',
        },
      },
      null,
      2
    ),
  });
  const { notify } = useToast();
  const isAdmin = useAppStore((s) => s.isAdmin);
  const plan = useAppStore((s) => s.plan);

  // Check if user has a paid plan
  const isPaidPlan =
    plan?.name?.toLowerCase()?.includes("growth") ||
    plan?.name?.toLowerCase()?.includes("scale") ||
    plan?.name?.toLowerCase()?.includes("pro") ||
    plan?.name?.toLowerCase()?.includes("premium");

  // Handle template selection - redirect to billing for premium templates if not paid
  const handleTemplateSelect = useCallback(
    (template) => {
      if (template.isPremium && !isPaidPlan) {
        notify({
          title: "Premium template",
          message: "Upgrade your plan to use premium templates.",
        });
        router.push("/app/billing");
        return;
      }
      setApplyTemplate(template);
    },
    [isPaidPlan, notify, router]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.templates.list();
        if (Array.isArray(data) && data.length > 0) {
          setTemplates(data);
        }
      } catch (_err) {
        // keep defaults
      }
    };
    load();
  }, []);

  const loadAdminTemplates = useCallback(async () => {
    if (!isAdmin) return;
    setAdminLoading(true);
    try {
      const data = await api.templates.admin.list();
      setAdminTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      notify({ title: "Admin template fetch failed", message: err.message });
    } finally {
      setAdminLoading(false);
    }
  }, [isAdmin, notify]);

  useEffect(() => {
    loadAdminTemplates();
  }, [loadAdminTemplates]);

  const handleApply = async () => {
    if (!applyTemplate) return;
    setLoading(true);
    try {
      await api.profile.updateTemplate({
        template: applyTemplate.slug || applyTemplate.id,
      });
      setActive(applyTemplate.slug || applyTemplate.id);
      notify({
        title: "Template applied",
        message: `Now using ${applyTemplate.label}`,
      });
      setApplyTemplate(null);
    } catch (err) {
      notify({ title: "Template failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminFormChange = useCallback((field, value) => {
    setAdminForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAdminCreate = useCallback(async () => {
    if (!isAdmin) return;
    if (!adminForm.slug || !adminForm.name || !adminForm.description) {
      notify({
        title: "Missing info",
        message: "Slug, name, and description are required.",
      });
      return;
    }

    let themeConfig;
    let componentSnippets;
    try {
      themeConfig = adminForm.themeConfig
        ? JSON.parse(adminForm.themeConfig)
        : {};
    } catch (_err) {
      notify({
        title: "Invalid theme config",
        message: "Please provide valid JSON.",
      });
      return;
    }

    try {
      componentSnippets = adminForm.componentSnippets
        ? JSON.parse(adminForm.componentSnippets)
        : {};
    } catch (_err) {
      notify({
        title: "Invalid component snippets",
        message: "Please provide valid JSON.",
      });
      return;
    }

    setAdminLoading(true);
    try {
      const payload = {
        slug: adminForm.slug,
        name: adminForm.name,
        description: adminForm.description,
        previewUrl: adminForm.previewUrl,
        category: adminForm.category,
        tags: adminForm.tags
          ? adminForm.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        status: adminForm.status,
        isPremium: adminForm.isPremium,
        themeConfig,
        componentSnippets,
      };
      const newTemplate = await api.templates.admin.create(payload);
      setAdminTemplates((prev) => [newTemplate, ...prev]);
      setAdminForm({
        slug: "",
        name: "",
        description: "",
        previewUrl: "",
        category: "General",
        tags: "",
        status: "active",
        isPremium: false,
        themeConfig: adminForm.themeConfig,
        componentSnippets: adminForm.componentSnippets,
      });
      notify({
        title: "Template created",
        message: "Template is now available to users.",
      });
    } catch (err) {
      notify({ title: "Creation failed", message: err.message });
    } finally {
      setAdminLoading(false);
    }
  }, [adminForm, isAdmin, notify]);

  const handleAdminToggle = useCallback(
    async (template) => {
      if (!isAdmin) return;
      setAdminLoading(true);
      try {
        const updated = await api.templates.admin.update(template.id, {
          status: template.status === "active" ? "archived" : "active",
        });
        setAdminTemplates((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        notify({
          title: "Template updated",
          message: `${updated.name} is now ${updated.status}.`,
        });
      } catch (err) {
        notify({ title: "Update failed", message: err.message });
      } finally {
        setAdminLoading(false);
      }
    },
    [isAdmin, notify]
  );

  const filteredTemplates =
    filter === "all"
      ? templates
      : filter === "premium"
      ? templates.filter((t) => t.isPremium)
      : templates.filter((t) => !t.isPremium);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Templates"
        title="Choose your style"
        description="Select a template that matches your personal brand."
      />

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "free", "premium"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-xs capitalize transition ${
              filter === f
                ? "bg-cyber text-night"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isActive={active === (template.slug || template.id)}
              onSelect={handleTemplateSelect}
              onPreview={setPreviewTemplate}
            />
          ))}
        </AnimatePresence>
      </div>

      {isAdmin && (
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-white">
                Template control room
              </p>
              <p className="text-sm text-white/60">
                Publish new layouts, toggle availability, and manage premium
                states directly from the live catalog.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadAdminTemplates}
                disabled={adminLoading}
                className="rounded-full border border-white/30 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                {adminLoading ? "Refreshing..." : "Refresh"}
              </button>
              <Tag tone="accent">Admin</Tag>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <GlowCard className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
                Ship a new template
              </p>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-wide text-white/60">
                    Slug
                  </label>
                  <input
                    className="rounded-xl border border-white/10 bg-night/60 p-3 text-sm text-white"
                    value={adminForm.slug}
                    onChange={(e) =>
                      handleAdminFormChange("slug", e.target.value)
                    }
                    placeholder="neon-portfolio"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-wide text-white/60">
                    Name
                  </label>
                  <input
                    className="rounded-xl border border-white/10 bg-night/60 p-3 text-sm text-white"
                    value={adminForm.name}
                    onChange={(e) =>
                      handleAdminFormChange("name", e.target.value)
                    }
                    placeholder="Neon Portfolio"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-wide text-white/60">
                    Description
                  </label>
                  <textarea
                    className="min-h-[72px] rounded-xl border border-white/10 bg-night/60 p-3 text-sm text-white"
                    value={adminForm.description}
                    onChange={(e) =>
                      handleAdminFormChange("description", e.target.value)
                    }
                    placeholder="Hero + skills grid + CTA"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-wide text-white/60">
                    Preview URL
                  </label>
                  <input
                    className="rounded-xl border border-white/10 bg-night/60 p-3 text-sm text-white"
                    value={adminForm.previewUrl}
                    onChange={(e) =>
                      handleAdminFormChange("previewUrl", e.target.value)
                    }
                    placeholder="https://cdn.openpersona.dev/templates/neon"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-wide text-white/60">
                    Category
                  </label>
                  <input
                    className="rounded-xl border border-white/10 bg-night/60 p-3 text-sm text-white"
                    value={adminForm.category}
                    onChange={(e) =>
                      handleAdminFormChange("category", e.target.value)
                    }
                    placeholder="Portfolio"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-wide text-white/60">
                    Tags
                  </label>
                  <input
                    className="rounded-xl border border-white/10 bg-night/60 p-3 text-sm text-white"
                    value={adminForm.tags}
                    onChange={(e) =>
                      handleAdminFormChange("tags", e.target.value)
                    }
                    placeholder="bold,futuristic,premium"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-wide text-white/60">
                    Theme config (JSON)
                  </label>
                  <textarea
                    className="min-h-[120px] rounded-xl border border-white/10 bg-night/60 p-3 text-xs text-white"
                    value={adminForm.themeConfig}
                    onChange={(e) =>
                      handleAdminFormChange("themeConfig", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-wide text-white/60">
                    Component snippets (JSON)
                  </label>
                  <textarea
                    className="min-h-[120px] rounded-xl border border-white/10 bg-night/60 p-3 text-xs text-white"
                    value={adminForm.componentSnippets}
                    onChange={(e) =>
                      handleAdminFormChange("componentSnippets", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={adminForm.isPremium}
                      onChange={(e) =>
                        handleAdminFormChange("isPremium", e.target.checked)
                      }
                      className="h-4 w-4 rounded border border-white/30 bg-transparent"
                    />
                    Premium template
                  </label>
                  <select
                    value={adminForm.status}
                    onChange={(e) =>
                      handleAdminFormChange("status", e.target.value)
                    }
                    className="rounded-full border border-white/20 bg-night/60 px-4 py-2 text-xs uppercase tracking-wide text-white"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <NeonButton onClick={handleAdminCreate} disabled={adminLoading}>
                  {adminLoading ? "Saving..." : "Publish template"}
                </NeonButton>
              </div>
            </GlowCard>

            <GlowCard className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
                Live template catalog
              </p>
              <div className="space-y-3">
                {adminTemplates.length === 0 && (
                  <p className="text-sm text-white/50">
                    No templates found yet. Import an existing layout or publish
                    a new one above.
                  </p>
                )}
                {adminTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {template.name}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-white/40">
                          {template.slug} • {template.status}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAdminToggle(template)}
                        disabled={adminLoading}
                        className="rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-wide text-white/80 hover:bg-white/10"
                      >
                        {template.status === "active" ? "Archive" : "Activate"}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-white/70">
                      {template.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(template.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-night/70 px-3 py-1 text-xs text-white/60"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.isPremium && <Tag tone="accent">Premium</Tag>}
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onApply={(t) => {
            setPreviewTemplate(null);
            handleTemplateSelect(t);
          }}
        />
      )}

      {/* Apply confirmation modal */}
      {applyTemplate && (
        <ApplyModal
          template={applyTemplate}
          onConfirm={handleApply}
          onClose={() => setApplyTemplate(null)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default TemplatesShowcase;
