
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Layers3,
  Pencil,
  Trash2,
  X,
  Package,
  CheckCircle2,
  RotateCcw,
  ImagePlus,
  AlertTriangle,
  Leaf,
  ArrowUpRight,
  ExternalLink,
  Sprout,
  Filter,
  Eye,
  Link2,
  ChevronRight,
  Check,
  LoaderCircle,
} from "lucide-react";
import { useAdminData } from "../context/AdminDataContext";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  status: "Active",
  image: "",
};

function makeSlug(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function CategoryImage({ src, name, className = "" }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-[#edf2e8] ${className}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name || "Category"}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#f0f4e9] via-[#e7eee0] to-[#dce7d6]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white/70 text-[#507653] shadow-sm">
            <Sprout size={27} strokeWidth={1.4} />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#789074]">
            Natural collection
          </span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        active
          ? "border-[#d8e8d3] bg-[#edf5e9] text-[#356c43]"
          : "border-[#e5e5de] bg-[#f4f4ef] text-[#777d70]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-[#438654]" : "bg-[#a2a69a]"
        }`}
      />
      {status || "Draft"}
    </span>
  );
}

function CategoryForm({
  category,
  categories,
  onClose,
  onSave,
  saving,
}) {
  const [form, setForm] = useState(() =>
    category ? { ...category } : { ...emptyForm }
  );
  const [slugEdited, setSlugEdited] = useState(Boolean(category));
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "name" && !slugEdited) {
        next.slug = makeSlug(value);
      }

      return next;
    });

    setError("");
  }

  async function submit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const slug = makeSlug(form.slug);

    if (!name) {
      setError("Enter a category name.");
      return;
    }

    if (!slug) {
      setError("Enter a valid category URL slug.");
      return;
    }

    const duplicate = categories.some(
      (item) =>
        item.id !== category?.id &&
        (item.name.trim().toLowerCase() === name.toLowerCase() ||
          item.slug.toLowerCase() === slug.toLowerCase())
    );

    if (duplicate) {
      setError("A category with this name or URL slug already exists.");
      return;
    }

    try {
      setError("");

      await onSave({
        ...(category?.id ? { id: category.id } : {}),
        name,
        slug,
        description: form.description.trim(),
        image: form.image?.trim() || "",
        status: form.status,
        sortOrder: category?.sortOrder ?? 0,
        parentId: category?.parentId || null,
      });
    } catch (saveError) {
      setError(
        saveError?.message ||
          "Unable to save the category. Check your connection and permissions."
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#14271b]/55 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
        className="my-auto max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-[26px] border border-white/70 bg-[#fffef9] shadow-2xl shadow-[#132619]/20"
      >
        <div className="relative overflow-hidden border-b border-[#e9eadf] px-5 py-5 sm:px-7 sm:py-6">
          <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#e9f0df] blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#285b3b] text-white shadow-lg shadow-[#285b3b]/15">
                {category ? <Pencil size={20} /> : <Plus size={22} />}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b8957]">
                  Catalogue management
                </p>
                <h2
                  id="category-form-title"
                  className="mt-1 text-xl font-extrabold tracking-tight text-[#244b32] sm:text-2xl"
                >
                  {category ? "Edit category" : "Create a category"}
                </h2>
                <p className="mt-1 max-w-md text-xs leading-5 text-[#858a7e] sm:text-sm">
                  {category
                    ? "Update the collection details displayed in your catalogue."
                    : "Create a clear shopping collection for your natural products."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close form"
              disabled={saving}
              className="rounded-xl border border-[#e6e8dc] bg-white p-2.5 text-[#697366] transition hover:bg-[#edf2e8] disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5 sm:p-7">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-[#465345]">
                Category name <span className="text-red-500">*</span>
              </span>
              <input
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="e.g. Dosa Mixes"
                className="w-full rounded-xl border border-[#e1e4d9] bg-white px-4 py-3 text-sm text-[#304834] outline-none transition placeholder:text-[#adb1a5] focus:border-[#648968] focus:ring-4 focus:ring-[#285b3b]/[0.07]"
                required
                maxLength={120}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold text-[#465345]">
                Status
              </span>
              <select
                value={form.status}
                onChange={(event) => update("status", event.target.value)}
                className="w-full rounded-xl border border-[#e1e4d9] bg-white px-4 py-3 text-sm text-[#304834] outline-none transition focus:border-[#648968] focus:ring-4 focus:ring-[#285b3b]/[0.07]"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#465345]">
              URL slug <span className="text-red-500">*</span>
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-[#e1e4d9] bg-white px-3 transition focus-within:border-[#648968] focus-within:ring-4 focus-within:ring-[#285b3b]/[0.07]">
              <Link2 size={16} className="shrink-0 text-[#84917d]" />
              <input
                value={form.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  update("slug", event.target.value);
                }}
                placeholder="dosa-mixes"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#304834] outline-none placeholder:text-[#adb1a5]"
                required
                maxLength={160}
              />
            </div>
            <p className="mt-2 break-all text-[11px] text-[#92978c]">
              Store URL:{" "}
              <span className="font-semibold text-[#557455]">
                /shop/{makeSlug(form.slug || form.name)}
              </span>
            </p>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#465345]">
              Description
            </span>
            <textarea
              rows={3}
              value={form.description || ""}
              onChange={(event) =>
                update("description", event.target.value)
              }
              placeholder="Describe the products in this collection..."
              maxLength={600}
              className="w-full resize-y rounded-xl border border-[#e1e4d9] bg-white px-4 py-3 text-sm leading-6 text-[#304834] outline-none transition placeholder:text-[#adb1a5] focus:border-[#648968] focus:ring-4 focus:ring-[#285b3b]/[0.07]"
            />
            <p className="mt-1 text-right text-[10px] text-[#a0a498]">
              {(form.description || "").length}/600
            </p>
          </label>

          <div>
            <label className="mb-2 block text-xs font-bold text-[#465345]">
              Category image URL
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-[#e1e4d9] bg-white px-3">
              <ImagePlus
                size={18}
                className="shrink-0 text-[#839079]"
              />
              <input
                value={form.image || ""}
                onChange={(event) => update("image", event.target.value)}
                placeholder="https://... or /assets/categories/dosa-mixes.png"
                className="min-w-0 flex-1 bg-transparent py-3 text-xs text-[#304834] outline-none placeholder:text-[#adb1a5] sm:text-sm"
              />
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-[#e6e9de] bg-[#f8f9f3]">
              <div className="flex items-center justify-between border-b border-[#e6e9de] px-3 py-2.5">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7c8675]">
                  <Eye size={13} />
                  Image preview
                </span>
                <span className="text-[10px] text-[#a0a498]">
                  Optional
                </span>
              </div>
              <CategoryImage
                src={form.image}
                name={form.name || "Category preview"}
                className="h-36 w-full sm:h-44"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-[#e9e7dc] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="hidden items-center gap-1.5 text-[10px] text-[#92978c] sm:flex">
              <Leaf size={13} />
              Chithu's Natural Products
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-[#dfe2d7] bg-white px-5 py-3 text-sm font-semibold text-[#586354] transition hover:bg-[#f3f4ed] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285b3b] px-6 py-3 text-sm font-bold text-white shadow-sm shadow-[#285b3b]/15 transition hover:bg-[#1e462d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                {saving
                  ? "Saving..."
                  : category
                    ? "Save changes"
                    : "Create category"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, detail, accent = "green" }) {
  const accents = {
    green: "bg-[#eaf2e5] text-[#356746]",
    gold: "bg-[#f6f0df] text-[#92743a]",
    sage: "bg-[#edf0e8] text-[#697b5e]",
  };

  return (
    <div className="group rounded-2xl border border-[#e8e9de] bg-[#fffefb] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#d5dfcd] hover:shadow-lg hover:shadow-[#263b2c]/[0.04] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#858a7e]">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#244b32] sm:text-[34px]">
            {value}
          </p>
          <p className="mt-1.5 text-[10px] leading-4 text-[#969b90]">
            {detail}
          </p>
        </div>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-105 ${accents[accent]}`}
        >
          <Icon size={20} strokeWidth={1.7} />
        </span>
      </div>
    </div>
  );
}

function CategoryCard({ category, onEdit, onDelete }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(category.image) && !imageFailed;

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#e7e8dd] bg-[#fffefb] transition duration-300 hover:-translate-y-1 hover:border-[#d5dfcd] hover:shadow-xl hover:shadow-[#253b2b]/[0.06]">
      <div className="relative h-44 overflow-hidden bg-[#edf2e8] sm:h-48">
        {hasImage ? (
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f0f4e9] via-[#e7eee0] to-[#dce7d6]">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/80 bg-white/65 text-[#668064] shadow-sm">
              <Layers3 size={31} strokeWidth={1.3} />
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-bold text-[#3e6141] shadow-sm backdrop-blur-md">
            <Leaf size={12} />
            Collection
          </span>
          <StatusBadge status={category.status} />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#15291b]/45 to-transparent" />

        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
          <span className="max-w-[75%] truncate rounded-lg border border-white/20 bg-[#173f2a]/75 px-2.5 py-1.5 text-[10px] font-medium text-white backdrop-blur-md">
            /shop/{category.slug}
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/50 bg-white/90 text-[#285b3b] shadow-sm">
            <ArrowUpRight size={17} />
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="min-h-[82px]">
          <h2 className="break-words text-lg font-extrabold tracking-tight text-[#244b32] transition group-hover:text-[#356746]">
            {category.name}
          </h2>
          <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#7d8378]">
            {category.description || "No description added yet."}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#eceee5] bg-[#f8f9f3] px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f0e3] text-[#3d7047]">
              <Package size={17} />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-[#52604f]">
                Assigned products
              </p>
              <p className="mt-0.5 text-[10px] text-[#969b90]">
                In this collection
              </p>
            </div>
          </div>

          <span className="text-2xl font-extrabold tracking-tight text-[#285b3b]">
            {category.productCount || 0}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#dfe5d9] bg-white px-3 py-2.5 text-xs font-bold text-[#356746] transition hover:border-[#b9cdb1] hover:bg-[#edf3e8]"
          >
            <Pencil size={14} />
            Edit category
          </button>

          <button
            type="button"
            onClick={() => onDelete(category)}
            aria-label={`Delete ${category.name}`}
            title="Delete category"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#f0dfdc] bg-white text-[#b44f43] transition hover:border-[#e8bdb6] hover:bg-[#fff1ee]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AdminCategories() {
  const {
    categories,
    loading,
    refreshing,
    error: catalogueError,
    reloadCatalogue,
    saveCategory,
    deleteCategory,
  } = useAdminData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return safeCategories.filter((category) => {
      const matchesSearch =
        !query ||
        (category.name || "").toLowerCase().includes(query) ||
        (category.slug || "").toLowerCase().includes(query) ||
        (category.description || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All Statuses" ||
        category.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [safeCategories, search, statusFilter]);

  const activeCount = safeCategories.filter(
    (category) => category.status === "Active"
  ).length;

  const draftCount = safeCategories.filter(
    (category) => category.status !== "Active"
  ).length;

  const totalProducts = safeCategories.reduce(
    (sum, category) => sum + (Number(category.productCount) || 0),
    0
  );

  async function handleSaveCategory(category) {
    setSaving(true);
    setActionError("");
    setNotice("");

    try {
      await saveCategory(category);
      setModalOpen(false);
      setEditingCategory(null);
      setNotice(
        category.id
          ? "Category updated successfully."
          : "Category added successfully."
      );
    } catch (saveError) {
      setActionError(saveError?.message || "Unable to save the category.");
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingCategory || deleting) return;

    if ((deletingCategory.productCount || 0) > 0) {
      setActionError(
        "This category has associated products. Reassign those products before deleting the category."
      );
      setDeletingCategory(null);
      return;
    }

    setDeleting(true);
    setActionError("");
    setNotice("");

    try {
      await deleteCategory(deletingCategory.id);
      setNotice("Category deleted successfully.");
      setDeletingCategory(null);
    } catch (deleteError) {
      setActionError(
        deleteError?.message ||
          "Unable to delete the category. It may be referenced by other records."
      );
    } finally {
      setDeleting(false);
    }
  }

  async function refreshCategories() {
    setActionError("");
    setNotice("");

    try {
      await reloadCatalogue({ quiet: true });
      setNotice("Catalogue refreshed from Supabase.");
    } catch (refreshError) {
      setActionError(
        refreshError?.message || "Unable to refresh the catalogue."
      );
    }
  }

  function closeForm() {
    if (saving) return;
    setModalOpen(false);
    setEditingCategory(null);
  }

  function openCreateForm() {
    setEditingCategory(null);
    setActionError("");
    setNotice("");
    setModalOpen(true);
  }

  function openEditForm(category) {
    setEditingCategory(category);
    setActionError("");
    setNotice("");
    setModalOpen(true);
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page introduction */}
      <section className="relative overflow-hidden rounded-[26px] border border-[#e3e8da] bg-[#eaf0e3]">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-[#d3dfc8]/70" />
        <div className="pointer-events-none absolute -right-5 -top-9 h-44 w-44 rounded-full border border-[#d3dfc8]/70" />
        <div className="pointer-events-none absolute bottom-[-85px] right-[24%] h-48 w-48 rounded-full bg-[#f5eed9]/80 blur-3xl" />

        <div className="relative flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#285b3b] text-white shadow-lg shadow-[#285b3b]/15 sm:h-14 sm:w-14">
              <Layers3 size={25} strokeWidth={1.5} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8c8158]">
                Store catalogue
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#244b32] sm:text-3xl">
                Product categories
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-6 text-[#697864] sm:text-sm">
                Create thoughtfully organized collections that help customers
                discover your natural products with ease.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d6e1cd] bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-[#4c704e]">
                  <Leaf size={12} />
                  Natural collections
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d6e1cd] bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-[#697864]">
                  <CheckCircle2 size={12} />
                  Supabase connected
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#285b3b] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#285b3b]/15 transition hover:-translate-y-0.5 hover:bg-[#1e462d] hover:shadow-lg"
          >
            <Plus size={18} />
            Create category
          </button>
        </div>
      </section>

      {/* Notifications */}
      {(notice || actionError || catalogueError) && (
        <div
          role={actionError || catalogueError ? "alert" : "status"}
          className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3.5 text-sm ${
            actionError || catalogueError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#d9e8d4] bg-[#edf5e9] text-[#285b3b]"
          }`}
        >
          <span className="flex min-w-0 items-start gap-2.5">
            {actionError || catalogueError ? (
              <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
            )}
            <span className="break-words">
              {actionError || catalogueError || notice}
            </span>
          </span>

          <button
            type="button"
            onClick={() => {
              setNotice("");
              setActionError("");
            }}
            aria-label="Dismiss message"
            className="shrink-0 rounded-lg p-1 transition hover:bg-black/5"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total categories"
          value={safeCategories.length}
          icon={Layers3}
          detail="All catalogue collections"
          accent="green"
        />
        <StatCard
          label="Active categories"
          value={activeCount}
          icon={CheckCircle2}
          detail="Currently marked active"
          accent="sage"
        />
        <StatCard
          label="Draft categories"
          value={draftCount}
          icon={Eye}
          detail="Not marked active"
          accent="gold"
        />
        <StatCard
          label="Assigned products"
          value={totalProducts}
          icon={Package}
          detail="Sum of category product counts"
          accent="green"
        />
      </section>

      {/* Search and filtering */}
      <section className="rounded-2xl border border-[#e7e8dd] bg-[#fffefb] p-4 shadow-sm shadow-[#263b2c]/[0.02] sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#304834]">
              Your collections
            </h3>
            <p className="mt-1 text-[11px] text-[#92978c]">
              Search, filter and manage your product categories.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(200px,1fr)_190px] xl:w-[510px]">
            <div className="flex items-center gap-2.5 rounded-xl border border-[#e1e4d9] bg-[#fffefb] px-3.5 transition focus-within:border-[#9eb69a] focus-within:ring-4 focus-within:ring-[#285b3b]/[0.06]">
              <Search size={17} className="shrink-0 text-[#8e9687]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, slug, description..."
                aria-label="Search categories"
                className="h-11 min-w-0 flex-1 bg-transparent text-xs text-[#304834] outline-none placeholder:text-[#a5aa9e]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="rounded-md p-1 text-[#92978c] hover:bg-[#edf1e8]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#e1e4d9] bg-white px-3.5">
              <Filter size={16} className="shrink-0 text-[#8e9687]" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter categories by status"
                className="h-11 min-w-0 flex-1 bg-transparent text-xs text-[#52604f] outline-none"
              >
                <option>All Statuses</option>
                <option>Active</option>
                <option>Draft</option>
              </select>
            </div>
          </div>
        </div>

        {(search || statusFilter !== "All Statuses") && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf0e8] pt-3">
            <p className="text-[11px] text-[#858a7e]">
              Showing {filteredCategories.length} matching categories
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All Statuses");
              }}
              className="text-[11px] font-bold text-[#356746] transition hover:text-[#9a7b38]"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Category collection */}
      {loading ? (
        <div className="rounded-2xl border border-[#e7e8dd] bg-[#fffefb] px-5 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf3e8] text-[#356746]">
            <LoaderCircle size={27} className="animate-spin" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-[#344637]">
            Loading your collections
          </h3>
          <p className="mt-1.5 text-xs text-[#858a7e]">
            Fetching category information from Supabase...
          </p>
        </div>
      ) : filteredCategories.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[#858a7e]">
              <span className="font-bold text-[#344637]">
                {filteredCategories.length}
              </span>{" "}
              {filteredCategories.length === 1 ? "collection" : "collections"}
              {search || statusFilter !== "All Statuses"
                ? " found"
                : " in your catalogue"}
            </p>

            <span className="inline-flex items-center gap-1.5 text-[10px] text-[#8a9582]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#60946a]" />
              Live catalogue data
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={openEditForm}
                onDelete={(item) => {
                  setActionError("");
                  setNotice("");
                  setDeletingCategory(item);
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="overflow-hidden rounded-[26px] border border-[#e7e8dd] bg-[#fffefb]">
          <div className="relative px-5 py-14 text-center sm:py-20">
            <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#edf3e8] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#f5eedb] blur-3xl" />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[#e0e9d8] bg-[#edf3e8] text-[#356746]">
              {safeCategories.length === 0 ? (
                <Layers3 size={30} strokeWidth={1.4} />
              ) : (
                <Search size={28} strokeWidth={1.4} />
              )}
            </div>

            <h3 className="relative mt-5 text-lg font-extrabold text-[#244b32]">
              {safeCategories.length === 0
                ? "Your catalogue starts here"
                : "No matching collections"}
            </h3>

            <p className="relative mx-auto mt-2 max-w-sm text-xs leading-6 text-[#858a7e] sm:text-sm">
              {safeCategories.length === 0
                ? "Create your first category to organize your natural products and make shopping easier for your customers."
                : "Try a different search term or adjust the status filter to find your categories."}
            </p>

            {safeCategories.length === 0 ? (
              <button
                type="button"
                onClick={openCreateForm}
                className="relative mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#285b3b] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#1e462d]"
              >
                <Plus size={16} />
                Create first category
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All Statuses");
                }}
                className="relative mt-5 inline-flex items-center gap-2 rounded-xl border border-[#dfe5d9] bg-white px-4 py-2.5 text-xs font-bold text-[#356746] transition hover:bg-[#edf3e8]"
              >
                <RotateCcw size={14} />
                Reset filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Catalogue footer */}
      <footer className="flex flex-col gap-3 rounded-2xl border border-[#e7e8dd] bg-[#fffefb] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf3e8] text-[#356746]">
            <Leaf size={17} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#344637]">
              Catalogue overview
            </p>
            <p className="mt-1 text-[10px] text-[#858a7e]">
              Showing {filteredCategories.length} of {safeCategories.length}{" "}
              database categories
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refreshCategories}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e1e5d9] bg-white px-4 py-2.5 text-xs font-bold text-[#356746] transition hover:border-[#c5d6bc] hover:bg-[#f3f6ef] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw
            size={14}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing catalogue..." : "Refresh from database"}
        </button>
      </footer>

      {/* Create / edit modal */}
      {modalOpen && (
        <CategoryForm
          key={editingCategory?.id || "new-category"}
          category={editingCategory}
          categories={safeCategories}
          saving={saving}
          onClose={closeForm}
          onSave={handleSaveCategory}
        />
      )}

      {/* Delete confirmation */}
      {deletingCategory && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#14271b]/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeletingCategory(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            className="w-full max-w-md overflow-hidden rounded-[26px] border border-white/70 bg-[#fffef9] shadow-2xl shadow-[#132619]/20"
          >
            <div className="p-6 sm:p-7">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
                <Trash2 size={23} />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a34b40]">
                Catalogue management
              </p>

              <h2
                id="delete-category-title"
                className="mt-2 text-xl font-extrabold tracking-tight text-[#244b32]"
              >
                Delete this category?
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#858a7e]">
                You are about to remove{" "}
                <strong className="text-[#344637]">
                  {deletingCategory.name}
                </strong>{" "}
                from your catalogue. This action cannot be undone.
              </p>

              {(deletingCategory.productCount || 0) > 0 && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-5 text-amber-800">
                  <AlertTriangle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />
                  <span>
                    This category has{" "}
                    <strong>{deletingCategory.productCount}</strong>{" "}
                    associated products. Reassign those products before
                    deleting this category.
                  </span>
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeletingCategory(null)}
                  disabled={deleting}
                  className="rounded-xl border border-[#e1e4d9] bg-white px-4 py-3 text-sm font-semibold text-[#586354] transition hover:bg-[#f3f4ed] disabled:opacity-50"
                >
                  Keep category
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={
                    deleting ||
                    (deletingCategory.productCount || 0) > 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b5473d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#96372f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  {deleting ? "Deleting..." : "Delete category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
