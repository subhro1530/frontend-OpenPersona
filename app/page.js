import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "@/components/visual/icons";
import NeonButton from "@/components/ui/NeonButton";
import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";

const Feature = ({ title, description, pills }) => (
  <GlowCard className="min-h-[260px]">
    <p className="text-sm uppercase tracking-[0.4em] text-white/50">{pills}</p>
    <h3 className="mt-4 text-2xl font-semibold text-white">{title}</h3>
    <p className="mt-2 text-white/70">{description}</p>
  </GlowCard>
);

const LandingPage = () => (
  <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-night via-nebula to-night text-white">
    <div className="gradient-ring pointer-events-none absolute inset-0 opacity-60" />
    <header className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-40 pt-32 text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
        <SparklesIcon className="h-3.5 w-3.5 text-cyber" /> AI-native identity
        OS
      </div>
      <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl">
        Craft your
        <br />
        <span className="bg-gradient-to-r from-aurora via-cyber to-pulse bg-clip-text text-transparent">
          cinematic portfolio
        </span>
        <br />
        in minutes.
      </h1>
      <p className="mx-auto max-w-2xl text-lg text-white/70">
        OpenPersona fuses Gemini-grade intelligence with hand-crafted control so
        you can ingest resumes, auto-generate layouts, edit every module, and
        launch stunning dashboards everywhere.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/register" className="inline-flex">
          <NeonButton as="span">Enter workspace</NeonButton>
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
        >
          I already have access
        </Link>
      </div>
    </header>

    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
      <SectionHeader
        eyebrow="Why OpenPersona"
        title="Designed for power talent"
        description="Bring resumes, AI, and craft into a single identity studio."
      />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Feature
          title="Blueprint + Draft + Composer"
          description="See your blueprint, run Gemini drafts, and manually control every chip, timeline, and CTA in one split-screen builder."
          pills="Build"
        />
        <Feature
          title="Support AI suite"
          description="Highlights, job match briefs, and identity copilot deliver insights, suggested scripts, and recruiter-ready storylines."
          pills="Coach"
        />
        <Feature
          title="Dashboards & Templates"
          description="Plan-aware dashboards, Vultr media, and template switching keep your public presence fresh without rework."
          pills="Publish"
        />
        <Feature
          title="Admin-grade control"
          description="Billing modals, plan upgrades, and admin oversight ensure enterprise-grade governance."
          pills="Scale"
        />
      </div>
    </section>

    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
      <SectionHeader
        eyebrow="Systems check"
        title="Run a pulse scan"
        description="Kick off the neon diagnostic script to watch latency, vibes, and uptime stream back in real time."
        actions={
          <Link href="/login" className="text-sm text-cyber">
            Launch workspace <ArrowRightIcon className="ml-2 inline h-4 w-4" />
          </Link>
        }
      />
      <GlowCard className="mt-8" variant="hero">
        <pre className="overflow-x-auto rounded-2xl bg-black/60 p-6 text-sm text-cyber">
          {`export OP_BASE=http://localhost:4000
curl -s "$OP_BASE/api/diagnostics/pulse" | jq '.telemetry'

curl -s -X POST "$OP_BASE/api/diagnostics/vibe" \
  -H "Content-Type: application/json" \
  -d '{"intent":"portfolio-showcase"}' | jq '.status'`}
        </pre>
      </GlowCard>
    </section>
  </div>
);

export default LandingPage;
