"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api-client";
import Tag from "@/components/ui/Tag";

const PublicDashboardPage = ({ params }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.public.dashboard(params.handle, params.slug);
        setDashboard(data);
      } catch (err) {
        setError(err.message || "Dashboard not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.handle, params.slug]);

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

  return (
    <div className="min-h-screen bg-night">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-lg">
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
          <Tag tone="success">{dashboard?.visibility || "public"}</Tag>
        </div>
      </header>

      {/* Dashboard content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white">
              {dashboard?.title}
            </h1>
            <p className="mt-2 text-white/50">/{dashboard?.slug}</p>
          </div>

          {/* Layout sections */}
          {dashboard?.layout?.sections?.length > 0 ? (
            <div className="grid gap-6">
              {dashboard.layout.sections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-8"
                >
                  {typeof section === "string" ? (
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyber/20 text-xl">
                        {getSectionIcon(section)}
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        {section}
                      </h3>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold text-white">
                        {section.title || section.type}
                      </h3>
                      {section.content && (
                        <p className="mt-4 text-white/70">{section.content}</p>
                      )}
                      {section.items?.length > 0 && (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {section.items.map((item, j) => (
                            <div
                              key={j}
                              className="rounded-xl border border-white/10 bg-white/5 p-4"
                            >
                              <p className="font-medium text-white">
                                {item.title || item.name || item}
                              </p>
                              {item.description && (
                                <p className="mt-1 text-sm text-white/50">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 py-20 text-center">
              <div className="text-4xl">📊</div>
              <p className="mt-4 text-white/60">
                This dashboard is being configured.
              </p>
            </div>
          )}

          {/* Raw layout preview */}
          {dashboard?.layout && !dashboard?.layout?.sections?.length && (
            <div className="rounded-2xl border border-white/10 bg-black/50 p-6">
              <p className="mb-4 text-sm text-white/50">Layout configuration</p>
              <pre className="overflow-auto text-sm text-white/60">
                {JSON.stringify(dashboard.layout, null, 2)}
              </pre>
            </div>
          )}
        </motion.div>
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
    </div>
  );
};

const getSectionIcon = (sectionName) => {
  const icons = {
    hero: "🎯",
    about: "👤",
    skills: "⚡",
    projects: "💼",
    experience: "📈",
    education: "🎓",
    contact: "📬",
    testimonials: "💬",
    gallery: "🖼️",
    timeline: "📅",
    cta: "🚀",
  };
  const lower = sectionName?.toLowerCase() || "";
  for (const [key, icon] of Object.entries(icons)) {
    if (lower.includes(key)) return icon;
  }
  return "📋";
};

export default PublicDashboardPage;
