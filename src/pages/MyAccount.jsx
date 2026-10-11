
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Heart,
  Leaf,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const COLORS = {
  green: "#285C3A",
  darkGreen: "#173F2A",
  lightGreen: "#E7F0E8",
  cream: "#FAF7EF",
  gold: "#C79A3B",
  text: "#242821",
  muted: "#72796E",
  border: "#E8E4D9",
};

const cardClass =
  "rounded-3xl border border-[#E8E4D9] bg-white shadow-[0_8px_30px_rgba(36,40,33,0.035)]";

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "C"
  );
}

function formatDate(date) {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function IconTile({ icon: Icon, className = "" }) {
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F0E8] text-[#285C3A] ${className}`}
    >
      <Icon size={22} strokeWidth={1.8} />
    </span>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#9A7A37]">
            {eyebrow}
          </p>
        )}

        <h2 className="text-xl font-semibold tracking-tight text-[#242821] sm:text-2xl">
          {title}
        </h2>

        {description && (
          <p className="mt-1.5 text-sm leading-6 text-[#72796E]">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function AccountAction({
  icon: Icon,
  title,
  description,
  to,
  iconClass = "",
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-[#E8E4D9] bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#B8CDBA] hover:shadow-lg hover:shadow-[#285C3A]/5 sm:p-5"
    >
      <IconTile icon={Icon} className={iconClass} />

      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-[#242821]">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-[#72796E] sm:text-sm">
          {description}
        </span>
      </span>

      <ChevronRight
        size={19}
        className="shrink-0 text-[#9A9F94] transition group-hover:translate-x-1 group-hover:text-[#285C3A]"
      />
    </Link>
  );
}

export default function MyAccount() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [addresses, setAddresses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editing, setEditing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [addressError, setAddressError] = useState("");

  const loadAccount = useCallback(async (currentUser) => {
    setUser(currentUser);
    setFullName(currentUser.user_metadata?.full_name || "");
    setError("");
    setAddressError("");

    const [profileResult, addressResult] = await Promise.all([
      supabase
        .from("customer_profiles")
        .select("phone")
        .eq("user_id", currentUser.id)
        .maybeSingle(),

      supabase
        .from("customer_addresses")
        .select(
          "id, full_name, phone, address_line_1, address_line_2, landmark, city, state, postal_code, address_type, is_default"
        )
        .eq("user_id", currentUser.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

    if (profileResult.error) {
      console.error("Unable to load profile:", profileResult.error);

      setError(
        "Your account loaded, but your saved phone number could not be loaded."
      );
    } else {
      setPhone(profileResult.data?.phone || "");
    }

    if (addressResult.error) {
      console.error("Unable to load addresses:", addressResult.error);

      setAddressError(
        "Your saved addresses could not be loaded. Please try refreshing."
      );

      setAddresses([]);
    } else {
      setAddresses(addressResult.data || []);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initialise = async () => {
      try {
        const { data, error: authError } =
          await supabase.auth.getUser();

        if (!active) return;

        if (authError || !data.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        await loadAccount(data.user);
      } catch (loadError) {
        console.error("Unable to load account:", loadError);

        if (active) {
          setError(
            "Unable to load your account. Please refresh the page."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    initialise();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
        setFullName("");
        setPhone("");
        setAddresses([]);
        setEditing(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadAccount]);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!user?.id) {
      setError("Please log in again before updating your profile.");
      return;
    }

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError("Your name must contain between 2 and 100 characters.");
      return;
    }

    if (trimmedPhone) {
      const digits = trimmedPhone.replace(/\D/g, "");

      if (digits.length < 10 || digits.length > 15) {
        setError("Enter a valid phone number containing 10–15 digits.");
        return;
      }
    }

    setSaving(true);

    try {
      const { data, error: authUpdateError } =
        await supabase.auth.updateUser({
          data: { full_name: trimmedName },
        });

      if (authUpdateError) throw authUpdateError;

      if (!data?.user) {
        throw new Error("Your session could not be verified. Please log in again.");
      }

      const { error: profileError } = await supabase
        .from("customer_profiles")
        .upsert(
          {
            user_id: data.user.id,
            phone: trimmedPhone || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (profileError) throw profileError;

      setUser(data.user);
      setFullName(trimmedName);
      setPhone(trimmedPhone);
      setEditing(false);
      setMessage("Your profile has been updated successfully.");
    } catch (saveError) {
      console.error("Unable to save profile:", saveError);

      setError(
        saveError.message ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setError("");
    setLoggingOut(true);

    try {
      const { error: logoutError } = await supabase.auth.signOut();

      if (logoutError) throw logoutError;

      navigate("/login", { replace: true });
    } catch (logoutError) {
      setError(logoutError.message || "Unable to log out. Please try again.");
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#FAF7EF] px-4">
        <div className="flex flex-col items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F0E8] text-[#285C3A]">
            <LoaderCircle size={26} className="animate-spin" />
          </span>
          <p className="text-sm font-medium text-[#285C3A]">
            Preparing your account...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#FAF7EF] px-4 py-12">
        <section className={`${cardClass} w-full max-w-md p-8 text-center sm:p-10`}>
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E7F0E8] text-[#285C3A]">
            <CircleUserRound size={32} />
          </span>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#9A7A37]">
            Welcome to Chithu's
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#242821]">
            Your account awaits
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#72796E]">
            Sign in to manage your profile, saved addresses, and shopping
            experience.
          </p>

          <Link
            to="/login"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173F2A]"
          >
            Sign in to your account
            <ArrowRight size={17} />
          </Link>

          <p className="mt-5 text-sm text-[#72796E]">
            New customer?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#285C3A] hover:underline"
            >
              Create an account
            </Link>
          </p>
        </section>
      </main>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Customer";

  const initials = getInitials(displayName);
  const emailVerified = Boolean(user.email_confirmed_at);

  const defaultAddress =
    addresses.find((address) => address.is_default) || addresses[0] || null;

  return (
    <main className="min-h-screen bg-[#FAF7EF] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#72796E] sm:text-sm">
          <Link to="/" className="transition hover:text-[#285C3A]">
            Home
          </Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-[#285C3A]">My Account</span>
        </div>

        {/* Welcome banner */}
        <section className="relative isolate overflow-hidden rounded-[28px] bg-[#173F2A] text-white shadow-xl shadow-[#173F2A]/10">
          <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-4 -top-12 -z-10 h-52 w-52 rounded-full bg-[#C79A3B]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 -z-10 h-56 w-56 rounded-full bg-[#6B9B72]/15 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-11">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
              >
                <Leaf size={15} className="text-[#DCC58F]" />
                Chithu's Natural Products
              </Link>

              <p className="mt-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#E8D5A8]">
                <Sparkles size={15} />
                Your personal space
              </p>

              <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Good to see you,
                <span className="mt-1 block text-[#E8D5A8]">
                  {displayName.split(/\s+/)[0]}.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                Manage your details, keep your delivery information ready,
                and make every shopping experience simpler.
              </p>

              <button
                type="button"
                onClick={() => {
                  setFullName(user.user_metadata?.full_name || "");
                  setEditing(true);
                  setError("");
                  setMessage("");
                }}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#FAF7EF] px-5 py-3 text-sm font-semibold text-[#173F2A] transition hover:bg-white"
              >
                <Pencil size={16} />
                Edit my profile
              </button>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4 sm:max-w-sm sm:p-5 lg:min-w-[280px]">
              <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-2xl border border-[#E8D5A8]/40 bg-[#FAF7EF] text-xl font-bold text-[#285C3A] shadow-inner">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="font-semibold">{displayName}</p>

                <p className="mt-1 break-all text-xs leading-5 text-white/65">
                  {user.email}
                </p>

                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#E8D5A8]">
                  <ShieldCheck size={14} />
                  Customer account
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-white/10 bg-black/10">
            <div className="px-3 py-4 text-center sm:px-6">
              <p className="text-xl font-semibold sm:text-2xl">
                {addresses.length}
              </p>
              <p className="mt-1 text-[10px] text-white/60 sm:text-xs">
                Saved addresses
              </p>
            </div>

            <div className="border-x border-white/10 px-3 py-4 text-center sm:px-6">
              <p className="text-xl font-semibold sm:text-2xl">
                {emailVerified ? "Yes" : "—"}
              </p>
              <p className="mt-1 text-[10px] text-white/60 sm:text-xs">
                Email verified
              </p>
            </div>

            <div className="px-3 py-4 text-center sm:px-6">
              <p className="text-xl font-semibold sm:text-2xl">
                <Leaf className="mx-auto" size={24} />
              </p>
              <p className="mt-1 text-[10px] text-white/60 sm:text-xs">
                Natural goodness
              </p>
            </div>
          </div>
        </section>

        {/* Status messages */}
        {message && (
          <div
            role="status"
            className="mt-5 flex items-start gap-3 rounded-2xl border border-[#C9DFCC] bg-[#F0F7EF] p-4 text-sm text-[#285C3A]"
          >
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <X size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Profile editor */}
        {editing && (
          <section className={`${cardClass} mt-6 p-5 sm:p-8`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A7A37]">
                  Personal information
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[#242821]">
                  Edit your profile
                </h2>
                <p className="mt-1 text-sm text-[#72796E]">
                  Keep your details up to date.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFullName(user.user_metadata?.full_name || "");
                  setError("");
                }}
                aria-label="Close profile editor"
                className="rounded-xl border border-[#E8E4D9] p-2 text-[#72796E] transition hover:bg-[#FAF7EF]"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="mt-7 grid gap-5 md:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="accountFullName"
                  className="mb-2 block text-sm font-medium text-[#353B32]"
                >
                  Full name
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-[#E0E5DB] bg-white px-4 transition focus-within:border-[#285C3A] focus-within:ring-4 focus-within:ring-[#285C3A]/10">
                  <UserRound size={18} className="shrink-0 text-[#72796E]" />
                  <input
                    id="accountFullName"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    required
                    className="w-full bg-transparent py-3.5 text-sm text-[#242821] outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="accountEmail"
                  className="mb-2 block text-sm font-medium text-[#353B32]"
                >
                  Email address
                </label>

                <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#E0E5DB] bg-[#F7F8F4] px-4 py-3.5">
                  <Mail size={18} className="shrink-0 text-[#72796E]" />
                  <span
                    id="accountEmail"
                    className="min-w-0 flex-1 break-all text-sm text-[#72796E]"
                  >
                    {user.email}
                  </span>
                  {emailVerified && (
                    <BadgeCheck
                      size={18}
                      className="shrink-0 text-[#285C3A]"
                    />
                  )}
                </div>

                <p className="mt-2 text-xs text-[#858B80]">
                  Email changes require a separate verification process.
                </p>
              </div>

              <div>
                <label
                  htmlFor="accountPhone"
                  className="mb-2 block text-sm font-medium text-[#353B32]"
                >
                  Phone number
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-[#E0E5DB] bg-white px-4 transition focus-within:border-[#285C3A] focus-within:ring-4 focus-within:ring-[#285C3A]/10">
                  <Phone size={18} className="shrink-0 text-[#72796E]" />
                  <input
                    id="accountPhone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    maxLength={20}
                    className="w-full bg-transparent py-3.5 text-sm text-[#242821] outline-none"
                    placeholder="Enter your phone number"
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-[#858B80]">
                  Enter 10–15 digits, including the country code if needed.
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173F2A] disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={17} className="animate-spin" />
                  )}
                  {saving ? "Saving changes..." : "Save changes"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFullName(user.user_metadata?.full_name || "");
                    setError("");
                  }}
                  className="rounded-xl border border-[#E8E4D9] px-5 py-3.5 text-sm font-semibold text-[#353B32] transition hover:bg-[#FAF7EF]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Main dashboard */}
        <div className="mt-9 grid items-start gap-7 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="min-w-0">
            {/* Account shortcuts */}
            <section>
              <SectionHeading
                eyebrow="Made for you"
                title="Your account"
                description="Everything you need, neatly organised."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <AccountAction
                  icon={ShoppingBag}
                  title="My Orders"
                  description="View purchases and order updates."
                  to="/orders"
                />

                <AccountAction
                  icon={Heart}
                  title="My Wishlist"
                  description="Find your saved favourites."
                  to="/wishlist"
                  iconClass="bg-[#FBEBE9] text-[#A64F48]"
                />

                <AccountAction
                  icon={MapPin}
                  title="Delivery Addresses"
                  description="Manage your saved delivery locations."
                  to="/my-addresses"
                />

                <AccountAction
                  icon={Leaf}
                  title="Explore Products"
                  description="Discover more natural goodness."
                  to="/shop"
                />
              </div>
            </section>

            {/* Saved address */}
            <section className="mt-9">
              <SectionHeading
                eyebrow="Ready for delivery"
                title="Your saved address"
                description="Your preferred place for receiving orders."
                action={
                  <Link
                    to="/my-addresses"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#285C3A] hover:underline"
                  >
                    Manage
                    <ArrowRight size={15} />
                  </Link>
                }
              />

              {addressError && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
                >
                  {addressError}
                  <button
                    type="button"
                    onClick={() => loadAccount(user)}
                    className="ml-2 font-semibold underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {defaultAddress ? (
                <div className={`${cardClass} overflow-hidden`}>
                  <div className="flex items-center justify-between gap-3 border-b border-[#EEECE4] px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E7F0E8] text-[#285C3A]">
                        <MapPin size={18} />
                      </span>
                      <span className="font-semibold text-[#242821]">
                        Delivery location
                      </span>
                    </div>

                    <span className="rounded-full bg-[#E7F0E8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#285C3A]">
                      {defaultAddress.is_default ? "Default" : "Saved"}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-semibold text-[#242821]">
                          {defaultAddress.full_name}
                        </h3>

                        <p className="mt-1 text-sm text-[#72796E]">
                          {defaultAddress.phone}
                        </p>

                        <p className="mt-4 break-words text-sm leading-6 text-[#4F564B]">
                          {defaultAddress.address_line_1}
                          {defaultAddress.address_line_2 &&
                            `, ${defaultAddress.address_line_2}`}
                          {defaultAddress.landmark &&
                            `, Near ${defaultAddress.landmark}`}
                          {`, ${defaultAddress.city}, ${defaultAddress.state} - ${defaultAddress.postal_code}`}
                        </p>

                        <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#FAF7EF] px-2.5 py-1.5 text-xs text-[#72796E]">
                          <MapPin size={13} />
                          {defaultAddress.address_type || "Home"} address
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/my-addresses"
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#285C3A]/20 bg-[#F7FAF6] px-4 py-3 text-sm font-semibold text-[#285C3A] transition hover:bg-[#E7F0E8]"
                    >
                      Manage addresses
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className={`${cardClass} p-6 sm:p-8`}>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F0E8] text-[#285C3A]">
                    <MapPin size={26} />
                  </div>

                  <h3 className="mt-4 text-center text-lg font-semibold text-[#242821]">
                    Add your delivery address
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-[#72796E]">
                    Save your address for a smoother checkout next time.
                  </p>

                  <Link
                    to="/my-addresses"
                    className="mx-auto mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173F2A]"
                  >
                    Add an address
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Right column */}
          <aside className="space-y-6">
            {/* Profile details */}
            <section className={`${cardClass} p-5 sm:p-6`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A7A37]">
                    Your information
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-[#242821]">
                    Profile details
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFullName(user.user_metadata?.full_name || "");
                    setEditing(true);
                    setError("");
                    setMessage("");
                  }}
                  aria-label="Edit profile"
                  className="rounded-xl border border-[#E8E4D9] p-2.5 text-[#285C3A] transition hover:bg-[#E7F0E8]"
                >
                  <Pencil size={17} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={17} className="mt-0.5 shrink-0 text-[#72796E]" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#858B80]">Email address</p>
                    <p className="mt-1 break-all text-sm font-medium text-[#242821]">
                      {user.email}
                    </p>
                    <p
                      className={`mt-1.5 inline-flex items-center gap-1 text-xs ${
                        emailVerified ? "text-[#285C3A]" : "text-amber-700"
                      }`}
                    >
                      {emailVerified ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <ShieldCheck size={13} />
                      )}
                      {emailVerified ? "Verified email" : "Not verified"}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-[#EEECE4]" />

                <div className="flex items-start gap-3">
                  <Phone size={17} className="mt-0.5 shrink-0 text-[#72796E]" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#858B80]">Phone number</p>
                    <p className="mt-1 break-words text-sm font-medium text-[#242821]">
                      {phone || "Not added yet"}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-[#EEECE4]" />

                <div className="flex items-start gap-3">
                  <Clock3
                    size={17}
                    className="mt-0.5 shrink-0 text-[#72796E]"
                  />
                  <div>
                    <p className="text-xs text-[#858B80]">Member since</p>
                    <p className="mt-1 text-sm font-medium text-[#242821]">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFullName(user.user_metadata?.full_name || "");
                  setEditing(true);
                  setError("");
                  setMessage("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E8E4D9] px-4 py-3 text-sm font-semibold text-[#285C3A] transition hover:border-[#285C3A]/30 hover:bg-[#F7FAF6]"
              >
                Update information
                <ArrowRight size={15} />
              </button>
            </section>

            {/* Brand note */}
            <section className="relative overflow-hidden rounded-3xl bg-[#E7F0E8] p-6 sm:p-7">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[#285C3A]/10" />
              <div className="pointer-events-none absolute -right-1 -top-1 h-20 w-20 rounded-full bg-[#C79A3B]/10 blur-2xl" />

              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#285C3A]">
                <Leaf size={23} />
              </span>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A7A37]">
                A little goodness
              </p>

              <h2 className="mt-2 text-xl font-semibold leading-snug text-[#173F2A]">
                Choose natural.
                <br />
                Choose goodness.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#536754]">
                Explore traditional favourites and everyday essentials from
                Chithu's Natural Products.
              </p>

              <Link
                to="/shop"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#285C3A] transition hover:gap-3"
              >
                Explore the shop
                <ArrowRight size={16} />
              </Link>
            </section>

            {/* Sign out */}
            <section className={`${cardClass} p-5 sm:p-6`}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBEBE9] text-[#A64F48]">
                  <LogOut size={19} />
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-[#242821]">
                    Sign out
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-[#72796E]">
                    Finished shopping? You can safely sign out of your account.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E8D5D0] px-4 py-3 text-sm font-semibold text-[#9A4D43] transition hover:bg-[#FFF5F2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <LogOut size={17} />
                )}
                {loggingOut ? "Signing out..." : "Log out"}
              </button>
            </section>
          </aside>
        </div>

        {/* Footer note */}
        <div className="mt-10 border-t border-[#E8E4D9] py-6 text-center">
          <div className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#285C3A]">
            <Leaf size={16} />
            Chithu's Natural Products
          </div>

          <p className="mt-2 text-xs text-[#858B80]">
            Goodness in every choice.
          </p>
        </div>
      </div>
    </main>
  );
}
