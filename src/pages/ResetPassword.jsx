
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const checkRecoverySession = async () => {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (!active) return;

      // A valid session can be supplied by Supabase after the
      // recovery link has been opened.
      if (!sessionError && data.session) {
        setRecoveryReady(true);
      }

      setCheckingSession(false);
    };

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setRecoveryReady(true);
        setError("");
      }

      if (event === "SIGNED_OUT") {
        setRecoveryReady(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!recoveryReady) {
      setError(
        "Open the password recovery link from your email before setting a new password."
      );
      return;
    }

    if (password.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Use at least one letter and one number in your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.message ||
          "We couldn't update your password. Request a new recovery link and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#E0E5DB] bg-white py-3.5 pl-11 pr-12 text-sm text-[#242821] outline-none transition placeholder:text-[#A0A79D] focus:border-[#285C3A] focus:ring-4 focus:ring-[#285C3A]/10";

  return (
    <main className="min-h-screen bg-[#FAF7EF] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-[#E9E5D9] bg-white shadow-[0_20px_70px_rgba(40,92,58,0.08)] lg:grid-cols-2">
        {/* Brand panel */}
        <section className="relative flex min-h-[250px] flex-col justify-between overflow-hidden bg-[#285C3A] p-7 text-white sm:p-10 lg:min-h-[600px] lg:p-12">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10" />
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
              <ShieldCheck size={15} />
              Account security
            </span>

            <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              A fresh start for your account.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/75 sm:text-base">
              Choose a new password to help keep your Chithu's Natural
              Products account secure.
            </p>
          </div>

          <div className="relative z-10 mt-10 hidden items-center gap-3 border-t border-white/15 pt-6 text-xs text-white/65 lg:flex">
            <LockKeyhole size={18} className="text-[#E4C77F]" />
            Change your password securely using your recovery link.
          </div>
        </section>

        {/* Reset form */}
        <section className="flex items-center justify-center p-6 sm:p-10 lg:px-12 lg:py-12">
          <div className="w-full max-w-md">
            {success ? (
              <div className="py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F0E8] text-[#285C3A]">
                  <CheckCircle2 size={30} />
                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7830]">
                  Password updated
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#242821]">
                  You're all set.
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#72796E]">
                  Your password has been changed successfully. You can
                  now continue to your account using your new password.
                </p>

                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/login", { replace: true });
                  }}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#204A2F]"
                >
                  Continue to login <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7830]">
                  Account recovery
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#242821] sm:text-4xl">
                  Reset password
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#72796E]">
                  Create a new password for your account.
                </p>

                {checkingSession ? (
                  <div className="mt-8 flex items-center gap-3 rounded-xl bg-[#F3F5EF] p-4 text-sm text-[#285C3A]">
                    <LoaderCircle size={20} className="animate-spin" />
                    Verifying your recovery session...
                  </div>
                ) : !recoveryReady ? (
                  <div
                    role="alert"
                    className="mt-8 rounded-2xl border border-[#E9E5D9] bg-[#FAF7EF] p-5"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7F0E8] text-[#285C3A]">
                      <KeyRound size={22} />
                    </div>

                    <h3 className="mt-4 font-semibold text-[#242821]">
                      Recovery link required
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#72796E]">
                      To protect your account, open the password reset
                      link from the email you requested. If the link has
                      expired, request another one from the Login page.
                    </p>

                    <Link
                      to="/login"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#285C3A] hover:underline"
                    >
                      Return to login <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="mb-2 block text-sm font-medium text-[#353B32]"
                      >
                        New password *
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9487]"
                        />
                        <input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          value={password}
                          onChange={(event) => {
                            setPassword(event.target.value);
                            setError("");
                          }}
                          placeholder="At least 8 characters"
                          minLength={8}
                          required
                          disabled={saving}
                          className={inputClass}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((value) => !value)
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

                    <div>
                      <label
                        htmlFor="confirmNewPassword"
                        className="mb-2 block text-sm font-medium text-[#353B32]"
                      >
                        Confirm new password *
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9487]"
                        />
                        <input
                          id="confirmNewPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            setError("");
                          }}
                          placeholder="Enter your new password again"
                          minLength={8}
                          required
                          disabled={saving}
                          className={inputClass}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((value) => !value)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#7D8678] hover:bg-[#F1F4EE]"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs leading-5 text-[#858B80]">
                      Use at least 8 characters, including at least one
                      letter and one number.
                    </p>

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
                      disabled={saving}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#204A2F] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? (
                        <>
                          <LoaderCircle size={19} className="animate-spin" />
                          Updating password...
                        </>
                      ) : (
                        <>
                          Update password <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <p className="mt-7 text-center text-sm text-[#72796E]">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-[#285C3A] hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </>
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
