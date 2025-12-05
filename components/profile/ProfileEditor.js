"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";
import NeonButton from "@/components/ui/NeonButton";
import Tag from "@/components/ui/Tag";
import api from "@/lib/api-client";
import { useToast } from "@/components/ui/ToastProvider";
import useAppStore from "@/store/useAppStore";

/* ─────────────────────────────────────────────────────────── */
/* Social link editor                                           */
/* ─────────────────────────────────────────────────────────── */
const SocialLinksEditor = ({ links, onChange }) => {
  const addLink = () => {
    onChange([...links, { label: "", url: "" }]);
  };

  const updateLink = (index, field, value) => {
    const updated = links.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    onChange(updated);
  };

  const removeLink = (index) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {links.map((link, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            className="w-1/3 rounded-2xl bg-white/5 px-4 py-2 text-white outline-none"
            placeholder="Label (e.g., LinkedIn)"
            value={link.label}
            onChange={(e) => updateLink(idx, "label", e.target.value)}
          />
          <input
            className="flex-1 rounded-2xl bg-white/5 px-4 py-2 text-white outline-none"
            placeholder="URL"
            value={link.url}
            onChange={(e) => updateLink(idx, "url", e.target.value)}
          />
          <button
            onClick={() => removeLink(idx)}
            className="rounded-full border border-pulse/50 px-3 text-xs text-pulse hover:bg-pulse/10"
          >
            ×
          </button>
        </div>
      ))}
      <button onClick={addLink} className="text-sm text-cyber hover:underline">
        + Add social link
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Main component                                               */
/* ─────────────────────────────────────────────────────────── */
const ProfileEditor = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHandle, setSavingHandle] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [newHandle, setNewHandle] = useState("");
  const [upgradeCode, setUpgradeCode] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [downgrading, setDowngrading] = useState(false);
  const setUser = useAppStore((s) => s.setUser);
  const setPlan = useAppStore((s) => s.setPlan);
  const isAdmin = useAppStore((s) => s.isAdmin);
  const { notify } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData, templateData] = await Promise.all([
          api.profile.get(),
          api.templates.list().catch(() => []),
        ]);
        setProfile(profileData);
        setNewHandle(profileData?.handle || "");
        setTemplates(Array.isArray(templateData) ? templateData : []);
      } catch (err) {
        notify({ title: "Profile load failed", message: err.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [notify]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (links) => {
    setProfile((prev) => ({ ...prev, socialLinks: links }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const result = await api.profile.update(profile);
      const updatedUser = result?.user || result?.profile || result || profile;
      setUser(updatedUser);
      setProfile(updatedUser);
      notify({
        title: "Profile saved successfully",
        message: `Updated: ${
          updatedUser.name || updatedUser.handle || "profile"
        }`,
      });
    } catch (err) {
      const errorMsg = err.message || "Unknown error occurred";
      notify({
        title: "Save failed",
        message: errorMsg.includes("401")
          ? "Session expired. Please log in again."
          : errorMsg.includes("500")
          ? "Server error. Please try again later."
          : errorMsg,
      });
    } finally {
      setSaving(false);
    }
  };

  const updateHandle = async () => {
    if (!newHandle?.trim()) {
      notify({
        title: "Invalid handle",
        message: "Please enter a valid handle",
      });
      return;
    }
    if (newHandle === profile?.handle) {
      notify({ title: "No change", message: "Handle is the same" });
      return;
    }
    // Basic validation
    if (!/^[a-zA-Z0-9_-]+$/.test(newHandle)) {
      notify({
        title: "Invalid handle",
        message:
          "Handle can only contain letters, numbers, underscores, and hyphens",
      });
      return;
    }
    setSavingHandle(true);
    try {
      const result = await api.profile.updateHandle({ handle: newHandle });
      const updatedProfile = { ...profile, handle: newHandle };
      setProfile(updatedProfile);
      setUser(updatedProfile);
      notify({
        title: "Handle updated!",
        message: `Your new handle: @${newHandle}`,
      });
    } catch (err) {
      const errorMsg = err.message || "Unknown error";
      notify({
        title: "Handle update failed",
        message:
          errorMsg.includes("409") || errorMsg.includes("taken")
            ? "This handle is already taken. Try another one."
            : errorMsg,
      });
    } finally {
      setSavingHandle(false);
    }
  };

  const updateTemplate = async (template) => {
    setSavingTemplate(true);
    try {
      await api.profile.updateTemplate({ template });
      setProfile((prev) => ({ ...prev, template }));
      notify({ title: "Template updated", message: `Applied: ${template}` });
    } catch (err) {
      notify({ title: "Template update failed", message: err.message });
    } finally {
      setSavingTemplate(false);
    }
  };

  const upgradeAdmin = async () => {
    if (!upgradeCode?.trim()) {
      notify({
        title: "Passphrase required",
        message: "Enter the admin enrollment passphrase.",
      });
      return;
    }
    setUpgrading(true);
    try {
      const response = await api.auth.upgradeAdmin({
        adminCode: upgradeCode,
      });
      const nextProfile = response?.user || response?.profile || response;
      if (nextProfile) {
        setProfile((prev) => ({ ...prev, ...nextProfile }));
        setUser(nextProfile);
        setPlan(nextProfile.plan || "scale");
      }
      notify({
        title: "Admin mode unlocked",
        message: "Plan upgraded to Scale",
      });
    } catch (err) {
      notify({ title: "Upgrade failed", message: err.message });
    } finally {
      setUpgrading(false);
    }
  };

  const downgradeAdmin = async () => {
    if (!confirm("Are you sure you want to downgrade to regular user?")) return;
    setDowngrading(true);
    try {
      const response = await api.auth.downgradeAdmin();
      const nextProfile = response?.user || response?.profile || response;
      if (nextProfile) {
        setProfile((prev) => ({ ...prev, ...nextProfile, role: "user" }));
        setUser({ ...nextProfile, role: "user", isAdmin: false });
        setPlan(nextProfile.plan || "free");
      }
      notify({
        title: "Downgraded to user",
        message: "Admin privileges removed",
      });
    } catch (err) {
      notify({ title: "Downgrade failed", message: err.message });
    } finally {
      setDowngrading(false);
    }
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

  if (!profile) {
    return (
      <GlowCard className="py-12 text-center text-white/60">
        Failed to load profile. Please try again.
      </GlowCard>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Profile"
        title="Manage metadata, handles, templates"
        description="Manage your public profile, handle, template, and social links."
        actions={
          <NeonButton onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </NeonButton>
        }
      />

      {/* Main profile fields */}
      <GlowCard className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-white/70">Headline</label>
            <input
              className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyber"
              value={profile.headline || ""}
              onChange={(e) => handleChange("headline", e.target.value)}
              placeholder="Product storyteller"
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Location</label>
            <input
              className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
              value={profile.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Bengaluru, India"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-white/70">Bio</label>
          <textarea
            className="mt-1 min-h-[120px] w-full rounded-2xl bg-white/5 p-4 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyber"
            value={profile.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Building identity systems..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-white/70">Avatar URL</label>
            <input
              className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
              value={profile.avatarUrl || ""}
              onChange={(e) => handleChange("avatarUrl", e.target.value)}
              placeholder="https://cdn.example.com/avatar.jpg"
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Banner URL</label>
            <input
              className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
              value={profile.bannerUrl || ""}
              onChange={(e) => handleChange("bannerUrl", e.target.value)}
              placeholder="https://cdn.example.com/banner.jpg"
            />
          </div>
        </div>

        {/* Preview */}
        {(profile.avatarUrl || profile.bannerUrl) && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-white/50">
              Preview
            </p>
            <div className="relative h-32 overflow-hidden rounded-2xl bg-white/5">
              {profile.bannerUrl && (
                <img
                  src={profile.bannerUrl}
                  alt="Banner"
                  className="h-full w-full object-cover"
                />
              )}
              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="absolute bottom-2 left-4 h-16 w-16 rounded-full border-2 border-night object-cover"
                />
              )}
            </div>
          </div>
        )}
      </GlowCard>

      {/* Handle section */}
      <GlowCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/50">
              Vanity handle
            </p>
            <p className="text-xs text-white/60">
              PATCH /api/profile/handle – syncs primary dashboard slug
            </p>
          </div>
          <Tag tone="neutral">{profile.handle}</Tag>
        </div>
        <div className="flex gap-3">
          <input
            className="flex-1 rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value)}
            placeholder="new-handle"
          />
          <NeonButton onClick={updateHandle} disabled={savingHandle}>
            {savingHandle ? "Updating..." : "Update Handle"}
          </NeonButton>
        </div>
      </GlowCard>

      {/* Template section */}
      <GlowCard className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-white/50">
            Active template
          </p>
          <p className="text-xs text-white/60">
            PATCH /api/profile/template – switch portfolio skin
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {templates.map((tpl) => (
            <button
              key={tpl.id || tpl.slug}
              onClick={() => updateTemplate(tpl.slug || tpl.id)}
              disabled={savingTemplate}
              className={`rounded-2xl border px-5 py-3 text-sm transition ${
                profile.template === (tpl.slug || tpl.id)
                  ? "border-cyber bg-cyber/10 text-white"
                  : "border-white/10 text-white/70 hover:border-white/30"
              }`}
            >
              {tpl.label || tpl.name || tpl.slug}
            </button>
          ))}
        </div>
        {profile.template && (
          <p className="text-sm text-white/60">
            Current: <span className="text-cyber">{profile.template}</span>
          </p>
        )}
      </GlowCard>

      {/* Admin upgrade/downgrade */}
      {!isAdmin ? (
        <GlowCard className="space-y-3">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/50">
              Unlock admin workspace
            </p>
            <p className="text-xs text-white/60">
              Enter the admin enrollment passphrase to elevate this account.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              className="flex-1 rounded-2xl bg-white/5 px-4 py-3 text-white outline-none"
              type="password"
              autoComplete="new-password"
              value={upgradeCode}
              placeholder="Admin passphrase"
              onChange={(e) => setUpgradeCode(e.target.value)}
            />
            <NeonButton onClick={upgradeAdmin} disabled={upgrading}>
              {upgrading ? "Upgrading..." : "Upgrade to Admin"}
            </NeonButton>
          </div>
        </GlowCard>
      ) : (
        <GlowCard className="space-y-3">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/50">
              Admin status
            </p>
            <p className="text-xs text-white/60">
              You currently have admin privileges. You can downgrade to regular
              user.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Tag tone="accent">Admin Active</Tag>
            <button
              onClick={downgradeAdmin}
              disabled={downgrading}
              className="rounded-full border border-pulse/50 px-4 py-2 text-sm text-pulse hover:bg-pulse/10 disabled:opacity-50"
            >
              {downgrading ? "Downgrading..." : "Downgrade to User"}
            </button>
          </div>
        </GlowCard>
      )}

      {/* Social links */}
      <GlowCard className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-white/50">
            Social links
          </p>
          <p className="text-xs text-white/60">
            Add links to LinkedIn, Twitter, GitHub, etc.
          </p>
        </div>
        <SocialLinksEditor
          links={profile.socialLinks || []}
          onChange={handleSocialChange}
        />
      </GlowCard>

      {/* Profile metadata */}
      <GlowCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/50">
          Metadata
        </p>
        <div className="grid gap-4 text-sm text-white/70 md:grid-cols-3">
          <div>
            <p className="text-white/50">ID</p>
            <p className="font-mono text-xs">{profile.id}</p>
          </div>
          <div>
            <p className="text-white/50">Created</p>
            <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-white/50">Updated</p>
            <p>{new Date(profile.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </GlowCard>
    </div>
  );
};

export default ProfileEditor;
