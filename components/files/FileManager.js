"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";
import NeonButton from "@/components/ui/NeonButton";
import Tag from "@/components/ui/Tag";
import api from "@/lib/api-client";
import { useToast } from "@/components/ui/ToastProvider";
import useAppStore from "@/store/useAppStore";

const categories = ["avatar", "banner", "project", "portfolio"];

/* ─────────────────────────────────────────────────────────── */
/* File card                                                    */
/* ─────────────────────────────────────────────────────────── */
const FileCard = ({ file, onGetUrl, onDelete, onPreview }) => {
  const isImage =
    file.mimeType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.filename);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/20"
    >
      {/* Preview */}
      <div
        className="relative h-32 cursor-pointer bg-gradient-to-br from-white/5 to-white/10"
        onClick={() => onPreview(file)}
      >
        {isImage && file.thumbnailUrl ? (
          <img
            src={file.thumbnailUrl}
            alt={file.filename}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl text-white/30">
            📄
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
          <span className="text-sm text-white">Preview</span>
        </div>
      </div>

      <div className="space-y-2 p-3">
        <p
          className="truncate text-sm font-medium text-white"
          title={file.filename}
        >
          {file.filename}
        </p>
        <div className="flex items-center gap-2">
          <Tag tone="neutral">{file.category}</Tag>
          <span className="text-xs text-white/40">
            {file.size ? `${(file.size / 1024).toFixed(1)}KB` : ""}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onGetUrl(file.id)}
            className="flex-1 rounded-full border border-cyber/50 px-2 py-1 text-xs text-cyber hover:bg-cyber/10"
          >
            URL
          </button>
          <button
            onClick={() => onDelete(file.id)}
            className="rounded-full border border-pulse/50 px-2 py-1 text-xs text-pulse hover:bg-pulse/10"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Upload dropzone                                              */
/* ─────────────────────────────────────────────────────────── */
const UploadDropzone = ({ category, dashboardSlug, onUpload, uploading }) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onUpload(files[0]);
    },
    [onUpload]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
        dragOver
          ? "border-cyber bg-cyber/10"
          : "border-white/20 hover:border-white/40"
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx"
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-8 w-8 rounded-full border-2 border-cyber border-t-transparent"
          />
          <p className="text-sm text-cyber">Uploading...</p>
        </div>
      ) : (
        <>
          <div className="mb-3 text-4xl">📤</div>
          <p className="text-sm text-white/70">
            Drop files here or <span className="text-cyber">browse</span>
          </p>
          <p className="mt-1 text-xs text-white/50">
            Category: {category}{" "}
            {dashboardSlug && `• Dashboard: ${dashboardSlug}`}
          </p>
        </>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* File preview modal                                           */
/* ─────────────────────────────────────────────────────────── */
const FilePreviewModal = ({ file, signedUrl, onClose }) => {
  if (!file) return null;

  const isImage =
    file.mimeType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.filename);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl space-y-4 overflow-hidden rounded-3xl border border-white/10 bg-night"
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <p className="text-lg font-semibold text-white">{file.filename}</p>
            <p className="text-xs text-white/50">
              {file.category} • {file.mimeType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Close
          </button>
        </div>

        <div className="flex min-h-[300px] items-center justify-center p-6">
          {isImage && signedUrl ? (
            <img
              src={signedUrl}
              alt={file.filename}
              className="max-h-[500px] rounded-2xl object-contain"
            />
          ) : signedUrl ? (
            <div className="space-y-4 text-center">
              <div className="text-6xl">📄</div>
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-cyber px-6 py-3 text-cyber hover:bg-cyber/10"
              >
                Download file
              </a>
            </div>
          ) : (
            <p className="text-white/60">Loading preview...</p>
          )}
        </div>

        {signedUrl && (
          <div className="border-t border-white/10 p-4">
            <p className="text-xs text-white/50">Signed URL</p>
            <p className="mt-1 break-all text-xs text-cyber">{signedUrl}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Main component                                               */
/* ─────────────────────────────────────────────────────────── */
const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("avatar");
  const [dashboardSlug, setDashboardSlug] = useState("");
  const [filter, setFilter] = useState("all");
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const setStoreFiles = useAppStore((s) => s.setFiles);
  const { notify } = useToast();

  const load = async () => {
    try {
      const data = await api.files.list();
      setFiles(data || []);
      setStoreFiles(data || []);
    } catch (err) {
      notify({ title: "File fetch failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const result = await api.files.upload({
        file,
        category,
        dashboardSlug: dashboardSlug || undefined,
      });
      notify({ title: "File uploaded", message: file.name });
      load();
    } catch (err) {
      notify({ title: "Upload failed", message: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this file?")) return;
    try {
      await api.files.remove(id);
      notify({ title: "File deleted" });
      load();
    } catch (err) {
      notify({ title: "Delete failed", message: err.message });
    }
  };

  const handleGetUrl = async (id) => {
    try {
      const data = await api.files.signedUrl(id);
      if (data?.url) {
        await navigator.clipboard.writeText(data.url);
        notify({ title: "URL copied to clipboard" });
      }
    } catch (err) {
      notify({ title: "Failed to get URL", message: err.message });
    }
  };

  const handlePreview = async (file) => {
    setPreviewFile(file);
    try {
      const data = await api.files.signedUrl(file.id);
      setPreviewUrl(data?.url || "");
    } catch (err) {
      notify({ title: "Failed to load preview", message: err.message });
    }
  };

  const filteredFiles =
    filter === "all" ? files : files.filter((f) => f.category === filter);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Vultr uploads"
        title="Media file manager"
        description="Upload avatars, banners, project images, and portfolio media to Vultr storage."
      />

      {/* Upload section */}
      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <UploadDropzone
          category={category}
          dashboardSlug={dashboardSlug}
          onUpload={handleUpload}
          uploading={uploading}
        />

        <GlowCard className="space-y-4">
          <div>
            <label className="text-xs text-white/60">Category</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs uppercase tracking-wide transition ${
                    category === cat
                      ? "bg-aurora text-night"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60">
              Dashboard slug (optional)
            </label>
            <input
              className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-2 text-white outline-none"
              placeholder="hire-me"
              value={dashboardSlug}
              onChange={(e) => setDashboardSlug(e.target.value)}
            />
          </div>
        </GlowCard>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/50">Filter:</span>
        {["all", ...categories].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1 text-xs transition ${
              filter === f
                ? "bg-cyber text-night"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-sm text-white/50">
          {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Files grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-8 w-8 rounded-full border-2 border-cyber border-t-transparent"
          />
        </div>
      ) : filteredFiles.length === 0 ? (
        <GlowCard className="py-16 text-center">
          <div className="text-4xl">📂</div>
          <p className="mt-4 text-white/60">
            {filter === "all"
              ? "No files yet. Upload your first file to get started."
              : `No ${filter} files found.`}
          </p>
        </GlowCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onGetUrl={handleGetUrl}
                onDelete={handleDelete}
                onPreview={handlePreview}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preview modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          signedUrl={previewUrl}
          onClose={() => {
            setPreviewFile(null);
            setPreviewUrl("");
          }}
        />
      )}
    </div>
  );
};

export default FileManager;
