import AuthForm from "@/components/auth/AuthForm";
import Link from "next/link";

const RegisterPage = () => (
  <div className="gradient-ring flex min-h-screen items-center justify-center bg-night px-6 py-24">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(255,126,226,0.2),_transparent_65%)]" />
    <div className="relative z-10 flex w-full max-w-5xl flex-col gap-10 lg:flex-row">
      <div className="flex-1 space-y-4">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">
          Launch
        </p>
        <h1 className="text-4xl font-semibold text-white">
          Create your AI-native studio
        </h1>
        <p className="text-white/70">
          Sign up to ingest resumes, run Gemini blueprints, and ship dashboards.
        </p>
        <Link href="/login" className="text-sm text-cyber">
          Already have an account?
        </Link>
      </div>
      <div className="flex-1">
        <AuthForm mode="register" />
      </div>
    </div>
  </div>
);

export default RegisterPage;
