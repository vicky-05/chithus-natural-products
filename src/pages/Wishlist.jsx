import { Link } from "react-router-dom";

import {
  ArrowRight,
  Heart,
  Leaf,
  ShoppingBag,
  Trash2,
  Sparkles,
} from "lucide-react";

import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import sadChilly from "../assets/sad-chilly.png";

export default function Wishlist() {
  const {
    wishlistItems,
    wishlistCount,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  const formatPrice = (price) =>
    price !== null && price !== undefined
      ? `₹${Number(price).toLocaleString("en-IN")}`
      : "Price coming soon";

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF7EF] text-[#242821]">
      {/* Hero */}
      <section className="relative border-b border-[#E5DDC9]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#E7F0E8] opacity-70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-52 w-52 rounded-full bg-[#E8D5A8] opacity-20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div>
            <div className="mb-7 flex items-center gap-2 text-xs text-[#667064]">
              <Link to="/" className="transition hover:text-[#285C3A]">
                Home
              </Link>
              <span>/</span>
              <span className="font-medium text-[#285C3A]">
                Wishlist
              </span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#D9E4D8] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#285C3A]">
              <Leaf size={15} />
              Your Favourites
            </div>

            <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-[#173F2A] sm:text-6xl lg:text-7xl">
              My Wishlist
              <span className="ml-3 inline-block align-middle text-[#B8892D]">
                <Heart size={35} strokeWidth={1.4} />
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#667064] sm:text-lg">
              A little collection of things you love. Keep your
              favourite products close and find them whenever
              you're ready.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-[#285C3A] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#285C3A]/10 transition hover:-translate-y-0.5 hover:bg-[#173F2A]"
              >
                Explore Products
                <ArrowRight size={17} />
              </Link>

              {wishlistCount > 0 && (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#DDD8C8] bg-white/80 px-5 py-3 text-sm font-medium text-[#667064]">
                  <Heart size={16} className="text-[#B94A48]" />
                  {wishlistCount} saved{" "}
                  {wishlistCount === 1 ? "item" : "items"}
                </div>
              )}
            </div>
          </div>

          {/* Decorative Wishlist Illustration */}
          <div className="relative hidden min-h-[250px] items-center justify-center lg:flex">
            <div className="absolute h-64 w-64 rounded-full border border-[#D9E4D8] bg-[#E7F0E8]/60" />
            <div className="absolute h-48 w-48 rounded-full border border-[#D9C99F] bg-[#F5EBD3]/80" />

            <div className="relative flex h-36 w-36 rotate-[-6deg] items-center justify-center rounded-[36px] border border-white bg-white/90 shadow-xl shadow-[#285C3A]/10">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#F7E8DF]">
                <Heart
                  size={53}
                  strokeWidth={1.3}
                  className="fill-[#B94A48] text-[#B94A48]"
                />
              </div>
            </div>

            <Leaf
              size={38}
              strokeWidth={1.2}
              className="absolute left-[16%] top-[20%] rotate-[-35deg] text-[#719176]"
            />

            <Leaf
              size={30}
              strokeWidth={1.2}
              className="absolute bottom-[18%] right-[18%] rotate-[35deg] text-[#B8892D]"
            />

            <div className="absolute right-0 top-8 rounded-2xl border border-[#E5DDC9] bg-white/90 px-4 py-3 shadow-sm">
              <p className="font-serif text-sm italic text-[#285C3A]">
                Picked with love
              </p>

              <div className="mt-1 flex gap-1">
                {[0, 1, 2].map((item) => (
                  <span
                    key={item}
                    className="h-1.5 w-1.5 rounded-full bg-[#B8892D]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wishlist Summary */}
      {wishlistCount > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
          <div className="flex flex-col gap-5 rounded-3xl border border-[#DCE5D8] bg-[#EAF0E5] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#B94A48] shadow-sm">
                <Heart size={26} />
              </div>

              <div>
                <p className="text-sm text-[#667064]">
                  Your personal collection
                </p>

                <h2 className="mt-1 font-serif text-xl font-semibold text-[#173F2A]">
                  {wishlistCount} favourite{" "}
                  {wishlistCount === 1 ? "product" : "products"}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-[#285C3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173F2A]"
              >
                Continue Shopping
                <ArrowRight size={16} />
              </Link>

              <button
                type="button"
                onClick={clearWishlist}
                className="inline-flex items-center gap-2 rounded-full border border-[#D9BDB6] bg-white/70 px-5 py-3 text-sm font-semibold text-[#B94A48] transition hover:bg-[#F9E9E5]"
              >
                <Trash2 size={15} />
                Clear All
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Wishlist Products */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {wishlistItems.length === 0 ? (
          /* Empty Wishlist — Sad Chilly */
          <div className="relative overflow-hidden rounded-[32px] border border-[#E5DDC9] bg-white px-6 py-12 text-center sm:py-16">
            <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-[#E7F0E8] opacity-70 blur-2xl" />

            <div className="pointer-events-none absolute -bottom-16 -right-10 h-52 w-52 rounded-full bg-[#E8D5A8] opacity-25 blur-2xl" />

            <div className="relative mx-auto max-w-xl">
              <div className="relative mx-auto flex h-56 items-center justify-center sm:h-72">
                <div className="absolute h-48 w-48 rounded-full bg-[#F7F0E2] sm:h-60 sm:w-60" />

                {/* Separate Chilly image asset */}
                <img
                  src={sadChilly}
                  alt="Sad Chilly mascot because your wishlist is empty"
                  className="relative z-10 h-full w-full object-contain drop-shadow-sm transition duration-500 hover:scale-105"
                  loading="lazy"
                />

                <span className="absolute right-[12%] top-[10%] z-20 flex h-11 w-11 rotate-12 items-center justify-center rounded-2xl border border-[#E5DDC9] bg-white text-[#B94A48] shadow-sm sm:right-[16%]">
                  <Heart size={22} strokeWidth={1.6} />
                </span>
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#B8892D]">
                A little love goes a long way
              </p>

              <h2 className="mt-3 font-serif text-3xl font-semibold text-[#173F2A] sm:text-4xl">
                Chilly feels lonely!
              </h2>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#667064] sm:text-base">
                Your wishlist is empty, and our little Chilly is
                feeling sad. Find something you love and tap the
                heart to make Chilly happy!
              </p>

              <Link
                to="/shop"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#285C3A] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#285C3A]/10 transition hover:-translate-y-0.5 hover:bg-[#173F2A]"
              >
                <ShoppingBag size={18} />
                Make Chilly Happy
                <ArrowRight size={17} />
              </Link>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#667064]">
                <Sparkles size={14} className="text-[#B8892D]" />
                Traditional goodness, saved for later
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B8892D]">
                  Saved for later
                </p>

                <h2 className="mt-2 font-serif text-2xl font-semibold text-[#173F2A] sm:text-3xl">
                  Your favourites
                </h2>
              </div>

              <span className="text-sm text-[#667064]">
                {wishlistCount}{" "}
                {wishlistCount === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wishlistItems.map((product) => {
                const hasPrice =
                  product.price !== null &&
                  product.price !== undefined;

                const canAddToCart =
                  product.inStock !== false && hasPrice;

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[26px] border border-[#E3DDCE] bg-white shadow-[0_8px_30px_rgba(40,92,58,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(40,92,58,0.10)]"
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden bg-[#E7F0E8]">
                      <Link
                        to={`/product/${product.slug}`}
                        className="block aspect-[4/3] overflow-hidden"
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-[#667064]">
                            Image coming soon
                          </div>
                        )}
                      </Link>

                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#285C3A] shadow-sm backdrop-blur">
                        <Leaf size={12} />
                        {product.categoryName || product.category}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        aria-label={`Remove ${product.name} from wishlist`}
                        title="Remove from wishlist"
                        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/95 text-[#B94A48] shadow-sm transition hover:scale-105 hover:bg-[#F9E9E5]"
                      >
                        <Heart
                          size={19}
                          className="fill-current"
                        />
                      </button>
                    </div>

                    {/* Product Information */}
                    <div className="p-5">
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="font-serif text-xl font-semibold leading-snug text-[#173F2A] transition-colors hover:text-[#B8892D]">
                          {product.name}
                        </h3>
                      </Link>

                      {product.shortDescription && (
                        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#667064]">
                          {product.shortDescription}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                        {product.weight && (
                          <span className="rounded-full bg-[#F2F0E7] px-3 py-1.5 text-xs text-[#667064]">
                            {product.weight}
                          </span>
                        )}

                        <span className="text-lg font-bold text-[#173F2A]">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      {product.inStock === false && (
                        <p className="mt-3 text-xs font-semibold text-[#B94A48]">
                          Currently out of stock
                        </p>
                      )}

                      <button
                        type="button"
                        disabled={!canAddToCart}
                        onClick={() => addToCart(product, 1)}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#285C3A] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173F2A] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                      >
                        <ShoppingBag size={17} />
                        {!hasPrice
                          ? "Price Unavailable"
                          : product.inStock === false
                            ? "Out of Stock"
                            : "Add to Cart"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-[#8A655B] transition hover:text-[#B94A48]"
                      >
                        <Trash2 size={15} />
                        Remove from Wishlist
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Closing Brand Note */}
      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-[#E3DDCE] bg-[#F1EFE4] px-6 py-7 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#285C3A] sm:flex">
              <Leaf size={23} />
            </div>

            <div>
              <p className="font-serif text-lg font-semibold text-[#173F2A]">
                Good choices begin with good ingredients.
              </p>

              <p className="mt-1 text-sm text-[#667064]">
                Discover the goodness of Chithu's Natural Products.
              </p>
            </div>
          </div>

          <Link
            to="/shop"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#285C3A] transition hover:text-[#B8892D]"
          >
            Shop the collection
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}