import productImage from "../assets/chithu-product (2).png";

const reasons = [
  {
    icon: "◈",
    title: "Traditional Wisdom",
    description:
      "Inspired by time-tested recipes and home-style preparations.",
  },
  {
    icon: "✦",
    title: "Natural Ingredients",
    description:
      "Made with native millets, herbs, spices and wholesome ingredients.",
  },
  {
    icon: "♡",
    title: "Healthy Choice",
    description:
      "Nutritious products for you and your family's well-being.",
  },
  {
    icon: "◎",
    title: "Quality You Can Trust",
    description:
      "Prepared with care, clean and hygienic processing.",
  },
  {
    icon: "♧",
    title: "For All Generations",
    description:
      "Traditional taste loved by both young and old.",
  },
];

const bottomFeatures = [
  {
    icon: "✦",
    title: "Pure & Wholesome Ingredients",
  },
  {
    icon: "◈",
    title: "Inspired by Traditional Recipes",
  },
  {
    icon: "♡",
    title: "Everyday Nutrition for Families",
  },
  {
    icon: "♧",
    title: "Supporting a Healthier Tomorrow",
  },
];

function ReasonCard({ reason }) {
  return (
    <div className="group flex flex-col items-center text-center">
      {/* Icon */}
      <div
        className="
          flex
          h-[72px]
          w-[72px]
          items-center
          justify-center
          rounded-full
          border-[5px]
          border-[#285C3A]
          bg-[#FAF7EF]
          text-2xl
          text-[#173F2A]
          shadow-[0_5px_20px_rgba(0,0,0,0.12)]
          transition-all
          duration-300
          group-hover:scale-105
          group-hover:border-[#C79A3B]
        "
      >
        {reason.icon}
      </div>

      {/* Title */}
      <h3
        className="
          mt-4
          font-serif
          text-[20px]
          font-semibold
          leading-tight
          text-white
          sm:text-[22px]
        "
      >
        {reason.title}
      </h3>

      {/* Description */}
      <p
        className="
          mt-2
          max-w-[220px]
          text-[12px]
          leading-5
          text-white/70
          sm:text-[13px]
        "
      >
        {reason.description}
      </p>
    </div>
  );
}

export default function WhyChooseUsSection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#FAF7EF]
        py-16
        sm:py-20
        lg:py-28
      "
    >
      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-16
          top-12
          h-40
          w-40
          rounded-full
          bg-[#E7F0E8]
          opacity-60
          blur-2xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-20
          bottom-20
          h-56
          w-56
          rounded-full
          bg-[#E8D5A8]
          opacity-30
          blur-3xl
        "
      />

      <div
        className="
          relative
          mx-auto
          max-w-[1400px]
          px-5
          sm:px-8
          lg:px-12
        "
      >
        {/* =====================================================
            SECTION HEADER
        ====================================================== */}

        <div className="mx-auto max-w-[850px] text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#C79A3B]" />

            <span
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.25em]
                text-[#285C3A]
              "
            >
              Why Choose Chithu's?
            </span>

            <span className="h-px w-10 bg-[#C79A3B]" />
          </div>

          <h2
            className="
              font-serif
              text-[40px]
              font-semibold
              leading-[1]
              text-[#173F2A]
              sm:text-[52px]
              lg:text-[64px]
            "
          >
            Goodness in{" "}
            <span className="text-[#C79A3B]">
              Every Home
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-[720px]
              text-[14px]
              leading-7
              text-[#667064]
              sm:text-base
              sm:leading-8
            "
          >
            We bring together traditional knowledge, natural
            ingredients and careful preparation to give you
            wholesome, tasty products for everyday meals.
          </p>
        </div>

        {/* =====================================================
            MAIN GREEN PANEL
        ====================================================== */}

        <div
          className="
            relative
            mt-12
            overflow-hidden
            rounded-[42px]
            bg-[#173F2A]
            px-5
            py-12
            sm:mt-16
            sm:rounded-[56px]
            sm:px-10
            sm:py-16
            lg:px-16
            lg:py-20
          "
        >
          {/* =================================================
              DECORATIVE CIRCLES
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              left-[-100px]
              top-1/2
              h-[300px]
              w-[300px]
              -translate-y-1/2
              rounded-full
              border
              border-[#C79A3B]/20
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              right-[-120px]
              top-[-80px]
              h-[280px]
              w-[280px]
              rounded-full
              border
              border-white/10
            "
          />

          {/* Gold dots */}
          <span className="absolute left-[15%] top-[25%] h-2 w-2 rounded-full bg-[#C79A3B]" />
          <span className="absolute left-[28%] top-[17%] h-1.5 w-1.5 rounded-full bg-[#C79A3B]" />
          <span className="absolute right-[26%] top-[18%] h-2 w-2 rounded-full bg-[#C79A3B]" />
          <span className="absolute right-[14%] top-[28%] h-1.5 w-1.5 rounded-full bg-[#C79A3B]" />
          <span className="absolute left-[17%] bottom-[26%] h-2 w-2 rounded-full bg-[#C79A3B]" />
          <span className="absolute right-[16%] bottom-[26%] h-2 w-2 rounded-full bg-[#C79A3B]" />

          {/* =================================================
              DESKTOP LAYOUT
          ================================================== */}

          <div className="relative hidden min-h-[720px] lg:block">

            {/* =================================================
                TOP CENTER
            ================================================== */}

            <div
              className="
                absolute
                left-1/2
                top-0
                z-30
                w-[270px]
                -translate-x-1/2
              "
            >
              <ReasonCard reason={reasons[0]} />
            </div>

            {/* =================================================
                LEFT TOP
            ================================================== */}

            <div
              className="
                absolute
                left-0
                top-[150px]
                z-30
                w-[280px]
              "
            >
              <ReasonCard reason={reasons[1]} />
            </div>

            {/* =================================================
                RIGHT TOP
            ================================================== */}

            <div
              className="
                absolute
                right-0
                top-[150px]
                z-30
                w-[280px]
              "
            >
              <ReasonCard reason={reasons[2]} />
            </div>

            {/* =================================================
                LEFT BOTTOM
            ================================================== */}

            <div
              className="
                absolute
                bottom-[25px]
                left-[2%]
                z-30
                w-[280px]
              "
            >
              <ReasonCard reason={reasons[3]} />
            </div>

            {/* =================================================
                RIGHT BOTTOM
            ================================================== */}

            <div
              className="
                absolute
                bottom-[25px]
                right-[2%]
                z-30
                w-[280px]
              "
            >
              <ReasonCard reason={reasons[4]} />
            </div>

            {/* =================================================
                CENTER PRODUCT AREA
            ================================================== */}

            <div
              className="
                absolute
                bottom-[-20px]
                left-1/2
                z-20
                flex
                h-[540px]
                w-[560px]
                -translate-x-1/2
                items-end
                justify-center
              "
            >
              {/* Large green glow */}
              <div
                className="
                  absolute
                  bottom-[25px]
                  left-1/2
                  h-[470px]
                  w-[470px]
                  -translate-x-1/2
                  rounded-full
                  bg-[#285C3A]
                  opacity-80
                "
              />

              {/* Inner soft glow */}
              <div
                className="
                  absolute
                  bottom-[45px]
                  left-1/2
                  h-[370px]
                  w-[370px]
                  -translate-x-1/2
                  rounded-full
                  bg-[#3B704A]
                  opacity-60
                "
              />

              {/* =================================================
                  EXACT CENTER PRODUCT IMAGE
              ================================================== */}

              <img
                src={productImage}
                alt="Chithu's Natural Products"
                className="
                  relative
                  z-30
                  h-[520px]
                  w-auto
                  max-w-[420px]
                  object-contain
                  drop-shadow-[0_28px_35px_rgba(0,0,0,0.38)]
                  transition-transform
                  duration-500
                  hover:scale-[1.03]
                "
              />

              {/* Decorative circles */}
              <div
                className="
                  absolute
                  bottom-[10px]
                  left-[25px]
                  z-10
                  h-[82px]
                  w-[82px]
                  rounded-full
                  bg-[#E8D5A8]
                  opacity-90
                  shadow-lg
                "
              />

              <div
                className="
                  absolute
                  bottom-[35px]
                  right-[10px]
                  z-10
                  h-[68px]
                  w-[68px]
                  rounded-full
                  bg-[#C79A3B]
                  opacity-90
                  shadow-lg
                "
              />

              <div
                className="
                  absolute
                  bottom-[105px]
                  left-[-5px]
                  z-10
                  h-[48px]
                  w-[48px]
                  rounded-full
                  bg-[#E7F0E8]
                "
              />
            </div>
          </div>

          {/* =====================================================
              MOBILE LAYOUT
          ====================================================== */}

          <div className="relative lg:hidden">

            {/* =================================================
                MOBILE CENTER PRODUCT
            ================================================== */}

            <div
              className="
                relative
                mx-auto
                mb-12
                flex
                h-[330px]
                max-w-[360px]
                items-end
                justify-center
              "
            >
              {/* Large glow */}
              <div
                className="
                  absolute
                  bottom-[15px]
                  left-1/2
                  h-[270px]
                  w-[270px]
                  -translate-x-1/2
                  rounded-full
                  bg-[#285C3A]
                "
              />

              {/* Inner glow */}
              <div
                className="
                  absolute
                  bottom-[35px]
                  left-1/2
                  h-[220px]
                  w-[220px]
                  -translate-x-1/2
                  rounded-full
                  bg-[#3B704A]
                  opacity-60
                "
              />

              {/* Exact product image */}
              <img
                src={productImage}
                alt="Chithu's Natural Products"
                className="
                  relative
                  z-20
                  h-[315px]
                  w-auto
                  max-w-[250px]
                  object-contain
                  drop-shadow-[0_22px_28px_rgba(0,0,0,0.38)]
                "
              />

              {/* Decorative circles */}
              <div
                className="
                  absolute
                  bottom-2
                  left-3
                  z-10
                  h-14
                  w-14
                  rounded-full
                  bg-[#E8D5A8]
                "
              />

              <div
                className="
                  absolute
                  bottom-5
                  right-2
                  z-10
                  h-12
                  w-12
                  rounded-full
                  bg-[#C79A3B]
                "
              />
            </div>

            {/* =================================================
                MOBILE BENEFITS
            ================================================== */}

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {reasons.map((reason) => (
                <ReasonCard
                  key={reason.title}
                  reason={reason}
                />
              ))}
            </div>
          </div>
        </div>

        {/* =====================================================
            BOTTOM FEATURE RIBBON
        ====================================================== */}

        <div
          className="
            relative
            mt-6
            overflow-hidden
            rounded-[28px]
            border
            border-[#DDD3B9]
            bg-[#F4EEDC]
            sm:mt-8
            sm:rounded-[34px]
          "
        >
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {bottomFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`
                  flex
                  items-center
                  gap-3
                  px-5
                  py-5
                  sm:px-7
                  sm:py-6
                  lg:px-8
                  lg:py-7

                  ${
                    index < 2
                      ? "border-b border-[#DDD3B9]"
                      : ""
                  }

                  ${
                    index % 2 === 0
                      ? "border-r border-[#DDD3B9]"
                      : ""
                  }

                  lg:border-b-0
                  lg:border-r
                  lg:last:border-r-0
                `}
              >
                {/* Icon */}
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#E8D5A8]
                    text-lg
                    text-[#285C3A]
                  "
                >
                  {feature.icon}
                </div>

                {/* Text */}
                <p
                  className="
                    max-w-[170px]
                    text-xs
                    font-semibold
                    leading-5
                    text-[#285C3A]
                    sm:text-sm
                  "
                >
                  {feature.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}