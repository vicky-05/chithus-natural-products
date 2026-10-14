import React, { useEffect, useState } from "react";

import heroImage1 from "../assets/chithus-hero.png";
import heroImage2 from "../assets/chithus-hero-2.png";
import heroImage3 from "../../image-optimization-preview/chithus-hero-3.webp";

const heroSlides = [
  {
    image: heroImage1,
    eyebrow: "Traditional Goodness",
    title: (
      <>
        <span className="block">Food that carries</span>
        <span className="block">a little piece of</span>
        <span className="block text-[#BD7918]">tradition.</span>
      </>
    ),
    description:
      "Carefully prepared from traditional recipes, native grains and wholesome ingredients.",
  },

  {
    image: heroImage2,
    eyebrow: "Traditional & Wellness",
    title: (
      <>
        <span className="block">Nourishment rooted</span>
        <span className="block">in our rich</span>
        <span className="block text-[#BD7918]">tradition.</span>
      </>
    ),
    description:
      "Wholesome laddus, health mixes and nourishing malts made with carefully selected ingredients.",
  },

  {
    image: heroImage3,
    eyebrow: "Everyday Kitchen Essentials",
    title: (
      <>
        <span className="block">Authentic flavours</span>
        <span className="block">for every</span>
        <span className="block text-[#BD7918]">kitchen.</span>
      </>
    ),
    description:
      "From traditional dosai mixes and aromatic masalas to noodles and pasta for everyday meals.",
  },
];

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === heroSlides.length - 1 ? 0 : prev + 1
    );
  };

  const previousSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? heroSlides.length - 1 : prev - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // -------------------------------------------------------
  // AUTOPLAY
  // Changes slide every 5 seconds
  // -------------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative overflow-hidden bg-[#FAF7EF]">

      {/* =====================================================
          DESKTOP HERO
      ====================================================== */}

      <div className="relative hidden min-h-[680px] lg:block xl:min-h-[720px]">

        {/* -----------------------------------------------------
            SLIDER IMAGES
        ------------------------------------------------------ */}

        <div className="absolute inset-0 z-0">

          {heroSlides.map((item, index) => (
            <img
              key={index}
              src={item.image}
              alt="Chithu's Natural Products"
              draggable="false"
              className={`
                absolute
                inset-0
                h-full
                w-full
                object-cover
                object-center
                transition-opacity
                duration-1000
                ease-in-out
                ${currentSlide === index
                  ? "opacity-100"
                  : "opacity-0"
                }
              `}
            />
          ))}

        </div>


        {/* -----------------------------------------------------
            DESKTOP CREAM GRADIENT
        ------------------------------------------------------ */}

        <div
          className="absolute inset-0 z-10"
          style={{
            background: `
              linear-gradient(
                90deg,
                rgba(250,247,239,1) 0%,
                rgba(250,247,239,0.99) 20%,
                rgba(250,247,239,0.96) 30%,
                rgba(250,247,239,0.88) 39%,
                rgba(250,247,239,0.65) 49%,
                rgba(250,247,239,0.32) 60%,
                rgba(250,247,239,0.08) 72%,
                rgba(250,247,239,0) 84%
              )
            `,
          }}
        />


        {/* -----------------------------------------------------
            SUBTLE BOTTOM FADE
        ------------------------------------------------------ */}

        <div
          className="absolute inset-x-0 bottom-0 z-10 h-24"
          style={{
            background:
              "linear-gradient(to top, rgba(250,247,239,0.35), transparent)",
          }}
        />


        {/* =====================================================
            DESKTOP CONTENT
        ====================================================== */}

        <div
          className="
            relative
            z-20
            mx-auto
            flex
            min-h-[680px]
            max-w-[1400px]
            items-end
            px-10
            pb-28
            xl:min-h-[720px]
            xl:px-16
            xl:pb-24
          "
        >

          <div className="w-[50%] max-w-[590px]">

            {/* -------------------------------------------------
                EYEBROW
            -------------------------------------------------- */}

            <div className="mb-4 flex items-center gap-3">

              <span className="text-xl text-[#285C3A]">
                🍃
              </span>

              <span
                className="
                  text-sm
                  font-semibold
                  uppercase
                  tracking-[0.28em]
                  text-[#285C3A]
                "
              >
                {slide.eyebrow}
              </span>

            </div>


            {/* -------------------------------------------------
                DECORATIVE LINE
            -------------------------------------------------- */}

            <div
              className="
                mb-7
                h-px
                w-[365px]
                bg-[#C79A3B]/70
              "
            />


            {/* -------------------------------------------------
                HEADING
            -------------------------------------------------- */}

            <h1
              key={`desktop-title-${currentSlide}`}
              className="
                animate-[fadeIn_0.8s_ease-in-out]
                text-[58px]
                font-bold
                leading-[0.98]
                tracking-[-0.045em]
                text-[#063E29]
                xl:text-[70px]
              "
            >
              {slide.title}
            </h1>


            {/* -------------------------------------------------
                DESCRIPTION
            -------------------------------------------------- */}

            <p
              key={`desktop-description-${currentSlide}`}
              className="
                mt-7
                max-w-[500px]
                text-[17px]
                leading-8
                text-[#39423D]
              "
            >
              {slide.description}
            </p>


            {/* -------------------------------------------------
                BUTTONS
            -------------------------------------------------- */}


            <div className="mt-8 flex items-center gap-4">
              {/* Explore Products */}
              <a
                href="/shop"
                className="btn-primary group gap-3 px-7 py-4 shadow-lg"
              >
                <span className="text-lg">🍃</span>

                <span>Explore Products</span>

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>

              {/* Our Story */}
              <a
                href="/about"
                className="btn-secondary px-7 py-4 backdrop-blur-sm"
              >
                Our Story
              </a>
            </div>


          </div>

        </div>


        {/* =====================================================
            DESKTOP LEFT ARROW
        ====================================================== */}

        <button
          type="button"
          onClick={previousSlide}
          aria-label="Previous slide"
          className="
            absolute
            bottom-8
            left-8
            z-30
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-white/90
            text-xl
            text-[#173F2A]
            shadow-md
            backdrop-blur-sm
            transition-all
            duration-300
            hover:scale-105
          "
        >
          ←
        </button>


        {/* =====================================================
            DESKTOP RIGHT ARROW
        ====================================================== */}

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="
            absolute
            bottom-8
            right-8
            z-30
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-white/90
            text-xl
            text-[#173F2A]
            shadow-md
            backdrop-blur-sm
            transition-all
            duration-300
            hover:scale-105
          "
        >
          →
        </button>


        {/* =====================================================
            DESKTOP SLIDER DOTS
        ====================================================== */}

        <div
          className="
            absolute
            bottom-10
            left-1/2
            z-30
            flex
            -translate-x-1/2
            items-center
            gap-3
          "
        >

          {heroSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`
                h-3
                rounded-full
                transition-all
                duration-300
                ${currentSlide === index
                  ? "w-8 bg-[#00512F]"
                  : "w-3 bg-[#173F2A]/30 hover:bg-[#173F2A]/50"
                }
              `}
            />
          ))}

        </div>

      </div>


      {/* =====================================================
          MOBILE HERO
      ====================================================== */}

      <div className="relative block lg:hidden">

        <div
          className="
            relative
            min-h-[760px]
            overflow-hidden
            sm:min-h-[820px]
          "
        >

          {/* -------------------------------------------------
              MOBILE SLIDER IMAGES
          -------------------------------------------------- */}

          <div className="absolute inset-0 z-0">

            {heroSlides.map((item, index) => (
              <img
                key={index}
                src={item.image}
                alt="Chithu's Natural Products"
                draggable="false"
                className={`
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  object-[70%_0%]
                  sm:object-[68%_0%]
                  transition-opacity
                  duration-1000
                  ease-in-out
                  ${currentSlide === index
                    ? "opacity-100"
                    : "opacity-0"
                  }
                `}
              />
            ))}

          </div>


          {/* -------------------------------------------------
              MOBILE VERTICAL FADE
          -------------------------------------------------- */}

          <div
            className="absolute inset-0 z-10"
            style={{
              background: `
                linear-gradient(
                  to bottom,
                  rgba(250,247,239,0.00) 0%,
                  rgba(250,247,239,0.00) 20%,
                  rgba(250,247,239,0.06) 30%,
                  rgba(250,247,239,0.18) 40%,
                  rgba(250,247,239,0.42) 49%,
                  rgba(250,247,239,0.70) 58%,
                  rgba(250,247,239,0.91) 67%,
                  rgba(250,247,239,0.98) 74%,
                  rgba(250,247,239,1) 79%,
                  rgba(250,247,239,1) 100%
                )
              `,
            }}
          />


          {/* =================================================
              MOBILE CONTENT
          ================================================== */}

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              z-20
              px-5
              pb-8
              pt-32
              sm:px-8
              sm:pb-10
            "
          >

            {/* -------------------------------------------------
                EYEBROW
            -------------------------------------------------- */}

            <div
              className="
                mb-3
                flex
                items-center
                gap-2
              "
            >

              <span className="text-lg text-[#285C3A]">
                🍃
              </span>

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-[#285C3A]
                  sm:text-xs
                "
              >
                {slide.eyebrow}
              </span>

            </div>


            {/* -------------------------------------------------
                MOBILE LINE
            -------------------------------------------------- */}

            <div
              className="
                mb-5
                h-px
                w-28
                bg-[#C79A3B]/70
                sm:w-36
              "
            />


            {/* -------------------------------------------------
                MOBILE HEADING
            -------------------------------------------------- */}

            <h1
              key={`mobile-title-${currentSlide}`}
              className="
                text-[40px]
                font-bold
                leading-[1.02]
                tracking-[-0.04em]
                text-[#063E29]
                sm:text-[50px]
              "
            >
              {slide.title}
            </h1>


            {/* -------------------------------------------------
                MOBILE DESCRIPTION
            -------------------------------------------------- */}

            <p
              key={`mobile-description-${currentSlide}`}
              className="
                mt-4
                max-w-[420px]
                text-[14px]
                leading-6
                text-[#39423D]
                sm:text-[15px]
                sm:leading-7
              "
            >
              {slide.description}
            </p>


            {/* -------------------------------------------------
                MOBILE BUTTONS
            -------------------------------------------------- */}

            <div
              className="
                mt-5
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >

              {/* Explore Products */}

              <a
                href="/shop"
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#00512F]
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  transition
                  active:scale-[0.98]
                  sm:w-auto
                  sm:px-7
                "
              >

                <span>
                  🍃
                </span>

                <span>
                  Explore Products
                </span>

                <span>
                  →
                </span>

              </a>


              {/* Our Story */}

              <a
                href="/about"
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#285C3A]
                  bg-[#FAF7EF]/75
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-[#285C3A]
                  backdrop-blur-sm
                  transition
                  active:scale-[0.98]
                  sm:w-auto
                  sm:px-7
                "
              >
                Our Story
              </a>

            </div>

          </div>


          {/* =================================================
              MOBILE SLIDER DOTS
          ================================================== */}

          <div
            className="
              absolute
              bottom-3
              left-1/2
              z-30
              flex
              -translate-x-1/2
              items-center
              gap-2.5
            "
          >

            {heroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`
                  h-2.5
                  rounded-full
                  transition-all
                  duration-300
                  ${currentSlide === index
                    ? "w-7 bg-[#00512F]"
                    : "w-2.5 bg-[#173F2A]/25"
                  }
                `}
              />
            ))}

          </div>

        </div>

      </div>

    </section>
  );
}

export default HeroSection;