
import { useCallback, useEffect, useState } from "react";
import {
  Megaphone,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  CalendarDays,
  AlertCircle,
  X,
  CheckCircle2,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const EMPTY_FORM = {
  message: "",
  link_url: "",
  is_active: false,
  starts_at: "",
  ends_at: "",
  sort_order: 0,
};

function toLocalDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

function toIsoDateTime(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
}

function formatDate(value) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatus(item) {
  const now = Date.now();

  if (!item.is_active) {
    return {
      label: "Inactive",
      className: "bg-gray-100 text-gray-600",
    };
  }

  if (item.starts_at && new Date(item.starts_at).getTime() > now) {
    return {
      label: "Scheduled",
      className: "bg-blue-50 text-blue-700",
    };
  }

  if (item.ends_at && new Date(item.ends_at).getTime() <= now) {
    return {
      label: "Expired",
      className: "bg-orange-50 text-orange-700",
    };
  }

  return {
    label: "Published",
    className: "bg-green-50 text-green-700",
  };
}

/**
 * Accept relative storefront paths and HTTPS URLs only.
 * Examples:
 * /shop
 * /shop/dosa-mixes
 * https://example.com/offer
 */
function validateDestination(value) {
  const url = value.trim();

  if (!url) {
    return { valid: true, value: null };
  }

  if (
    url.startsWith("/") &&
    !url.startsWith("//") &&
    !url.includes("\\")
  ) {
    return { valid: true, value: url };
  }

  try {
    const parsed = new URL(url);

    if (
      parsed.protocol === "https:" &&
      parsed.hostname &&
      !parsed.username &&
      !parsed.password
    ) {
      return { valid: true, value: url };
    }
  } catch {
    // Invalid URL: return the validation message below.
  }

  return {
    valid: false,
    message:
      "Enter a valid internal path, such as /shop, or an HTTPS URL.",
  };
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("announcements")
        .select(
          "id, message, link_url, is_active, starts_at, ends_at, sort_order, created_at, updated_at"
        )
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setAnnouncements(data || []);
    } catch (err) {
      setError(
        err.message || "Unable to load announcements."
      );
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  function openCreateModal() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  }

  function openEditModal(item) {
    setEditingId(item.id);

    setForm({
      message: item.message || "",
      link_url: item.link_url || "",
      is_active: Boolean(item.is_active),
      starts_at: toLocalDateTime(item.starts_at),
      ends_at: toLocalDateTime(item.ends_at),
      sort_order: item.sort_order ?? 0,
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setIsModalOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
  }

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const message = form.message.trim();

    if (!message) {
      setError("Please enter an announcement message.");
      return;
    }

    const destination = validateDestination(form.link_url);

    if (!destination.valid) {
      setError(destination.message);
      return;
    }

    const startsAt = toIsoDateTime(form.starts_at);
    const endsAt = toIsoDateTime(form.ends_at);

    if (form.starts_at && !startsAt) {
      setError("Please enter a valid start date.");
      return;
    }

    if (form.ends_at && !endsAt) {
      setError("Please enter a valid end date.");
      return;
    }

    if (
      startsAt &&
      endsAt &&
      new Date(endsAt).getTime() <=
        new Date(startsAt).getTime()
    ) {
      setError(
        "The end date must be later than the start date."
      );
      return;
    }

    const numericPriority = Number(form.sort_order);

    if (!Number.isFinite(numericPriority)) {
      setError("Please enter a valid display priority.");
      return;
    }

    const payload = {
      message,
      link_url: destination.value,
      is_active: form.is_active,
      starts_at: startsAt,
      ends_at: endsAt,
      sort_order: Math.trunc(numericPriority),
      updated_at: new Date().toISOString(),
    };

    setSaving(true);

    try {
      let result;

      if (editingId) {
        result = await supabase
          .from("announcements")
          .update(payload)
          .eq("id", editingId);
      } else {
        result = await supabase
          .from("announcements")
          .insert(payload);
      }

      if (result.error) throw result.error;

      setSuccess(
        editingId
          ? "Announcement updated successfully."
          : "Announcement created successfully."
      );

      setIsModalOpen(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });

      await loadAnnouncements();
    } catch (err) {
      setError(
        err.message || "Unable to save the announcement."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleAnnouncement(item) {
    setError("");
    setSuccess("");
    setActionId(item.id);

    try {
      const { error: updateError } = await supabase
        .from("announcements")
        .update({
          is_active: !item.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (updateError) throw updateError;

      setSuccess(
        item.is_active
          ? "Announcement deactivated."
          : "Announcement activated."
      );

      await loadAnnouncements();
    } catch (err) {
      setError(
        err.message || "Unable to change announcement status."
      );
    } finally {
      setActionId(null);
    }
  }

  async function deleteAnnouncement(item) {
    const confirmed = window.confirm(
      `Delete this announcement?\n\n"${item.message}"`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setActionId(item.id);

    try {
      const { error: deleteError } = await supabase
        .from("announcements")
        .delete()
        .eq("id", item.id);

      if (deleteError) throw deleteError;

      setSuccess("Announcement deleted successfully.");

      await loadAnnouncements();
    } catch (err) {
      setError(
        err.message || "Unable to delete the announcement."
      );
    } finally {
      setActionId(null);
    }
  }

  const now = Date.now();

  const publishedCount = announcements.filter((item) => {
    return (
      item.is_active &&
      (!item.starts_at ||
        new Date(item.starts_at).getTime() <= now) &&
      (!item.ends_at ||
        new Date(item.ends_at).getTime() > now)
    );
  }).length;

  const scheduledCount = announcements.filter((item) => {
    return (
      item.is_active &&
      item.starts_at &&
      new Date(item.starts_at).getTime() > now
    );
  }).length;

  return (
    <div className="min-h-screen space-y-6 bg-[#FAF8F2] p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-[#667064]">
            <Megaphone size={17} />
            <span>Storefront Management</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#24352A] sm:text-3xl">
            Announcements
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667064]">
            Manage promotional messages and destination links
            displayed in your store's announcement bar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadAnnouncements}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E3D9] bg-white px-4 py-3 text-sm font-semibold text-[#344438] transition hover:bg-[#F4F3EB] disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173F2A]"
          >
            <Plus size={18} />
            Create announcement
          </button>
        </div>
      </div>

      {/* Feedback messages */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div className="min-w-0 flex-1 break-words">
            {error}
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div className="min-w-0 flex-1">{success}</div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#EAE8DC] bg-white p-5">
          <p className="text-sm text-[#667064]">
            Total announcements
          </p>
          <p className="mt-2 text-3xl font-bold text-[#24352A]">
            {announcements.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#EAE8DC] bg-white p-5">
          <p className="text-sm text-[#667064]">
            Currently published
          </p>
          <p className="mt-2 text-3xl font-bold text-[#285C3A]">
            {publishedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#EAE8DC] bg-white p-5">
          <p className="text-sm text-[#667064]">
            Scheduled announcements
          </p>
          <p className="mt-2 text-3xl font-bold text-[#24352A]">
            {scheduledCount}
          </p>
        </div>
      </div>

      {/* Announcement list */}
      <section className="overflow-hidden rounded-2xl border border-[#EAE8DC] bg-white">
        <div className="border-b border-[#EEEBDD] px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-[#24352A]">
            All announcements
          </h2>

          <p className="mt-1 text-sm text-[#667064]">
            Manage messages, destination links and publication
            status.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-52 items-center justify-center gap-3 text-sm text-[#667064]">
            <RefreshCw size={19} className="animate-spin" />
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F0E8] text-[#285C3A]">
              <Megaphone size={27} />
            </div>

            <h3 className="mt-4 font-semibold text-[#24352A]">
              No announcements yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[#667064]">
              Create your first announcement to manage the
              message shown at the top of your storefront.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#285C3A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#173F2A]"
            >
              <Plus size={17} />
              Create your first announcement
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#EEEBDD]">
            {announcements.map((item) => {
              const status = getStatus(item);
              const busy = actionId === item.id;

              return (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-[#FCFBF7] sm:px-6"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>

                        <span className="rounded-full bg-[#F4F3EB] px-3 py-1 text-xs font-medium text-[#667064]">
                          Priority: {item.sort_order}
                        </span>

                        {item.link_url && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F0E8] px-3 py-1 text-xs font-semibold text-[#285C3A]">
                            <LinkIcon size={12} />
                            Clickable
                          </span>
                        )}
                      </div>

                      <p className="break-words text-base font-medium leading-7 text-[#24352A]">
                        <span className="mr-2 text-[#C79A3B]">
                          ✦
                        </span>
                        {item.message}
                      </p>

                      {item.link_url && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#E2E9DC] bg-[#F5F8F1] p-3">
                          <ExternalLink
                            size={15}
                            className="mt-0.5 shrink-0 text-[#285C3A]"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#667064]">
                              Destination URL
                            </p>

                            <p className="mt-1 break-all text-xs font-medium text-[#285C3A]">
                              {item.link_url}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex flex-col gap-2 text-xs text-[#667064] sm:flex-row sm:flex-wrap sm:gap-4">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          Starts: {formatDate(item.starts_at)}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          Ends: {formatDate(item.ends_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => toggleAnnouncement(item)}
                        title={
                          item.is_active
                            ? "Deactivate"
                            : "Activate"
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-[#E2E3D9] px-3 py-2 text-sm font-medium text-[#344438] hover:bg-[#F4F3EB] disabled:opacity-50"
                      >
                        {item.is_active ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}

                        {item.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => openEditModal(item)}
                        title="Edit announcement"
                        aria-label="Edit announcement"
                        className="inline-flex items-center justify-center rounded-lg border border-[#E2E3D9] p-2.5 text-[#344438] hover:bg-[#F4F3EB] disabled:opacity-50"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => deleteAnnouncement(item)}
                        title="Delete announcement"
                        aria-label="Delete announcement"
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {busy ? (
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Create / edit modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-modal-title"
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EEEBDD] bg-white px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="announcement-modal-title"
                  className="text-lg font-bold text-[#24352A]"
                >
                  {editingId
                    ? "Edit announcement"
                    : "Create announcement"}
                </h2>

                <p className="mt-1 text-sm text-[#667064]">
                  Configure your storefront message and its
                  optional destination.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-[#667064] hover:bg-[#F4F3EB] disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5 sm:p-6"
            >
              {/* Message */}
              <div>
                <label
                  htmlFor="announcement-message"
                  className="mb-2 block text-sm font-semibold text-[#344438]"
                >
                  Announcement message *
                </label>

                <textarea
                  id="announcement-message"
                  required
                  maxLength={200}
                  rows={3}
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  placeholder="Example: Explore Our Millet Mixes →"
                  className="w-full rounded-xl border border-[#DADDD1] bg-white px-4 py-3 text-sm text-[#24352A] outline-none transition placeholder:text-[#9A9F94] focus:border-[#285C3A] focus:ring-2 focus:ring-[#285C3A]/10"
                />

                <p className="mt-1 text-right text-xs text-[#667064]">
                  {form.message.length}/200 characters
                </p>
              </div>

              {/* Destination URL */}
              <div>
                <label
                  htmlFor="announcement-link"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#344438]"
                >
                  <LinkIcon size={15} />
                  Destination URL (optional)
                </label>

                <input
                  id="announcement-link"
                  type="text"
                  value={form.link_url}
                  onChange={(event) =>
                    updateField("link_url", event.target.value)
                  }
                  placeholder="/shop or https://example.com"
                  maxLength={2048}
                  autoComplete="url"
                  spellCheck={false}
                  className="w-full rounded-xl border border-[#DADDD1] bg-white px-4 py-3 text-sm text-[#24352A] outline-none transition placeholder:text-[#9A9F94] focus:border-[#285C3A] focus:ring-2 focus:ring-[#285C3A]/10"
                />

                <p className="mt-2 text-xs leading-5 text-[#667064]">
                  When a destination is provided, visitors can
                  click the announcement to open it. Leave blank
                  for a non-clickable message.
                </p>

                <div className="mt-3 rounded-xl bg-[#F5F7F0] p-3">
                  <p className="text-xs font-semibold text-[#285C3A]">
                    Examples
                  </p>

                  <div className="mt-2 space-y-1.5 text-xs text-[#667064]">
                    <p>
                      Shop all products:{" "}
                      <code className="text-[#285C3A]">
                        /shop
                      </code>
                    </p>
                    <p>
                      Open a category:{" "}
                      <code className="text-[#285C3A]">
                        /shop/your-category-slug
                      </code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="announcement-start"
                    className="mb-2 block text-sm font-semibold text-[#344438]"
                  >
                    Start date and time
                  </label>

                  <input
                    id="announcement-start"
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(event) =>
                      updateField(
                        "starts_at",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded-xl border border-[#DADDD1] px-3 py-3 text-sm outline-none focus:border-[#285C3A]"
                  />

                  <p className="mt-1 text-xs text-[#667064]">
                    Leave blank to start immediately.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="announcement-end"
                    className="mb-2 block text-sm font-semibold text-[#344438]"
                  >
                    End date and time
                  </label>

                  <input
                    id="announcement-end"
                    type="datetime-local"
                    min={form.starts_at || undefined}
                    value={form.ends_at}
                    onChange={(event) =>
                      updateField(
                        "ends_at",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded-xl border border-[#DADDD1] px-3 py-3 text-sm outline-none focus:border-[#285C3A]"
                  />

                  <p className="mt-1 text-xs text-[#667064]">
                    Leave blank for no expiry.
                  </p>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label
                  htmlFor="announcement-priority"
                  className="mb-2 block text-sm font-semibold text-[#344438]"
                >
                  Display priority
                </label>

                <input
                  id="announcement-priority"
                  type="number"
                  step="1"
                  value={form.sort_order}
                  onChange={(event) =>
                    updateField(
                      "sort_order",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#DADDD1] px-4 py-3 text-sm outline-none focus:border-[#285C3A]"
                />

                <p className="mt-1 text-xs text-[#667064]">
                  Lower numbers appear first when multiple
                  announcements are available.
                </p>
              </div>

              {/* Active toggle */}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E2E3D9] bg-[#FAF8F2] p-4">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    updateField(
                      "is_active",
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[#285C3A]"
                />

                <span>
                  <span className="block text-sm font-semibold text-[#24352A]">
                    Activate announcement
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-[#667064]">
                    When enabled, the announcement can display
                    during its scheduled period.
                  </span>
                </span>
              </label>

              {/* Modal error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#EEEBDD] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-[#DADDD1] px-5 py-3 text-sm font-semibold text-[#344438] hover:bg-[#F4F3EB] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#173F2A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
