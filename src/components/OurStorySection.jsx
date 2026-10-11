import { Link } from "react-router-dom";
import storyImage from "../assets/our-story.png";

const highlights = [
  {
    icon: "◈",
    title: "Traditional Recipes",
    description: "Inspired by our cultural heritage",
  },
  {
    icon: "✦",
    title: "Natural Ingredients",
    description: "Native millets, herbs and spices",
  },
  {
    icon: "♡",
    title: "Made With Care",
    description: "For healthy family meals",
  },
];

const bottomFeatures = [
  {
    icon: "❋",
    value: "100%",
    title: "Natural Ingredients",
  },
  {
    icon: "◉",
    value: "",
    title: "Traditional Formulations",
  },
  {
    icon: "♧",
    value: "",
    title: "For All Generations",
  },
  {
    icon: "⌁",
    value: "",
    title: "Proudly Made in India",
  },
];

export default function OurStorySection() {
  return (
    <section className="relative overflow-hidden bg-[#FAF7EF] py-16 sm:py-20 lg:py-28">
      {/* Decorative background elements */}
      <div
        className="
          pointer-events-none
          absolute
          -left-32
          top-20
          h-72
          w-72
          rounded-full
          bg-[#E7F0E8]
          opacity-60
          blur-[2px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-20
          h-96
          w-96
          rounded-full
          bg-[#E8D5A8]
          opacity-20
        "
      />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        {/* ================= MAIN STORY ================= */}
        <div
          className="
            grid
            items-center
            gap-10
            lg:grid-cols-[1.05fr_0.95fr]
            lg:gap-16
          "
        >
          {/* ================= IMAGE SIDE ================= */}
          <div className="relative">
            {/* Main image frame */}
            <div
              className="
                relative
                overflow-hidden
                rounded-[32px]
                sm:rounded-[42px]
                lg:rounded-[56px]
                lg:rounded-br-[110px]
              "
            >
              <img
                src={storyImage}
                alt="Traditional preparation of Chithu's Natural Products"
                className="
                  h-[430px]
                  w-full
                  object-cover
                  sm:h-[520px]
                  lg:h-[620px]
                "
              />

              {/* Soft image overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#173F2A]/30
                  via-transparent
                  to-transparent
                "
              />
            </div>

            {/* Floating quote */}
            <div
              className="
                absolute
                -right-2
                top-8
                w-[135px]
                rounded-[24px]
                bg-[#173F2A]
                px-5
                py-5
                text-center
                shadow-xl
                sm:-right-5
                sm:w-[160px]
                sm:px-6
                sm:py-6
                lg:-right-8
                lg:top-12
              "
            >
              <p
                className="
                  font-serif
                  text-[20px]
                  italic
                  leading-tight
                  text-[#FAF7EF]
                  sm:text-[23px]
                "
              >
                Good Food
                <br />
                Brighter Days
              </p>

              <span className="mt-2 block text-lg text-[#E8D5A8]">
                ♡
              </span>
            </div>

            {/* Decorative gold circle */}
            <div
              className="
                absolute
                -bottom-5
                left-6
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                border
                border-[#C79A3B]/50
                bg-[#FAF7EF]
                text-3xl
                text-[#285C3A]
                shadow-md
                sm:left-10
              "
            >
              ❋
            </div>

            {/* Small label */}
            <div
              className="
                absolute
                bottom-7
                right-5
                rounded-full
                border
                border-white/30
                bg-[#FAF7EF]/90
                px-4
                py-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.15em]
                text-[#285C3A]
                backdrop-blur-sm
                sm:bottom-9
                sm:right-8
              "
            >
              Traditional Goodness
            </div>
          </div>

          {/* ================= CONTENT SIDE ================= */}
          <div className="relative lg:pl-4 xl:pl-8">
            {/* Eyebrow */}
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-9 bg-[#C79A3B]" />

              <span
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.24em]
                  text-[#285C3A]
                "
              >
                Our Story
              </span>

              <span className="h-px w-9 bg-[#C79A3B]" />
            </div>

            {/* Heading */}
            <h2
              className="
                max-w-[650px]
                font-serif
                text-[40px]
                font-semibold
                leading-[0.98]
                text-[#173F2A]
                sm:text-[52px]
                lg:text-[64px]
                xl:text-[70px]
              "
            >
              From Tradition,
              <span className="block text-[#C79A3B]">
                With Love.
              </span>
            </h2>

            {/* Description */}
            <p
              className="
                mt-6
                max-w-[600px]
                text-[15px]
                leading-7
                text-[#667064]
                sm:text-base
                sm:leading-8
              "
            >
              Chithu's Natural Products brings the goodness of
              traditional food culture to modern homes. We celebrate
              familiar flavours, carefully selected ingredients and
              time-tested food traditions.
            </p>

            <p
              className="
                mt-4
                max-w-[600px]
                text-[15px]
                leading-7
                text-[#667064]
                sm:text-base
                sm:leading-8
              "
            >
              From native millets and herbs to wholesome traditional
              preparations, every product is made with the idea of
              keeping good food close to every family.
            </p>

            {/* ================= HIGHLIGHTS ================= */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="
                    group
                    rounded-[22px]
                    border
                    border-[#DDD8C8]
                    bg-white/65
                    p-4
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#C79A3B]/50
                    hover:shadow-[0_12px_30px_rgba(40,92,58,0.08)]
                    sm:p-5
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      bg-[#E7F0E8]
                      text-lg
                      text-[#285C3A]
                      transition-transform
                      duration-300
                      group-hover:scale-105
                    "
                  >
                    {item.icon}
                  </div>

                  <h3
                    className="
                      mt-4
                      font-serif
                      text-[17px]
                      font-semibold
                      leading-tight
                      text-[#242821]
                    "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                      mt-2
                      text-[11px]
                      leading-5
                      text-[#667064]
                    "
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}

            <div className="mt-8">
              <Link
                to="/about"
                className="btn-primary group gap-3 px-7 py-3.5 text-sm hover:shadow-[0_10px_25px_rgba(23,63,42,0.18)]"
              >
                <span className="text-[#E8D5A8]">❋</span>

                <span>Discover Our Story</span>

                <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>

          </div>
        </div>

        {/* ================= BOTTOM FEATURES ================= */}
        <div
          className="
            mt-16
            overflow-hidden
            rounded-[28px]
            border
            border-[#E3DCCB]
            bg-[#F4EEDC]
            sm:mt-20
            lg:mt-24
          "
        >
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {bottomFeatures.map((item, index) => (
              <div
                key={item.title}
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
                  ${index < 2
                    ? "border-b border-[#DDD3B9]"
                    : ""
                  }
                  ${index % 2 === 0
                    ? "border-r border-[#DDD3B9]"
                    : ""
                  }
                  lg:border-b-0
                  lg:border-r
                  lg:last:border-r-0
                `}
              >
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
                  {item.icon}
                </div>

                <div>
                  {item.value && (
                    <p
                      className="
                        font-serif
                        text-[22px]
                        font-bold
                        leading-none
                        text-[#173F2A]
                      "
                    >
                      {item.value}
                    </p>
                  )}

                  <p
                    className="
                      mt-1
                      text-xs
                      font-semibold
                      leading-4
                      text-[#285C3A]
                      sm:text-sm
                    "
                  >
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}