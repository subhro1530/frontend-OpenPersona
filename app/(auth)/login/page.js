import AuthForm from "@/components/auth/AuthForm";
import Link from "next/link";

const LoginPage = () => (
  <div className="gradient-ring flex min-h-screen items-center justify-center bg-night px-6 py-24">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(92,77,255,0.3),_transparent_60%)]" />
    <div className="relative z-10 flex w-full max-w-5xl flex-col gap-10 lg:flex-row">
      <div className="flex-1 space-y-4">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">
          Identity OS
        </p>
        <h1 className="text-4xl font-semibold text-white">Welcome back</h1>
        <p className="text-white/70">
          Log back in to shape resumes, portfolios, and dashboards.
        </p>
        <Link href="/" className="text-sm text-cyber">
          ← Back to cinematic intro
        </Link>
      </div>
      <div className="flex-1">
        <AuthForm mode="login" />
      </div>
    </div>
  </div>
);

export default LoginPage;
