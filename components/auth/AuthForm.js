"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import NeonButton from "../ui/NeonButton";
import GlowCard from "../ui/GlowCard";
import { useToast } from "../ui/ToastProvider";
import api, { setAuthToken } from "@/lib/api-client";
import useAppStore from "@/store/useAppStore";

const AuthForm = ({ mode = "login" }) => {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const { notify } = useToast();
  const setUser = useAppStore((state) => state.setUser);
  const setPlan = useAppStore((state) => state.setPlan);
  const setToken = useAppStore((state) => state.setToken);
  const [loading, setLoading] = useState(false);
  const [adminEnroll, setAdminEnroll] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [networkHint, setNetworkHint] = useState(null);
  const [lastAttempt, setLastAttempt] = useState(null);

  const applyAuth = (response) => {
    if (!response) return;
    const token = response.token || response.accessToken;
    const profile = response.user || response.profile || response;
    if (token) {
      setAuthToken(token);
      setToken(token);
    }
    if (profile) {
      setUser(profile);
      if (profile.plan || response.plan) {
        setPlan(profile.plan || response.plan);
      }
    }
  };

  const processAttempt = async (attempt) => {
    setLoading(true);
    setNetworkHint(null);
    try {
      const { values, stepMode, adminMode, adminSecret } = attempt;
      let authResponse;
      if (stepMode === "register") {
        const payload = adminMode
          ? { ...values, adminCode: adminSecret?.trim() }
          : values;
        if (adminMode && !payload.adminCode) {
          notify({
            title: "Admin code required",
            message: "Enter the enrollment passphrase to create an admin.",
          });
          setLoading(false);
          return;
        }
        const registerFn = adminMode
          ? api.auth.registerAdmin
          : api.auth.register;
        authResponse = await registerFn(payload);
        if (!authResponse?.token) {
          authResponse = await api.auth.login({
            email: values.email,
            password: values.password,
          });
        }
      } else {
        authResponse = await api.auth.login(values);
      }

      applyAuth(authResponse);
      notify({ title: "Welcome back", message: "Redirecting to workspace" });
      router.push("/app");
    } catch (err) {
      const isNetworkError =
        err?.name === "TypeError" ||
        /Failed to fetch|Network request failed/i.test(err?.message || "");
      if (isNetworkError) {
        setNetworkHint(
          "Network request failed. Open devtools → Network and confirm the call hits http://localhost:4000. If the backend is offline run `npm start` inside /backend-OpenPersona."
        );
        notify({
          title: "Network request failed",
          message:
            "Open devtools → Network to inspect the payload, then retry with full name, email, strong password, and unique handle.",
        });
      } else {
        notify({ title: "Auth error", message: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (values) => {
    const attempt = {
      values,
      stepMode: mode,
      adminMode: adminEnroll,
      adminSecret: adminCode,
    };
    setLastAttempt(attempt);
    processAttempt(attempt);
  };

  const resendRequest = () => {
    if (!lastAttempt) return;
    processAttempt(lastAttempt);
  };

  return (
    <GlowCard className="mx-auto max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {mode === "register" && (
          <>
            <div>
              <label className="text-sm text-white/70">Name</label>
              <input
                {...register("name", { required: true })}
                className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyber"
                placeholder="Ava Builder"
              />
            </div>
            <div>
              <label className="text-sm text-white/70">Handle</label>
              <input
                {...register("handle", { required: true })}
                className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyber"
                placeholder="avabuilder"
              />
            </div>
          </>
        )}
        <div>
          <label className="text-sm text-white/70">Email</label>
          <input
            {...register("email", { required: true })}
            type="email"
            className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyber"
            placeholder="ava@example.com"
          />
        </div>
        <div>
          <label className="text-sm text-white/70">Password</label>
          <input
            {...register("password", { required: true })}
            type="password"
            className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyber"
            placeholder="ChangeMe123!"
          />
          <p className="mt-2 text-xs text-white/50">
            At least 10 chars, one symbol, one number.
          </p>
        </div>

        {mode === "register" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <label className="flex items-center gap-3 text-white/80">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={adminEnroll}
                onChange={(e) => setAdminEnroll(e.target.checked)}
              />
              Enroll with admin code (POST /api/auth/register/admin)
            </label>
            {adminEnroll && (
              <input
                className="mt-3 w-full rounded-2xl bg-night/60 px-4 py-2 text-white outline-none"
                type="password"
                autoComplete="new-password"
                value={adminCode}
                placeholder="Admin enrollment code"
                onChange={(e) => setAdminCode(e.target.value)}
              />
            )}
          </div>
        )}

        <NeonButton
          type="submit"
          className="w-full justify-center"
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : mode === "register"
            ? "Create identity"
            : "Enter workspace"}
        </NeonButton>

        {networkHint && (
          <div className="rounded-2xl border border-pulse/40 bg-pulse/10 p-3 text-xs text-pulse">
            {networkHint}
          </div>
        )}

        {lastAttempt && (
          <button
            type="button"
            onClick={resendRequest}
            className="w-full rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5"
            disabled={loading}
          >
            Re-send request
          </button>
        )}
      </form>
    </GlowCard>
  );
};

export default AuthForm;
