
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Home,
  MapPin,
  MapPinned,
  Pencil,
  Plus,
  BriefcaseBusiness,
  Trash2,
  X,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useGlobalUI } from "../context/GlobalUIContext";

const emptyForm = {
  full_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  landmark: "",
  city: "",
  state: "",
  postal_code: "",
  address_type: "Home",
  is_default: false,
};

const inputClass =
  "w-full rounded-xl border border-[#E0E5DB] bg-white px-4 py-3 text-sm text-[#242821] outline-none transition placeholder:text-[#A0A79D] focus:border-[#285C3A] focus:ring-4 focus:ring-[#285C3A]/10 disabled:bg-[#F3F4F0]";

const labelClass =
  "mb-2 block text-sm font-medium text-[#353B32]";

function getAddressIcon(type) {
  if (type === "Work") return BriefcaseBusiness;
  if (type === "Other") return MapPinned;
  return Home;
}

export default function MyAddresses() {
  const { confirm } = useGlobalUI();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAddresses = useCallback(async (userId) => {
    const { data, error: queryError } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (queryError) throw queryError;

    setAddresses(data ?? []);
  }, []);

  useEffect(() => {
    let active = true;

    const initialise = async () => {
      try {
        const { data, error: authError } =
          await supabase.auth.getUser();

        if (!active) return;

        if (authError || !data.user) {
          navigate("/login", {
            replace: true,
            state: { from: "/my-addresses" },
          });
          return;
        }

        setUser(data.user);

        const { data: rows, error: queryError } = await supabase
          .from("customer_addresses")
          .select("*")
          .eq("user_id", data.user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false });

        if (queryError) throw queryError;
        if (active) setAddresses(rows ?? []);
      } catch (err) {
        if (active) {
          setError(
            err.message ||
            "We couldn't load your saved addresses. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    initialise();

    return () => {
      active = false;
    };
  }, [navigate]);

  const openAddForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      full_name: user?.user_metadata?.full_name ?? "",
      is_default: addresses.length === 0,
    });
    setError("");
    setNotice("");
    setFormOpen(true);
  };

  const openEditForm = (address) => {
    setEditingId(address.id);
    setForm({
      full_name: address.full_name ?? "",
      phone: address.phone ?? "",
      address_line_1: address.address_line_1 ?? "",
      address_line_2: address.address_line_2 ?? "",
      landmark: address.landmark ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      postal_code: address.postal_code ?? "",
      address_type: address.address_type ?? "Home",
      is_default: address.is_default,
    });
    setError("");
    setNotice("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!user) return;

    setError("");
    setNotice("");

    const phoneDigits = form.phone.replace(/\D/g, "");
    const postalDigits = form.postal_code.replace(/\D/g, "");

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setError("Enter a valid phone number with 10–15 digits.");
      return;
    }

    if (postalDigits.length !== 6) {
      setError("Enter a valid 6-digit Indian PIN code.");
      return;
    }

    setSaving(true);

    try {
      const makeDefault = form.is_default || addresses.length === 0;

      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address_line_1: form.address_line_1.trim(),
        address_line_2: form.address_line_2.trim() || null,
        landmark: form.landmark.trim() || null,
        city: form.city.trim(),
        state: form.state.trim(),
        postal_code: form.postal_code.trim(),
        address_type: form.address_type,
        is_default: makeDefault,
      };

      // Clear the existing default before setting another one.
      if (makeDefault) {
        const { error: clearError } = await supabase
          .from("customer_addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);

        if (clearError) throw clearError;
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from("customer_addresses")
          .update(payload)
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("customer_addresses")
          .insert({
            ...payload,
            user_id: user.id,
          });

        if (insertError) throw insertError;
      }

      // If the previous default was turned off, select another
      // address as default when one exists.
      if (!makeDefault) {
        const wasDefault = addresses.some(
          (address) =>
            address.id === editingId && address.is_default
        );

        if (wasDefault) {
          const fallback = addresses.find(
            (address) => address.id !== editingId
          );

          if (fallback) {
            const { error: defaultError } = await supabase
              .from("customer_addresses")
              .update({ is_default: true })
              .eq("id", fallback.id)
              .eq("user_id", user.id);

            if (defaultError) throw defaultError;
          }
        }
      }

      await loadAddresses(user.id);
      closeForm();
      setNotice(
        editingId
          ? "Your address has been updated."
          : "Your new address has been saved."
      );
    } catch (err) {
      setError(
        err.message ||
        "We couldn't save your address. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (address) => {
    if (!user || address.is_default) return;

    setError("");
    setNotice("");

    try {
      const { error: clearError } = await supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      if (clearError) throw clearError;

      const { error: setError } = await supabase
        .from("customer_addresses")
        .update({ is_default: true })
        .eq("id", address.id)
        .eq("user_id", user.id);

      if (setError) throw setError;

      await loadAddresses(user.id);
      setNotice("Default delivery address updated.");
    } catch (err) {
      setError(
        err.message || "Couldn't change the default address."
      );
      try {
        await loadAddresses(user.id);
      } catch {
        // Keep the original error visible.
      }
    }
  };


  const handleDelete = async (address) => {
    if (!user) return;

    const confirmed = await confirm({
      title: "Delete saved address?",
      message: `Are you sure you want to delete the address for ${address.full_name}? This action cannot be undone.`,
      confirmText: "Delete address",
      cancelText: "Keep address",
      variant: "danger",
    });

    if (!confirmed) return;


    setError("");
    setNotice("");
    setDeletingId(address.id);

    try {
      const { error: deleteError } = await supabase
        .from("customer_addresses")
        .delete()
        .eq("id", address.id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      const remaining = addresses.filter(
        (item) => item.id !== address.id
      );

      if (address.is_default && remaining.length > 0) {
        const { error: defaultError } = await supabase
          .from("customer_addresses")
          .update({ is_default: true })
          .eq("id", remaining[0].id)
          .eq("user_id", user.id);

        if (defaultError) throw defaultError;
      }

      await loadAddresses(user.id);
      setNotice("Address deleted successfully.");

      if (editingId === address.id) closeForm();
    } catch (err) {
      setError(
        err.message || "We couldn't delete this address."
      );
      try {
        await loadAddresses(user.id);
      } catch {
        // Keep the original error visible.
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7EF] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/my-account"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#647060] transition hover:text-[#285C3A]"
        >
          <ArrowLeft size={17} />
          Back to My Account
        </Link>

        <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7830]">
              Your account
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#242821] sm:text-4xl">
              Saved addresses
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#72796E]">
              Keep your delivery details ready for your next order.
            </p>
          </div>

          {!loading && (
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#204A2F]"
            >
              <Plus size={18} />
              Add new address
            </button>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-6 flex items-center gap-2 rounded-xl border border-[#CFE2D1] bg-[#E7F0E8] px-4 py-3 text-sm text-[#285C3A]"
          >
            <CheckCircle2 size={18} />
            {notice}
          </div>
        )}

        {loading ? (
          <div className="mt-10 flex min-h-52 items-center justify-center gap-3 text-sm text-[#647060]">
            <LoaderCircle size={22} className="animate-spin" />
            Loading your saved addresses...
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-4">
              {addresses.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#D9DFD3] bg-white px-6 py-12 text-center sm:px-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F0E8] text-[#285C3A]">
                    <MapPin size={30} />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-[#242821]">
                    No saved addresses yet
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#72796E]">
                    Add your home or work address to make future
                    deliveries easier.
                  </p>
                  <button
                    type="button"
                    onClick={openAddForm}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#285C3A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#204A2F]"
                  >
                    <Plus size={17} />
                    Add your first address
                  </button>
                </div>
              ) : (
                addresses.map((address) => {
                  const AddressIcon = getAddressIcon(
                    address.address_type
                  );

                  return (
                    <article
                      key={address.id}
                      className={`rounded-2xl border bg-white p-5 shadow-[0_8px_28px_rgba(40,92,58,0.035)] transition sm:p-6 ${address.is_default
                          ? "border-[#9CBCA1]"
                          : "border-[#E9E5D9]"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E7F0E8] text-[#285C3A]">
                          <AddressIcon size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold text-[#242821]">
                              {address.full_name}
                            </h2>

                            <span className="rounded-full bg-[#F3F4F0] px-2.5 py-1 text-xs text-[#647060]">
                              {address.address_type}
                            </span>

                            {address.is_default && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F0E8] px-2.5 py-1 text-xs font-medium text-[#285C3A]">
                                <Check size={13} />
                                Default
                              </span>
                            )}
                          </div>

                          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#646C60]">
                            {address.address_line_1}
                            {address.address_line_2 &&
                              `, ${address.address_line_2}`}
                            {address.landmark &&
                              `, Near ${address.landmark}`}
                            {`\n${address.city}, ${address.state} - ${address.postal_code}`}
                          </p>

                          <p className="mt-2 text-sm text-[#646C60]">
                            Phone: {address.phone}
                          </p>

                          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#F0EEE7] pt-4">
                            <button
                              type="button"
                              onClick={() => openEditForm(address)}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#285C3A] hover:underline"
                            >
                              <Pencil size={15} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(address)}
                              disabled={deletingId === address.id}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#A3473D] hover:underline disabled:opacity-50"
                            >
                              {deletingId === address.id ? (
                                <LoaderCircle
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={15} />
                              )}
                              Delete
                            </button>

                            {!address.is_default && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetDefault(address)
                                }
                                className="text-sm font-medium text-[#647060] hover:text-[#285C3A] hover:underline"
                              >
                                Set as default
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </section>

            <aside className="h-fit rounded-2xl border border-[#E9E5D9] bg-white p-5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7F0E8] text-[#285C3A]">
                <ShieldCheck size={22} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[#242821]">
                Your addresses, protected
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#72796E]">
                Your saved delivery details are associated with your
                signed-in account. Supabase Row Level Security protects
                access to these records.
              </p>

              <div className="mt-5 border-t border-[#E9E5D9] pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#858B80]">
                  Need something else?
                </p>
                <Link
                  to="/shop"
                  className="mt-3 flex items-center justify-between text-sm font-medium text-[#285C3A] hover:underline"
                >
                  Continue shopping
                  <ChevronRight size={17} />
                </Link>
              </div>
            </aside>
          </div>
        )}

        {/* Add/edit address form */}
        {formOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#17241B]/55 sm:items-center sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) {
                closeForm();
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="address-form-title"
              className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7830]">
                    Delivery details
                  </p>
                  <h2
                    id="address-form-title"
                    className="mt-2 text-2xl font-semibold text-[#242821]"
                  >
                    {editingId ? "Edit address" : "Add new address"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  aria-label="Close address form"
                  className="rounded-xl p-2 text-[#72796E] hover:bg-[#F3F4F0] disabled:opacity-50"
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-7 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="full_name">
                      Full name *
                    </label>
                    <input
                      id="full_name"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleFieldChange}
                      className={inputClass}
                      placeholder="Recipient's name"
                      maxLength={100}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="phone">
                      Phone number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={handleFieldChange}
                      className={inputClass}
                      placeholder="10-digit mobile number"
                      maxLength={20}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      className={labelClass}
                      htmlFor="address_line_1"
                    >
                      House / flat number and street *
                    </label>
                    <input
                      id="address_line_1"
                      name="address_line_1"
                      value={form.address_line_1}
                      onChange={handleFieldChange}
                      className={inputClass}
                      placeholder="House no., street name"
                      maxLength={200}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label
                      className={labelClass}
                      htmlFor="address_line_2"
                    >
                      Area / locality
                    </label>
                    <input
                      id="address_line_2"
                      name="address_line_2"
                      value={form.address_line_2}
                      onChange={handleFieldChange}
                      className={inputClass}
                      placeholder="Area, locality"
                      maxLength={200}
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="landmark">
                      Landmark
                    </label>
                    <input
                      id="landmark"
                      name="landmark"
                      value={form.landmark}
                      onChange={handleFieldChange}
                      className={inputClass}
                      placeholder="Nearby landmark"
                      maxLength={150}
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="city">
                      City / town *
                    </label>
                    <input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleFieldChange}
                      className={inputClass}
                      placeholder="City or town"
                      maxLength={100}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="state">
                      State *
                    </label>
                    <input
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={handleFieldChange}
                      className={inputClass}
                      placeholder="State"
                      maxLength={100}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label
                      className={labelClass}
                      htmlFor="postal_code"
                    >
                      PIN code *
                    </label>
                    <input
                      id="postal_code"
                      name="postal_code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      value={form.postal_code}
                      onChange={handleFieldChange}
                      className={inputClass}
                      placeholder="6-digit PIN code"
                      maxLength={6}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label
                      className={labelClass}
                      htmlFor="address_type"
                    >
                      Address type *
                    </label>
                    <select
                      id="address_type"
                      name="address_type"
                      value={form.address_type}
                      onChange={handleFieldChange}
                      className={inputClass}
                      disabled={saving}
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E9E5D9] bg-[#FAF7EF] p-4">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={form.is_default}
                    onChange={handleFieldChange}
                    disabled={saving}
                    className="mt-0.5 h-4 w-4 accent-[#285C3A]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-[#242821]">
                      Make this my default address
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#72796E]">
                      Use this as your preferred delivery address.
                    </span>
                  </span>
                </label>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-[#E9E5D9] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="rounded-xl border border-[#DDE2D7] px-5 py-3.5 text-sm font-semibold text-[#4E584B] hover:bg-[#F5F6F2] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#204A2F] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? (
                      <>
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        {editingId ? "Save changes" : "Save address"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
