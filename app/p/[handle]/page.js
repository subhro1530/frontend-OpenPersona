"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api-client";
import Tag from "@/components/ui/Tag";

const PublicProfilePage = ({ params }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.public.profile(params.handle);
        setProfile(data);
      } catch (err) {
        setError(err.message || "Profile not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.handle]);

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
        <div className="text-6xl">😕</div>
        <h1 className="text-2xl font-bold text-white">Profile not found</h1>
        <p className="text-white/60">{error}</p>
        <Link
          href="/"
          className="mt-4 rounded-full border border-cyber px-6 py-2 text-cyber hover:bg-cyber/10"
        >
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night">
      {/* Banner */}
      <div
        className="relative h-48 md:h-64"
        style={{
          background: profile?.bannerUrl
            ? `url(${profile.bannerUrl}) center/cover`
            : "linear-gradient(135deg, #5c4dff 0%, #00f7ff 50%, #ff7ee2 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />
      </div>

      {/* Profile content */}
      <div className="relative z-10 mx-auto -mt-20 max-w-4xl px-6">
        {/* Avatar */}
        <div className="flex items-end gap-6">
          <div className="h-32 w-32 overflow-hidden rounded-3xl border-4 border-night bg-white/10 shadow-xl md:h-40 md:w-40">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyber/30 to-aurora/30 text-5xl">
                {profile?.name?.[0]?.toUpperCase() || "👤"}
              </div>
            )}
          </div>
          <div className="mb-4">
            <Tag
              tone={
                profile?.plan === "scale"
                  ? "accent"
                  : profile?.plan === "growth"
                  ? "success"
                  : "neutral"
              }
            >
              {profile?.plan || "free"} plan
            </Tag>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              {profile?.name || profile?.handle}
            </h1>
            <p className="text-lg text-cyber">@{profile?.handle}</p>
          </div>

          {profile?.bio && (
            <p className="max-w-2xl text-lg text-white/70">{profile.bio}</p>
          )}

          {/* Social links */}
          {profile?.socialLinks?.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {profile.socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-cyber hover:text-cyber"
                >
                  <span>{getSocialIcon(link.platform)}</span>
                  <span>{link.platform}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Dashboards */}
        {profile?.dashboards?.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-xl font-semibold text-white">
              Public dashboards
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {profile.dashboards.map((dash) => (
                <Link
                  key={dash.id}
                  href={`/p/${params.handle}/${dash.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyber/30 hover:bg-cyber/5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-cyber">
                        {dash.title}
                      </h3>
                      <p className="text-sm text-white/50">/{dash.slug}</p>
                    </div>
                    <span className="text-white/30 group-hover:text-cyber">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio sections */}
        {profile?.portfolio?.sections?.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-xl font-semibold text-white">Portfolio</h2>
            <div className="grid gap-6">
              {profile.portfolio.sections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {section.title}
                  </h3>
                  {section.content && (
                    <p className="mt-2 text-white/60">{section.content}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 border-t border-white/10 py-8 text-center">
          <p className="text-sm text-white/40">
            Powered by{" "}
            <Link href="/" className="text-cyber hover:underline">
              OpenPersona
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const getSocialIcon = (platform) => {
  const icons = {
    twitter: "𝕏",
    github: "🐙",
    linkedin: "💼",
    website: "🌐",
    instagram: "📸",
    youtube: "📺",
  };
  return icons[platform?.toLowerCase()] || "🔗";
};

export default PublicProfilePage;
