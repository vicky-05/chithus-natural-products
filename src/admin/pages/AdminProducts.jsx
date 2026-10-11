import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Package,
  Pencil,
  Archive,
  X,
  ImagePlus,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Layers3,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAdminData } from "../context/AdminDataContext";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const emptyVariant = () => ({
  id: null,
  pack_size_value: "100",
  pack_size_unit: "g",
  price: "",
  stock_quantity: "0",
  barcode: "",
  is_active: true,
});

const emptyForm = () => ({
  name: "",
  short_description: "",
  description: "",
  categoryIds: [],
  status: "draft",
  is_featured: false,
  badge_type: "",
  images: [{ url: "", file: null, preview: "" }],
  variants: [emptyVariant()],
  details: {
    ingredients: "",
    allergen_information: "",
    storage_instructions: "",
    shelf_life: "",
    net_weight_description: "",
    country_of_origin: "India",
    manufacturer_name: "",
    customer_support_information: "",
    nutritional_information: "",
  },
});

const badgeOptions = [
  "Best Seller",
  "Our Pick",
  "Popular",
  "Trending",
];

const units = ["g", "kg", "ml", "l", "piece", "pack"];

function getProductStatus(product) {
  if (product.status === "Archived") return "Archived";
  if (product.status === "Draft") return "Draft";
  return product.stock <= 0 ? "Out of Stock" : "Active";
}

function ProductImage({ src, name }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#e7e9df] bg-gradient-to-br from-[#f6f7ef] to-[#e9eee4] shadow-sm">
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Package size={21} className="text-[#839079]" />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700",
    Draft: "bg-gray-100 text-gray-600",
    Archived: "bg-slate-100 text-slate-600",
    "Out of Stock": "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[status] || styles.Draft
      }`}
    >
      <span
        className={`mr-1.5 mt-1 h-1.5 w-1.5 rounded-full ${
          status === "Active"
            ? "bg-emerald-500"
            : status === "Out of Stock"
              ? "bg-red-500"
              : "bg-gray-400"
        }`}
      />
      {status}
    </span>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onSave,
  saving,
}) {
  const [form, setForm] = useState(() => {
    if (!product) return emptyForm();

    const variants =
      product.variants?.length > 0
        ? product.variants.map((variant) => ({
            id: variant.id || null,
            pack_size_value: String(variant.packSizeValue ?? ""),
            pack_size_unit: variant.packSizeUnit || "g",
            price: String(variant.price ?? ""),
            stock_quantity: String(variant.stock ?? 0),
            barcode: variant.barcode || "",
            is_active: variant.isActive !== false,
          }))
        : [emptyVariant()];

    return {
      ...emptyForm(),
      name: product.name || "",
      short_description: product.shortDescription || "",
      description: product.description || "",
      categoryIds: product.categoryIds || [],
      status:
        product.status === "Active"
          ? "active"
          : product.status === "Archived"
            ? "archived"
            : "draft",
      is_featured: Boolean(product.isFeatured),
      badge_type: product.badgeType || "",
      images:
        product.images?.length > 0
          ? product.images.map((image) => ({
              url: image.url || "",
              file: null,
              preview: image.url || "",
            }))
          : [
              {
                url: product.image || "",
                file: null,
                preview: product.image || "",
              },
            ],
      variants,
      details: {
        ...emptyForm().details,
        ...(product.details || {}),
        nutritional_information:
          typeof product.details?.nutritional_information === "string"
            ? product.details.nutritional_information
            : product.details?.nutritional_information
              ? JSON.stringify(
                  product.details.nutritional_information,
                  null,
                  2,
                )
              : "",
      },
    };
  });

  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function updateVariant(index, field, value) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index
          ? { ...variant, [field]: value }
          : variant,
      ),
    }));
    setError("");
  }

  function updateDetail(field, value) {
    setForm((current) => ({
      ...current,
      details: { ...current.details, [field]: value },
    }));
    setError("");
  }

  function updateImage(index, nextImage) {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...nextImage } : image,
      ),
    }));
    setError("");
  }

  function toggleCategory(categoryId) {
    setForm((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(categoryId)
        ? current.categoryIds.filter((id) => id !== categoryId)
        : [...current.categoryIds, categoryId],
    }));
  }

  function addVariant() {
    setForm((current) => ({
      ...current,
      variants: [...current.variants, emptyVariant()],
    }));
  }

  function removeVariant(index) {
    setForm((current) => {
      const variant = current.variants[index];

      if (variant?.id) {
        return {
          ...current,
          variants: current.variants.map((item, itemIndex) =>
            itemIndex === index
              ? { ...item, is_active: false }
              : item,
          ),
        };
      }

      return {
        ...current,
        variants: current.variants.filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      };
    });
  }

  function addImage() {
    if (form.images.length >= 4) return;

    setForm((current) => ({
      ...current,
      images: [...current.images, { url: "", file: null, preview: "" }],
    }));
  }

  function removeImage(index) {
    setForm((current) => ({
      ...current,
      images: current.images.filter(
        (_, imageIndex) => imageIndex !== index,
      ),
    }));
  }

  function selectImageFile(index, file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Each image must be 5 MB or smaller.");
      return;
    }

    const preview = URL.createObjectURL(file);
    updateImage(index, { file, preview, url: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Enter the product name.");
      return;
    }

    if (form.categoryIds.length === 0) {
      setError("Select at least one category.");
      return;
    }

    const validVariants = form.variants.filter(
      (variant) =>
        variant.pack_size_value !== "" &&
        variant.price !== "" &&
        variant.stock_quantity !== "",
    );

    if (validVariants.length === 0) {
      setError("Add at least one complete pack size.");
      return;
    }

    for (const variant of validVariants) {
      if (
        !Number.isFinite(Number(variant.pack_size_value)) ||
        Number(variant.pack_size_value) <= 0
      ) {
        setError("Pack size must be greater than zero.");
        return;
      }

      if (
        !Number.isFinite(Number(variant.price)) ||
        Number(variant.price) < 0
      ) {
        setError("Every variant must have a valid price.");
        return;
      }

      if (
        !Number.isInteger(Number(variant.stock_quantity)) ||
        Number(variant.stock_quantity) < 0
      ) {
        setError("Stock must be a whole number of zero or more.");
        return;
      }
    }

    const packKeys = validVariants.map(
      (variant) =>
        `${Number(variant.pack_size_value)}:${variant.pack_size_unit}`,
    );

    if (new Set(packKeys).size !== packKeys.length) {
      setError("Each pack size and unit combination must be unique.");
      return;
    }

    const imageItems = form.images.filter(
      (image) => Boolean(image.file) || Boolean(image.url?.trim()),
    );

    if (imageItems.length > 4) {
      setError("A product can have up to four images.");
      return;
    }

    let nutrition = null;

    if (form.details.nutritional_information.trim()) {
      try {
        nutrition = JSON.parse(
          form.details.nutritional_information,
        );
      } catch {
        setError(
          'Nutritional information must be valid JSON, for example {"energy":"350 kcal"}.',
        );
        return;
      }
    }

    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        short_description: form.short_description.trim(),
        description: form.description.trim(),
        badge_type: form.badge_type || null,
        categoryIds: form.categoryIds,
        images: imageItems,
        variants: validVariants.map((variant) => ({
          ...variant,
          pack_size_value: Number(variant.pack_size_value),
          price: Number(variant.price),
          stock_quantity: Number(variant.stock_quantity),
          barcode: variant.barcode.trim() || null,
        })),
        details: {
          ...form.details,
          ingredients: form.details.ingredients.trim() || null,
          allergen_information:
            form.details.allergen_information.trim() || null,
          storage_instructions:
            form.details.storage_instructions.trim() || null,
          shelf_life: form.details.shelf_life.trim() || null,
          net_weight_description:
            form.details.net_weight_description.trim() || null,
          country_of_origin:
            form.details.country_of_origin.trim() || null,
          manufacturer_name:
            form.details.manufacturer_name.trim() || null,
          customer_support_information:
            form.details.customer_support_information.trim() || null,
          nutritional_information: nutrition,
        },
      });
    } catch (saveError) {
      setError(
        saveError?.message ||
          "Unable to save this product. Check your database permissions.",
      );
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#e1e2d6] bg-white px-4 py-3 text-sm outline-none focus:border-[#285b3b] focus:ring-2 focus:ring-[#285b3b]/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[#465345]";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#122318]/65 p-3 backdrop-blur-sm sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className="my-auto max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-white/70 bg-[#fffdf7] shadow-[0_30px_100px_-25px_rgba(0,0,0,0.55)]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e9e7dc] bg-[#fffdf7]/95 px-5 py-5 backdrop-blur sm:px-7">
          <div>
            <h2
              id="product-form-title"
              className="text-xl font-extrabold text-[#244b32]"
            >
              {product ? "Edit product" : "Add new product"}
            </h2>
            <p className="mt-1 text-sm text-[#858a7e]">
              Product information, pack sizes, pricing and inventory.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close form"
            className="rounded-xl p-2 text-[#697366] hover:bg-[#edf1e8]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7">
          <section className="space-y-4">
            <h3 className="font-bold text-[#244b32]">
              Basic information
            </h3>

            <label className="block">
              <span className={labelClass}>Product name *</span>
              <input
                value={form.name}
                onChange={(event) =>
                  update("name", event.target.value)
                }
                placeholder="e.g. Ragi Dosa Mix"
                className={inputClass}
                required
                maxLength={200}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Short description</span>
              <textarea
                rows={2}
                value={form.short_description}
                onChange={(event) =>
                  update("short_description", event.target.value)
                }
                placeholder="A short description for product cards"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Full description</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  update("description", event.target.value)
                }
                placeholder="Describe the product..."
                className={inputClass}
              />
            </label>

            <div>
              <span className={labelClass}>Categories *</span>

              {categories.length === 0 ? (
                <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                  Create a category first in Admin → Categories.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e1e2d6] bg-white px-3 py-3 text-sm text-[#465345]"
                    >
                      <input
                        type="checkbox"
                        checked={form.categoryIds.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="h-4 w-4 accent-[#285b3b]"
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Product status</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    update("status", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </label>

              <label className="block">
                <span className={labelClass}>Optional product badge</span>
                <select
                  value={form.badge_type}
                  onChange={(event) =>
                    update("badge_type", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">No badge</option>
                  {badgeOptions.map((badge) => (
                    <option key={badge} value={badge}>
                      {badge}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-[#e1e2d6] bg-white p-4 text-sm font-medium text-[#465345]">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(event) =>
                  update("is_featured", event.target.checked)
                }
                className="h-4 w-4 accent-[#285b3b]"
              />
              Feature this product on the storefront
            </label>
          </section>

          <div className="border-t border-[#e9e7dc]" />

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[#244b32]">
                  Pack sizes and inventory
                </h3>
                <p className="mt-1 text-xs text-[#858a7e]">
                  Each pack size gets its own price, stock and generated SKU.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-[#dfe2d7] px-3 py-2 text-sm font-semibold text-[#285b3b] hover:bg-[#edf1e8]"
              >
                <Plus size={15} />
                Add pack
              </button>
            </div>

            {form.variants.map((variant, index) => (
              <div
                key={variant.id || `new-${index}`}
                className="space-y-4 rounded-2xl border border-[#e4e8dc] bg-gradient-to-br from-white to-[#fbfcf8] p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-[#244b32]">
                    Pack option {index + 1}
                  </h4>

                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    aria-label={`Remove pack option ${index + 1}`}
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label>
                    <span className={labelClass}>Pack size *</span>
                    <input
                      type="number"
                      min="0.001"
                      step="any"
                      value={variant.pack_size_value}
                      onChange={(event) =>
                        updateVariant(
                          index,
                          "pack_size_value",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                      required
                    />
                  </label>

                  <label>
                    <span className={labelClass}>Unit *</span>
                    <select
                      value={variant.pack_size_unit}
                      onChange={(event) =>
                        updateVariant(
                          index,
                          "pack_size_unit",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className={labelClass}>Price (₹) *</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(event) =>
                        updateVariant(index, "price", event.target.value)
                      }
                      className={inputClass}
                      required
                    />
                  </label>

                  <label>
                    <span className={labelClass}>Stock *</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={variant.stock_quantity}
                      onChange={(event) =>
                        updateVariant(
                          index,
                          "stock_quantity",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                      required
                    />
                  </label>
                </div>

                <label className="block">
                  <span className={labelClass}>Barcode (optional)</span>
                  <input
                    value={variant.barcode}
                    onChange={(event) =>
                      updateVariant(index, "barcode", event.target.value)
                    }
                    placeholder="Enter barcode if available"
                    className={inputClass}
                  />
                </label>

                {variant.id && (
                  <p className="text-xs text-[#858a7e]">
                    SKU:{" "}
                    {product?.variants?.find(
                      (item) => item.id === variant.id,
                    )?.sku || "Generated by database"}
                  </p>
                )}

                {!variant.is_active && (
                  <p className="text-xs font-medium text-amber-700">
                    This existing variant is marked inactive.
                  </p>
                )}
              </div>
            ))}
          </section>

          <div className="border-t border-[#e9e7dc]" />

          <section className="space-y-4">
            <div>
              <h3 className="font-bold text-[#244b32]">Product images</h3>
              <p className="mt-1 text-xs text-[#858a7e]">
                Upload up to four images (maximum 5 MB each). The first image
                is the primary image. Files are uploaded to Supabase Storage
                when you save the product.
              </p>
            </div>

            {form.images.map((image, index) => (
              <div
                key={index}
                className="space-y-3 rounded-2xl border border-[#e4e8dc] bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e1e2d6] bg-[#f4f3eb]">
                    {image.preview ? (
                      <img
                        src={image.preview}
                        alt={`${form.name || "Product"} image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus size={22} className="text-[#839079]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-sm font-semibold text-[#465345]">
                      Image {index + 1}
                      {index === 0 ? " · Primary" : ""}
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        selectImageFile(index, event.target.files?.[0])
                      }
                      className="block w-full text-sm text-[#586354] file:mr-3 file:rounded-lg file:border-0 file:bg-[#edf1e8] file:px-3 file:py-2 file:font-semibold file:text-[#285b3b]"
                    />

                    <input
                      type="url"
                      value={image.file ? "" : image.url}
                      onChange={(event) =>
                        updateImage(index, {
                          url: event.target.value,
                          file: null,
                          preview: event.target.value,
                        })
                      }
                      placeholder="Or paste an existing image URL"
                      className={inputClass}
                    />

                    {image.file && (
                      <p className="break-all text-xs text-[#586354]">
                        Selected: {image.file.name}
                      </p>
                    )}
                  </div>

                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label={`Remove image ${index + 1}`}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >
                      <X size={17} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {form.images.length < 4 && (
              <button
                type="button"
                onClick={addImage}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#285b3b]"
              >
                <Plus size={16} /> Add another image
              </button>
            )}
          </section>

          <div className="border-t border-[#e9e7dc]" />

          <section className="space-y-4">
            <h3 className="font-bold text-[#244b32]">Product details</h3>

            <label className="block">
              <span className={labelClass}>Ingredients</span>
              <textarea
                rows={2}
                value={form.details.ingredients}
                onChange={(event) =>
                  updateDetail("ingredients", event.target.value)
                }
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Allergen information</span>
              <textarea
                rows={2}
                value={form.details.allergen_information}
                onChange={(event) =>
                  updateDetail("allergen_information", event.target.value)
                }
                className={inputClass}
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Shelf life</span>
                <input
                  value={form.details.shelf_life}
                  onChange={(event) =>
                    updateDetail("shelf_life", event.target.value)
                  }
                  placeholder="e.g. 6 months"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className={labelClass}>Net weight description</span>
                <input
                  value={form.details.net_weight_description}
                  onChange={(event) =>
                    updateDetail(
                      "net_weight_description",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Available in 100 g and 250 g"
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block">
              <span className={labelClass}>Storage instructions</span>
              <textarea
                rows={2}
                value={form.details.storage_instructions}
                onChange={(event) =>
                  updateDetail("storage_instructions", event.target.value)
                }
                className={inputClass}
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Country of origin</span>
                <input
                  value={form.details.country_of_origin}
                  onChange={(event) =>
                    updateDetail("country_of_origin", event.target.value)
                  }
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className={labelClass}>Manufacturer name</span>
                <input
                  value={form.details.manufacturer_name}
                  onChange={(event) =>
                    updateDetail("manufacturer_name", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block">
              <span className={labelClass}>Customer support information</span>
              <input
                value={form.details.customer_support_information}
                onChange={(event) =>
                  updateDetail(
                    "customer_support_information",
                    event.target.value,
                  )
                }
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>
                Nutritional information (JSON)
              </span>
              <textarea
                rows={4}
                value={form.details.nutritional_information}
                onChange={(event) =>
                  updateDetail(
                    "nutritional_information",
                    event.target.value,
                  )
                }
                placeholder={'{"energy":"350 kcal","protein":"10 g"}'}
                className={`${inputClass} font-mono`}
              />
            </label>
          </section>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-[#e9e7dc] bg-[#fffdf7] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[#dfe2d7] px-5 py-3 text-sm font-semibold text-[#586354] hover:bg-[#f3f3ec] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || categories.length === 0}
              className="rounded-xl bg-[#285b3b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1e462d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : product
                  ? "Save changes"
                  : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const {
    products,
    categories,
    loading,
    refreshing,
    error: catalogueError,
    reloadCatalogue,
  } = useAdminData();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");
  const [stockFilter, setStockFilter] = useState("All Stock");
  const [modalProduct, setModalProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [archivingProduct, setArchivingProduct] = useState(null);
  const [archiving, setArchiving] = useState(false);

  const categoryOptions = [
    "All Categories",
    ...categories.map((item) => item.name),
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.sku || "").toLowerCase().includes(query) ||
        (product.variants || []).some((variant) =>
          (variant.sku || "").toLowerCase().includes(query),
        );

      const productCategoryNames = (product.categories || []).map(
        (item) => item.name,
      );

      const matchesCategory =
        category === "All Categories" ||
        productCategoryNames.includes(category) ||
        product.category === category;

      const productStatus = getProductStatus(product);

      const matchesStatus =
        status === "All Statuses" || productStatus === status;

      const matchesStock =
        stockFilter === "All Stock" ||
        (stockFilter === "Low Stock" &&
          product.stock > 0 &&
          product.stock <= 5) ||
        (stockFilter === "Out of Stock" && product.stock === 0) ||
        (stockFilter === "In Stock" && product.stock > 5);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesStock
      );
    });
  }, [products, search, category, status, stockFilter]);

  const totalStock = products.reduce(
    (sum, product) => sum + (Number(product.stock) || 0),
    0,
  );

  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock <= 5,
  ).length;

  const outOfStockCount = products.filter(
    (product) => product.stock === 0,
  ).length;

  async function saveProduct(form) {
    setSaving(true);
    setActionError("");
    setNotice("");

    try {
      const productPayload = {
        name: form.name,
        short_description: form.short_description || null,
        description: form.description || null,
        status: form.status,
        is_featured: form.is_featured,
        badge_type: form.badge_type,
      };

      let productId = modalProduct?.id || null;

      if (productId) {
        const { error } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", productId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(productPayload)
          .select("id")
          .single();

        if (error) throw error;
        productId = data.id;
      }

      // Save category relationships.
      const { error: clearCategoriesError } = await supabase
        .from("product_categories")
        .delete()
        .eq("product_id", productId);

      if (clearCategoriesError) throw clearCategoriesError;

      if (form.categoryIds.length > 0) {
        const { error: categoryLinkError } = await supabase
          .from("product_categories")
          .insert(
            form.categoryIds.map((categoryId) => ({
              product_id: productId,
              category_id: categoryId,
            })),
          );

        if (categoryLinkError) throw categoryLinkError;
      }

      // Save variant records. Existing variant IDs are retained.
      const existingVariants = modalProduct?.variants || [];

      const submittedVariantIds = new Set(
        form.variants.map((variant) => variant.id).filter(Boolean),
      );

      for (const existingVariant of existingVariants) {
        if (!submittedVariantIds.has(existingVariant.id)) {
          const { error } = await supabase
            .from("product_variants")
            .update({ is_active: false })
            .eq("id", existingVariant.id);

          if (error) throw error;
        }
      }

      for (const variant of form.variants) {
        const variantPayload = {
          product_id: productId,
          pack_size_value: variant.pack_size_value,
          pack_size_unit: variant.pack_size_unit,
          price: variant.price,
          stock_quantity: variant.stock_quantity,
          barcode: variant.barcode,
          is_active: variant.is_active !== false,
        };

        let result;

        if (variant.id) {
          result = await supabase
            .from("product_variants")
            .update(variantPayload)
            .eq("id", variant.id);
        } else {
          // SKU is generated by the existing database trigger.
          result = await supabase
            .from("product_variants")
            .insert(variantPayload);
        }

        if (result.error) throw result.error;
      }

      // Upload newly selected images to Supabase Storage.
      const uploadedImageUrls = [];

      for (let index = 0; index < form.images.length; index += 1) {
        const image = form.images[index];

        if (image.file) {
          const safeName = image.file.name
            .toLowerCase()
            .replace(/[^a-z0-9._-]+/g, "-")
            .replace(/-+/g, "-");

          const objectPath = `${productId}/${Date.now()}-${index + 1}-${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from("products-image")
            .upload(objectPath, image.file, {
              cacheControl: "3600",
              upsert: false,
              contentType: image.file.type,
            });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("products-image")
            .getPublicUrl(objectPath);

          if (!publicUrlData?.publicUrl) {
            throw new Error(
              "Image uploaded, but its public URL could not be generated.",
            );
          }

          uploadedImageUrls.push(publicUrlData.publicUrl);
        } else if (image.url?.trim()) {
          uploadedImageUrls.push(image.url.trim());
        }
      }

      // Replace database image rows in display order.
      const { error: removeImagesError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId);

      if (removeImagesError) throw removeImagesError;

      if (uploadedImageUrls.length > 0) {
        const { error: imageError } = await supabase
          .from("product_images")
          .insert(
            uploadedImageUrls.map((url, index) => ({
              product_id: productId,
              image_url: url,
              alt_text: form.name,
              sort_order: index + 1,
              is_primary: index === 0,
            })),
          );

        if (imageError) throw imageError;
      }

      // Save the detailed product information.
      const detailsPayload = {
        product_id: productId,
        ingredients: form.details.ingredients,
        allergen_information: form.details.allergen_information,
        storage_instructions: form.details.storage_instructions,
        shelf_life: form.details.shelf_life,
        net_weight_description: form.details.net_weight_description,
        country_of_origin: form.details.country_of_origin,
        manufacturer_name: form.details.manufacturer_name,
        customer_support_information:
          form.details.customer_support_information,
        nutritional_information:
          form.details.nutritional_information,
      };

      const { error: detailsError } = await supabase
        .from("product_details")
        .upsert(detailsPayload, { onConflict: "product_id" });

      if (detailsError) throw detailsError;

      await reloadCatalogue({ quiet: true });

      setModalOpen(false);
      setModalProduct(null);

      setNotice(
        modalProduct
          ? "Product updated successfully."
          : "Product created successfully.",
      );
    } catch (saveError) {
      setActionError(
        saveError?.message ||
          "Unable to save the product. Check your database permissions.",
      );
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  async function archiveProduct() {
    if (!archivingProduct || archiving) return;

    setArchiving(true);
    setActionError("");
    setNotice("");

    try {
      const { error } = await supabase
        .from("products")
        .update({ status: "archived" })
        .eq("id", archivingProduct.id);

      if (error) throw error;

      await reloadCatalogue({ quiet: true });

      setNotice(`${archivingProduct.name} has been archived.`);
      setArchivingProduct(null);
    } catch (archiveError) {
      setActionError(
        archiveError?.message || "Unable to archive this product.",
      );
    } finally {
      setArchiving(false);
    }
  }

  async function refreshProducts() {
    setActionError("");
    setNotice("");

    try {
      await reloadCatalogue({ quiet: true });
      setNotice("Products refreshed from Supabase.");
    } catch (refreshError) {
      setActionError(
        refreshError?.message || "Unable to refresh products.",
      );
    }
  }

  function closeForm() {
    if (saving) return;
    setModalOpen(false);
    setModalProduct(null);
  }

  return (
    <div className="space-y-7 pb-8">
      <section className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#214b31] via-[#285b3b] to-[#376849] p-6 text-white shadow-[0_18px_45px_-24px_rgba(31,73,46,0.65)] sm:p-8 lg:p-9">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[42px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-28 right-28 h-56 w-56 rounded-full bg-[#e5c878]/[0.10] blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f0d995]">
              <Package size={14} />
              Store management
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Product catalogue
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              Manage your natural products, pack sizes, pricing, product
              images and inventory in one place.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/70">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-[#bde1a7]" />
                {products.length} products in catalogue
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-2">
                <Layers3 size={14} />
                {categories.length} categories available
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={refreshProducts}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              <RotateCcw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => {
                setModalProduct(null);
                setActionError("");
                setModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f0d995] px-5 py-3 text-sm font-extrabold text-[#244b32] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#f7e6b5]"
            >
              <Plus size={18} />
              Add new product
            </button>
          </div>
        </div>
      </section>

      {(notice || actionError || catalogueError) && (
        <div
          role={actionError || catalogueError ? "alert" : "status"}
          className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
            actionError || catalogueError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#d9e8d4] bg-[#edf5e9] text-[#285b3b]"
          }`}
        >
          <span className="flex items-start gap-2">
            {actionError || catalogueError ? (
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}
            {actionError || catalogueError || notice}
          </span>

          <button
            type="button"
            onClick={() => {
              setNotice("");
              setActionError("");
            }}
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total products", value: products.length, icon: Package },
          {
            label: "Active products",
            value: products.filter(
              (product) => getProductStatus(product) === "Active",
            ).length,
            icon: CheckCircle2,
          },
          { label: "Low stock", value: lowStockCount, icon: AlertTriangle },
          { label: "Units in stock", value: totalStock, icon: Layers3 },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="group rounded-2xl border border-[#e7e8df] bg-white p-5 shadow-[0_4px_18px_-14px_rgba(35,60,38,0.35)] transition duration-200 hover:-translate-y-1 hover:border-[#cbd9c8] hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#858a7e]">
                  {item.label}
                </span>

                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#edf3e9] to-[#dfeadd] text-[#285b3b] ring-1 ring-[#dbe7d7] transition group-hover:scale-105">
                  <Icon size={19} />
                </span>
              </div>

              <p className="mt-3 text-2xl font-extrabold text-[#244b32]">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {outOfStockCount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-white p-4 shadow-sm">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="text-sm font-bold text-red-800">
              {outOfStockCount} product(s) are out of stock
            </p>
            <p className="mt-1 text-xs leading-5 text-red-700">
              Review inventory before accepting orders.
            </p>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-[#e5e7dc] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <SlidersHorizontal size={18} className="text-[#285b3b]" />

          <h2 className="font-bold text-[#244b32]">
            Product catalogue
          </h2>

          <span className="ml-auto rounded-full bg-[#edf1e8] px-3 py-1 text-xs font-semibold text-[#285b3b]">
            {filteredProducts.length} results
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(150px,1fr))]">
          <div className="flex items-center gap-2 rounded-xl border border-[#dfe4d9] bg-[#fbfcf8] px-3 transition focus-within:border-[#8aaa87] focus-within:ring-4 focus-within:ring-[#285b3b]/[0.08]">
            <Search size={18} className="shrink-0 text-[#92978c]" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or SKU..."
              aria-label="Search products"
              className="min-w-0 flex-1 py-3 text-sm outline-none"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} className="text-[#858a7e]" />
              </button>
            )}
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
            className="rounded-xl border border-[#dfe4d9] bg-[#fbfcf8] px-3 py-3 text-sm text-[#465345] outline-none transition focus:border-[#8aaa87] focus:ring-4 focus:ring-[#285b3b]/[0.08]"
          >
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
            className="rounded-xl border border-[#dfe4d9] bg-[#fbfcf8] px-3 py-3 text-sm text-[#465345] outline-none transition focus:border-[#8aaa87] focus:ring-4 focus:ring-[#285b3b]/[0.08]"
          >
            {[
              "All Statuses",
              "Active",
              "Draft",
              "Out of Stock",
              "Archived",
            ].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            aria-label="Filter by stock"
            className="rounded-xl border border-[#dfe4d9] bg-[#fbfcf8] px-3 py-3 text-sm text-[#465345] outline-none transition focus:border-[#8aaa87] focus:ring-4 focus:ring-[#285b3b]/[0.08]"
          >
            {["All Stock", "In Stock", "Low Stock", "Out of Stock"].map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ),
            )}
          </select>
        </div>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-[#e5e7dc] bg-white px-5 py-16 text-center shadow-sm">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#dce5d6] border-t-[#285b3b]" />
          <p className="text-sm text-[#858a7e]">
            Loading products from Supabase...
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-[#e5e7dc] bg-white px-5 py-16 text-center shadow-sm">
          <Package
            size={36}
            className="mx-auto mb-3 text-[#9ca594]"
          />

          <h2 className="font-bold text-[#344637]">
            {products.length === 0
              ? "No products in your database yet"
              : "No products found"}
          </h2>

          <p className="mt-1 text-sm text-[#858a7e]">
            {products.length === 0
              ? "Add your first product to begin building your catalogue."
              : "Try another search or change your filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#e5e7dc] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-[#e7e9df] bg-[#f7f8f2] text-[10px] uppercase tracking-[0.13em] text-[#747e70]">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Categories</th>
                  <th className="px-5 py-4">Pack options</th>
                  <th className="px-5 py-4">Price range</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#eff0e9]">
                {filteredProducts.map((product) => {
                  const activeVariants = (product.variants || []).filter(
                    (variant) => variant.isActive !== false,
                  );

                  const prices = activeVariants.map(
                    (variant) => variant.price,
                  );

                  const priceLabel =
                    prices.length === 0
                      ? "—"
                      : prices.length === 1
                        ? formatPrice(prices[0])
                        : `${formatPrice(Math.min(...prices))} – ${formatPrice(Math.max(...prices))}`;

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-[#f8faf5]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ProductImage
                            src={product.image}
                            name={product.name}
                          />

                          <div className="min-w-0">
                            <p className="font-bold text-[#244b32]">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-[#858a7e]">
                              {product.sku || "SKU generated per pack"}
                            </p>

                            {product.badgeType && (
                              <span className="mt-1 inline-block rounded-full bg-[#f7f0df] px-2 py-1 text-[10px] font-semibold text-[#886820]">
                                {product.badgeType}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-[#586354]">
                        {(product.categories || [])
                          .map((item) => item.name)
                          .join(", ") ||
                          product.category ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-[#586354]">
                        {activeVariants.length}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#244b32]">
                        {priceLabel}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            product.stock <= 5
                              ? "font-semibold text-red-600"
                              : "font-medium text-[#586354]"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={getProductStatus(product)} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setModalProduct(product);
                              setActionError("");
                              setModalOpen(true);
                            }}
                            aria-label={`Edit ${product.name}`}
                            className="rounded-xl border border-[#dfe5da] bg-white p-2.5 text-[#285b3b] transition hover:border-[#b8cdb3] hover:bg-[#edf4e9]"
                          >
                            <Pencil size={16} />
                          </button>

                          {product.status !== "Archived" && (
                            <button
                              type="button"
                              onClick={() => setArchivingProduct(product)}
                              aria-label={`Archive ${product.name}`}
                              className="rounded-xl border border-red-100 bg-white p-2.5 text-red-600 transition hover:border-red-200 hover:bg-red-50"
                            >
                              <Archive size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-[#e5e7dc] bg-[#f7f8f2] p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#858a7e]">
          Showing {filteredProducts.length} of {products.length} database
          products.
        </p>

        <button
          type="button"
          onClick={refreshProducts}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#285b3b] hover:text-[#a17a2d] disabled:opacity-50"
        >
          <RotateCcw
            size={14}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh from database"}
        </button>
      </div>

      {modalOpen && (
        <ProductForm
          key={modalProduct?.id || "new-product"}
          product={modalProduct}
          categories={categories.filter(
            (item) => item.status === "Active",
          )}
          saving={saving}
          onClose={closeForm}
          onSave={saveProduct}
        />
      )}

      {archivingProduct && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-product-title"
            className="w-full max-w-md rounded-3xl bg-[#fffdf7] p-6 shadow-2xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <Archive size={22} />
            </div>

            <h2
              id="archive-product-title"
              className="text-lg font-extrabold text-[#244b32]"
            >
              Archive product?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#858a7e]">
              Archive <strong>{archivingProduct.name}</strong>? It will no
              longer be treated as an active storefront product. Its database
              record will be retained.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setArchivingProduct(null)}
                disabled={archiving}
                className="rounded-xl border border-[#e1e2d6] px-4 py-3 text-sm font-semibold text-[#586354] hover:bg-[#f3f3ec]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={archiveProduct}
                disabled={archiving}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {archiving ? "Archiving..." : "Archive product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}