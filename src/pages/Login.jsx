
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetMode, setResetMode] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-[#E0E5DB] bg-white py-3.5 pl-11 pr-4 text-sm text-[#242821] outline-none transition placeholder:text-[#A0A79D] focus:border-[#285C3A] focus:ring-4 focus:ring-[#285C3A]/10";

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setResetMessage("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (loginError) {
        throw loginError;
      }

      // The Supabase session is persisted by the client.
      // We'll connect this destination to My Account next.
      navigate("/my-account", { replace: true });
    } catch (err) {
      if (err.message?.toLowerCase().includes("email not confirmed")) {
        setError(
          "Please verify your email address using the confirmation link we sent you."
        );
      } else {
        setError(
          "We couldn't sign you in. Check your email and password, then try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setError("");
    setResetMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter your email address first.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

      if (resetError) {
        throw resetError;
      }

      setResetMessage(
        "If an account exists for this email, password reset instructions will be sent. Check your inbox and spam folder."
      );
    } catch {
      setError("We couldn't request a password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7EF] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] border border-[#E9E5D9] bg-white shadow-[0_20px_70px_rgba(40,92,58,0.08)] lg:grid-cols-2">

        {/* Brand panel */}
        <section className="relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-[#285C3A] p-7 text-white sm:p-10 lg:min-h-[650px] lg:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#C79A3B]/15 blur-2xl" />

          <Link to="/" className="relative z-10 inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FAF7EF] text-[#285C3A]">
              <Leaf size={23} />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-wide">
                Chithu's
              </span>
              <span className="block text-xs tracking-[0.2em] text-white/70">
                NATURAL PRODUCTS
              </span>
            </span>
          </Link>

          <div className="relative z-10 mt-8">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs">
              <Leaf size={14} />
              Welcome back
            </span>

            <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Nature's goodness, just a login away.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/75 sm:text-base">
              Sign in to continue discovering traditional favourites
              and natural products for your everyday life.
            </p>
          </div>

          <div className="relative z-10 mt-10 hidden items-center gap-3 border-t border-white/15 pt-6 text-xs text-white/65 lg:flex">
            <ShieldCheck size={19} className="text-[#E4C77F]" />
            Secure authentication powered by Supabase
          </div>
        </section>

        {/* Login form */}
        <section className="flex items-center justify-center p-6 sm:p-10 lg:px-14 lg:py-12">
          <div className="w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7830]">
              Your account
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#242821] sm:text-4xl">
              {resetMode ? "Reset password" : "Welcome back"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#72796E]">
              {resetMode
                ? "Enter your registered email to request password reset instructions."
                : "Enter your details to sign in to your account."}
            </p>

            {resetMessage && (
              <div
                role="status"
                className="mt-6 flex gap-3 rounded-xl border border-[#C9DFCC] bg-[#F0F7EF] p-4 text-sm leading-6 text-[#285C3A]"
              >
                <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                <p>{resetMessage}</p>
              </div>
            )}

            <form
              onSubmit={resetMode ? handleForgotPassword : handleLogin}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="loginEmail"
                  className="mb-2 block text-sm font-medium text-[#353B32]"
                >
                  Email address *
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9487]"
                  />
                  <input
                    id="loginEmail"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                      setResetMessage("");
                    }}
                    placeholder="you@example.com"
                    maxLength={254}
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>

              {!resetMode && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label
                      htmlFor="loginPassword"
                      className="text-sm font-medium text-[#353B32]"
                    >
                      Password *
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setResetMode(true);
                        setError("");
                        setResetMessage("");
                      }}
                      className="text-xs font-semibold text-[#285C3A] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9487]"
                    />
                    <input
                      id="loginPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#7D8678] hover:bg-[#F1F4EE]"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#204A2F] focus:outline-none focus:ring-4 focus:ring-[#285C3A]/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {resetMode ? "Send reset instructions" : "Log in"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {resetMode && (
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setError("");
                    setResetMessage("");
                  }}
                  className="w-full text-sm font-medium text-[#285C3A] hover:underline"
                >
                  Back to login
                </button>
              )}
            </form>

            {!resetMode && (
              <p className="mt-6 text-center text-sm text-[#72796E]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#285C3A] hover:underline"
                >
                  Create account
                </Link>
              </p>
            )}

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#8A9085]">
              <ShieldCheck size={15} />
              Secure account authentication
            </div>
          </div>
        </section>
      </div>

      <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-[#858B80]">
        Chithu's Natural Products · Goodness in every choice.
      </p>
    </main>
  );
}
