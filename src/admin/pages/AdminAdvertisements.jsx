import { useEffect, useState } from "react";
import {
  ImagePlus,
  Power,
  RefreshCw,
  Pencil,
  X,
  ExternalLink,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "advertisement-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const initialForm = {
  title: "",
  targetUrl: "",
};

function validateTargetUrl(value) {
  const url = value.trim();

  if (!url) return "";

  // Prevent protocol-relative URLs.
  if (url.startsWith("//")) {
    return "Enter an internal path or a valid HTTP/HTTPS URL.";
  }

  // Internal routes, such as /shop or /product/example.
  if (url.startsWith("/")) {
    return "";
  }

  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Only HTTP and HTTPS destination URLs are allowed.";
    }

    return "";
  } catch {
    return "Enter a valid URL, such as /shop or https://example.com.";
  }
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminAdvertisements() {
  const [campaigns, setCampaigns] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isEditing = Boolean(editingCampaign);

  async function loadCampaigns() {
    setLoading(true);
    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("advertisement_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      setCampaigns(data || []);
    } catch (err) {
      setError(err.message || "Unable to load advertisements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function clearFileInput() {
    const input = document.getElementById("advertisement-image");

    if (input) {
      input.value = "";
    }
  }

  function resetForm() {
    setForm(initialForm);
    setImageFile(null);
    setEditingCampaign(null);
    clearFileInput();
  }

  function startEditing(campaign) {
    setEditingCampaign(campaign);

    setForm({
      title: campaign.title || "",
      targetUrl: campaign.target_url || "",
    });

    setImageFile(null);
    clearFileInput();
    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditing() {
    resetForm();
    setError("");
    setMessage("");
  }

  async function uploadAdvertisementImage(file, userId) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `${userId}/${crypto.randomUUID()}-${safeName}`;

    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: publicData.publicUrl,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const title = form.title.trim();
    const targetUrl = form.targetUrl.trim();

    if (!title) {
      setError("Please enter an advertisement title.");
      return;
    }

    if (!isEditing && !imageFile) {
      setError("Please select an advertisement image.");
      return;
    }

    if (imageFile && !imageFile.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    if (imageFile && imageFile.size > MAX_IMAGE_SIZE) {
      setError("Please choose an image smaller than 5 MB.");
      return;
    }

    const urlError = validateTargetUrl(targetUrl);

    if (urlError) {
      setError(urlError);
      return;
    }

    setSaving(true);

    let uploadedPath = null;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error("Please sign in as an admin.");
      }

      // Preserve the existing image unless a new image is selected.
      let imageUrl = editingCampaign?.image_url || "";

      if (imageFile) {
        const uploaded = await uploadAdvertisementImage(
          imageFile,
          user.id
        );

        uploadedPath = uploaded.path;
        imageUrl = uploaded.url;
      }

      if (isEditing) {
        const { data, error: updateError } = await supabase
          .from("advertisement_campaigns")
          .update({
            title,
            image_url: imageUrl,
            target_url: targetUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCampaign.id)
          .select("id")
          .maybeSingle();

        if (updateError) throw updateError;

        if (!data) {
          throw new Error(
            "Advertisement was not updated. Check your admin permissions and Supabase update policies."
          );
        }

        setMessage("Advertisement updated successfully.");
      } else {
        const { data, error: insertError } = await supabase
          .from("advertisement_campaigns")
          .insert({
            title,
            image_url: imageUrl,
            target_url: targetUrl || null,
            is_active: true,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        if (!data) {
          throw new Error("Advertisement could not be created.");
        }

        setMessage("Advertisement published successfully.");
      }

      resetForm();

      // Refresh records while preserving the success message.
      await loadCampaigns();
    } catch (err) {
      // Remove only a newly uploaded image if the database operation fails.
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error(
            "Unable to clean up the unused advertisement image:",
            cleanupError
          );
        }
      }

      setError(err.message || "Unable to save advertisement.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleCampaign(campaign) {
    setBusyId(campaign.id);
    setError("");
    setMessage("");

    try {
      const { data, error: updateError } = await supabase
        .from("advertisement_campaigns")
        .update({
          is_active: !campaign.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaign.id)
        .select("id")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!data) {
        throw new Error(
          "Advertisement status was not changed. Check your admin permissions."
        );
      }

      setMessage(
        campaign.is_active
          ? "Advertisement deactivated."
          : "Advertisement activated."
      );

      await loadCampaigns();
    } catch (err) {
      setError(err.message || "Unable to update advertisement status.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7F0E8] text-[#285C3A]">
              <Megaphone size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#242821]">
                Advertisement Management
              </h1>

              <p className="mt-1 text-sm text-gray-600">
                Manage your storefront promotional campaigns.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadCampaigns}
          disabled={loading || saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDD8C8] bg-white px-4 py-2.5 text-sm font-medium text-[#242821] transition hover:bg-[#FAF7EF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh campaigns
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <p className="min-w-0 break-words">{error}</p>
        </div>
      )}

      {message && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

          <p className="min-w-0 break-words">{message}</p>
        </div>
      )}

      {/* Create / Edit form */}
      <section
        id="advertisement-form"
        className="overflow-hidden rounded-2xl border border-[#DDD8C8] bg-white shadow-sm"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#DDD8C8] bg-[#FAF7EF] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#242821]">
              {isEditing ? "Edit advertisement" : "Create advertisement"}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {isEditing
                ? "Update your campaign details without creating a duplicate."
                : "Upload a promotional image to display in your storefront popup."}
            </p>
          </div>

          {isEditing && (
            <span className="shrink-0 rounded-full bg-[#E7F0E8] px-3 py-1 text-xs font-semibold text-[#173F2A]">
              Editing
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          {/* Title */}
          <div>
            <label
              htmlFor="advertisement-title"
              className="mb-1.5 block text-sm font-semibold text-[#242821]"
            >
              Advertisement title
            </label>

            <input
              id="advertisement-title"
              type="text"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              maxLength={150}
              required
              placeholder="Example: Festival Special Offers"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#242821] outline-none transition placeholder:text-gray-400 focus:border-[#285C3A] focus:ring-2 focus:ring-[#285C3A]/15"
            />
          </div>

          {/* Image preview */}
          {isEditing && !imageFile && editingCampaign.image_url && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#242821]">
                Current advertisement image
              </p>

              <div className="flex max-h-72 justify-center overflow-hidden rounded-xl border border-[#DDD8C8] bg-[#FAF7EF] p-2">
                <img
                  src={editingCampaign.image_url}
                  alt="Current advertisement"
                  className="max-h-64 max-w-full rounded-lg object-contain"
                />
              </div>

              <p className="text-xs text-gray-500">
                Keep this image or choose another image below.
              </p>
            </div>
          )}

          {imageFile && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#242821]">
                Replacement image preview
              </p>

              <div className="flex max-h-72 justify-center overflow-hidden rounded-xl border border-[#DDD8C8] bg-[#FAF7EF] p-2">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Selected advertisement preview"
                  className="max-h-64 max-w-full rounded-lg object-contain"
                  onLoad={(event) => {
                    // Release the temporary preview URL after loading.
                    URL.revokeObjectURL(event.currentTarget.src);
                  }}
                />
              </div>
            </div>
          )}

          {/* Image upload */}
          <div>
            <label
              htmlFor="advertisement-image"
              className="mb-1.5 block text-sm font-semibold text-[#242821]"
            >
              {isEditing ? "Replace advertisement image" : "Advertisement image"}
            </label>

            <input
              id="advertisement-image"
              type="file"
              accept="image/*"
              required={!isEditing}
              onChange={(event) => {
                setImageFile(event.target.files?.[0] || null);
                setError("");
                setMessage("");
              }}
              className="block w-full rounded-xl border border-gray-300 bg-white p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#E7F0E8] file:px-3 file:py-2 file:font-semibold file:text-[#173F2A] hover:file:bg-[#d6e7d9]"
            />

            <p className="mt-1.5 text-xs text-gray-500">
              Supported image files. Maximum size: 5 MB.
              {isEditing && " Leave empty to keep the current image."}
            </p>

            {imageFile && (
              <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-[#FAF7EF] p-3">
                <p className="min-w-0 truncate text-xs text-gray-700">
                  {imageFile.name}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    clearFileInput();
                  }}
                  className="shrink-0 text-sm font-medium text-red-700 hover:text-red-900"
                >
                  Remove selection
                </button>
              </div>
            )}
          </div>

          {/* Destination URL */}
          <div>
            <label
              htmlFor="advertisement-link"
              className="mb-1.5 block text-sm font-semibold text-[#242821]"
            >
              Destination URL
              <span className="ml-1 font-normal text-gray-500">
                (optional)
              </span>
            </label>

            <input
              id="advertisement-link"
              type="text"
              value={form.targetUrl}
              onChange={(event) =>
                updateForm("targetUrl", event.target.value)
              }
              placeholder="/shop or https://example.com"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#242821] outline-none transition placeholder:text-gray-400 focus:border-[#285C3A] focus:ring-2 focus:ring-[#285C3A]/15"
            />

            <p className="mt-1.5 text-xs text-gray-500">
              Customers can open this destination by clicking the advertisement.
            </p>
          </div>

          {/* Form actions */}
          <div className="flex flex-col gap-3 border-t border-[#DDD8C8] pt-5 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#173F2A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : isEditing ? (
                <CheckCircle2 size={18} />
              ) : (
                <ImagePlus size={18} />
              )}

              {saving
                ? "Saving..."
                : isEditing
                ? "Save changes"
                : "Publish advertisement"}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                <X size={18} />
                Cancel editing
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Existing campaigns */}
      <section className="overflow-hidden rounded-2xl border border-[#DDD8C8] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#DDD8C8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#242821]">
              Existing advertisements
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Edit campaign details or control which advertisement is active.
            </p>
          </div>

          <span className="w-fit rounded-full bg-[#E7F0E8] px-3 py-1 text-xs font-semibold text-[#173F2A]">
            {campaigns.length} campaigns
          </span>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
              <LoaderCircle size={18} className="animate-spin" />
              Loading advertisements...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
                <Megaphone size={26} />
              </div>

              <h3 className="font-semibold text-[#242821]">
                No advertisements yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Create your first campaign using the form above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {campaigns.map((campaign) => {
                const isBusy = busyId === campaign.id;
                const isCurrentlyEditing =
                  editingCampaign?.id === campaign.id;

                return (
                  <article
                    key={campaign.id}
                    className={`overflow-hidden rounded-2xl border bg-white transition ${
                      isCurrentlyEditing
                        ? "border-[#285C3A] ring-2 ring-[#285C3A]/10"
                        : "border-[#DDD8C8] hover:border-[#b9c8b8]"
                    }`}
                  >
                    {/* Campaign image */}
                    <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#FAF7EF] p-3">
                      <img
                        src={campaign.image_url}
                        alt={campaign.title || "Advertisement"}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />

                      <span
                        className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                          campaign.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            campaign.is_active
                              ? "bg-green-600"
                              : "bg-gray-400"
                          }`}
                        />
                        {campaign.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Campaign details */}
                    <div className="space-y-3 p-4">
                      <div>
                        <h3 className="break-words font-bold text-[#242821]">
                          {campaign.title}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Created {formatDate(campaign.created_at)}
                        </p>
                      </div>

                      {campaign.target_url && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <ExternalLink
                            size={15}
                            className="mt-0.5 shrink-0"
                          />

                          <a
                            href={campaign.target_url}
                            target={
                              campaign.target_url.startsWith("/")
                                ? "_self"
                                : "_blank"
                            }
                            rel={
                              campaign.target_url.startsWith("/")
                                ? undefined
                                : "noopener noreferrer"
                            }
                            className="break-all underline decoration-gray-300 underline-offset-2 hover:text-[#285C3A]"
                          >
                            {campaign.target_url}
                          </a>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                        <button
                          type="button"
                          onClick={() => startEditing(campaign)}
                          disabled={saving || isBusy}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E7F0E8] px-3 py-2 text-sm font-semibold text-[#173F2A] transition hover:bg-[#d6e7d9] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleCampaign(campaign)}
                          disabled={isBusy || saving}
                          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            campaign.is_active
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-[#285C3A] text-white hover:bg-[#173F2A]"
                          }`}
                        >
                          {isBusy ? (
                            <LoaderCircle
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Power size={15} />
                          )}

                          {isBusy
                            ? "Updating..."
                            : campaign.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
