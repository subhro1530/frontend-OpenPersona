"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";
import NeonButton from "@/components/ui/NeonButton";
import Tag from "@/components/ui/Tag";
import api from "@/lib/api-client";
import { useToast } from "@/components/ui/ToastProvider";

const planOptions = ["free", "growth", "scale"];
const planColors = {
  free: "neutral",
  growth: "success",
  scale: "accent",
};

/* ─────────────────────────────────────────────────────────── */
/* Stat card                                                    */
/* ─────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-4"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyber/20 text-2xl">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────── */
/* Plan update modal                                            */
/* ─────────────────────────────────────────────────────────── */
const PlanModal = ({ user, onSave, onClose }) => {
  const [plan, setPlan] = useState(user?.plan || "free");

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-night p-6"
      >
        <div>
          <p className="text-lg font-semibold text-white">Update plan for</p>
          <p className="text-sm text-white/60">{user.name || user.email}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {planOptions.map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`rounded-2xl border-2 py-4 text-center text-sm font-medium uppercase transition ${
                plan === p
                  ? "border-cyber bg-cyber/20 text-cyber"
                  : "border-white/10 text-white/60 hover:border-white/20"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <NeonButton onClick={() => onSave(plan)}>Save plan</NeonButton>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Block user modal                                             */
/* ─────────────────────────────────────────────────────────── */
const BlockModal = ({ user, onSave, onClose }) => {
  const [reason, setReason] = useState("");

  if (!user) return null;
  const isBlocked = user.blocked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-night p-6"
      >
        <div>
          <p className="text-lg font-semibold text-white">
            {isBlocked ? "Unblock" : "Block"} user
          </p>
          <p className="text-sm text-white/60">{user.name || user.email}</p>
        </div>

        {!isBlocked && (
          <div>
            <label className="text-xs text-white/60">Reason for blocking</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-2 w-full resize-none rounded-xl bg-white/5 p-3 text-sm text-white outline-none"
              placeholder="Enter reason..."
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <NeonButton
            className={isBlocked ? "" : "border-pulse bg-pulse/20 text-pulse"}
            onClick={() => onSave(reason)}
          >
            {isBlocked ? "Unblock" : "Block"} user
          </NeonButton>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Delete user modal                                            */
/* ─────────────────────────────────────────────────────────── */
const DeleteModal = ({ user, onConfirm, onClose }) => {
  const [confirm, setConfirm] = useState("");

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-night p-6"
      >
        <div>
          <p className="text-lg font-semibold text-pulse">
            Delete user permanently
          </p>
          <p className="text-sm text-white/60">{user.name || user.email}</p>
        </div>

        <div className="rounded-xl bg-pulse/10 p-4 text-sm text-pulse/80">
          ⚠️ This action cannot be undone. All user data, dashboards, and files
          will be permanently removed.
        </div>

        <div>
          <label className="text-xs text-white/60">
            Type "DELETE" to confirm
          </label>
          <input
            className="mt-2 w-full rounded-xl bg-white/5 p-3 text-sm text-white outline-none"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            disabled={confirm !== "DELETE"}
            onClick={onConfirm}
            className={`rounded-full px-5 py-2 text-sm transition ${
              confirm === "DELETE"
                ? "bg-pulse text-night"
                : "cursor-not-allowed bg-white/10 text-white/40"
            }`}
          >
            Delete permanently
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* User row                                                     */
/* ─────────────────────────────────────────────────────────── */
const UserRow = ({ user, onPlan, onBlock, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`group relative flex flex-wrap items-center gap-4 rounded-2xl border p-4 transition ${
      user.blocked
        ? "border-pulse/30 bg-pulse/5"
        : "border-white/10 hover:border-white/20"
    }`}
  >
    {/* Avatar */}
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyber/30 to-aurora/30 text-white">
      {user.name?.[0]?.toUpperCase() || "U"}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium text-white truncate">
          {user.name || "Unnamed"}
        </p>
        {user.role === "admin" && <Tag tone="accent">Admin</Tag>}
        {user.blocked && <Tag tone="danger">Blocked</Tag>}
      </div>
      <p className="text-sm text-white/60 truncate">{user.email}</p>
      {user.handle && <p className="text-xs text-cyber">@{user.handle}</p>}
      <p className="text-xs text-white/40 mt-1">
        Joined{" "}
        {user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "Unknown"}
      </p>
    </div>

    {/* Plan */}
    <Tag tone={planColors[user.plan] || "neutral"}>{user.plan || "free"}</Tag>

    {/* Actions */}
    <div className="flex gap-2 opacity-70 transition group-hover:opacity-100">
      <button
        onClick={() => onPlan(user)}
        className="rounded-full border border-cyber/50 px-3 py-1 text-xs text-cyber hover:bg-cyber/10"
      >
        Plan
      </button>
      <button
        onClick={() => onBlock(user)}
        className={`rounded-full border px-3 py-1 text-xs transition ${
          user.blocked
            ? "border-aurora/50 text-aurora hover:bg-aurora/10"
            : "border-pulse/50 text-pulse hover:bg-pulse/10"
        }`}
      >
        {user.blocked ? "Unblock" : "Block"}
      </button>
      <button
        onClick={() => onDelete(user)}
        className="rounded-full border border-pulse/50 px-3 py-1 text-xs text-pulse hover:bg-pulse/10"
      >
        Delete
      </button>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────── */
/* Main component                                               */
/* ─────────────────────────────────────────────────────────── */
const AdminConsole = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [planModal, setPlanModal] = useState(null);
  const [blockModal, setBlockModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const { notify } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.admin.users();
      setUsers(data || []);
    } catch (err) {
      notify({ title: "Admin fetch failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* Derived stats */
  const totalUsers = users.length;
  const blockedUsers = users.filter((u) => u.blocked).length;
  const paidUsers = users.filter(
    (u) => u.plan === "growth" || u.plan === "scale"
  ).length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  /* Filtered users */
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "blocked" && u.blocked) ||
      (filter === "free" && u.plan === "free") ||
      (filter === "paid" && (u.plan === "growth" || u.plan === "scale"));

    return matchesSearch && matchesFilter;
  });

  /* Actions */
  const handleSavePlan = async (plan) => {
    if (!planModal) return;
    try {
      await api.admin.updatePlan(planModal.id, { plan });
      notify({ title: "Plan updated", message: `Set to ${plan}` });
      load();
    } catch (err) {
      notify({ title: "Failed to update plan", message: err.message });
    }
    setPlanModal(null);
  };

  const handleSaveBlock = async (reason) => {
    if (!blockModal) return;
    const isBlocked = blockModal.blocked;
    try {
      await api.admin.blockUser(blockModal.id, {
        blocked: !isBlocked,
        reason: reason || undefined,
      });
      notify({ title: isBlocked ? "User unblocked" : "User blocked" });
      load();
    } catch (err) {
      notify({ title: "Failed to update block status", message: err.message });
    }
    setBlockModal(null);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.admin.deleteUser(deleteModal.id);
      notify({ title: "User deleted permanently" });
      load();
    } catch (err) {
      notify({ title: "Failed to delete user", message: err.message });
    }
    setDeleteModal(null);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Admin console"
        title="User management"
        description="Manage users, plans, and account statuses."
        actions={
          <NeonButton onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </NeonButton>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={totalUsers} icon="👥" />
        <StatCard label="Admins" value={adminUsers} icon="🛡️" />
        <StatCard label="Paid users" value={paidUsers} icon="💎" />
        <StatCard label="Blocked" value={blockedUsers} icon="🚫" />
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
        />
        <div className="flex gap-2">
          {["all", "paid", "free", "blocked"].map((f) => (
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
      </div>

      {/* User list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-8 w-8 rounded-full border-2 border-cyber border-t-transparent"
          />
        </div>
      ) : filteredUsers.length === 0 ? (
        <GlowCard className="py-16 text-center">
          <p className="text-white/60">No users found.</p>
        </GlowCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onPlan={setPlanModal}
                onBlock={setBlockModal}
                onDelete={setDeleteModal}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      {planModal && (
        <PlanModal
          user={planModal}
          onSave={handleSavePlan}
          onClose={() => setPlanModal(null)}
        />
      )}

      {blockModal && (
        <BlockModal
          user={blockModal}
          onSave={handleSaveBlock}
          onClose={() => setBlockModal(null)}
        />
      )}

      {deleteModal && (
        <DeleteModal
          user={deleteModal}
          onConfirm={handleDelete}
          onClose={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
};

export default AdminConsole;
