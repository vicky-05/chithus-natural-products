import { ArrowRight, Leaf, Sparkles } from "lucide-react";

import ctaImage from "../assets/health-mixes.png";

function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-[#173F2A]">
      {/* =========================================
          BACKGROUND DECORATION
      ========================================== */}

      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full border border-white/10" />

      <div className="pointer-events-none absolute -right-40 bottom-[-120px] h-[420px] w-[420px] rounded-full border border-[#C79A3B]/20" />

      <div className="pointer-events-none absolute left-[8%] top-[25%] h-40 w-40 rounded-full bg-[#C79A3B]/10 blur-3xl" />

      <div className="pointer-events-none absolute right-[15%] top-[15%] h-52 w-52 rounded-full bg-white/5 blur-3xl" />

      {/* Decorative leaf */}
      <div className="pointer-events-none absolute left-[5%] top-20 hidden text-[#C79A3B]/30 lg:block">
        <Leaf size={100} strokeWidth={0.7} />
      </div>

      <div className="pointer-events-none absolute bottom-16 right-[5%] hidden rotate-180 text-white/10 lg:block">
        <Leaf size={120} strokeWidth={0.7} />
      </div>

      {/* =========================================
          CONTENT
      ========================================== */}

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          {/* =====================================
              LEFT CONTENT
          ====================================== */}

          <div className="max-w-2xl">
            {/* Label */}

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C79A3B]/30 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <Sparkles
                size={14}
                strokeWidth={1.7}
                className="text-[#C79A3B]"
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E8D5A8] sm:text-xs">
                Traditional Goodness
              </span>
            </div>

            {/* Heading */}

            <h2 className="font-serif text-4xl leading-[1.08] text-white sm:text-5xl lg:text-7xl">
              Bring a little
              <br />

              <span className="italic text-[#E8D5A8]">
                tradition
              </span>{" "}
              home.
            </h2>

            {/* Description */}

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
              Discover wholesome foods inspired by traditional recipes,
              natural ingredients and the flavours we grew up loving.
            </p>

            {/* Buttons */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {/* Primary */}

              <a
                href="/shop"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#C79A3B] px-7 py-4 text-sm font-semibold text-[#173F2A] transition-all duration-300 hover:bg-[#E8D5A8] hover:shadow-[0_12px_30px_rgba(199,154,59,0.2)]"
              >
                Explore Products

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>

              {/* Secondary */}

              <a
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5"
              >
                Our Story
              </a>
            </div>

            {/* Trust line */}

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/50">
              <span>Traditional Recipes</span>

              <span className="h-1 w-1 rounded-full bg-[#C79A3B]" />

              <span>Natural Ingredients</span>

              <span className="h-1 w-1 rounded-full bg-[#C79A3B]" />

              <span>Made With Care</span>
            </div>
          </div>

          {/* =====================================
              RIGHT IMAGE
          ====================================== */}

          <div className="relative mx-auto w-full max-w-[500px] lg:ml-auto">
            {/* Glow */}

            <div className="absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C79A3B]/15 blur-3xl" />

            {/* Organic image frame */}

            <div className="relative overflow-hidden rounded-[45%_45%_25%_25%/35%_35%_20%_20%] border border-white/10 bg-[#FAF7EF] p-2 shadow-2xl">
              <div className="overflow-hidden rounded-[44%_44%_24%_24%/34%_34%_19%_19%]">
                <img
                  src={ctaImage}
                  alt="Chithu's Natural Products"
                  className="h-[400px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[480px]"
                />
              </div>
            </div>

            {/* Floating badge */}

            <div className="absolute bottom-5 left-[-8px] flex items-center gap-3 rounded-2xl border border-white/10 bg-[#FAF7EF] px-4 py-3 shadow-xl sm:bottom-8 sm:left-[-25px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
                <Leaf size={19} strokeWidth={1.7} />
              </div>

              <div>
                <p className="text-xs font-semibold text-[#173F2A]">
                  Made With Love
                </p>

                <p className="mt-0.5 text-[10px] text-[#667064]">
                  Traditional goodness
                </p>
              </div>
            </div>

            {/* Gold floating dot */}

            <div className="absolute right-3 top-6 h-5 w-5 rounded-full bg-[#C79A3B] shadow-lg sm:right-[-5px] sm:top-10" />

            <div className="absolute bottom-24 right-[-5px] hidden h-3 w-3 rounded-full bg-[#E8D5A8] sm:block" />
          </div>
        </div>
      </div>

      {/* =========================================
          BOTTOM ORGANIC EDGE
      ========================================== */}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-5 overflow-hidden">
        <div className="absolute -bottom-12 left-[-5%] h-20 w-[110%] rounded-[50%] bg-[#FAF7EF]" />
      </div>
    </section>
  );
}

export default FinalCTASection;