
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Leaf,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  Headphones,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useGlobalUI } from "../context/GlobalUIContext";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabaseClient";
import sadCart from "../assets/sad-cart.png";

// Replace with your actual business WhatsApp number.
// Include country code, without + or spaces. Example: 919876543210
const WHATSAPP_NUMBER = "YOUR_WHATSAPP_NUMBER";

// Confirm these delivery policies before launching.
const FREE_DELIVERY_MINIMUM = 500;
const DELIVERY_CHARGE = 40;

const RECOMMENDATION_LIMIT = 4;

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const getItemWeight = (item) => {
  const selectedWeight = item.selectedWeight;

  if (selectedWeight && typeof selectedWeight === "object") {
    return (
      selectedWeight.label ||
      selectedWeight.weight ||
      item.weight ||
      "Standard"
    );
  }

  return selectedWeight || item.weight || "Standard";
};

const getItemStock = (item) => {
  const value =
    item.stockQuantity ??
    item.stock_quantity ??
    item.stock ??
    null;

  if (value === null || value === undefined) return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : null;
};

const getProductImage = (images = []) => {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  const sortedImages = [...images].sort((a, b) => {
    if (Boolean(a.is_primary) !== Boolean(b.is_primary)) {
      return a.is_primary ? -1 : 1;
    }

    return Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });

  return sortedImages[0]?.image_url || null;
};

const getActiveVariants = (variants = []) =>
  (Array.isArray(variants) ? variants : [])
    .filter(
      (variant) =>
        variant.is_active === true &&
        Number.isFinite(Number(variant.price)) &&
        Number(variant.price) >= 0
    )
    .sort((a, b) => Number(a.price) - Number(b.price));

const getVariantLabel = (variant) => {
  if (!variant) return "Standard";

  const value = variant.pack_size_value;
  const unit = variant.pack_size_unit || "";

  if (value !== null && value !== undefined) {
    return `${value} ${unit}`.trim();
  }

  return "Standard";
};

/**
 * Retrieves recommended products and their active variants from Supabase.
 * No local product catalogue is used.
 */
async function fetchRecommendedProducts(excludedSlugs) {
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
    .limit(100);

  if (error) {
    throw error;
  }

  return (data || [])
    .filter(
      (product) =>
        product.slug &&
        !excludedSlugs.has(product.slug)
    )
    .map((product) => {
      const variants = getActiveVariants(
        product.product_variants
      );

      // Recommendations should have a purchasable variant.
      const availableVariants = variants.filter(
        (variant) => Number(variant.stock_quantity) > 0
      );

      const cheapestVariant = availableVariants[0];

      const categoryRelation = product.product_categories?.find(
        (entry) => entry.categories
      );

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description:
          product.short_description ||
          product.description ||
          "",
        image: getProductImage(product.product_images),
        categoryName: categoryRelation?.categories?.name || "",
        isFeatured: product.is_featured === true,
        price:
          cheapestVariant != null
            ? Number(cheapestVariant.price)
            : null,
        weight: cheapestVariant
          ? getVariantLabel(cheapestVariant)
          : "",
        inStock: Boolean(cheapestVariant),
      };
    })
    .filter(
      (product) =>
        product.inStock &&
        product.price !== null
    )
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) {
        return a.isFeatured ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    })
    .slice(0, RECOMMENDATION_LIMIT);
}

function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
  maxStock,
}) {
  const stockReached =
    maxStock !== null &&
    maxStock !== undefined &&
    quantity >= maxStock;

  return (
    <div>
      <div className="flex h-10 items-center rounded-xl border border-[#DDD8C8] bg-white">
        <button
          type="button"
          onClick={onDecrease}
          disabled={quantity <= 1}
          className="flex h-full w-9 items-center justify-center text-[#242821] transition hover:bg-[#E7F0E8] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>

        <span
          className="flex w-8 justify-center text-sm font-semibold text-[#242821]"
          aria-live="polite"
        >
          {quantity}
        </span>

        <button
          type="button"
          onClick={onIncrease}
          disabled={stockReached}
          className="flex h-full w-9 items-center justify-center text-[#242821] transition hover:bg-[#E7F0E8] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase quantity"
          title={
            stockReached
              ? "Available stock limit reached"
              : "Increase quantity"
          }
        >
          <Plus size={14} />
        </button>
      </div>

      {stockReached && (
        <p className="mt-1 text-[10px] text-[#8A641B]">
          Stock limit reached
        </p>
      )}
    </div>
  );
}

function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  const productUrl = item.slug
    ? `/product/${item.slug}`
    : "/shop";

  const stock = getItemStock(item);
  const weight = getItemWeight(item);

  const stockUnavailable =
    item.inStock === false ||
    (stock !== null && stock < 1);

  return (
    <article className="flex gap-3 border-b border-[#E8E1D2] py-5 first:pt-1 last:border-b-0 sm:gap-4">
      <Link
        to={productUrl}
        className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#F1EBDD] sm:h-32 sm:w-28"
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#285C3A]">
            <Leaf size={30} />
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={productUrl}
              className="block font-serif text-lg font-bold text-[#173F2A] transition hover:text-[#285C3A] sm:text-xl"
            >
              {item.name}
            </Link>

            {(item.categoryName || item.category) && (
              <p className="mt-1 text-xs text-[#667064]">
                {item.categoryName || item.category}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#667064] transition hover:bg-[#FCE8E5] hover:text-[#B94A48] sm:flex"
            aria-label={`Remove ${item.name}`}
            title="Remove item"
          >
            <Trash2 size={17} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {stockUnavailable ? (
            <>
              <AlertCircle
                size={15}
                className="shrink-0 text-[#B94A48]"
              />
              <span className="text-xs font-medium text-[#B94A48]">
                Availability needs confirmation
              </span>
            </>
          ) : (
            <>
              <Check
                size={15}
                className="shrink-0 text-[#3F7D4A]"
              />
              <span className="text-xs font-medium text-[#3F7D4A]">
                Added to your cart
              </span>
            </>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {weight && weight !== "Standard" && (
            <span className="rounded-full bg-[#F3E9D3] px-3 py-1 text-xs font-semibold text-[#6D5324]">
              {weight}
            </span>
          )}

          <QuantityControl
            quantity={item.quantity}
            onDecrease={() => onDecrease(item.id)}
            onIncrease={() => onIncrease(item.id)}
            maxStock={stock}
          />

          <div className="ml-auto text-right">
            <p className="text-lg font-bold text-[#173F2A]">
              {formatPrice(
                Number(item.price) * Number(item.quantity)
              )}
            </p>

            <p className="text-xs text-[#8A8D87]">
              {formatPrice(item.price)} each
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#667064] transition hover:text-[#B94A48] sm:hidden"
        >
          <Trash2 size={13} />
          Remove
        </button>
      </div>
    </article>
  );
}

function TrustBox() {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: "Order Support",
      description: "Help with your order",
    },
    {
      icon: Truck,
      title: "Delivery Updates",
      description: "Confirm delivery details",
    },
    {
      icon: RotateCcw,
      title: "Customer Care",
      description: "We're here to help",
    },
    {
      icon: Headphones,
      title: "Personal Assistance",
      description: "Contact us for support",
    },
  ];

  return (
    <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#DDD8C8] bg-[#DDD8C8]">
      {trustItems.map(({ icon: Icon, title, description }) => (
        <div key={title} className="bg-white p-4">
          <Icon className="text-[#285C3A]" size={23} />

          <h4 className="mt-2 text-sm font-semibold text-[#173F2A]">
            {title}
          </h4>

          <p className="mt-1 text-[11px] text-[#667064]">
            {description}
          </p>
        </div>
      ))}
    </div>
  );
}

function EmptyCart() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="relative overflow-hidden rounded-[30px] border border-[#E5DCC8] bg-white px-6 py-12 text-center shadow-[0_15px_50px_rgba(36,40,33,0.05)] sm:px-12 sm:py-14">
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#E7F0E8] opacity-70 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-16 -right-12 h-52 w-52 rounded-full bg-[#E8D5A8] opacity-30 blur-3xl" />

        <div className="relative mx-auto max-w-xl">
          <div className="relative mx-auto flex h-56 items-center justify-center sm:h-72">
            <div className="absolute h-48 w-48 rounded-full bg-[#F7F0E2] sm:h-60 sm:w-60" />

            <img
              src={sadCart}
              alt="An empty shopping bag"
              className="relative z-10 h-full w-full object-contain drop-shadow-sm transition duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">
            Your Basket
          </p>

          <h1 className="mt-3 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
            Our little bag feels lonely!
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#667064] sm:text-base">
            There's nothing in your cart yet. Add your favourite
            traditional mixes, masalas, and wholesome treats to
            make this little bag happy!
          </p>

          <Link
            to="/shop"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#285C3A] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#285C3A]/10 transition hover:-translate-y-0.5 hover:bg-[#173F2A]"
          >
            <ShoppingBag size={18} />
            Fill My Bag
            <ArrowRight size={17} />
          </Link>

          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-[#667064]">
            <Leaf size={15} className="text-[#285C3A]" />
            Good ingredients. Happier families.
          </div>
        </div>
      </div>
    </section>
  );
}

function RecommendedProduct({ product }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#E5DCC8] bg-white shadow-[0_8px_25px_rgba(36,40,33,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(36,40,33,0.09)]">
      <Link
        to={`/product/${product.slug}`}
        className="block aspect-square overflow-hidden bg-[#F2EBDD]"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#285C3A]">
            <Leaf size={38} />
          </div>
        )}
      </Link>

      <div className="p-3.5">
        <Link
          to={`/product/${product.slug}`}
          className="block truncate font-serif text-base font-bold text-[#173F2A] hover:text-[#285C3A]"
        >
          {product.name}
        </Link>

        {product.weight && (
          <p className="mt-1 text-xs text-[#667064]">
            From {product.weight}
          </p>
        )}

        {product.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#667064]">
            {product.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-[#173F2A]">
            {formatPrice(product.price)}
          </p>

          <Link
            to={`/product/${product.slug}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#285C3A] text-white transition hover:bg-[#173F2A]"
            aria-label={`Choose a pack size of ${product.name}`}
            title="Choose pack size"
          >
            <Plus size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Cart() {
  const {
    cartItems = [],
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { notify } = useGlobalUI();

  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] =
    useState(false);
  const [recommendationsError, setRecommendationsError] =
    useState("");

  const [cartNotice, setCartNotice] = useState("");

  const cartSlugsKey = useMemo(
    () =>
      [...new Set(cartItems.map((item) => item.slug).filter(Boolean))]
        .sort()
        .join("|"),
    [cartItems]
  );

  const loadRecommendations = useCallback(async () => {
    setRecommendationsLoading(true);
    setRecommendationsError("");

    try {
      const excludedSlugs = new Set(
        cartSlugsKey ? cartSlugsKey.split("|") : []
      );

      const recommendations =
        await fetchRecommendedProducts(excludedSlugs);

      setRecommendedProducts(recommendations);
    } catch (error) {
      console.error(
        "Unable to load recommended products from Supabase:",
        error
      );

      setRecommendationsError(
        "We couldn't load product recommendations right now."
      );

      setRecommendedProducts([]);
    } finally {
      setRecommendationsLoading(false);
    }
  }, [cartSlugsKey]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) *
          Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const totalItems = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const deliveryCharge =
    subtotal === 0 || subtotal >= FREE_DELIVERY_MINIMUM
      ? 0
      : DELIVERY_CHARGE;

  const total = subtotal + deliveryCharge;

  const increaseQuantity = (id) => {
    const item = cartItems.find(
      (cartItem) => cartItem.id === id
    );

    if (!item) return;

    const stock = getItemStock(item);

    if (stock !== null && Number(item.quantity) >= stock) {
      setCartNotice(
        `Only ${stock} unit(s) of ${item.name} are recorded as available.`
      );
      return;
    }

    setCartNotice("");
    updateQuantity(id, Number(item.quantity) + 1);
  };

  const decreaseQuantity = (id) => {
    const item = cartItems.find(
      (cartItem) => cartItem.id === id
    );

    if (item && Number(item.quantity) > 1) {
      setCartNotice("");
      updateQuantity(id, Number(item.quantity) - 1);
    }
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    setCartNotice("");
  };

  const handleWhatsAppOrder = () => {
    if (cartItems.length === 0) return;


    if (
      !WHATSAPP_NUMBER ||
      WHATSAPP_NUMBER === "YOUR_WHATSAPP_NUMBER"
    ) {
      notify(
        "Please configure your business WhatsApp number before using WhatsApp ordering.",
        {
          type: "warning",
          title: "WhatsApp ordering unavailable",
        }
      );
      return;
    }


    const orderLines = cartItems
      .map((item, index) => {
        const weight = getItemWeight(item);

        return (
          `${index + 1}. ${item.name} - ${weight} x ` +
          `${item.quantity} = ${formatPrice(
            Number(item.price) * Number(item.quantity)
          )}`
        );
      })
      .join("\n");

    const message = [
      "Hello Chithu's Natural Products,",
      "",
      "I would like to place an order:",
      "",
      orderLines,
      "",
      `Subtotal: ${formatPrice(subtotal)}`,
      `Delivery: ${deliveryCharge === 0
        ? "FREE"
        : formatPrice(deliveryCharge)
      }`,
      `Total: ${formatPrice(total)}`,
      "",
      "Please confirm product availability, final delivery charges, and payment details.",
    ].join("\n");

    const url =
      `https://wa.me/${WHATSAPP_NUMBER}?text=` +
      encodeURIComponent(message);

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#FAF7EF]">
      {/* Cart Hero */}
      <section className="border-b border-[#E8E1D2] bg-[#F4EFE3]">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:py-12">
          <nav className="flex items-center gap-2 text-xs font-medium text-[#667064]">
            <Link to="/" className="hover:text-[#285C3A]">
              Home
            </Link>
            <span>›</span>
            <span className="text-[#285C3A]">Cart</span>
          </nav>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.28em] text-[#C79A3B]">
            Your Basket
          </p>

          <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#173F2A] sm:text-5xl">
            Your Cart
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#667064] sm:text-base">
            Wholesome choices for a healthier, happier family.
          </p>
        </div>
      </section>

      {cartItems.length === 0 ? (
        <>
          <EmptyCart />

          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl font-bold text-[#173F2A]">
                Explore Our Products
              </h2>

              <Link
                to="/shop"
                className="text-sm font-semibold text-[#285C3A] hover:text-[#173F2A]"
              >
                View all
              </Link>
            </div>

            {recommendationsLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#667064]">
                <LoaderCircle
                  size={20}
                  className="animate-spin"
                />
                Loading products from our catalogue...
              </div>
            ) : recommendationsError ? (
              <div className="mt-5 rounded-2xl border border-[#E5DCC8] bg-white p-5 text-sm text-[#667064]">
                <p>{recommendationsError}</p>
                <button
                  type="button"
                  onClick={loadRecommendations}
                  className="mt-3 inline-flex items-center gap-2 font-semibold text-[#285C3A]"
                >
                  <RefreshCw size={15} />
                  Try again
                </button>
              </div>
            ) : recommendedProducts.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
                {recommendedProducts.map((product) => (
                  <RecommendedProduct
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-[#667064]">
                No additional products are available to recommend right now.
              </p>
            )}
          </section>
        </>
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
            {/* Cart Items */}
            <section className="rounded-[26px] border border-[#E5DCC8] bg-white p-5 shadow-[0_10px_35px_rgba(36,40,33,0.04)] sm:p-7">
              <div className="flex items-center justify-between gap-4 border-b border-[#E8E1D2] pb-5">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#173F2A]">
                    Cart Items
                    <span className="ml-2 font-sans text-base font-medium text-[#667064]">
                      ({totalItems})
                    </span>
                  </h2>

                  <p className="mt-1 text-xs text-[#8A8D87]">
                    Review your selected products
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    setCartNotice("");
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#B94A48] transition hover:text-[#8D3030]"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">
                    Clear Cart
                  </span>
                </button>
              </div>

              {cartNotice && (
                <div
                  role="status"
                  className="mt-4 flex items-start gap-2 rounded-xl border border-[#E8D5A8] bg-[#FFF9EC] px-3 py-3 text-sm text-[#78581C]"
                >
                  <Info size={17} className="mt-0.5 shrink-0" />
                  <span>{cartNotice}</span>
                </div>
              )}

              <div>
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              <div className="mt-3 border-t border-[#E8E1D2] pt-5">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#173F2A] transition hover:text-[#C79A3B]"
                >
                  <ArrowLeft size={17} />
                  Continue Shopping
                </Link>
              </div>
            </section>

            {/* Order Summary */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[26px] border border-[#DCE5D8] bg-[#F0F4EA] p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C79A3B]">
                  Your Order
                </p>

                <h2 className="mt-1 font-serif text-2xl font-bold text-[#173F2A]">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#667064]">
                      Subtotal ({totalItems} items)
                    </span>
                    <span className="font-semibold text-[#242821]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-1.5 text-[#667064]">
                      Delivery Charge
                      <Info
                        size={14}
                        className="text-[#C79A3B]"
                      />
                    </span>
                    <span className="font-semibold text-[#242821]">
                      {deliveryCharge === 0
                        ? "FREE"
                        : formatPrice(deliveryCharge)}
                    </span>
                  </div>

                  {deliveryCharge > 0 && (
                    <div className="rounded-xl bg-[#E7F0E8] px-3 py-2 text-xs leading-5 text-[#285C3A]">
                      Add{" "}
                      {formatPrice(
                        FREE_DELIVERY_MINIMUM - subtotal
                      )}{" "}
                      more to qualify for free delivery.
                    </div>
                  )}

                  {deliveryCharge === 0 &&
                    subtotal >= FREE_DELIVERY_MINIMUM && (
                      <div className="rounded-xl bg-[#E7F0E8] px-3 py-2 text-xs leading-5 text-[#285C3A]">
                        <Check
                          size={14}
                          className="mr-1 inline"
                        />
                        You've qualified for free delivery!
                      </div>
                    )}

                  <div className="border-t border-[#D5DDCF] pt-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="font-serif text-lg font-bold text-[#173F2A]">
                          Total
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#667064]">
                          Final charges to be confirmed
                        </p>
                      </div>

                      <p className="font-serif text-3xl font-bold text-[#173F2A]">
                        {formatPrice(total)}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#173F2A] px-5 py-4 text-sm font-bold text-white shadow-[0_8px_25px_rgba(23,63,42,0.18)] transition hover:bg-[#285C3A] focus:outline-none focus:ring-2 focus:ring-[#C79A3B] focus:ring-offset-2"
                >
                  <ShieldCheck size={18} />
                  Proceed to Checkout
                  <ArrowRight size={17} />
                </Link>

                <div className="my-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-[#D5DDCF]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8D87]">
                    OR
                  </span>
                  <span className="h-px flex-1 bg-[#D5DDCF]" />
                </div>

                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#C79A3B] bg-white px-5 py-3.5 text-sm font-bold text-[#8B641B] transition hover:bg-[#FFF9EC]"
                >
                  <MessageCircle size={19} />
                  Order via WhatsApp
                </button>

                <p className="mt-3 text-center text-[10px] leading-4 text-[#8A8D87]">
                  Confirm product availability and delivery charges
                  with us before payment.
                </p>
              </div>

              <TrustBox />
            </aside>
          </div>

          {/* Recommended Products */}
          <section className="mt-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C79A3B]">
                Complete Your Basket
              </p>

              <h2 className="mt-1 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
                You May Also Like
              </h2>

              <p className="mt-1 text-sm text-[#667064]">
                Discover more products from Chithu's Natural Products.
              </p>
            </div>

            {recommendationsLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#667064]">
                <LoaderCircle
                  size={20}
                  className="animate-spin"
                />
                Loading products from Supabase...
              </div>
            ) : recommendationsError ? (
              <div className="mt-5 rounded-2xl border border-[#E5DCC8] bg-white p-5 text-sm text-[#667064]">
                <p>{recommendationsError}</p>
                <button
                  type="button"
                  onClick={loadRecommendations}
                  className="mt-3 inline-flex items-center gap-2 font-semibold text-[#285C3A]"
                >
                  <RefreshCw size={15} />
                  Try again
                </button>
              </div>
            ) : recommendedProducts.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                {recommendedProducts.map((product) => (
                  <RecommendedProduct
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-[#667064]">
                No additional products are available to recommend right now.
              </p>
            )}
          </section>

          {/* Brand Promise */}
          <section className="relative mt-14 overflow-hidden rounded-[28px] bg-[#173F2A] px-6 py-10 sm:px-10 lg:px-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#C79A3B]/30" />

            <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full border border-[#E7F0E8]/10" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8D5A8]">
                  Chithu's Promise
                </p>

                <h2 className="mt-2 max-w-xl font-serif text-3xl font-bold text-white sm:text-4xl">
                  Good ingredients.
                  <br />
                  Happier families.
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-[#DCE5D8]">
                  Explore traditional flavours and wholesome choices
                  for everyday family meals.
                </p>
              </div>

              <Link
                to="/shop"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-[#C79A3B] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#D3AA55]"
              >
                Explore Products
                <ArrowRight size={17} />
              </Link>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
