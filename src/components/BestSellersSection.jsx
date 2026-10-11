import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import WishlistButton from "./WishlistButton";
import GlobalLoader from "./common/GlobalLoader";

const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") {
    return "Price unavailable";
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "Price unavailable";
  }

  return `₹${numericPrice.toLocaleString("en-IN")}`;
};

const formatPackSize = (value, unit) => {
  if (value === null || value === undefined || !unit) return "";
  return `${value} ${unit}`;
};

function mapProduct(row) {
  const variants = (row.product_variants || [])
    .filter((variant) => variant.is_active !== false)
    .sort((a, b) => {
      const aPrice = Number(a.price ?? Number.MAX_SAFE_INTEGER);
      const bPrice = Number(b.price ?? Number.MAX_SAFE_INTEGER);

      return aPrice - bPrice;
    });

  const variant = variants[0] || null;

  const images = [...(row.product_images || [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) {
      return a.is_primary ? -1 : 1;
    }

    return (a.sort_order ?? 99) - (b.sort_order ?? 99);
  });

  const category = (row.product_categories || [])
    .map((link) => link.categories)
    .find(Boolean);

  const badge = row.badge_type || null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: images[0]?.image_url || null,
    price: variant?.price ?? null,
    weight: variant
      ? formatPackSize(variant.pack_size_value, variant.pack_size_unit)
      : "",
    inStock: Boolean(variant && Number(variant.stock_quantity) > 0),
    stockQuantity: variant ? Number(variant.stock_quantity) : 0,
    variantId: variant?.id || null,
    selectedVariantId: variant?.id || null,
    sku: variant?.sku || null,
    categoryName: category?.name || "",
    category: category?.name || "",
    categorySlug: category?.slug || "",
    shortDescription: row.short_description || "",
    description: row.description || "",
    badge,
    badgeType: badge === "Trending" ? "red" : "green",
    status: row.status,
    is_featured: row.is_featured,
    product_variants: row.product_variants || [],
    product_images: row.product_images || [],
  };
}

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const isAvailable =
    product.inStock &&
    product.price !== null &&
    product.price !== undefined &&
    Boolean(product.variantId);

  const handleAddToCart = () => {
    if (!isAvailable) return;

    addToCart(
      {
        ...product,
        variantId: product.variantId,
        selectedVariantId: product.variantId,
        quantity: 1,
      },
      1
    );
  };

  return (
    <article
      className="
        group flex h-full min-w-0 shrink-0 snap-start
        flex-col overflow-hidden rounded-[24px]
        border border-[#E2D8C2] bg-[#FFFDF7]
        shadow-[0_8px_28px_rgba(40,92,58,0.08)]
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_45px_rgba(40,92,58,0.15)]
        basis-[85%] sm:basis-[48%]
        lg:basis-[calc((100%-3.75rem)/4)]
      "
    >
      {/* Product image */}
      <div className="relative h-[265px] shrink-0 overflow-hidden bg-[#E7F0E8]">
        <Link
          to={`/product/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="block h-full w-full"
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              draggable="false"
              loading="lazy"
              className="
                h-full w-full object-cover
                transition-transform duration-700
                group-hover:scale-105
              "
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <span className="text-sm font-medium text-[#667064]">
                Product image coming soon
              </span>
            </div>
          )}
        </Link>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#FFFDF7]/75 to-transparent" />

        {product.badge && (
          <div
            className={`absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-md ${
              product.badgeType === "red" ? "bg-[#B52C24]" : "bg-[#167044]"
            }`}
          >
            {product.badge === "Best Seller" ? "♛ " : "🌿 "}
            {product.badge}
          </div>
        )}

        <WishlistButton
          product={product}
          className="absolute right-4 top-4 z-10"
        />
      </div>

      {/* Product information */}
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#B8892D]">
          {product.categoryName || "Chithu's Natural Products"}
        </p>

        <Link
          to={`/product/${product.slug}`}
          className="min-h-[48px] font-serif text-[21px] font-bold leading-[1.1] text-[#173F2A] transition-colors hover:text-[#B97822]"
        >
          {product.name}
        </Link>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#667064]">
          {product.shortDescription ||
            "Discover this product from our kitchen."}
        </p>

        <div className="mt-4 flex items-center gap-3">
          {product.weight && (
            <span className="text-sm text-[#667064]">{product.weight}</span>
          )}

          {product.weight && (
            <span className="h-5 w-px bg-[#D8D1C0]" />
          )}

          <span className="text-lg font-bold text-[#173F2A]">
            {formatPrice(product.price)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          aria-label={`Add ${product.name} to cart`}
          className="
            mt-auto mt-5 flex w-full items-center
            justify-center gap-2 rounded-full
            bg-[#075A35] px-5 py-3
            text-sm font-semibold text-[#FAF7EF]
            shadow-[0_4px_12px_rgba(7,90,53,0.12)]
            transition-all duration-300
            hover:bg-[#173F2A]
            hover:shadow-[0_7px_18px_rgba(7,90,53,0.20)]
            disabled:cursor-not-allowed
            disabled:bg-gray-400
          "
        >
          <span
            className="text-lg leading-none text-[#E8D5A8]"
            aria-hidden="true"
          >
            🛒
          </span>

          <span>
            {!product.inStock
              ? "Out of Stock"
              : !isAvailable
                ? "Price Unavailable"
                : "Add to Cart"}
          </span>
        </button>
      </div>
    </article>
  );
}

export default function BestSellersSection() {
  const carouselRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadFeaturedProducts() {
      setLoading(true);
      setLoadError("");

      try {
        const { data, error } = await supabase
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
                name,
                slug
              )
            )
          `)
          .eq("status", "active")
          .eq("is_featured", true)
          .order("name", { ascending: true });

        if (error) throw error;
        if (!mounted) return;

        const featuredProducts = (data || [])
          .map(mapProduct)
          .filter((product) =>
            product.product_variants.some(
              (variant) => variant.is_active !== false
            )
          );

        setProducts(featuredProducts);
      } catch (error) {
        console.error(
          "Failed to load featured products from Supabase:",
          error
        );

        if (mounted) {
          setLoadError("We couldn't load featured products right now.");
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadFeaturedProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const scrollCarousel = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const firstCard = carousel.querySelector("article");

    const cardWidth = firstCard
      ? firstCard.getBoundingClientRect().width
      : carousel.clientWidth * 0.8;

    const styles = window.getComputedStyle(carousel);
    const gap = parseFloat(styles.columnGap) || 0;
    const amount = (cardWidth + gap) * 2;

    carousel.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  // Use the same full-screen loading approach as ProductDetails.jsx.
  if (loading) {
    return (
      <GlobalLoader message="Discovering our favourite natural products..." />
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#FAF7EF] py-16 sm:py-20 lg:py-24">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-[#E7F0E8] opacity-35" />
      <div className="pointer-events-none absolute -left-32 bottom-20 h-72 w-72 rounded-full bg-[#E8D5A8] opacity-15" />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        {/* Heading */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-14 bg-[#B8892D] sm:w-20" />

            <div className="flex items-center gap-2">
              <span
                className="text-xl text-[#285C3A]"
                aria-hidden="true"
              >
                🍃
              </span>

              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#285C3A] sm:text-sm">
                Popular From
              </span>
            </div>

            <span className="h-px w-14 bg-[#B8892D] sm:w-20" />
          </div>

          <h2 className="mt-2 font-serif text-[50px] font-semibold leading-[0.95] tracking-[-0.04em] text-[#173F2A] sm:text-[64px] lg:text-[82px]">
            Our <span className="text-[#B97822]">Kitchen</span>
          </h2>

          <p className="mt-3 font-serif text-[20px] font-medium text-[#173F2A] sm:text-[24px] lg:text-[27px]">
            Loved for their traditional goodness
          </p>

          <p className="mx-auto mt-3 max-w-[620px] text-sm leading-6 text-[#667064] sm:text-base sm:leading-7">
            Discover some of the favourites from our kitchen, made with
            familiar ingredients and inspired by traditional food practices.
          </p>
        </div>

        {/* Product carousel */}
        <div className="relative mt-10 sm:mt-12">
          <button
            type="button"
            onClick={() => scrollCarousel("prev")}
            aria-label="Previous products"
            className="
              absolute -left-5 top-1/2 z-20 hidden
              h-12 w-12 -translate-y-1/2 items-center
              justify-center rounded-full bg-[#075A35]
              text-2xl text-[#FAF7EF] shadow-lg
              transition-all hover:scale-105
              hover:bg-[#173F2A] lg:flex xl:-left-7
            "
          >
            ←
          </button>

          <div
            ref={carouselRef}
            className="
              flex flex-nowrap items-stretch
              gap-4 overflow-x-auto
              snap-x snap-mandatory scroll-smooth pb-5
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
              sm:gap-5
            "
          >
            {loadError ? (
              <p className="w-full rounded-xl border border-[#E2D8C2] bg-white/70 px-5 py-8 text-center text-sm text-[#667064]">
                {loadError} Please refresh the page to try again.
              </p>
            ) : products.length === 0 ? (
              <p className="w-full rounded-xl border border-[#E2D8C2] bg-white/70 px-5 py-8 text-center text-sm text-[#667064]">
                No featured active products are available yet. Mark an active
                product as featured in Admin to display it here.
              </p>
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => scrollCarousel("next")}
            aria-label="Next products"
            className="
              absolute -right-5 top-1/2 z-20 hidden
              h-12 w-12 -translate-y-1/2 items-center
              justify-center rounded-full bg-[#075A35]
              text-2xl text-[#FAF7EF] shadow-lg
              transition-all hover:scale-105
              hover:bg-[#173F2A] lg:flex xl:-right-7
            "
          >
            →
          </button>
        </div>

        {/* View all products */}
        <div className="mt-9 flex justify-center sm:mt-10">
          <Link
            to="/shop"
            className="
              group inline-flex items-center justify-center
              gap-3 rounded-full bg-[#075A35] px-7 py-3.5
              text-sm font-semibold text-[#FAF7EF]
              shadow-[0_6px_18px_rgba(7,90,53,0.18)]
              transition-all duration-300
              hover:-translate-y-0.5 hover:bg-[#173F2A]
              hover:shadow-[0_10px_25px_rgba(7,90,53,0.25)]
            "
          >
            <span
              className="text-lg leading-none text-[#E8D5A8]"
              aria-hidden="true"
            >
              🍃
            </span>

            <span>View All Products</span>

            <span
              className="text-lg leading-none text-[#E8D5A8] transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}