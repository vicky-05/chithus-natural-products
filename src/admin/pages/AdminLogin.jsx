
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [alreadyAdmin, setAlreadyAdmin] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-xl border border-[#E0E5DB] bg-white py-3.5 pl-11 pr-4 text-sm text-[#242821] outline-none transition placeholder:text-[#A0A79D] focus:border-[#285C3A] focus:ring-4 focus:ring-[#285C3A]/10 disabled:opacity-60";

  useEffect(() => {
    let active = true;

    const checkExistingSession = async () => {
      try {
        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (data.session?.user) {
          const { data: role, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.session.user.id)
            .maybeSingle();

          if (roleError) throw roleError;

          if (active && role?.role === "admin") {
            setAlreadyAdmin(true);
          }
        }
      } catch (checkError) {
        console.error("Could not verify existing admin session:", checkError);

        if (active) {
          setError(
            "We couldn't verify your account. Check the Supabase role table and try again.",
          );
        }
      } finally {
        if (active) setCheckingSession(false);
      }
    };

    void checkExistingSession();

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your administrator email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (loginError) throw loginError;

      if (!data.user) {
        throw new Error("No authenticated user was returned.");
      }

      const { data: role, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (roleError) {
        throw new Error(
          "We couldn't verify administrator permissions. Check the user_roles table and policies.",
        );
      }

      if (role?.role !== "admin") {
        // This account can sign in as a customer, but is not an admin.
        await supabase.auth.signOut();
        throw new Error(
          "This account does not have administrator permission.",
        );
      }

      navigate("/admin", { replace: true });
    } catch (loginError) {
      setError(
        loginError.message?.toLowerCase().includes("email not confirmed")
          ? "Please confirm your email address before signing in."
          : loginError.message?.includes("administrator permission")
            ? loginError.message
            : loginError.message?.includes("verify administrator")
              ? loginError.message
              : "We couldn't sign you in. Check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7EF]">
        <LoaderCircle
          size={32}
          className="animate-spin text-[#285C3A]"
        />
      </div>
    );
  }

  if (alreadyAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF7EF] px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#E9E5D9] bg-white shadow-[0_20px_70px_rgba(40,92,58,0.08)] lg:grid-cols-2">
        {/* Brand panel */}
        <section className="relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-[#285C3A] p-7 text-white sm:p-10 lg:min-h-[600px] lg:p-12">
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
              <ShieldCheck size={15} className="text-[#E4C77F]" />
              Administrator portal
            </span>

            <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Your store, managed securely.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/75 sm:text-base">
              Sign in with an authorized administrator account to manage
              products, orders, customers, and store reports.
            </p>
          </div>

          <div className="relative z-10 mt-10 hidden items-center gap-3 border-t border-white/15 pt-6 text-xs text-white/65 lg:flex">
            <ShieldCheck size={19} className="text-[#E4C77F]" />
            Access verified using Supabase Authentication and admin roles
          </div>
        </section>

        {/* Login form */}
        <section className="flex items-center justify-center p-6 sm:p-10 lg:px-14">
          <div className="w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7830]">
              Restricted access
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#242821] sm:text-4xl">
              Admin sign in
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#72796E]">
              Use the email and password of your authorized administrator
              account.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="adminEmail"
                  className="mb-2 block text-sm font-medium text-[#353B32]"
                >
                  Administrator email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9487]"
                  />

                  <input
                    id="adminEmail"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    placeholder="admin@example.com"
                    maxLength={254}
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="adminPassword"
                  className="mb-2 block text-sm font-medium text-[#353B32]"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9487]"
                  />

                  <input
                    id="adminPassword"
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

              {error && (
                <div
                  role="alert"
                  className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  <ShieldAlert size={18} className="mt-1 shrink-0" />
                  <p>{error}</p>
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
                    Verifying access...
                  </>
                ) : (
                  <>
                    Sign in to admin
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#8A9085]">
              <ShieldCheck size={15} />
              Authorized administrators only
            </div>

            <p className="mt-5 text-center text-sm text-[#72796E]">
              <Link to="/" className="font-semibold text-[#285C3A] hover:underline">
                Return to store
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
