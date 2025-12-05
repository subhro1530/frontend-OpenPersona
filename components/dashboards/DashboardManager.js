"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";
import NeonButton from "@/components/ui/NeonButton";
import Tag from "@/components/ui/Tag";
import api from "@/lib/api-client";
import { useToast } from "@/components/ui/ToastProvider";
import useAppStore from "@/store/useAppStore";
import {
  normalizeDashboardsPayload,
  getFrontendUrl,
} from "@/lib/dashboard-utils";

/* ─────────────────────────────────────────────────────────── */
/* Dashboard card                                               */
/* ─────────────────────────────────────────────────────────── */
const DashboardCard = ({ dashboard, userHandle, onEdit, onDelete, onView }) => {
  const frontendUrl = getFrontendUrl();
  const dashboardUrl = `${frontendUrl}/p/${userHandle}/${dashboard.slug}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/20"
    >
      {/* Preview gradient */}
      <div
        className="h-32 cursor-pointer bg-gradient-to-br from-aurora/20 via-cyber/20 to-pulse/20"
        onClick={() => onView(dashboard)}
      />

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div>
            <Tag
              tone={dashboard.visibility === "public" ? "positive" : "neutral"}
            >
              {dashboard.visibility}
            </Tag>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {dashboard.title}
            </h3>
            <p className="text-sm text-white/60">/{dashboard.slug}</p>
          </div>
          {dashboard.isPrimary && (
            <span className="rounded-full bg-aurora/20 px-2 py-1 text-xs text-aurora">
              Primary
            </span>
          )}
        </div>

        {/* Public URL */}
        <div className="rounded-xl bg-black/30 p-2">
          <p className="text-xs text-white/40">Public URL:</p>
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-xs text-cyber hover:underline"
          >
            {dashboardUrl}
          </a>
        </div>

        {/* Layout preview */}
        {dashboard.layout?.sections && (
          <div className="flex flex-wrap gap-1">
            {dashboard.layout.sections.slice(0, 4).map((section) => (
              <span
                key={section}
                className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60"
              >
                {section}
              </span>
            ))}
            {dashboard.layout.sections.length > 4 && (
              <span className="text-xs text-white/40">
                +{dashboard.layout.sections.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <NeonButton
            className="flex-1 justify-center text-xs"
            onClick={() => onEdit(dashboard)}
          >
            Edit
          </NeonButton>
          <button
            onClick={() => onDelete(dashboard.id)}
            className="rounded-full border border-pulse/50 px-3 py-1 text-xs text-pulse hover:bg-pulse/10"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Dashboard editor modal                                       */
/* ─────────────────────────────────────────────────────────── */
const DashboardEditor = ({ dashboard, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: dashboard?.title || "New Dashboard",
    slug: dashboard?.slug || "",
    visibility: dashboard?.visibility || "public",
    layout: JSON.stringify(
      dashboard?.layout || { sections: ["hero", "projects", "cta"] },
      null,
      2
    ),
  });
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      let layoutObj;
      try {
        layoutObj = JSON.parse(form.layout);
      } catch {
        notify({ title: "Invalid JSON in layout" });
        setSaving(false);
        return;
      }

      const payload = {
        title: form.title,
        slug: form.slug,
        visibility: form.visibility,
        layout: layoutObj,
      };

      if (dashboard?.id) {
        await api.dashboards.update(dashboard.id, payload);
      } else {
        await api.dashboards.create(payload);
      }

      onSave();
      onClose();
    } catch (err) {
      notify({ title: "Save failed", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl space-y-4 rounded-3xl border border-white/10 bg-night p-6"
      >
        <h2 className="text-xl font-semibold text-white">
          {dashboard?.id ? "Edit Dashboard" : "Create Dashboard"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/70">Title</label>
            <input
              className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyber"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Slug (URL path)</label>
            <input
              className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
              placeholder="hire-me"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Visibility</label>
            <select
              className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white"
              value={form.visibility}
              onChange={(e) =>
                setForm((p) => ({ ...p, visibility: e.target.value }))
              }
            >
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-white/70">Layout (JSON)</label>
            <textarea
              className="mt-1 min-h-[160px] w-full rounded-2xl bg-white/5 p-4 font-mono text-xs text-white outline-none"
              value={form.layout}
              onChange={(e) =>
                setForm((p) => ({ ...p, layout: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <NeonButton onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Dashboard"}
          </NeonButton>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Dashboard detail view                                        */
/* ─────────────────────────────────────────────────────────── */
const DashboardDetail = ({ dashboard, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.dashboards.detail(dashboard.id);
        setDetail(data);
      } catch (err) {
        notify({ title: "Failed to load dashboard", message: err.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dashboard.id, notify]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl space-y-4 overflow-hidden rounded-3xl border border-white/10 bg-night"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">
              Dashboard preview
            </p>
            <h2 className="text-xl font-semibold text-white">
              {dashboard.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[500px] overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-8 w-8 rounded-full border-2 border-cyber border-t-transparent"
              />
            </div>
          ) : detail ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-white/50">Slug</p>
                  <p className="text-white">/{detail.slug}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Visibility</p>
                  <p className="text-white">{detail.visibility}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Created</p>
                  <p className="text-white">
                    {new Date(detail.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Updated</p>
                  <p className="text-white">
                    {new Date(detail.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-white/50">
                  Layout
                </p>
                <pre className="mt-2 max-h-[200px] overflow-auto rounded-2xl bg-black/60 p-4 text-xs text-cyber">
                  {JSON.stringify(detail.layout, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-white/60">No data</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Main component                                               */
/* ─────────────────────────────────────────────────────────── */
const DashboardManager = () => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState(null);
  const [viewingDashboard, setViewingDashboard] = useState(null);
  const setStoreDashboards = useAppStore((s) => s.setDashboards);
  const plan = useAppStore((s) => s.plan);
  const user = useAppStore((s) => s.user);
  const canCreate = useAppStore((s) => s.canCreateDashboard);
  const { notify } = useToast();
  const safeDashboards = normalizeDashboardsPayload(dashboards);
  const userHandle = user?.handle || user?.username || "user";

  const load = async () => {
    try {
      const data = await api.dashboards.list();
      const normalized = normalizeDashboardsPayload(data);
      setDashboards(normalized);
      setStoreDashboards(normalized);
    } catch (err) {
      notify({ title: "Dashboard fetch failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this dashboard?")) return;
    try {
      await api.dashboards.remove(id);
      notify({ title: "Dashboard deleted" });
      load();
    } catch (err) {
      notify({ title: "Delete failed", message: err.message });
    }
  };

  const openEditor = (dashboard = null) => {
    setEditingDashboard(dashboard);
    setEditorOpen(true);
  };

  const planLimit = () => {
    const key = plan?.name?.toLowerCase() || "";
    if (key.includes("scale")) return "Unlimited";
    if (key.includes("growth")) return "5";
    return "1";
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Dashboards"
        title="Plan-aware portfolio spaces"
        description="Create, edit, and manage your public dashboards. Plan limits apply."
        actions={
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50">
              {safeDashboards.length} / {planLimit()}
            </span>
            <NeonButton onClick={() => openEditor()} disabled={!canCreate()}>
              New Dashboard
            </NeonButton>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-8 w-8 rounded-full border-2 border-cyber border-t-transparent"
          />
        </div>
      ) : safeDashboards.length === 0 ? (
        <GlowCard className="py-16 text-center">
          <p className="text-white/60">
            No dashboards yet. Create your first one to get started.
          </p>
          <NeonButton className="mt-4" onClick={() => openEditor()}>
            Create Dashboard
          </NeonButton>
        </GlowCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {safeDashboards.map((dash) => (
              <DashboardCard
                key={dash.id}
                dashboard={dash}
                userHandle={userHandle}
                onEdit={openEditor}
                onDelete={handleDelete}
                onView={setViewingDashboard}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Editor modal */}
      {editorOpen && (
        <DashboardEditor
          dashboard={editingDashboard}
          onClose={() => {
            setEditorOpen(false);
            setEditingDashboard(null);
          }}
          onSave={load}
        />
      )}

      {/* Detail view modal */}
      {viewingDashboard && (
        <DashboardDetail
          dashboard={viewingDashboard}
          onClose={() => setViewingDashboard(null)}
        />
      )}
    </div>
  );
};

export default DashboardManager;
