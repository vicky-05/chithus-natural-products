import { Link } from "react-router-dom";
import { Home, ShoppingBag, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-[#faf7ef] px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        {/* 404 Illustration */}
        <div className="relative mx-auto mb-8 flex h-44 w-44 items-center justify-center rounded-full bg-[#e8efe2]">
          <ShoppingBag
            size={76}
            strokeWidth={1.4}
            className="text-[#285b3b]"
          />

          <span className="absolute -right-1 top-2 rounded-full bg-[#d7a84b] px-4 py-2 text-sm font-bold text-white shadow-md">
            404
          </span>
        </div>

        {/* Message */}
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#8a9b62]">
          Oops! Wrong aisle
        </p>

        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-[#244b32] sm:text-6xl">
          Page not found
        </h1>

        <p className="mx-auto mb-8 max-w-lg text-base leading-7 text-[#666b60] sm:text-lg">
          Looks like this page wandered off our shelves. Let’s get you back
          to fresh, natural goodness!
        </p>

        {/* Navigation Actions */}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#285b3b] px-7 py-3.5 font-semibold text-white transition hover:bg-[#1d462c] focus:outline-none focus:ring-2 focus:ring-[#285b3b] focus:ring-offset-2"
          >
            <Home size={18} />
            Back to Home
          </Link>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#285b3b] px-7 py-3.5 font-semibold text-[#285b3b] transition hover:bg-[#e8efe2] focus:outline-none focus:ring-2 focus:ring-[#285b3b] focus:ring-offset-2"
          >
            <ShoppingBag size={18} />
            Explore Products
          </Link>
        </div>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#73786d] transition hover:text-[#285b3b]"
        >
          <ArrowLeft size={16} />
          Go back to previous page
        </button>
      </div>
    </main>
  );
}