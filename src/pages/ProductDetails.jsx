import { Helmet } from "react-helmet-async";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import {

  ArrowLeft,

  Check,

  ChevronDown,

  ChevronLeft,

  ChevronRight,

  Heart,

  Leaf,

  Minus,

  Package,

  Plus,

  RotateCcw,

  ShieldCheck,

  ShoppingBag,

  Star,

  Truck,

  X,

  Maximize2,

  MapPin,

  MessageCircle,

  Share2,

  Copy,

} from "lucide-react";

import GlobalLoader from "../components/common/GlobalLoader";

import { supabase } from "../lib/supabaseClient";

import { useCart } from "../context/CartContext";

import { socialLinks } from "../config/socialLinks";

import { useWishlist } from "../context/WishlistContext";

const PLACEHOLDER_IMAGE =

  "https://placehold.co/800x800/F7F4EB/285C3A?text=Chithu%27s+Natural+Products";

const formatPrice = (price) => {

  if (price === null || price === undefined || price === "") {

    return "Price unavailable";

  }

  return `₹${Number(price).toLocaleString("en-IN", {

    maximumFractionDigits: 2,

  })}`;

};

function sortImages(images = []) {

  return [...images]

    .filter((image) => image?.image_url)

    .sort((a, b) => {

      if (a.is_primary !== b.is_primary) {

        return a.is_primary ? -1 : 1;

      }

      return (a.sort_order ?? 999) - (b.sort_order ?? 999);

    });

}

function getCategory(product) {

  return (product.product_categories || [])

    .map((entry) => entry.categories)

    .find(Boolean);

}

function mapRelatedProduct(row) {

  const variants = (row.product_variants || [])

    .filter((variant) => variant.is_active !== false)

    .sort((a, b) => Number(a.price) - Number(b.price));

  const images = sortImages(row.product_images);

  const category = getCategory(row);

  const variant = variants[0];

  return {

    ...row,

    image: images[0]?.image_url || null,

    category: category?.slug || "",

    categoryName: category?.name || "",

    weight: variant

      ? `${variant.pack_size_value} ${variant.pack_size_unit}`

      : "",

    price: variant?.price ?? null,

    inStock: variants.some(

      (item) => Number(item.stock_quantity) > 0

    ),

    variants,

  };

}

function Accordion({ title, children, defaultOpen = false }) {

  const [open, setOpen] = useState(defaultOpen);

  return (

    <section className="border-b border-[#D8DDD7]">

      <button

        type="button"

        onClick={() => setOpen((value) => !value)}

        aria-expanded={open}

        className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-[#222822] sm:text-lg"

      >

        <span>{title}</span>

        <ChevronDown

          size={21}

          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""

            }`}

        />

      </button>

      {open && (

        <div className="whitespace-pre-line pb-6 text-sm leading-7 text-[#5F695F]">

          {children}

        </div>

      )}

    </section>

  );

}

function ProductGallery({ product, images }) {

  const [selectedIndex, setSelectedIndex] = useState(0);

  const [zoom, setZoom] = useState(false);

  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const [viewerOpen, setViewerOpen] = useState(false);

  const [viewerZoom, setViewerZoom] = useState(false);

  const [touchStartX, setTouchStartX] = useState(null);

  const thumbnailRefs = useRef([]);

  const safeImages = images?.length ? images : [PLACEHOLDER_IMAGE];

  const activeIndex = Math.min(selectedIndex, safeImages.length - 1);

  const activeImage = safeImages[activeIndex] || PLACEHOLDER_IMAGE;

  const multipleImages = safeImages.length > 1;

  useEffect(() => {

    setSelectedIndex(0);

    setZoom(false);

    setViewerZoom(false);

    setViewerOpen(false);

  }, [product.id]);

  const previousImage = useCallback(() => {

    setSelectedIndex((index) => (index === 0 ? safeImages.length - 1 : index - 1));

    setZoom(false);

    setViewerZoom(false);

  }, [safeImages.length]);

  const nextImage = useCallback(() => {

    setSelectedIndex((index) => (index + 1) % safeImages.length);

    setZoom(false);

    setViewerZoom(false);

  }, [safeImages.length]);

  const closeViewer = useCallback(() => {

    setViewerOpen(false);

    setViewerZoom(false);

  }, []);

  useEffect(() => {

    if (!viewerOpen) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {

      if (event.key === "Escape") closeViewer();

      if (event.key === "ArrowLeft" && multipleImages) previousImage();

      if (event.key === "ArrowRight" && multipleImages) nextImage();

    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {

      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = previousOverflow;

    };

  }, [viewerOpen, closeViewer, previousImage, nextImage, multipleImages]);

  useEffect(() => {

    thumbnailRefs.current[activeIndex]?.scrollIntoView({

      block: "nearest",

      inline: "nearest",

      behavior: "smooth",

    });

  }, [activeIndex]);

  const handleMouseMove = (event) => {

    const rect = event.currentTarget.getBoundingClientRect();

    setZoomPosition({

      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),

      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)),

    });

  };

  const selectImage = (index) => {

    setSelectedIndex(index);

    setZoom(false);

    setViewerZoom(false);

  };

  const handleTouchStart = (event) => {

    setTouchStartX(event.touches[0]?.clientX ?? null);

  };

  const handleTouchEnd = (event) => {

    if (touchStartX === null || !multipleImages) {

      setTouchStartX(null);

      return;

    }

    const endX = event.changedTouches[0]?.clientX;

    if (typeof endX === "number") {

      const distance = endX - touchStartX;

      if (Math.abs(distance) > 45) {

        if (distance < 0) nextImage();

        else previousImage();

      }

    }

    setTouchStartX(null);

  };

  return (

    <div className="min-w-0 w-full">

      <div className={`grid min-w-0 gap-4 ${multipleImages ? "grid-cols-1 sm:grid-cols-[76px_minmax(0,1fr)]" : "grid-cols-1"

        }`}>

        {multipleImages && (

          <div

            className="order-2 flex gap-3 overflow-x-auto pb-2 sm:order-1 sm:max-h-[620px] sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden"

            aria-label="Product image thumbnails"

          >

            {safeImages.map((image, index) => (

              <button

                key={`${image}-${index}`}

                ref={(element) => { thumbnailRefs.current[index] = element; }}

                type="button"

                onMouseEnter={() => selectImage(index)}

                onFocus={() => selectImage(index)}

                onClick={() => selectImage(index)}

                aria-label={`View product image ${index + 1}`}

                aria-pressed={activeIndex === index}

                className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition sm:h-[76px] sm:w-[76px] ${activeIndex === index

                  ? "border-[#285C3A] shadow-sm"

                  : "border-[#DDE1DB] hover:border-[#C79A3B]"

                  }`}

              >

                <img

                  src={image}

                  alt={`${product.name} thumbnail ${index + 1}`}

                  loading="lazy"

                  onError={(event) => {

                    event.currentTarget.onerror = null;

                    event.currentTarget.src = PLACEHOLDER_IMAGE;

                  }}

                  className="h-full w-full object-contain"

                />

              </button>

            ))}

          </div>

        )}

        <div className={`order-1 min-w-0 w-full ${multipleImages ? "sm:order-2" : ""}`}>

          <div

            className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-[#E8E2D4] bg-[#F7F4EB] shadow-sm sm:rounded-[2rem]"

            onMouseMove={handleMouseMove}

            onMouseEnter={() => setZoom(true)}

            onMouseLeave={() => setZoom(false)}

            onTouchStart={handleTouchStart}

            onTouchEnd={handleTouchEnd}

          >

            <img

              src={activeImage}

              alt={`${product.name} image ${activeIndex + 1}`}

              draggable="false"

              onError={(event) => {

                event.currentTarget.onerror = null;

                event.currentTarget.src = PLACEHOLDER_IMAGE;

              }}

              onDoubleClick={() => setViewerOpen(true)}

              className="h-full w-full select-none object-contain p-5 sm:p-8 lg:p-10"

              style={{

                transform: zoom && !viewerOpen ? "scale(1.8)" : "scale(1)",

                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,

                transition: zoom ? "transform 100ms ease-out" : "transform 180ms ease-out",

              }}

            />

            <button

              type="button"

              onClick={() => setViewerOpen(true)}

              aria-label="Open full-screen product image viewer"

              title="View full screen"

              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#E3E2DB] bg-white/95 text-[#285C3A] shadow-sm transition hover:bg-[#E7F0E8]"

            >

              <Maximize2 size={18} />

            </button>

            {multipleImages && (

              <>

                <button

                  type="button"

                  aria-label="Previous product image"

                  onClick={previousImage}

                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E3E2DB] bg-white/95 shadow-sm transition hover:bg-[#E7F0E8]"

                >

                  <ChevronLeft size={21} />

                </button>

                <button

                  type="button"

                  aria-label="Next product image"

                  onClick={nextImage}

                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E3E2DB] bg-white/95 shadow-sm transition hover:bg-[#E7F0E8]"

                >

                  <ChevronRight size={21} />

                </button>

              </>

            )}

            {product.badge_type && (

              <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-[#E7F0E8] px-3 py-1.5 text-xs font-semibold text-[#285C3A]">

                {product.badge_type}

              </span>

            )}

            <span className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1.5 text-xs text-[#5F695F] shadow-sm">

              <span className="hidden sm:inline">Hover to zoom · Click to enlarge</span>
              <span className="sm:hidden">Swipe to explore · Tap to enlarge</span>

            </span>

          </div>

          <p className="mt-3 text-center text-xs text-[#72796F]">

            {safeImages.length} product image{safeImages.length === 1 ? "" : "s"}

            {" · "}Image {activeIndex + 1} of {safeImages.length}

          </p>

          {multipleImages && (

            <div className="mt-3 flex justify-center gap-2 sm:hidden">

              {safeImages.map((image, index) => (

                <button

                  key={`${image}-indicator-${index}`}

                  type="button"

                  onClick={() => selectImage(index)}

                  aria-label={`Go to image ${index + 1}`}

                  aria-current={activeIndex === index ? "true" : undefined}

                  className={`h-2 rounded-full transition-all ${activeIndex === index ? "w-6 bg-[#285C3A]" : "w-2 bg-[#C9CFC5]"

                    }`}

                />

              ))}

            </div>

          )}

        </div>

      </div>

      {viewerOpen && (

        <div

          className="fixed inset-0 z-[100] flex flex-col bg-black/95"

          role="dialog"

          aria-modal="true"

          aria-label={`${product.name} image viewer`}

          onClick={closeViewer}

        >

          <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-4 text-white sm:px-8">

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold sm:text-base">{product.name}</p>

              <p className="mt-1 text-xs text-white/65">

                Image {activeIndex + 1} of {safeImages.length}

              </p>

            </div>

            <button

              type="button"

              onClick={closeViewer}

              aria-label="Close image viewer"

              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"

            >

              <X size={24} />

            </button>

          </div>

          <div

            className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-14 pb-5 sm:px-20"

            onTouchStart={handleTouchStart}

            onTouchEnd={handleTouchEnd}

          >

            {multipleImages && (

              <button

                type="button"

                onClick={(event) => { event.stopPropagation(); previousImage(); }}

                aria-label="Previous image"

                className="absolute left-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"

              >

                <ChevronLeft size={27} />

              </button>

            )}

            <img

              src={activeImage}

              alt={`${product.name} image ${activeIndex + 1}`}

              draggable="false"

              onClick={(event) => event.stopPropagation()}

              onError={(event) => {

                event.currentTarget.onerror = null;

                event.currentTarget.src = PLACEHOLDER_IMAGE;

              }}

              onDoubleClick={() => setViewerZoom((value) => !value)}

              className={`max-h-full max-w-full select-none object-contain transition-transform duration-200 ${viewerZoom ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"

                }`}

            />

            {multipleImages && (

              <button

                type="button"

                onClick={(event) => { event.stopPropagation(); nextImage(); }}

                aria-label="Next image"

                className="absolute right-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"

              >

                <ChevronRight size={27} />

              </button>

            )}

          </div>

          <p className="shrink-0 px-4 pb-3 text-center text-xs text-white/65">

            Use ← → to navigate · Esc to close · Double-click image to zoom

          </p>

          {multipleImages && (

            <div

              className="flex shrink-0 justify-center gap-2 overflow-x-auto px-4 pb-5"

              onClick={(event) => event.stopPropagation()}

            >

              {safeImages.map((image, index) => (

                <button

                  key={`${image}-viewer-${index}`}

                  type="button"

                  onClick={() => selectImage(index)}

                  aria-label={`View image ${index + 1}`}

                  aria-pressed={activeIndex === index}

                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white/10 p-1 sm:h-16 sm:w-16 ${activeIndex === index ? "border-[#E8D5A8]" : "border-white/20"

                    }`}

                >

                  <img

                    src={image}

                    alt=""

                    onError={(event) => {

                      event.currentTarget.onerror = null;

                      event.currentTarget.src = PLACEHOLDER_IMAGE;

                    }}

                    className="h-full w-full object-contain"

                  />

                </button>

              ))}

            </div>

          )}

        </div>

      )}

    </div>

  );

}

function RelatedProductCard({ item }) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E2D8C2] bg-[#FFFDF7] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#C9D8CA] hover:shadow-lg">
      <Link
        to={`/product/${item.slug}`}
        className="relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden bg-[#F7F4EB] p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#285C3A] sm:p-5"
        aria-label={`View ${item.name}`}
      >
        <img
          src={item.image || PLACEHOLDER_IMAGE}
          alt={item.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4 lg:p-5">
        <p className="mb-1.5 line-clamp-1 min-h-3 text-[9px] font-semibold uppercase leading-3 tracking-[0.12em] text-[#A87826] sm:text-[10px] sm:leading-4">
          {item.categoryName || "\u00A0"}
        </p>

        <Link
          to={`/product/${item.slug}`}
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285C3A]"
        >
          <h3 className="line-clamp-2 min-h-10 font-serif text-sm font-bold leading-5 text-[#173F2A] transition-colors group-hover:text-[#285C3A] sm:text-base sm:leading-6">
            {item.name}
          </h3>
        </Link>

        <p className="mt-2 min-h-4 line-clamp-1 text-[11px] text-[#697267] sm:text-xs">
          {item.weight || "Pack details available"}
        </p>

        <p className="mt-auto pt-3 text-base font-bold text-[#173F2A] sm:text-lg">
          {formatPrice(item.price)}
        </p>

        <Link
          to={`/product/${item.slug}`}
          className="mt-3 flex min-h-10 w-full items-center justify-center rounded-full bg-[#075D3A] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#064A30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C79A3B] focus-visible:ring-offset-2 sm:mt-4 sm:min-h-11 sm:text-sm"
        >
          View product
          <ChevronRight size={15} className="ml-1" />
        </Link>
      </div>
    </article>
  );
}

export default function ProductDetails() {

  const { slug } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useCart();

  const {

    toggleWishlist,

    isWishlisted: checkIsWishlisted,

  } = useWishlist();

  const [product, setProduct] = useState(null);

  const [allProducts, setAllProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedVariantId, setSelectedVariantId] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [notice, setNotice] = useState("");
  const purchasePanelRef = useRef(null);
  const [hasReachedPurchasePanel, setHasReachedPurchasePanel] = useState(false);
  const [showStickyPurchase, setShowStickyPurchase] = useState(false);

  const [reviews, setReviews] = useState([]);

  const [reviewName, setReviewName] = useState("");

  const [reviewText, setReviewText] = useState("");

  const [reviewRating, setReviewRating] = useState(5);

  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("idle");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");

  const loadProduct = useCallback(async () => {

    setLoading(true);

    setError("");

    setProduct(null);

    setAllProducts([]);

    try {

      const { data, error: queryError } = await supabase

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

          ),

          product_details (

            ingredients,

            allergen_information,

            storage_instructions,

            shelf_life,

            nutritional_information,

            net_weight_description,

            country_of_origin,

            manufacturer_name,

            customer_support_information

          )

        `)

        .eq("slug", slug)

        .eq("status", "active")

        .maybeSingle();

      if (queryError) throw queryError;

      if (!data) {

        setProduct(null);

        return;

      }

      const variants = (data.product_variants || [])

        .filter((variant) => variant.is_active !== false)

        .sort((a, b) => Number(a.price) - Number(b.price));

      const images = sortImages(data.product_images);

      const category = getCategory(data);

      const details = Array.isArray(data.product_details)

        ? data.product_details[0] || {}

        : data.product_details || {};

      setProduct({

        ...data,

        images,

        image: images[0]?.image_url || null,

        category: category?.slug || "",

        categoryName: category?.name || "",

        details,

        variants,

      });

      setSelectedVariantId((current) =>

        variants.some((variant) => variant.id === current)

          ? current

          : variants[0]?.id || ""

      );

      const { data: relatedRows, error: relatedError } =

        await supabase

          .from("products")

          .select(`

            id,

            name,

            slug,

            short_description,

            description,

            status,

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

          .neq("id", data.id)

          .order("name", { ascending: true });

      if (relatedError) throw relatedError;

      setAllProducts(

        (relatedRows || [])

          .map(mapRelatedProduct)

          .filter((item) => item.variants.length > 0)

      );

    } catch (loadError) {

      console.error("Unable to load product:", loadError);

      setError(

        "We couldn't load this product. Please check your connection and try again."

      );

    } finally {

      setLoading(false);

    }

  }, [slug]);

  useEffect(() => {

    let cancelled = false;

    async function load() {

      if (cancelled) return;

      await loadProduct();

    }

    load();

    return () => {

      cancelled = true;

    };

  }, [loadProduct]);

  useEffect(() => {

    setQuantity(1);

    setNotice("");

    setReviews([]);

    setReviewName("");

    setReviewText("");

    setReviewRating(5);

    setReviewMessage("");
    setHasReachedPurchasePanel(false);
    setShowStickyPurchase(false);

  }, [slug]);

  // Load only approved reviews for the current product from Supabase.
  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      if (!product?.id) {
        setReviews([]);
        return;
      }

      setReviewsLoading(true);
      try {
        const { data, error: reviewsError } = await supabase
          .from("product_reviews")
          .select("id, reviewer_name, rating, review_text, created_at")
          .eq("product_id", product.id)
          .eq("is_approved", true)
          .order("created_at", { ascending: false });

        if (reviewsError) throw reviewsError;
        if (cancelled) return;

        setReviews(
          (data || []).map((review) => ({
            id: review.id,
            name: review.reviewer_name,
            comment: review.review_text,
            rating: Number(review.rating),
            date: review.created_at
              ? new Date(review.created_at).toLocaleDateString("en-IN")
              : "",
          }))
        );
      } catch (reviewsError) {
        console.error("Unable to load product reviews:", reviewsError);
        if (!cancelled) {
          setReviews([]);
          setReviewMessage("Customer reviews could not be loaded right now.");
        }
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    }

    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  useEffect(() => {

    if (!notice) return undefined;

    const timeoutId = window.setTimeout(

      () => setNotice(""),

      3000

    );

    return () => window.clearTimeout(timeoutId);

  }, [notice]);

  // Show the compact mobile purchase bar only after the main purchase panel
  // has entered the viewport and then scrolled out of view.
  useEffect(() => {
    const target = purchasePanelRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasReachedPurchasePanel(true);
          setShowStickyPurchase(false);
        } else if (hasReachedPurchasePanel && entry.boundingClientRect.top < 0) {
          setShowStickyPurchase(true);
        } else if (entry.boundingClientRect.top >= 0) {
          setShowStickyPurchase(false);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasReachedPurchasePanel, product?.id, loading]);

  const images = useMemo(() => {

    const validImages = (product?.images || [])

      .map((image) => image.image_url)

      .filter(Boolean);

    return validImages.length

      ? validImages

      : [PLACEHOLDER_IMAGE];

  }, [product]);

  const selectedVariant = useMemo(

    () =>

      product?.variants?.find(

        (variant) => variant.id === selectedVariantId

      ) ||

      product?.variants?.[0] ||

      null,

    [product, selectedVariantId]

  );

  const details = product?.details || {};

  const stockQuantity = Number(

    selectedVariant?.stock_quantity || 0

  );

  const currentPrice = selectedVariant?.price ?? null;

  const available =

    Boolean(selectedVariant) &&

    stockQuantity > 0 &&

    currentPrice !== null;

  const isWishlisted = product

    ? checkIsWishlisted(product.id)

    : false;

  // Prefer products in the same category. If there are fewer than

  // four, fill the remaining slots with other active products.

  const relatedProducts = useMemo(() => {

    if (!product) return [];

    const availableProducts = allProducts.filter(

      (item) => item.id !== product.id

    );

    const sameCategory = availableProducts.filter(

      (item) =>

        product.category &&

        item.category === product.category

    );

    const otherProducts = availableProducts.filter(

      (item) =>

        !sameCategory.some(

          (related) => related.id === item.id

        )

    );

    return [...sameCategory, ...otherProducts].slice(0, 4);

  }, [product, allProducts]);

  const averageRating = reviews.length

    ? reviews.reduce((total, review) => total + review.rating, 0) /

    reviews.length

    : 0;

  const getRatingCount = (rating) =>

    reviews.filter((review) => review.rating === rating).length;

  const showNotice = (message) => setNotice(message);

  const makeSelectedWeight = () => ({

    id: selectedVariant.id,

    variantId: selectedVariant.id,

    sku: selectedVariant.sku,

    label: `${selectedVariant.pack_size_value} ${selectedVariant.pack_size_unit}`,

    price: Number(selectedVariant.price),

  });

  const addSelectedProductToCart = () => {

    if (!product || !selectedVariant) {

      showNotice("Please select an available pack size.");

      return false;

    }

    if (!available) {

      showNotice("This product is currently unavailable.");

      return false;

    }

    if (quantity > stockQuantity) {

      showNotice("The selected quantity exceeds available stock.");

      return false;

    }

    addToCart(

      {

        ...product,

        id: product.id,

        slug: product.slug,

        name: product.name,

        image: product.image,

      },

      quantity,

      makeSelectedWeight()

    );

    return true;

  };

  const handleCheckDelivery = async () => {
    const pincode = deliveryPincode.trim();

    setDeliveryMessage("");
    setDeliveryLocation("");

    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryStatus("invalid");
      setDeliveryMessage("Enter a valid 6-digit PIN code.");
      return;
    }

    setDeliveryStatus("checking");

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );

      if (!response.ok) {
        throw new Error(
          "PIN-code verification is temporarily unavailable. Please try again."
        );
      }

      const result = await response.json();
      const offices = result?.[0]?.PostOffice;

      if (
        result?.[0]?.Status !== "Success" ||
        !Array.isArray(offices) ||
        offices.length === 0
      ) {
        throw new Error(
          "This PIN code could not be verified. Please check it and try again."
        );
      }

      const statesFound = [
        ...new Set(
          offices.map((office) =>
            String(office.State || "").trim().toLowerCase()
          )
        ),
      ];

      if (
        statesFound.length !== 1 ||
        statesFound[0] !== "tamil nadu"
      ) {
        throw new Error(
          "Sorry, we currently deliver only within Tamil Nadu."
        );
      }

      const firstOffice = offices[0];

      setDeliveryStatus("success");
      setDeliveryLocation(
        [firstOffice.District, firstOffice.State]
          .filter(Boolean)
          .join(", ")
      );
      setDeliveryMessage(
        "Good news! Your PIN code is in our supported delivery state."
      );
    } catch (error) {
      setDeliveryStatus("invalid");
      setDeliveryMessage(
        error?.message ||
        "Unable to verify this PIN code. Please try again."
      );
    }
  };


  const handleShareProduct = async () => {
    const productUrl = window.location.href;
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} from Chithu's Natural Products!`,
      url: productUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(productUrl);
      showNotice("Product link copied successfully.");
    } catch (error) {
      if (error?.name !== "AbortError") {
        showNotice("Unable to share this product. Please copy the page link.");
      }
    }
  };


  const handleAddToCart = () => {

    if (addSelectedProductToCart()) {

      showNotice(`${product.name} added to your cart.`);

    }

  };

  const handleBuyNow = () => {

    if (addSelectedProductToCart()) {

      navigate("/checkout");

    }

  };

  const handleReviewSubmit = async (event) => {

    event.preventDefault();

    const trimmedName = reviewName.trim();
    const trimmedText = reviewText.trim();

    if (!trimmedName || !trimmedText) {
      setReviewMessage("Please enter your name and review.");
      return;
    }

    if (!product?.id) {
      setReviewMessage("This product could not be identified. Please refresh and try again.");
      return;
    }

    if (reviewSubmitting) return;

    setReviewSubmitting(true);
    setReviewMessage("");

    try {
      const { error: insertError } = await supabase
        .from("product_reviews")
        .insert({
          product_id: product.id,
          reviewer_name: trimmedName,
          rating: reviewRating,
          review_text: trimmedText,
          is_approved: false,
        });

      if (insertError) throw insertError;

      setReviewName("");
      setReviewText("");
      setReviewRating(5);
      setReviewMessage(
        "Thank you! Your review has been submitted and is awaiting approval."
      );
    } catch (submitError) {
      console.error("Unable to submit product review:", submitError);
      setReviewMessage(
        "We couldn't submit your review. Please try again."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {

    return <GlobalLoader message="Loading product details..." />;

  }

  if (error) {

    return (

      <main className="flex min-h-[65vh] flex-col items-center justify-center bg-[#FAF8F2] px-5 text-center">

        <Package size={42} className="text-[#285C3A]" />

        <h1 className="mt-5 text-2xl font-bold">

          Unable to load product

        </h1>

        <p className="mt-3 max-w-md text-[#657064]">{error}</p>

        <button

          type="button"

          onClick={loadProduct}

          className="mt-6 rounded-full bg-[#285C3A] px-6 py-3 font-semibold text-white"

        >

          Try again

        </button>

      </main>

    );

  }

  if (!product) {

    return (



      <main className="flex min-h-[65vh] flex-col items-center justify-center bg-[#FAF8F2] px-5 text-center">

        <ShoppingBag size={44} className="text-[#285C3A]" />

        <h1 className="mt-5 text-2xl font-bold">

          Product not found

        </h1>

        <p className="mt-2 text-[#657064]">

          This product may have been removed or is no longer available.

        </p>

        <Link

          to="/shop"

          className="mt-6 rounded-full bg-[#285C3A] px-6 py-3 font-semibold text-white"

        >

          <ArrowLeft className="mr-2 inline" size={18} />

          Back to shop

        </Link>

      </main>

    );

  }
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.short_description ||
      product.description ||
      `${product.name} from Chithu's Natural Products`,
    image: images.filter(
      (image) =>
        typeof image === "string" &&
        /^https?:\/\//i.test(image)
    ) || [],
    brand: {
      "@type": "Brand",
      name: "Chithu's Natural Products",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: Number(currentPrice),
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: window.location.href,
    },
  };
  return (

    <main className={`min-h-screen bg-[#FAF8F2] text-[#202820] ${showStickyPurchase ? "pb-24 lg:pb-0" : ""}`}>

      {/* Breadcrumb */}

      <div className="border-b border-[#E3E1D7] bg-white">

        <nav className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-2 px-4 py-4 text-xs text-[#697267] sm:px-6 lg:px-8">

          <Link to="/" className="hover:text-[#285C3A]">

            Home

          </Link>

          <ChevronRight size={14} />

          <Link to="/shop" className="hover:text-[#285C3A]">

            Shop

          </Link>

          {product.categoryName && (

            <>

              <ChevronRight size={14} />

              <Link

                to={`/shop/${product.category}`}

                className="hover:text-[#285C3A]"

              >

                {product.categoryName}

              </Link>

            </>

          )}

          <ChevronRight size={14} />

          <span className="font-medium text-[#202820]">

            {product.name}

          </span>

        </nav>

      </div>


      <>
        <Helmet>
          <title>
            {product.name} | Chithu's Natural Products
          </title>

          <meta
            name="description"
            content={
              product.short_description ||
              `Explore ${product.name} from Chithu's Natural Products. Discover traditional flavours and convenient online ordering.`
            }
          />

          <meta
            property="og:type"
            content="product"
          />

          <meta
            property="og:title"
            content={`${product.name} | Chithu's Natural Products`}
          />

          <meta
            property="og:description"
            content={
              product.short_description ||
              `Discover ${product.name} from Chithu's Natural Products.`
            }
          />

          <meta
            property="og:url"
            content={window.location.href}
          />

          {/* Product image for social sharing */}
          {images?.[0] && (
            <>
              <meta
                property="og:image"
                content={images[0]}
              />

              <meta
                name="twitter:image"
                content={images[0]}
              />
            </>
          )}

          <meta
            name="twitter:card"
            content="summary_large_image"
          />

          <meta
            name="twitter:title"
            content={`${product.name} | Chithu's Natural Products`}
          />

          <meta
            name="twitter:description"
            content={
              product.short_description ||
              `Discover ${product.name} from Chithu's Natural Products.`
            }
          />
          <script type="application/ld+json">
            {JSON.stringify(productSchema)}
          </script>
        </Helmet>

        {/* Main product area */}

        <section className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-8 xl:gap-12">


            {/* Sticky image gallery — desktop only */}
            <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <ProductGallery
                key={product.id}
                product={product}
                images={images}
              />
            </div>

            <div className="min-w-0 rounded-3xl border border-[#E9E3D7] bg-white p-5 shadow-sm sm:p-7 lg:p-8">

              {product.categoryName && (

                <Link

                  to={`/shop/${product.category}`}

                  className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A87826] hover:underline"

                >

                  {product.categoryName}

                </Link>

              )}

              <div className="mt-3 flex items-start justify-between gap-3">
                <h1 className="max-w-[16ch] font-serif text-3xl font-bold leading-tight tracking-tight text-[#173F2A] sm:text-4xl lg:text-[2.65rem]">
                  {product.name}
                </h1>

                <div className="flex shrink-0 items-center gap-2">
                  {/* Share product */}
                  <button
                    type="button"
                    onClick={handleShareProduct}
                    aria-label={`Share ${product.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E0E2D9] bg-white text-[#285C3A] transition hover:bg-[#E7F0E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C79A3B]"
                  >
                    <Share2 size={20} />
                  </button>

                  {/* Wishlist */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    aria-label={
                      isWishlisted
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                    aria-pressed={isWishlisted}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E0E2D9] bg-white transition hover:bg-[#E7F0E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C79A3B]"
                  >
                    <Heart
                      size={22}
                      className={
                        isWishlisted
                          ? "fill-[#B94A48] text-[#B94A48]"
                          : "text-[#285C3A]"
                      }
                    />
                  </button>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#616B60] sm:text-base">

                {product.short_description ||

                  "Explore traditional flavours from Chithu's Natural Products."}

              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">

                {product.is_featured && (

                  <span className="rounded-full bg-[#E7F0E8] px-3 py-1.5 text-xs font-semibold text-[#285C3A]">

                    Featured product

                  </span>

                )}

                <span

                  className={`flex items-center gap-1.5 text-sm font-medium ${available ? "text-[#285C3A]" : "text-[#A33D36]"

                    }`}

                >

                  {available ? (

                    <>

                      <Check size={16} />

                      In stock

                    </>

                  ) : (

                    "Currently unavailable"

                  )}

                </span>

              </div>

              <div className="my-6 border-t border-[#E1DED3]" />

              <div>

                <p className="text-xs uppercase tracking-wider text-[#697267]">

                  Price

                </p>

                <p className="mt-1 text-3xl font-bold text-[#173F2A]">

                  {formatPrice(currentPrice)}

                </p>

                <p className="mt-2 text-xs text-[#747B70]">

                  Delivery charges, if applicable, are calculated at checkout.

                </p>

              </div>

              {/* Variants */}

              {product.variants?.length > 0 && (

                <div className="mt-7">

                  <p className="mb-3 text-sm font-semibold">

                    Select pack size

                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                    {product.variants.map((variant) => {

                      const selected =

                        selectedVariant?.id === variant.id;

                      const inStock =

                        Number(variant.stock_quantity) > 0;

                      return (

                        <button

                          key={variant.id}

                          type="button"

                          onClick={() => {

                            setSelectedVariantId(variant.id);

                            setQuantity(1);

                          }}

                          aria-pressed={selected}

                          className={`rounded-xl border p-3 text-left transition ${selected

                            ? "border-[#285C3A] bg-[#E7F0E8]/60 ring-1 ring-[#285C3A]"

                            : "border-[#DDDCD2] bg-white hover:border-[#285C3A]"

                            }`}

                        >

                          <span className="block text-sm font-semibold">

                            {variant.pack_size_value}{" "}

                            {variant.pack_size_unit}

                          </span>

                          <span className="mt-1 block font-bold text-[#173F2A]">

                            {formatPrice(variant.price)}

                          </span>

                          <span

                            className={`mt-1 block text-xs ${inStock

                              ? "text-[#285C3A]"

                              : "text-[#A33D36]"

                              }`}

                          >

                            {inStock ? "Available" : "Out of stock"}

                          </span>

                        </button>

                      );

                    })}

                  </div>

                </div>

              )}

              {/* Quantity and purchase */}
              <div
                ref={purchasePanelRef}
                className="mt-7 overflow-hidden rounded-2xl border border-[#E0DED4] bg-[#FCFBF7] shadow-sm"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#202820]">
                        Select quantity
                      </p>
                      <p className="mt-1 text-xs text-[#72796F]">
                        {available
                          ? `${stockQuantity} available`
                          : "Currently unavailable"}
                      </p>
                    </div>

                    <div className="flex items-center rounded-full border border-[#D9DDD5] bg-white p-1">
                      <button
                        type="button"
                        disabled={quantity <= 1}
                        onClick={() =>
                          setQuantity((value) => Math.max(1, value - 1))
                        }
                        aria-label="Decrease quantity"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[#285C3A] transition hover:bg-[#E7F0E8] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="min-w-10 text-center text-sm font-bold tabular-nums">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        disabled={!available || quantity >= stockQuantity}
                        onClick={() =>
                          setQuantity((value) =>
                            Math.min(stockQuantity, value + 1)
                          )
                        }
                        aria-label="Increase quantity"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[#285C3A] transition hover:bg-[#E7F0E8] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-[#F0F3EA] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-[#697267]">
                        Selected pack
                      </span>
                      <span className="text-sm font-semibold text-[#173F2A]">
                        {selectedVariant
                          ? `${selectedVariant.pack_size_value} ${selectedVariant.pack_size_unit}`
                          : "No pack selected"}
                      </span>
                    </div>


                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-[#697267]">
                        Price per pack
                      </span>
                      <span className="text-sm font-semibold text-[#173F2A]">
                        {formatPrice(currentPrice)}
                      </span>
                    </div>


                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#DCE4D7] pt-3">
                      <span className="text-sm font-semibold text-[#202820]">
                        Quantity total
                      </span>
                      <span className="text-xl font-bold text-[#173F2A]">
                        {currentPrice !== null && currentPrice !== undefined
                          ? formatPrice(Number(currentPrice) * quantity)
                          : "Price unavailable"}
                      </span>
                    </div>
                  </div>
                  {/* Delivery PIN-code checker */}
                  <div className="mt-7 rounded-2xl border border-[#E0DED4] bg-[#FCFBF7] p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F0E8] text-[#285C3A]">
                        <MapPin size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[#173F2A]">
                          Check delivery availability
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-[#697267]">
                          Enter your 6-digit PIN code to check whether your
                          location is within our current delivery area.
                        </p>

                        <form
                          className="mt-4 flex flex-col gap-2 sm:flex-row"
                          onSubmit={(event) => {
                            event.preventDefault();
                            handleCheckDelivery();
                          }}
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            maxLength={6}
                            value={deliveryPincode}
                            onChange={(event) => {
                              const value = event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6);

                              setDeliveryPincode(value);
                              setDeliveryStatus("idle");
                              setDeliveryMessage("");
                              setDeliveryLocation("");
                            }}
                            placeholder="Enter PIN code"
                            aria-label="Delivery PIN code"
                            className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#D9DDD5] bg-white px-4 text-sm text-[#202820] outline-none transition focus:border-[#285C3A] focus:ring-2 focus:ring-[#285C3A]/15"
                          />

                          <button
                            type="submit"
                            disabled={deliveryStatus === "checking"}
                            className="min-h-11 shrink-0 rounded-xl bg-[#285C3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173F2A] disabled:cursor-wait disabled:opacity-60"
                          >
                            {deliveryStatus === "checking"
                              ? "Checking..."
                              : "Check"}
                          </button>
                        </form>

                        {deliveryMessage && (
                          <div
                            role="status"
                            aria-live="polite"
                            className={`mt-3 rounded-xl p-3 text-sm leading-6 ${deliveryStatus === "success"
                              ? "bg-[#E7F0E8] text-[#285C3A]"
                              : "bg-[#FCEDEA] text-[#9A342D]"
                              }`}
                          >
                            <p className="font-medium">{deliveryMessage}</p>

                            {deliveryStatus === "success" && deliveryLocation && (
                              <p className="mt-1 text-xs">
                                Location: {deliveryLocation}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex items-start gap-2 border-t border-[#E7E4DA] pt-3">
                          <Truck
                            size={17}
                            className="mt-0.5 shrink-0 text-[#285C3A]"
                          />

                          <p className="text-xs leading-5 text-[#697267]">
                            Delivery charge is ₹40 for order subtotals below ₹600
                            and free for subtotals of ₹600 or more. Final charges
                            are calculated at checkout.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Support & Return Policy */}
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Link
                      to="/return-policy"
                      className="group flex items-center gap-3 rounded-xl border border-[#DDD8C8] bg-[#FAF7EF] p-3.5 transition-colors hover:border-[#285C3A]/40 hover:bg-[#E7F0E8]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#285C3A]">
                        <RotateCcw size={19} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-[#242821]">
                          Returns & Refunds
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-600">
                          Read our return policy
                        </span>
                      </span>
                    </Link>

                    {socialLinks.whatsappNumber && (
                      <a
                        href={socialLinks.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-[#DDD8C8] bg-white p-3.5 transition-colors hover:border-[#285C3A]/40 hover:bg-[#E7F0E8]"
                        aria-label="Contact customer support on WhatsApp"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
                          <MessageCircle size={20} />
                        </span>

                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-[#242821]">
                            WhatsApp Support
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-600">
                            Need help? Chat with us
                          </span>
                        </span>
                      </a>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!available}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#285C3A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173F2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C79A3B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ShoppingBag size={18} />
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={!available}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#285C3A] bg-white px-5 py-3 text-sm font-semibold text-[#285C3A] transition hover:bg-[#E7F0E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C79A3B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Buy Now
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#ECEAE2] pt-4 sm:gap-3">
                    <div className="text-center">
                      <Truck className="mx-auto text-[#285C3A]" size={21} />
                      <p className="mt-2 text-[11px] font-medium text-[#465347] sm:text-xs">
                        Delivery
                      </p>
                    </div>

                    <div className="text-center">
                      <ShieldCheck className="mx-auto text-[#285C3A]" size={21} />
                      <p className="mt-2 text-[11px] font-medium text-[#465347] sm:text-xs">
                        Secure order
                      </p>
                    </div>

                    <div className="text-center">
                      <RotateCcw className="mx-auto text-[#285C3A]" size={21} />
                      <p className="mt-2 text-[11px] font-medium text-[#465347] sm:text-xs">
                        Order support
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="flex items-start gap-3 rounded-xl bg-[#EAF0E5] p-4">

                  <Leaf

                    className="mt-0.5 shrink-0 text-[#285C3A]"

                    size={20}

                  />

                  <div>

                    <p className="text-sm font-semibold">Ingredients</p>

                    <p className="mt-1 text-xs leading-5 text-[#606A5F]">

                      See product ingredients and allergen information below.

                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-3 rounded-xl bg-white p-4">

                  <Package

                    className="mt-0.5 shrink-0 text-[#285C3A]"

                    size={20}

                  />

                  <div>

                    <p className="text-sm font-semibold">Pack information</p>

                    <p className="mt-1 text-xs leading-5 text-[#606A5F]">

                      {selectedVariant

                        ? `${selectedVariant.pack_size_value} ${selectedVariant.pack_size_unit}`

                        : details.net_weight_description || "See product label"}

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* Keep any existing sections that follow your main product area */}

      </>



      {/* Product information */}
      <section className="border-y border-[#E1DED3] bg-[#FAF8F2]">
        <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          {/* Section heading */}
          <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E7F0E8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#285C3A]">
              <Leaf size={15} />
              Know your product
            </span>

            <h2 className="mt-4 font-serif text-2xl font-bold text-[#173F2A] sm:text-3xl lg:text-4xl">
              Product Information
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#697267] sm:text-base">
              Everything you need to know about {product.name}, including
              ingredients, pack details, storage, and nutritional information.
            </p>
          </div>

          {/* Quick specification cards */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-[#E4E1D6] bg-white p-4">
              <Package size={21} className="text-[#285C3A]" />
              <p className="mt-3 text-xs text-[#697267]">Selected pack</p>
              <p className="mt-1 break-words text-sm font-semibold text-[#173F2A]">
                {selectedVariant
                  ? `${selectedVariant.pack_size_value} ${selectedVariant.pack_size_unit}`
                  : details.net_weight_description || "Not specified"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E4E1D6] bg-white p-4">
              <Leaf size={21} className="text-[#285C3A]" />
              <p className="mt-3 text-xs text-[#697267]">Ingredients</p>
              <p className="mt-1 text-sm font-semibold text-[#173F2A]">
                {details.ingredients?.trim() ? "Information available" : "Not provided"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E4E1D6] bg-white p-4">
              <ShieldCheck size={21} className="text-[#285C3A]" />
              <p className="mt-3 text-xs text-[#697267]">Shelf life</p>
              <p className="mt-1 break-words text-sm font-semibold text-[#173F2A]">
                {details.shelf_life || "Check product label"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E4E1D6] bg-white p-4">
              <Truck size={21} className="text-[#285C3A]" />
              <p className="mt-3 text-xs text-[#697267]">Availability</p>
              <p className={`mt-1 text-sm font-semibold ${available ? "text-[#285C3A]" : "text-[#A33D36]"
                }`}>
                {available ? "In stock" : "Currently unavailable"}
              </p>
            </div>
          </div>

          {/* Detailed information */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="rounded-2xl border border-[#E4E1D6] bg-white px-5 sm:px-7">
              <Accordion title="Product description" defaultOpen>
                <p className="leading-7">
                  {product.description ||
                    product.short_description ||
                    "A detailed description has not been provided yet."}
                </p>
              </Accordion>

              <Accordion title="Ingredients">
                {details.ingredients?.trim() ? (
                  <p className="leading-7">{details.ingredients}</p>
                ) : (
                  <p>
                    Ingredient information has not been provided. Please check
                    the product packaging before consumption.
                  </p>
                )}
              </Accordion>

              <Accordion title="Allergen information">
                {details.allergen_information?.trim() ? (
                  <p className="leading-7">{details.allergen_information}</p>
                ) : (
                  <p>
                    Allergen information has not been provided here. Check the
                    product label before consumption, especially if you have
                    known food allergies.
                  </p>
                )}
              </Accordion>

              <Accordion title="Storage instructions">
                {details.storage_instructions?.trim() ? (
                  <p className="leading-7">{details.storage_instructions}</p>
                ) : (
                  <p>
                    Please follow the storage instructions printed on the
                    product packaging.
                  </p>
                )}
              </Accordion>
            </div>

            <div className="rounded-2xl border border-[#E4E1D6] bg-white px-5 sm:px-7">
              <Accordion title="Features & specifications" defaultOpen>
                <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-[#697267]">
                      Product name
                    </dt>
                    <dd className="mt-1 break-words font-semibold text-[#173F2A]">
                      {product.name}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-[#697267]">
                      Category
                    </dt>
                    <dd className="mt-1 font-semibold text-[#173F2A]">
                      {product.categoryName || "Not specified"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-[#697267]">
                      Pack size
                    </dt>
                    <dd className="mt-1 font-semibold text-[#173F2A]">
                      {selectedVariant
                        ? `${selectedVariant.pack_size_value} ${selectedVariant.pack_size_unit}`
                        : details.net_weight_description || "Not specified"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-[#697267]">
                      SKU
                    </dt>
                    <dd className="mt-1 break-words font-semibold text-[#173F2A]">
                      {selectedVariant?.sku || "Not specified"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-[#697267]">
                      Shelf life
                    </dt>
                    <dd className="mt-1 font-semibold text-[#173F2A]">
                      {details.shelf_life || "Check product label"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-[#697267]">
                      Country of origin
                    </dt>
                    <dd className="mt-1 font-semibold text-[#173F2A]">
                      {details.country_of_origin || "Not specified"}
                    </dd>
                  </div>
                </dl>
              </Accordion>

              <Accordion title="Nutritional information">
                {details.nutritional_information?.trim() ? (
                  <div className="rounded-xl border border-[#E5E7DD] bg-[#FAFAF6] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Leaf size={19} className="text-[#285C3A]" />
                      <h3 className="font-semibold text-[#173F2A]">
                        Nutrition details
                      </h3>
                    </div>

                    <p className="whitespace-pre-line break-words text-sm leading-7 text-[#515D51]">
                      {details.nutritional_information}
                    </p>

                    <p className="mt-3 border-t border-[#E5E7DD] pt-3 text-xs leading-5 text-[#697267]">
                      Refer to the product label for verified nutritional values.
                    </p>
                  </div>
                ) : (
                  <p className="rounded-xl bg-[#FAFAF6] p-4 leading-6">
                    Nutritional information has not been provided yet. Please
                    refer to the product label for verified values.
                  </p>
                )}
              </Accordion>

              <Accordion title="Manufacturer & customer support">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#697267]">
                      Manufacturer
                    </p>
                    <p className="mt-1 break-words text-[#202820]">
                      {details.manufacturer_name || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#697267]">
                      Customer support
                    </p>
                    <p className="mt-1 break-words text-[#202820]">
                      {details.customer_support_information ||
                        "Please use the contact details on the product packaging or visit our Contact page."}
                    </p>

                    <Link
                      to="/contact"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#285C3A] hover:underline"
                    >
                      Contact us
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </Accordion>

              <Accordion title="Preparation and usage">
                <p className="leading-7">
                  {product.description?.trim()
                    ? "For product-specific preparation and usage, follow the instructions provided on the product packaging."
                    : "Preparation and usage instructions have not been provided here. Please refer to the product packaging."}
                </p>
              </Accordion>
            </div>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-[#777D72]">
            Product details may vary by pack. Always refer to the actual product
            label for ingredients, allergens, storage, and nutritional values.
          </p>
        </div>
      </section>

      {/* Reviews */}

      <section

        id="customer-reviews"

        className="scroll-mt-24 border-b border-[#E1DED3] bg-[#F7F4EB] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"

      >

        <div className="mx-auto max-w-[1500px]">

          <div className="mb-8">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A87826]">

              Customer feedback

            </p>

            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">

              Customer reviews

            </h2>

            <p className="mt-3 text-sm text-[#697267]">

              Share your experience with {product.name}.

            </p>

          </div>

          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">

            <div className="h-fit rounded-2xl border border-[#E1DED3] bg-white p-5 sm:p-7">

              <p className="text-sm font-medium text-[#697267]">

                Average customer rating

              </p>

              <div className="mt-3 flex items-center gap-3">

                <span className="text-5xl font-bold text-[#173F2A]">

                  {reviews.length ? averageRating.toFixed(1) : "—"}

                </span>

                <div>

                  <div className="flex gap-1">

                    {[1, 2, 3, 4, 5].map((star) => (

                      <Star

                        key={star}

                        size={17}

                        className={

                          star <= Math.round(averageRating)

                            ? "fill-[#C79A3B] text-[#C79A3B]"

                            : "text-[#DDD8C8]"

                        }

                      />

                    ))}

                  </div>

                  <p className="mt-1 text-sm text-[#697267]">

                    {reviews.length} reviews

                  </p>

                </div>

              </div>

              <div className="mt-6 space-y-3">

                {[5, 4, 3, 2, 1].map((rating) => {

                  const count = getRatingCount(rating);

                  const percentage = reviews.length

                    ? (count / reviews.length) * 100

                    : 0;

                  return (

                    <div

                      key={rating}

                      className="flex items-center gap-3 text-sm"

                    >

                      <span className="w-12 shrink-0 text-[#697267]">

                        {rating} star

                      </span>

                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#DDD8C8]">

                        <div

                          className="h-full rounded-full bg-[#C79A3B]"

                          style={{ width: `${percentage}%` }}

                        />

                      </div>

                      <span className="w-6 text-right text-[#697267]">

                        {count}

                      </span>

                    </div>

                  );

                })}

              </div>

              <div className="mt-7 border-t border-[#E1DED3] pt-6">

                <h3 className="text-lg font-semibold">Write a review</h3>

                <form

                  onSubmit={handleReviewSubmit}

                  className="mt-5 space-y-4"

                >

                  <div>

                    <label

                      htmlFor="review-name"

                      className="mb-2 block text-sm font-medium"

                    >

                      Your name

                    </label>

                    <input

                      id="review-name"

                      type="text"

                      value={reviewName}

                      onChange={(event) =>

                        setReviewName(event.target.value)

                      }

                      maxLength={80}

                      required

                      placeholder="Enter your name"

                      className="w-full rounded-xl border border-[#DDD8C8] bg-white px-4 py-3 outline-none transition focus:border-[#285C3A] focus:ring-2 focus:ring-[#285C3A]/15"

                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium">

                      Your rating

                    </label>

                    <div className="flex gap-2">

                      {[1, 2, 3, 4, 5].map((star) => (

                        <button

                          key={star}

                          type="button"

                          onClick={() => setReviewRating(star)}

                          aria-label={`Rate ${star} out of 5 stars`}

                          aria-pressed={reviewRating === star}

                          className="rounded-md p-1 transition hover:bg-[#F7F4EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C79A3B]"

                        >

                          <Star

                            size={25}

                            className={

                              star <= reviewRating

                                ? "fill-[#C79A3B] text-[#C79A3B]"

                                : "text-[#DDD8C8]"

                            }

                          />

                        </button>

                      ))}

                    </div>

                  </div>

                  <div>

                    <label

                      htmlFor="review-text"

                      className="mb-2 block text-sm font-medium"

                    >

                      Your review

                    </label>

                    <textarea

                      id="review-text"

                      value={reviewText}

                      onChange={(event) =>

                        setReviewText(event.target.value)

                      }

                      rows={4}

                      maxLength={1500}

                      required

                      placeholder="Tell us about your experience..."

                      className="w-full resize-y rounded-xl border border-[#DDD8C8] bg-white px-4 py-3 outline-none transition focus:border-[#285C3A] focus:ring-2 focus:ring-[#285C3A]/15"

                    />

                  </div>

                  {reviewMessage && (

                    <p role="status" className="text-sm text-[#285C3A]">

                      {reviewMessage}

                    </p>

                  )}

                  <button

                    type="submit"

                    disabled={reviewSubmitting}

                    className="w-full rounded-full bg-[#075D3A] px-5 py-3 font-semibold text-white transition hover:bg-[#064A30] disabled:cursor-not-allowed disabled:opacity-60"

                  >

                    {reviewSubmitting ? "Submitting..." : "Submit review"}

                  </button>

                  <p className="text-xs leading-5 text-[#777D73]">

                    Reviews are saved securely and displayed after approval.

                  </p>

                </form>

              </div>

            </div>

            <div>

              <div className="flex items-center justify-between gap-3 border-b border-[#DDD8C8] pb-4">

                <h3 className="text-xl font-semibold">Recent reviews</h3>

                <span className="text-sm text-[#697267]">

                  {reviews.length} total

                </span>

              </div>

              {reviewsLoading ? (

                <div className="mt-6 rounded-2xl border border-dashed border-[#DDD8C8] bg-white px-5 py-12 text-center text-sm text-[#697267]" role="status">

                  Loading customer reviews...

                </div>

              ) : reviews.length === 0 ? (

                <div className="mt-6 rounded-2xl border border-dashed border-[#DDD8C8] bg-white px-5 py-12 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F0E8]">

                    <Star size={25} className="text-[#285C3A]" />

                  </div>

                  <h4 className="mt-4 text-lg font-semibold">

                    Be the first to review

                  </h4>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#697267]">

                    No approved reviews are available for this product yet.

                  </p>

                </div>

              ) : (

                <div className="divide-y divide-[#DDD8C8]">

                  {reviews.map((review) => (

                    <article key={review.id} className="py-6">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <h4 className="font-semibold">{review.name}</h4>

                          <div className="mt-2 flex gap-1">

                            {[1, 2, 3, 4, 5].map((star) => (

                              <Star

                                key={star}

                                size={15}

                                className={

                                  star <= review.rating

                                    ? "fill-[#C79A3B] text-[#C79A3B]"

                                    : "text-[#DDD8C8]"

                                }

                              />

                            ))}

                          </div>

                        </div>

                        <span className="shrink-0 text-xs text-[#697267]">

                          {review.date}

                        </span>

                      </div>

                      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#697267]">

                        {review.comment}

                      </p>

                    </article>

                  ))}

                </div>

              )}

            </div>

          </div>

        </div>

      </section>

      {/* Related products: same category first, then other products */}

      {relatedProducts.length > 0 && (

        <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

          <div className="mx-auto max-w-[1500px]">

            <div className="flex items-end justify-between gap-6">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A87826]">

                  You may also like

                </p>

                <h2 className="mt-2 font-serif text-2xl font-bold text-[#173F2A] sm:text-3xl">

                  {product.categoryName

                    ? `More from ${product.categoryName}`

                    : "Explore more products"}

                </h2>

              </div>

              <Link

                to={

                  product.category

                    ? `/shop/${product.category}`

                    : "/shop"

                }

                className="hidden text-sm font-semibold text-[#285C3A] hover:text-[#173F2A] sm:block"

              >

                View all →

              </Link>

            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">

              {relatedProducts.map((item) => (

                <RelatedProductCard key={item.id} item={item} />

              ))}

            </div>

            <Link

              to="/shop"

              className="mt-6 inline-flex text-sm font-semibold text-[#285C3A] hover:underline sm:hidden"

            >

              View all products →

            </Link>

          </div>

        </section>

      )}

      {/* Final call to action */}

      <section className="bg-[#FAF8F2] px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">

        <div className="mx-auto max-w-[1500px] overflow-hidden rounded-3xl bg-[#285C3A] px-6 py-12 text-center text-white sm:px-12">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D5A8]">

            Chithu's Natural Products

          </p>

          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl font-bold sm:text-4xl">

            Traditional goodness, made with love.

          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-[#E7F0E8]">

            Explore more products for your everyday family kitchen.

          </p>

          <Link

            to="/shop"

            className="mt-7 inline-flex items-center justify-center rounded-full bg-[#E8D5A8] px-7 py-3 font-semibold text-[#173F2A] transition hover:bg-white"

          >

            Explore products

          </Link>

        </div>

      </section>

      {/* Mobile sticky purchase bar: reuses the existing cart handler and selected variant. */}
      {showStickyPurchase && product && (
        <div
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#E5DFD2] bg-white/95 px-3 pt-3 shadow-[0_-8px_30px_rgba(23,63,42,0.10)] backdrop-blur-md lg:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <img
              src={images[0] || PLACEHOLDER_IMAGE}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl border border-[#E9E3D7] bg-[#F7F4EB] object-contain p-1"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = PLACEHOLDER_IMAGE;
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#173F2A]">{product.name}</p>
              <p className="mt-0.5 text-sm font-bold text-[#285C3A]">{formatPrice(currentPrice)}</p>
              {selectedVariant && (
                <p className="truncate text-[11px] text-[#697267]">
                  {selectedVariant.pack_size_value} {selectedVariant.pack_size_unit} · Qty {quantity}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!available}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#285C3A] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173F2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C79A3B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag size={17} />
              Add
            </button>
          </div>
        </div>
      )}

      {/* Toast notification */}

      {notice && (

        <div

          role="status"

          className="fixed bottom-24 left-1/2 z-[70] flex max-w-[calc(100%-2rem)] sm:bottom-6 -translate-x-1/2 items-center gap-3 rounded-full bg-[#173F2A] px-5 py-3 text-sm font-medium text-white shadow-2xl"

        >

          <span>{notice}</span>

          <button

            type="button"

            onClick={() => setNotice("")}

            className="rounded-full p-1 hover:bg-white/10"

            aria-label="Close notification"

          >

            <X size={15} />

          </button>

        </div>

      )}

    </main>

  );

}
