import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";

const SESSION_KEY = "chithus-announcement-dismissed";

const announcements = [
  {
    id: "natural",
    message: "Discover the Natural Goodness of Chithu's",
    link: "/shop",
    linkText: "Explore",
  },
  {
    id: "traditional",
    message: "Traditional Goodness, Made with Love",
    link: "/shop",
    linkText: "Shop Now",
  },
  {
    id: "collections",
    message: "Explore Our Millet Mixes, Laddus & Masalas",
    link: "/shop",
    linkText: "Discover",
  },
];

export default function AnnouncementBar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (dismissed) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % announcements.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [dismissed]);

  function closeBar() {
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // The bar can still be dismissed if session storage is unavailable.
    }

    setDismissed(true);
  }

  if (dismissed) return null;

  const announcement = announcements[activeIndex];

  return (
    <div
      className="
        relative z-40 w-full overflow-hidden
        border-b border-[#C79A3B]/25
        bg-[#173F2A] text-[#F8EBCB]
      "
      aria-label="Store announcements"
    >
      <div
        key={announcement.id}
        className="
          mx-auto flex min-h-9 max-w-screen-2xl
          items-center justify-center gap-2
          px-10 py-2 text-center
          animate-in fade-in duration-500
          sm:min-h-10 sm:gap-3 sm:px-12
        "
      >
        <Sparkles
          size={14}
          className="hidden shrink-0 text-[#E8D5A8] sm:block"
          aria-hidden="true"
        />

        <p
          aria-live="polite"
          className="
            text-[10px] font-medium leading-4
            tracking-wide sm:text-xs md:text-sm
          "
        >
          {announcement.message}
        </p>

        {announcement.link && (
          <a
            href={announcement.link}
            className="
              inline-flex shrink-0 items-center gap-1
              whitespace-nowrap border-b border-[#C79A3B]/60
              pb-0.5 text-[10px] font-semibold
              text-[#E8D5A8] transition hover:text-white
              sm:text-xs
            "
          >
            {announcement.linkText}
            <ArrowRight size={12} />
          </a>
        )}
      </div>

      <button
        type="button"
        onClick={closeBar}
        aria-label="Dismiss announcement"
        className="
          absolute right-2 top-1/2
          flex h-7 w-7 -translate-y-1/2
          items-center justify-center rounded-full
          text-[#F8EBCB]/75 transition
          hover:bg-white/10 hover:text-white
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-[#E8D5A8]
          sm:right-3
        "
      >
        <X size={14} />
      </button>
    </div>
  );
}
