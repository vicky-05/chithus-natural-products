import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const MAX_REVIEWS = 8;

const benefits = [
  {
    icon: "♧",
    title: "Great Taste",
    subtitle: "Loved by Families",
  },
  {
    icon: "♡",
    title: "Good Quality",
    subtitle: "Carefully Prepared",
  },
  {
    icon: "◈",
    title: "Traditional Flavours",
    subtitle: "Rooted in Our Culture",
  },
  {
    icon: "♧",
    title: "Growing Community",
    subtitle: "With Your Support",
  },
];

function Stars({ rating = 5 }) {
  return (
    <div
      className="flex items-center gap-1 text-[#C79A3B]"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-[15px] sm:text-[17px] ${
            star <= rating ? "" : "text-[#DDD8C8]"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function CustomerAvatar({ initial }) {
  return (
    <div
      className="
        flex h-[58px] w-[58px] shrink-0
        items-center justify-center rounded-full
        border-[3px] border-white bg-[#E8D5A8]
        font-serif text-[24px] font-semibold
        text-[#285C3A] shadow-sm
      "
    >
      {initial}
    </div>
  );
}

function TestimonialCard({ testimonial, featured = false }) {
  return (
    <article
      className={`
        relative min-w-[88%] overflow-hidden
        rounded-[30px] border transition-all duration-300
        sm:min-w-[500px] lg:min-w-0
        ${
          featured
            ? "border-[#285C3A] bg-[#E7F0E8] shadow-[0_18px_45px_rgba(40,92,58,0.14)]"
            : "border-[#E3DCCB] bg-white/90"
        }
      `}
    >
      <span
        className={`pointer-events-none absolute left-6 top-[105px] z-0 font-serif text-[72px] leading-none ${
          featured ? "text-[#285C3A]/20" : "text-[#9BAF91]/45"
        }`}
      >
        “
      </span>

      <span
        className={`pointer-events-none absolute bottom-[65px] right-7 z-0 font-serif text-[72px] leading-none ${
          featured ? "text-[#285C3A]/20" : "text-[#9BAF91]/45"
        }`}
      >
        ”
      </span>

      <div className="relative z-10 p-6 sm:p-7">
        {/* Customer information */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <CustomerAvatar initial={testimonial.initial} />

            <div className="min-w-0">
              <h3 className="font-serif text-[18px] font-semibold text-[#173F2A] sm:text-[20px]">
                {testimonial.name}
              </h3>

              <p className="mt-0.5 text-xs text-[#667064]">
                <span className="mr-1 text-[#C79A3B]">●</span>
                {testimonial.location}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <Stars rating={testimonial.rating} />
          </div>
        </div>

        {/* Customer review */}
        <div className="relative mt-8 min-h-[220px] sm:mt-9 sm:min-h-[225px]">
          <p
            className={`relative z-10 font-serif text-[19px] leading-[1.55] sm:text-[20px] ${
              featured ? "text-[#173F2A]" : "text-[#242821]"
            }`}
          >
            {testimonial.text}
          </p>
        </div>

        {/* Review label */}
        <div className="mt-3 text-center">
          <span
            className="
              inline-flex rounded-full border border-[#C79A3B]/50
              bg-[#FAF7EF] px-5 py-2 text-[9px]
              font-semibold uppercase tracking-[0.18em]
              text-[#285C3A]
            "
          >
            {testimonial.label}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function CustomerLoveSection() {
  const carouselRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadApprovedReviews() {
      try {
        const { data, error } = await supabase
          .from("product_reviews")
          .select(`
            id,
            product_id,
            user_id,
            reviewer_name,
            rating,
            review_text,
            created_at,
            products:products (
              name,
              slug
            )
          `)
          .eq("is_approved", true)
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        const seenProducts = new Set();
        const seenCustomers = new Set();
        const uniqueReviews = [];

        for (const row of data || []) {
          if (!row.product_id || seenProducts.has(row.product_id)) {
            continue;
          }

          const normalizedName = String(
            row.reviewer_name || ""
          )
            .trim()
            .toLocaleLowerCase();

          const customerKey = row.user_id
            ? `user:${row.user_id}`
            : `name:${normalizedName}`;

          if (!normalizedName || seenCustomers.has(customerKey)) {
            continue;
          }

          const name = String(row.reviewer_name).trim();

          seenProducts.add(row.product_id);
          seenCustomers.add(customerKey);

          uniqueReviews.push({
            id: row.id,
            name,
            location:
              row.products?.name || "Chithu's Natural Products",
            initial: name.charAt(0).toUpperCase() || "C",
            rating: Math.max(
              1,
              Math.min(5, Number(row.rating) || 5)
            ),
            text: row.review_text || "",
            label: "Customer Review",
            createdAt: row.created_at,
          });

          if (uniqueReviews.length >= MAX_REVIEWS) {
            break;
          }
        }

        if (!cancelled) {
          setTestimonials(uniqueReviews);
          setActiveDot(0);
        }
      } catch (error) {
        console.error(
          "Unable to load homepage customer reviews:",
          error
        );

        if (!cancelled) {
          setTestimonials([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadApprovedReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  const getCardWidth = () => {
    if (!carouselRef.current) return 0;

    const card = carouselRef.current.querySelector("article");

    return card ? card.offsetWidth + 20 : 0;
  };

  const scrollTestimonials = (direction) => {
    if (!carouselRef.current || testimonials.length === 0) {
      return;
    }

    const container = carouselRef.current;
    const cardWidth = getCardWidth();

    if (!cardWidth) return;

    const nextIndex =
      direction === "next"
        ? Math.min(activeDot + 1, testimonials.length - 1)
        : Math.max(activeDot - 1, 0);

    container.scrollTo({
      left: cardWidth * nextIndex,
      behavior: "smooth",
    });

    setActiveDot(nextIndex);
  };

  const goToTestimonial = (index) => {
    if (!carouselRef.current) return;

    const cardWidth = getCardWidth();

    if (!cardWidth) return;

    carouselRef.current.scrollTo({
      left: cardWidth * index,
      behavior: "smooth",
    });

    setActiveDot(index);
  };

  const handleScroll = () => {
    if (!carouselRef.current || testimonials.length === 0) {
      return;
    }

    const cardWidth = getCardWidth();

    if (!cardWidth) return;

    const index = Math.round(
      carouselRef.current.scrollLeft / cardWidth
    );

    setActiveDot(
      Math.min(
        Math.max(index, 0),
        testimonials.length - 1
      )
    );
  };

  return (
    <section
      className="
        relative overflow-hidden bg-[#FAF7EF]
        py-16 sm:py-20 lg:py-28
      "
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-24 top-20 h-[280px] w-[280px] rounded-full bg-[#E7F0E8] opacity-60" />

      <div className="pointer-events-none absolute -right-28 top-[280px] h-[300px] w-[300px] rounded-full bg-[#E7F0E8] opacity-55" />

      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-[350px] w-[350px] rounded-full bg-[#E8D5A8] opacity-20 blur-3xl" />

      {/* Decorative leaves */}
      <div className="pointer-events-none absolute left-8 top-8 hidden rotate-[-25deg] text-[60px] text-[#285C3A]/30 lg:block">
        ❧
      </div>

      <div className="pointer-events-none absolute right-12 top-24 hidden rotate-[25deg] text-[55px] text-[#285C3A]/25 lg:block">
        ❧
      </div>

      <div className="pointer-events-none absolute bottom-24 left-10 hidden rotate-[20deg] text-[50px] text-[#285C3A]/20 lg:block">
        ❧
      </div>

      <div className="pointer-events-none absolute bottom-32 right-8 hidden rotate-[-20deg] text-[50px] text-[#285C3A]/20 lg:block">
        ❧
      </div>

      <div className="relative mx-auto max-w-[1450px] px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mx-auto max-w-[1000px] text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-[#C79A3B]" />

            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#173F2A]">
              Customer Love
            </span>

            <span className="h-px w-12 bg-[#C79A3B]" />
          </div>

          <h2 className="font-serif text-[44px] font-semibold leading-[0.95] text-[#173F2F] sm:text-[58px] lg:text-[76px]">
            Loved by{" "}
            <span className="text-[#C79A3B]">Families</span>
            <span className="ml-2 inline-block text-[#173F2A]">
              ♡
            </span>
          </h2>

          <h3 className="mt-5 font-serif text-[20px] font-semibold text-[#173F2A] sm:text-[24px]">
            Real families. Real flavours. Real happiness.
          </h3>

          <p className="mx-auto mt-4 max-w-[700px] text-[14px] leading-7 text-[#667064] sm:text-base">
            Here's what our customers say about Chithu's
            Natural Products and how it's becoming a part of
            their everyday meals.
          </p>
        </div>

        {/* Green label */}
        <div className="absolute right-5 top-[170px] hidden rotate-[-4deg] rounded-[8px] bg-[#285C3A] px-7 py-4 shadow-lg lg:block">
          <p className="font-serif text-[17px] italic leading-tight text-white">
            Healthy Food
            <br />
            Happier Families
          </p>

          <div className="mx-auto mt-2 h-1 w-14 rounded-full bg-[#C79A3B]" />
        </div>

        {/* Testimonials */}
        <div className="relative mt-12 sm:mt-16 lg:mt-20">
          {/* Previous button */}
          <button
            type="button"
            onClick={() => scrollTestimonials("prev")}
            aria-label="Previous testimonials"
            disabled={testimonials.length <= 1}
            className="
              absolute left-[-8px] top-1/2 z-30 hidden
              h-12 w-12 -translate-y-1/2 items-center
              justify-center rounded-full border border-[#DDD8C8]
              bg-white text-2xl text-[#173F2A] shadow-md
              transition-all hover:border-[#285C3A]
              hover:bg-[#285C3A] hover:text-white
              disabled:cursor-not-allowed disabled:opacity-40
              lg:flex
            "
          >
            ←
          </button>

          {/* Next button */}
          <button
            type="button"
            onClick={() => scrollTestimonials("next")}
            aria-label="Next testimonials"
            disabled={testimonials.length <= 1}
            className="
              absolute right-[-8px] top-1/2 z-30 hidden
              h-12 w-12 -translate-y-1/2 items-center
              justify-center rounded-full border border-[#DDD8C8]
              bg-white text-2xl text-[#173F2A] shadow-md
              transition-all hover:border-[#285C3A]
              hover:bg-[#285C3A] hover:text-white
              disabled:cursor-not-allowed disabled:opacity-40
              lg:flex
            "
          >
            →
          </button>

          {/* Cards */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="
              flex gap-5 overflow-x-auto scroll-smooth pb-4
              snap-x snap-mandatory
              [-ms-overflow-style:none]
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
              lg:grid lg:grid-cols-3
              lg:overflow-visible lg:pb-0
            "
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="snap-center lg:snap-none"
              >
                <TestimonialCard
                  testimonial={testimonial}
                  featured={index === 1}
                />
              </div>
            ))}
          </div>

          {/* Loading and empty states */}
          {loading && (
            <p className="mt-5 text-center text-sm text-[#667064]">
              Loading customer reviews...
            </p>
          )}

          {!loading && testimonials.length === 0 && (
            <p className="mt-5 text-center text-sm text-[#667064]">
              Customer reviews will appear here after approval.
            </p>
          )}
        </div>

        {/* Carousel dots */}
        {testimonials.length > 1 && (
          <div className="mt-7 flex justify-center gap-2">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                type="button"
                onClick={() => goToTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={activeDot === index ? "true" : undefined}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${
                    activeDot === index
                      ? "w-7 bg-[#173F2A]"
                      : "w-2 bg-[#C8CDBD]"
                  }
                `}
              />
            ))}
          </div>
        )}

        {/* Mobile swipe hint */}
        <p className="mt-3 text-center text-[10px] uppercase tracking-[0.15em] text-[#667064] lg:hidden">
          Swipe to explore
        </p>

        {/* Bottom benefit ribbon */}
        <div className="relative mt-12 overflow-hidden rounded-[34px] border border-[#E1D9C7] bg-[#F4EEDC] shadow-[0_12px_35px_rgba(40,92,58,0.06)] sm:mt-16">
          <div className="pointer-events-none absolute left-3 top-2 rotate-[-25deg] text-[38px] text-[#285C3A]/20">
            ❧
          </div>

          <div className="pointer-events-none absolute bottom-2 right-3 rotate-[25deg] text-[38px] text-[#285C3A]/20">
            ❧
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className={`
                  flex items-center gap-3 px-5 py-5
                  sm:px-7 sm:py-7 lg:px-8
                  ${index < 2 ? "border-b border-[#DDD3B9]" : ""}
                  ${
                    index % 2 === 0
                      ? "border-r border-[#DDD3B9]"
                      : ""
                  }
                  lg:border-b-0 lg:border-r
                  lg:last:border-r-0
                `}
              >
                <div
                  className={`
                    flex h-12 w-12 shrink-0 items-center
                    justify-center rounded-full text-xl
                    ${
                      index % 2 === 0
                        ? "bg-[#DCE6C9] text-[#285C3A]"
                        : "bg-[#F2D99E] text-[#285C3A]"
                    }
                  `}
                >
                  {benefit.icon}
                </div>

                <div>
                  <h3 className="font-serif text-[15px] font-semibold leading-tight text-[#173F2A] sm:text-[18px]">
                    {benefit.title}
                  </h3>

                  <p className="mt-1 text-[10px] text-[#667064] sm:text-xs">
                    {benefit.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Organic bottom edge */}
      <div className="pointer-events-none absolute bottom-[-1px] left-0 h-5 w-full bg-[#173F2A] [clip-path:ellipse(55%_100%_at_50%_100%)]" />
    </section>
  );
}