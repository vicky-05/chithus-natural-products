
import React from "react";
import heroImage from "../assets/chithus-hero-hero.png";

export default function HeroSection() {
  return (
    <section
      aria-label="Chithu's Natural Products"
      className="relative isolate w-full overflow-hidden bg-[#FBF8F0]"
    >
      {/* Full-width hero image */}
      <div className="relative min-h-[680px] sm:min-h-[720px] lg:min-h-[700px] xl:min-h-[760px]">

        <img
          src={heroImage}
          alt="Traditional food products from Chithu's Natural Products"
          fetchPriority="high"
          decoding="async"
          draggable="false"
          className="
            absolute inset-0
            h-full w-full
            object-cover
            object-[65%_center]
            sm:object-center
          "
        />

        

        

        {/* Main content */}
        <div
          className="
            relative z-10 mx-auto flex
            min-h-[680px]
            max-w-[1440px]
            items-end
            px-5 pb-12 pt-[360px]
            sm:min-h-[720px]
            sm:px-8 sm:pb-16
            lg:min-h-[700px]
            lg:items-center
            lg:px-14 lg:py-20
            xl:min-h-[760px]
            xl:px-20
          "
        >
          <div className="w-full max-w-[610px]">

            {/* Eyebrow */}
            <div className="mb-5 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-10 bg-[#B89450]"
              />

              <p
                className="
                  text-xs font-semibold uppercase
                  tracking-[0.2em] text-[#526A48]
                  sm:text-sm sm:tracking-[0.24em]
                "
              >
                Traditional Goodness
              </p>
            </div>

            {/* Headline */}
            <h1
              className="
                text-[42px] font-bold
                leading-[1.08] tracking-[-0.045em]
                text-[#294B36]
                sm:text-5xl
                md:text-6xl
                lg:text-[64px]
                xl:text-[74px]
              "
            >
              Naturally Good.
              <span className="mt-1 block text-[#8B7046]">
                Made for Your Home.
              </span>
            </h1>

            

            {/* Single CTA */}
            <div className="mt-7 sm:mt-9">
              <a
                href="/shop"
                className="
                  group inline-flex min-h-[52px]
                  items-center justify-center gap-4
                  rounded-full bg-[#294B36]
                  px-8 py-4
                  text-sm font-semibold text-white
                  shadow-lg shadow-[#294B36]/15
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#203D2B]
                  hover:shadow-xl
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#294B36]
                  focus-visible:ring-offset-4
                  active:scale-[0.98]
                "
              >
                <span>Shop Now</span>

                <span
                  aria-hidden="true"
                  className="
                    text-lg transition-transform
                    duration-300 group-hover:translate-x-1
                  "
                >
                  →
                </span>
              </a>
            </div>

            

          </div>
        </div>
      </div>
    </section>
  );
}
