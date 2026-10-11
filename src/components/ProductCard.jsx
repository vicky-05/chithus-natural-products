import { Link } from "react-router-dom";
import { ShoppingBag, Check } from "lucide-react";
import WishlistButton from "./WishlistButton";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const hasPrice =
    product.price !== null &&
    product.price !== undefined &&
    product.price !== "";

  const hasImage = Boolean(product.image);

  const canAddToCart = product.inStock !== false && hasPrice;

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    addToCart(product, 1);
  };

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#EAE3D6] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#C8D9C9] hover:shadow-[0_12px_32px_rgba(40,92,58,0.10)] sm:rounded-3xl">
      {/* Image area */}
      <div className="relative overflow-hidden bg-[#FAF8F2]">
        <Link
          to={`/product/${product.slug}`}
          className="relative flex h-36 items-center justify-center overflow-hidden p-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#285C3A] sm:h-48 sm:p-5 lg:h-56"
          aria-label={`View ${product.name}`}
        >
          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl bg-[#F1EEE5] px-4 text-center">
              <ShoppingBag
                size={27}
                strokeWidth={1.3}
                className="text-[#9AA594]"
              />
              <span className="text-xs font-medium text-[#667064]">
                Image coming soon
              </span>
            </div>
          )}
        </Link>

        {/* Availability badge */}
        <div className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3">
          {product.inStock === false ? (
            <span className="inline-flex items-center rounded-full border border-red-100 bg-white/95 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-red-600 shadow-sm sm:text-[10px]">
              Sold out
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#DCE9DB] bg-white/95 px-2.5 py-1 text-[9px] font-medium text-[#285C3A] shadow-sm sm:text-[10px]">
              <Check size={11} strokeWidth={2.5} />
              In stock
            </span>
          )}
        </div>

        {/* Wishlist */}
        <div className="absolute right-2.5 top-2.5 z-10 sm:right-3 sm:top-3">
          <WishlistButton product={product} className="!static" />
        </div>

        {/* Subtle bottom image divider */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[#EAE3D6]" />
      </div>

      {/* Product details */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4 lg:p-5">
        {/* Category */}
        <p className="mb-1.5 line-clamp-1 min-h-[14px] text-[9px] font-bold uppercase leading-[14px] tracking-[0.15em] text-[#A17A32] sm:mb-2 sm:text-[10px]">
          {product.categoryName || "\u00A0"}
        </p>

        {/* Name */}
        <Link
          to={`/product/${product.slug}`}
          className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#285C3A]"
        >
          <h3 className="line-clamp-2 min-h-[2.7rem] text-sm font-semibold leading-[1.35rem] text-[#292E27] transition-colors duration-200 group-hover:text-[#285C3A] sm:min-h-[3.25rem] sm:text-base sm:leading-6 lg:text-[17px]">
            {product.name}
          </h3>
        </Link>

        {/* Pack size */}
        <div className="mt-1.5 min-h-5">
          {product.weight ? (
            <p className="line-clamp-1 text-[11px] text-[#777D70] sm:text-xs">
              Pack size: {product.weight}
            </p>
          ) : (
            <span aria-hidden="true">&nbsp;</span>
          )}
        </div>

        {/* Price and action */}
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-[#F0ECE3] pt-3.5 sm:pt-4">
          <div className="min-w-0 flex-1">
            {hasPrice ? (
              <p className="truncate text-lg font-bold leading-6 tabular-nums text-[#173F2A] sm:text-xl">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </p>
            ) : (
              <p className="text-xs font-medium leading-6 text-[#777D70]">
                Price unavailable
              </p>
            )}

            <p className="mt-0.5 text-[10px] text-[#8A8F83] sm:text-[11px]">
              {product.inStock === false
                ? "Currently unavailable"
                : hasPrice
                  ? "Inclusive of listed price"
                  : "Check back soon"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#285C3A] px-3 text-white shadow-sm transition-all duration-200 hover:bg-[#173F2A] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285C3A] focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#D9DED6] disabled:text-[#777D70] disabled:shadow-none sm:h-10 sm:px-4"
            aria-label={`Add ${product.name} to cart`}
            title={
              !hasPrice
                ? "Price unavailable"
                : product.inStock === false
                  ? "Currently out of stock"
                  : "Add to cart"
            }
          >
            <ShoppingBag size={16} strokeWidth={1.8} />
            <span className="text-xs font-semibold sm:text-sm">
              Add
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;