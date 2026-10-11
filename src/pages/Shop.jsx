import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  ArrowDownAZ,
  ArrowRight,
  ChevronDown,
  Filter,
  Leaf,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const formatPackSize = (value, unit) => {
  if (value === null || value === undefined || !unit) return "";
  return `${value} ${unit}`;
};

const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") {
    return null;
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) return null;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(numericPrice);
};

function mapProduct(row) {
  const variants = (row.product_variants || [])
    .filter((variant) => variant.is_active !== false)
    .sort(
      (a, b) =>
        Number(a.price ?? Infinity) - Number(b.price ?? Infinity)
    );

  const variant = variants[0] || null;

  const images = [...(row.product_images || [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) {
      return a.is_primary ? -1 : 1;
    }

    return (a.sort_order ?? 99) - (b.sort_order ?? 99);
  });

  const categories = (row.product_categories || [])
    .map((link) => link.categories)
    .filter(Boolean);

  const category = categories[0] || null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: images[0]?.image_url || null,
    displayImage: images[0]?.image_url || null,
    price: variant?.price ?? null,
    weight: variant
      ? formatPackSize(
          variant.pack_size_value,
          variant.pack_size_unit
        )
      : "",
    inStock: variants.some(
      (item) => Number(item.stock_quantity) > 0
    ),
    stockQuantity: variant ? Number(variant.stock_quantity) : 0,
    variantId: variant?.id || null,
    selectedVariantId: variant?.id || null,
    sku: variant?.sku || null,
    category: category?.slug || "",
    categoryName: category?.name || "",
    categorySlug: category?.slug || "",
    categories: categories.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
    })),
    shortDescription: row.short_description || "",
    description: row.description || "",
    badge: row.badge_type || null,
    badgeType: row.badge_type === "Trending" ? "red" : "green",
    status: row.status,
    is_featured: row.is_featured,
    product_variants: row.product_variants || [],
    product_images: row.product_images || [],
  };
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const [search, setSearch] = useState(
    () => searchParams.get("search") || ""
  );

  const [sortBy, setSortBy] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const urlSearch = searchParams.get("search") || "";

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  // Load categories and products together using local loading state.
  useEffect(() => {
    let mounted = true;

    async function loadShopData() {
      setLoading(true);
      setLoadError("");

      try {
        const [
          { data: categoryRows, error: categoryError },
          { data: productRows, error: productError },
        ] = await Promise.all([
          supabase
            .from("categories")
            .select(
              "id, name, slug, description, image_url, sort_order"
            )
            .eq("is_active", true)
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),

          supabase
            .from("products")
            .select(`
              id,
              name,
              slug,
              short_description,
              description,
              status,
              is_featured,
              badge_type,
              product_variants (
                id,
                sku,
                pack_size_value,
                pack_size_unit,
                price,
                stock_quantity,
                is_active
              ),
              product_images (
                image_url,
                alt_text,
                sort_order,
                is_primary
              ),
              product_categories (
                categories (
                  id,
                  name,
                  slug
                )
              )
            `)
            .eq("status", "active")
            .order("name", { ascending: true }),
        ]);

        if (categoryError) throw categoryError;
        if (productError) throw productError;
        if (!mounted) return;

        setCategories(categoryRows || []);

        const mappedProducts = (productRows || [])
          .map(mapProduct)
          .filter((product) =>
            product.product_variants.some(
              (variant) => variant.is_active !== false
            )
          );

        setProducts(mappedProducts);
      } catch (error) {
        console.error("Unable to load shop data:", error);

        if (mounted) {
          setLoadError(
            "We couldn't load the products right now. Please try again."
          );
          setProducts([]);
          setCategories([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadShopData();

    return () => {
      mounted = false;
    };
  }, []);

  // Category options always use database slugs.
  const categoryOptions = useMemo(
    () => [
      { name: "All Products", slug: "all" },
      ...categories.map((category) => ({
        name: category.name,
        slug: category.slug,
      })),
    ],
    [categories]
  );

  // Search, category filtering, and sorting.
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "All") {
      result = result.filter((product) =>
        product.categories.some(
          (category) => category.slug === activeCategory
        )
      );
    }

    const query = normalize(search);

    if (query) {
      result = result.filter((product) => {
        const searchableFields = [
          product.name,
          product.categoryName,
          ...product.categories.map((category) => category.name),
          product.shortDescription,
          product.description,
        ];

        return searchableFields.some((field) =>
          normalize(field).includes(query)
        );
      });
    }

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price ?? Infinity) -
          Number(b.price ?? Infinity)
      );
    } else if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price ?? -Infinity) -
          Number(a.price ?? -Infinity)
      );
    } else if (sortBy === "name") {
      result.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""))
      );
    } else if (sortBy === "featured") {
      result.sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured)
      );
    }

    return result;
  }, [products, activeCategory, search, sortBy]);

  const handleSearchChange = (value) => {
    setSearch(value);

    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);

        if (value.trim()) {
          next.set("search", value);
        } else {
          next.delete("search");
        }

        return next;
      },
      { replace: true }
    );
  };

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setSortBy("featured");
    setSearchParams({}, { replace: true });
  };

  const handleCategoryChange = (categorySlug) => {
    setActiveCategory(categorySlug);
  };

  const activeCategoryName =
    activeCategory === "All"
      ? "All Products"
      : categories.find(
          (category) => category.slug === activeCategory
        )?.name || "Products";

  const hasActiveFilters =
    Boolean(search.trim()) ||
    activeCategory !== "All" ||
    sortBy !== "featured";

  return (
    <main className="min-h-screen overflow-x-clip bg-[#FAF7EF] text-[#26352B]">
      {/* COMPACT SHOP HERO */}
      <section className="relative overflow-hidden border-b border-[#285C3A]/10 bg-[#E7F0E8]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-white/50 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-[1280px] items-center gap-6 px-5 py-7 sm:px-8 sm:py-9 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-10 lg:py-10">
          {/* Brand introduction */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#285C3A]/15 bg-white/65 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.19em] text-[#285C3A] sm:text-[10px]">
              <Leaf size={13} />
              Chithu's Natural Products
            </span>

            <h1 className="mt-4 max-w-2xl font-serif text-[2.4rem] leading-[1.04] tracking-tight text-[#173F2A] sm:text-5xl lg:text-[3.65rem]">
              Goodness for{" "}
              <span className="italic text-[#527C57]">
                every kitchen.
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#596C5D] sm:text-[15px]">
              Discover traditional flavours, wholesome mixes,
              delicious laddus, masalas and everyday kitchen
              essentials from our collection.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-[#285C3A] sm:text-xs">
              <span className="inline-flex items-center gap-1.5">
                <Leaf size={14} />
                Traditional flavours
              </span>
              <span className="h-1 w-1 rounded-full bg-[#C79A3B]" />
              <span>Made for everyday meals</span>
            </div>
          </div>

          {/* Search panel */}
          <div className="relative rounded-[22px] border border-white/80 bg-white/85 p-4 shadow-[0_14px_45px_rgba(23,63,42,0.05)] backdrop-blur sm:p-5 lg:ml-auto lg:w-full lg:max-w-[500px]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-semibold text-[#173F2A]">
                  Find your favourites
                </h2>
                <p className="mt-0.5 text-[11px] text-[#778073]">
                  Search our collection
                </p>
              </div>

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
                <Search size={18} />
              </span>
            </div>

            <form
              role="search"
              onSubmit={(event) => event.preventDefault()}
              className="relative"
            >
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7B8778]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  handleSearchChange(event.target.value)
                }
                placeholder="Search products, mixes, masalas..."
                aria-label="Search products"
                autoComplete="off"
                className="h-12 w-full rounded-2xl border border-[#E5E1D5] bg-[#FFFEFB] pl-11 pr-11 text-sm text-[#26352B] outline-none transition placeholder:text-[#92958B] focus:border-[#527C57] focus:ring-4 focus:ring-[#285C3A]/5"
              />

              {search.length > 0 && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#285C3A] hover:bg-[#E7F0E8]"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("shop-products")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }}
              className="mt-3 flex w-full items-center justify-between gap-2 text-left text-[10px] text-[#778073] transition hover:text-[#285C3A]"
            >
              <span>
                {search.trim()
                  ? `${filteredProducts.length} matching products`
                  : "Explore something delicious"}
              </span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* SHOP CONTENT */}
      <section
        id="shop-products"
        className="mx-auto max-w-[1280px] scroll-mt-5 px-5 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10 lg:pt-9"
      >
        {/* COLLECTION HEADING AND MOBILE FILTER */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A795A] sm:text-[10px]">
              Explore the collection
            </p>
            <h2 className="mt-1 font-serif text-2xl leading-tight text-[#173F2A] sm:text-3xl">
              Shop by category
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#DDD8C8] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#285C3A] transition hover:border-[#285C3A] lg:hidden"
          >
            <Filter size={15} />
            Filters
          </button>
        </div>

        <p className="mb-4 max-w-2xl text-xs leading-5 text-[#778073] sm:text-sm">
          Browse our collection and find the flavours your kitchen loves.
        </p>

        {/* CATEGORY PILLS */}
        {loading ? (
          <div className="mb-6 flex gap-2 overflow-hidden pb-1">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-[#E7E0D1]"
              />
            ))}
          </div>
        ) : (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {categoryOptions.map((category) => {
              const slug =
                category.slug === "all" ? "All" : category.slug;
              const active = activeCategory === slug;

              return (
                <CategoryButton
                  key={category.slug}
                  category={
                    category.slug === "all"
                      ? "All Products"
                      : category.name
                  }
                  active={active}
                  onClick={() => handleCategoryChange(slug)}
                />
              );
            })}
          </div>
        )}

        {/* PRODUCT TOOLBAR */}
        <div className="mb-5 flex flex-col gap-3 border-b border-[#E2DDCF] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-xl text-[#173F2A] sm:text-2xl">
                {search.trim() && activeCategory === "All"
                  ? "Search Results"
                  : activeCategoryName}
              </h3>

              {activeCategory !== "All" && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("All")}
                  aria-label="Clear category filter"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A] hover:bg-[#D9E7DA]"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <p className="mt-1 text-[11px] text-[#778073] sm:text-xs">
              {loading ? (
                "Loading products..."
              ) : (
                <>
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "product" : "products"}
                  {search.trim()
                    ? ` matching "${search.trim()}"`
                    : ""}
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-[#667064] transition hover:bg-[#E7F0E8] hover:text-[#285C3A]"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}

            <div className="relative">
              <SlidersHorizontal
                size={14}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667064]"
              />

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort products"
                className="h-10 max-w-[190px] appearance-none rounded-full border border-[#DDD8C8] bg-white pl-9 pr-9 text-xs font-semibold text-[#285C3A] outline-none transition focus:border-[#285C3A]"
              >
                <option value="featured">Featured first</option>
                <option value="name">Name: A–Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667064]"
              />
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {loadError ? (
          <div className="rounded-3xl border border-[#DDD8C8] bg-white px-6 py-12 text-center sm:py-16">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F8EDE6] text-[#9A573E]">
              <RotateCcw size={21} />
            </div>

            <h3 className="mt-4 font-serif text-2xl text-[#173F2A]">
              Unable to load products
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667064]">
              {loadError}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-[#285C3A] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#173F2A]"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-[#E9E3D6] bg-white"
              >
                <div className="aspect-square animate-pulse bg-[#E7E0D1]" />
                <div className="space-y-3 p-3 sm:p-4">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-[#E7E0D1]" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-[#E7E0D1]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-[#E7E0D1]" />
                  <div className="h-9 animate-pulse rounded-full bg-[#E7E0D1]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState search={search} onClear={clearFilters} />
        )}
      </section>

      {/* MOBILE FILTER DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-[#14231A]/40 backdrop-blur-[2px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="absolute bottom-0 left-0 right-0 max-h-[85dvh] overflow-y-auto rounded-t-[28px] border-t border-[#E2DDCF] bg-[#FAF7EF] p-5 pb-8 shadow-2xl sm:p-7"
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#D7D0C1]" />

            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h3
                  id="mobile-filter-title"
                  className="font-serif text-2xl text-[#173F2A]"
                >
                  Filter products
                </h3>
                <p className="mt-1 text-xs text-[#778073]">
                  Choose a collection to explore.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filter menu"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#667064]">
              Category
            </p>

            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((category) => {
                const slug =
                  category.slug === "all" ? "All" : category.slug;
                const active = activeCategory === slug;

                return (
                  <button
                    key={category.slug}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleCategoryChange(slug)}
                    className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${
                      active
                        ? "border-[#285C3A] bg-[#285C3A] text-white"
                        : "border-[#DDD8C8] bg-white text-[#285C3A] hover:border-[#285C3A]"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <label
                htmlFor="mobile-sort"
                className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#667064]"
              >
                Sort products
              </label>

              <select
                id="mobile-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#DDD8C8] bg-white px-3 text-sm text-[#285C3A] outline-none focus:border-[#285C3A]"
              >
                <option value="featured">Featured first</option>
                <option value="name">Name: A–Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#DDD8C8] bg-white text-sm font-semibold text-[#285C3A]"
              >
                <RotateCcw size={15} />
                Reset all
              </button>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="h-12 flex-[1.4] rounded-full bg-[#285C3A] px-4 text-sm font-semibold text-white transition hover:bg-[#173F2A]"
              >
                Show {filteredProducts.length} products
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function CategoryButton({ category, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-semibold transition-all ${
        active
          ? "border-[#285C3A] bg-[#285C3A] text-white shadow-sm"
          : "border-[#DDD8C8] bg-white text-[#53675A] hover:border-[#527C57] hover:bg-[#E7F0E8]"
      }`}
    >
      {category}
    </button>
  );
}

function EmptyState({ search, onClear }) {
  return (
    <div className="rounded-3xl border border-[#E5E0D4] bg-white px-5 py-12 text-center sm:py-16">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
        {search.trim() ? <Search size={23} /> : <Sparkles size={23} />}
      </div>

      <h3 className="mt-4 font-serif text-2xl text-[#173F2A]">
        {search.trim() ? "No products found" : "Nothing here just yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667064]">
        {search.trim()
          ? `We couldn't find anything matching "${search.trim()}". Try another product name or clear your filters.`
          : "There are no products in this collection yet. Explore the full collection instead."}
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#285C3A] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#173F2A]"
      >
        <ArrowDownAZ size={15} />
        View all products
      </button>
    </div>
  );
}