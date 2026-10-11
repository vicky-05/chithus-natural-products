
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Filter,
  Leaf,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";
import heroImage from "../assets/chithus-hero.png";

/* =========================================================
   HELPERS
========================================================= */

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const formatPackSize = (value, unit) => {
  if (value === null || value === undefined || !unit) return "";
  return `${value} ${unit}`;
};

function mapProduct(row) {
  const variants = (row.product_variants || [])
    .filter((variant) => variant.is_active !== false)
    .sort(
      (a, b) =>
        Number(a.price ?? Infinity) -
        Number(b.price ?? Infinity)
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

  const primaryCategory = categories[0] || null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,

    image: images[0]?.image_url || null,
    displayImage: images[0]?.image_url || null,
    images: images.map((image) => image.image_url).filter(Boolean),

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

    stockQuantity: variant
      ? Number(variant.stock_quantity || 0)
      : 0,

    variantId: variant?.id || null,
    selectedVariantId: variant?.id || null,
    sku: variant?.sku || null,

    category: primaryCategory?.slug || "",
    categoryName: primaryCategory?.name || "",
    categorySlug: primaryCategory?.slug || "",
    categoryId: primaryCategory?.id || null,

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

function getCategoryDescription(category) {
  const descriptions = {
    "laddus-traditional-sweets":
      "Discover traditional sweets and laddus for everyday moments and special occasions.",

    "laddus-and-traditional-sweets":
      "Discover traditional sweets and laddus for everyday moments and special occasions.",

    "health-mixes-powders":
      "Explore wholesome mixes and powders for your everyday kitchen.",

    "health-mixes-and-powders":
      "Explore wholesome mixes and powders for your everyday kitchen.",

    malts:
      "Explore traditional malt varieties for convenient everyday preparation.",

    "dosai-mixes":
      "Discover convenient dosai mixes inspired by familiar traditional flavours.",

    "masala-powders":
      "Find flavourful masala powders for your everyday cooking.",

    noodles:
      "Explore noodle varieties for a different take on everyday meals.",

    pastas:
      "Discover pasta varieties for your family's kitchen.",
  };

  return (
    descriptions[category?.slug] ||
    category?.description ||
    "Explore the natural product collection from Chithu's Natural Products."
  );
}

/* =========================================================
   CATEGORY PAGE
========================================================= */

export default function CategoryPage() {
  const { category } = useParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  /* ---------------------------------------------------------
     LOAD PRODUCTS AND CATEGORIES FROM SUPABASE
  --------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    async function loadCategoryData() {
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
              "id, name, slug, description, image_url, is_active, sort_order"
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
        console.error("Unable to load category products:", error);

        if (mounted) {
          setLoadError(
            "We couldn't load this collection. Please try again."
          );
          setProducts([]);
          setCategories([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCategoryData();

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------------------------------------------------
     CURRENT CATEGORY

     Match the route parameter against the real database slug.
  --------------------------------------------------------- */

  const currentCategory = useMemo(
    () =>
      categories.find(
        (item) => normalize(item.slug) === normalize(category)
      ) || null,
    [categories, category]
  );

  const currentCategoryTitle =
    currentCategory?.name ||
    (category || "Products")
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");

  const currentCategoryDescription =
    getCategoryDescription(currentCategory);

  /* ---------------------------------------------------------
     FILTER, SEARCH AND SORT
  --------------------------------------------------------- */

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) =>
      product.categories.some(
        (item) => normalize(item.slug) === normalize(category)
      )
    );

    const query = normalize(searchTerm);

    if (query) {
      result = result.filter((product) => {
        const searchableFields = [
          product.name,
          product.shortDescription,
          product.description,
          product.categoryName,
          ...product.categories.map((item) => item.name),
        ];

        return searchableFields.some((field) =>
          normalize(field).includes(query)
        );
      });
    }

    if (maxPrice !== "" && Number.isFinite(Number(maxPrice))) {
      result = result.filter(
        (product) =>
          product.price !== null &&
          Number(product.price) <= Number(maxPrice)
      );
    }

    if (inStockOnly) {
      result = result.filter((product) => product.inStock);
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
  }, [
    products,
    category,
    searchTerm,
    maxPrice,
    inStockOnly,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchTerm("");
    setMaxPrice("");
    setInStockOnly(false);
    setSortBy("featured");
  };

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    maxPrice !== "" ||
    inStockOnly ||
    sortBy !== "featured";

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#242821]">
      {/* CATEGORY HERO */}

      <section className="relative overflow-hidden border-b border-[#DDD8C8] bg-[#E7F0E8]">
        <div className="mx-auto max-w-[1280px] px-5 py-6 sm:px-8 sm:py-9 lg:px-10">
          {/* Breadcrumb */}

          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex flex-wrap items-center gap-2 text-xs text-[#667064] sm:text-sm"
          >
            <Link
              to="/"
              className="transition-colors hover:text-[#285C3A]"
            >
              Home
            </Link>

            <ChevronRight size={14} />

            <Link
              to="/shop"
              className="transition-colors hover:text-[#285C3A]"
            >
              Shop
            </Link>

            <ChevronRight size={14} />

            <span className="font-medium text-[#285C3A]">
              {currentCategoryTitle}
            </span>
          </nav>

          <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.8fr] lg:gap-10">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#285C3A]/10 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#285C3A]">
                <Leaf size={13} />
                Our Collection
              </span>

              <h1 className="mt-4 max-w-2xl font-serif text-3xl font-semibold leading-tight text-[#173F2A] sm:text-4xl lg:text-5xl">
                {currentCategoryTitle}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#667064] sm:text-base sm:leading-7">
                {currentCategoryDescription}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "Traditional Goodness",
                  "Made With Care",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#D8CFBC] bg-white/65 px-3 py-2 text-[11px] text-[#285C3A] sm:text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative hidden h-[210px] overflow-hidden rounded-[24px] border border-white/70 bg-[#DCE8DC] sm:block lg:h-[240px]">
              <img
                src={currentCategory?.image_url || heroImage}
                alt={currentCategoryTitle}
                className="h-full w-full object-cover"
                onError={(event) => {
                  if (event.currentTarget.src !== heroImage) {
                    event.currentTarget.src = heroImage;
                  }
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#173F2A]/50 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-flex rounded-full border border-white/50 bg-white/90 px-3 py-2 text-xs font-medium text-[#173F2A] shadow-sm">
                  Chithu's Natural Products
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY NAVIGATION */}

      <section className="sticky top-0 z-30 border-b border-[#DDD8C8] bg-[#FFFEFB]/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-[1280px] px-5 py-3 sm:px-8 lg:px-10">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link
              to="/shop"
              className="shrink-0 rounded-full border border-[#DDD8C8] bg-white px-4 py-2.5 text-xs font-semibold text-[#285C3A] transition hover:border-[#285C3A]"
            >
              All Products
            </Link>

            {categories.map((item) => {
              const active =
                normalize(item.slug) === normalize(category);

              return (
                <Link
                  key={item.id}
                  to={`/shop/${item.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                    active
                      ? "border-[#285C3A] bg-[#285C3A] text-white"
                      : "border-[#DDD8C8] bg-white text-[#53675A] hover:border-[#285C3A] hover:bg-[#E7F0E8]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}

      <section className="mx-auto max-w-[1280px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
        {/* Search and category heading */}

        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A795A]">
              Explore the collection
            </p>

            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#173F2A] sm:text-3xl">
              {currentCategoryTitle}
            </h2>

            <p className="mt-1 text-xs text-[#667064] sm:text-sm">
              {loading
                ? "Loading products..."
                : `${filteredProducts.length} ${
                    filteredProducts.length === 1
                      ? "product"
                      : "products"
                  } in this collection`}
            </p>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-[280px] sm:flex-none">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#778073]"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={`Search ${currentCategoryTitle.toLowerCase()}...`}
                aria-label={`Search ${currentCategoryTitle}`}
                className="h-11 w-full rounded-full border border-[#DDD8C8] bg-white pl-10 pr-10 text-xs outline-none transition focus:border-[#285C3A] focus:ring-2 focus:ring-[#285C3A]/10 sm:text-sm"
              />

              {searchTerm && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#285C3A] hover:bg-[#E7F0E8]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[#DDD8C8] bg-white px-3.5 text-xs font-semibold text-[#285C3A] transition hover:border-[#285C3A] lg:hidden"
            >
              <Filter size={15} />
              Filters
            </button>
          </div>
        </div>

        {/* Product toolbar */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2DDCF] pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#667064]">
            <span className="font-medium text-[#285C3A]">
              {filteredProducts.length} results
            </span>

            {inStockOnly && (
              <span className="rounded-full bg-[#E7F0E8] px-2.5 py-1 text-[#285C3A]">
                In stock
              </span>
            )}

            {maxPrice !== "" && (
              <span className="rounded-full bg-[#E7F0E8] px-2.5 py-1 text-[#285C3A]">
                Up to ₹{maxPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#667064] hover:bg-[#E7F0E8] hover:text-[#285C3A]"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}

            <div className="relative">
              <SlidersHorizontal
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#667064]"
              />

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort category products"
                className="h-10 max-w-[190px] appearance-none rounded-full border border-[#DDD8C8] bg-white pl-9 pr-8 text-xs font-semibold text-[#285C3A] outline-none focus:border-[#285C3A]"
              >
                <option value="featured">Featured first</option>
                <option value="name">Name: A–Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#667064]"
              />
            </div>
          </div>
        </div>

        {/* Main grid and desktop filters */}

        <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-[90px] rounded-2xl border border-[#E5E0D4] bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-semibold text-[#173F2A]">
                  Filters
                </h3>

                <Filter size={17} className="text-[#285C3A]" />
              </div>

              <div className="mt-5 border-t border-[#EEE8DB] pt-5">
                <label
                  htmlFor="desktop-max-price"
                  className="text-sm font-semibold text-[#26352B]"
                >
                  Maximum price
                </label>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-[#667064]">₹</span>

                  <input
                    id="desktop-max-price"
                    type="number"
                    min="0"
                    step="1"
                    value={maxPrice}
                    onChange={(event) =>
                      setMaxPrice(event.target.value)
                    }
                    placeholder="Any price"
                    className="h-10 min-w-0 flex-1 rounded-lg border border-[#DDD8C8] px-3 text-sm outline-none focus:border-[#285C3A]"
                  />
                </div>

                <p className="mt-2 text-[11px] leading-5 text-[#778073]">
                  Leave empty to show products at any price.
                </p>
              </div>

              <div className="mt-5 border-t border-[#EEE8DB] pt-5">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-[#53675A]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(event) =>
                      setInStockOnly(event.target.checked)
                    }
                    className="h-4 w-4 accent-[#285C3A]"
                  />
                  In-stock products only
                </label>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#DDD8C8] px-4 py-3 text-xs font-semibold text-[#285C3A] transition hover:bg-[#E7F0E8]"
              >
                <RotateCcw size={14} />
                Reset filters
              </button>
            </div>
          </aside>

          <div className="min-w-0">
            {loadError ? (
              <div className="rounded-3xl border border-[#DDD8C8] bg-white px-5 py-12 text-center">
                <h3 className="font-serif text-2xl text-[#173F2A]">
                  Unable to load products
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#667064]">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-5 rounded-full bg-[#285C3A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#173F2A]"
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
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
            ) : !currentCategory ? (
              <div className="rounded-3xl border border-[#DDD8C8] bg-white px-5 py-12 text-center">
                <h3 className="font-serif text-2xl text-[#173F2A]">
                  Collection not found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667064]">
                  This category may have been renamed or deactivated.
                  Please browse the available collections.
                </p>

                <Link
                  to="/shop"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#285C3A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#173F2A]"
                >
                  Browse all products
                  <ArrowRight size={15} />
                </Link>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-[#E5E0D4] bg-white px-5 py-12 text-center sm:py-16">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
                  <Search size={23} />
                </div>

                <h3 className="mt-4 font-serif text-2xl font-semibold text-[#173F2A]">
                  No products found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667064]">
                  {searchTerm.trim()
                    ? `No products in ${currentCategoryTitle} match "${searchTerm.trim()}". Try another search.`
                    : "There are currently no matching active products in this collection. You can clear your filters or browse all products."}
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-2 rounded-full border border-[#DDD8C8] px-5 py-3 text-xs font-semibold text-[#285C3A] hover:bg-[#E7F0E8]"
                    >
                      <RotateCcw size={14} />
                      Clear filters
                    </button>
                  )}

                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 rounded-full bg-[#285C3A] px-5 py-3 text-xs font-semibold text-white hover:bg-[#173F2A]"
                  >
                    View all products
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BRAND PROMISE */}

      <section className="border-y border-[#D8DEC8] bg-[#E7F0E8]">
        <div className="mx-auto grid max-w-[1280px] gap-5 px-5 py-6 sm:grid-cols-3 sm:px-8 lg:px-10">
          {[
            {
              number: "01",
              title: "Traditional Goodness",
              text: "Inspired by familiar traditional food choices.",
            },
            {
              number: "02",
              title: "Made With Care",
              text: "Thoughtfully presented for everyday kitchens.",
            },
            {
              number: "03",
              title: "Here to Help",
              text: "Contact us if you need help choosing a product.",
            },
          ].map((item) => (
            <div key={item.number} className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B9CDB8] text-xs font-semibold text-[#285C3A]">
                {item.number}
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold text-[#173F2A]">
                  {item.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#667064]">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MOBILE FILTER DRAWER */}

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-[#14231A]/40 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-filter-title"
            className="absolute bottom-0 left-0 right-0 max-h-[85dvh] overflow-y-auto rounded-t-[28px] border-t border-[#E2DDCF] bg-[#FAF7EF] p-5 pb-8 shadow-2xl sm:p-7"
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#D7D0C1]" />

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3
                  id="category-filter-title"
                  className="font-serif text-2xl text-[#173F2A]"
                >
                  Filter products
                </h3>

                <p className="mt-1 text-xs text-[#778073]">
                  Refine this collection.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filter menu"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]"
              >
                <X size={18} />
              </button>
            </div>

            <label
              htmlFor="mobile-max-price"
              className="text-sm font-semibold text-[#26352B]"
            >
              Maximum price
            </label>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-[#667064]">₹</span>

              <input
                id="mobile-max-price"
                type="number"
                min="0"
                step="1"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(event.target.value)
                }
                placeholder="Any price"
                className="h-11 flex-1 rounded-xl border border-[#DDD8C8] bg-white px-3 text-sm outline-none focus:border-[#285C3A]"
              />
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-[#53675A]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) =>
                  setInStockOnly(event.target.checked)
                }
                className="h-4 w-4 accent-[#285C3A]"
              />
              Show in-stock products only
            </label>

            <label
              htmlFor="mobile-category-sort"
              className="mb-2 mt-6 block text-sm font-semibold text-[#26352B]"
            >
              Sort products
            </label>

            <select
              id="mobile-category-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-11 w-full rounded-xl border border-[#DDD8C8] bg-white px-3 text-sm text-[#285C3A] outline-none focus:border-[#285C3A]"
            >
              <option value="featured">Featured first</option>
              <option value="name">Name: A–Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#DDD8C8] bg-white text-sm font-semibold text-[#285C3A]"
              >
                <RotateCcw size={15} />
                Reset
              </button>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="h-12 flex-[1.4] rounded-full bg-[#285C3A] px-4 text-sm font-semibold text-white hover:bg-[#173F2A]"
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
