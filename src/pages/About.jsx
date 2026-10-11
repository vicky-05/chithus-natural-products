import {
  ArrowRight,
  Check,
  Heart,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Wheat,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import aboutHeroImage from "../assets/about-hero.png";
import ourStoryImage from "../assets/our-story.png";
import ingredientsImage from "../assets/ingredients.png";
import traditionalPreparationImage from "../assets/traditional-preparation.png";

// --------------------------------------------------
// Quality Pillars
// --------------------------------------------------

const qualityPillars = [
  {
    icon: Wheat,
    title: "Traditional Preparation",
    description:
      "Inspired by traditional food practices and familiar flavours.",
  },
  {
    icon: Leaf,
    title: "Natural Ingredients",
    description:
      "Carefully selected ingredients form the foundation of our products.",
  },
  {
    icon: Sparkles,
    title: "Native Millets & Grains",
    description:
      "Ancient millets and native grains are part of our product range.",
  },
  {
    icon: Heart,
    title: "Family-Centric Nutrition",
    description:
      "Created with wholesome everyday choices for families in mind.",
  },
  {
    icon: ShieldCheck,
    title: "Hygienic Production",
    description:
      "Careful preparation and hygienic handling are important to us.",
  },
  {
    icon: PackageCheck,
    title: "Made With Care",
    description:
      "Every product is prepared with attention to quality and tradition.",
  },
];


// --------------------------------------------------
// Product Journey
// --------------------------------------------------

const journey = [
  {
    number: "01",
    title: "Choose Ingredients",
    description:
      "Selected grains, millets, herbs, greens and other ingredients.",
  },
  {
    number: "02",
    title: "Traditional Preparation",
    description:
      "Inspired by familiar traditional preparation methods and flavours.",
  },
  {
    number: "03",
    title: "Careful Packing",
    description:
      "Products are prepared and packed with attention to hygiene and quality.",
  },
  {
    number: "04",
    title: "Your Family",
    description:
      "Traditional goodness finds its way into everyday family meals.",
  },
];

// --------------------------------------------------
// About Page
// --------------------------------------------------

export default function About() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");

        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug, description, image_url, sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true });

        if (error) throw error;

        if (!cancelled) {
          setCategories(data || []);
        }
      } catch (error) {
        console.error("Unable to load About page categories:", error);

        if (!cancelled) {
          setCategoriesError(
            "Our collections are temporarily unavailable. Please explore our shop."
          );
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div className="min-h-screen bg-[#FAF7EF]">

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="relative overflow-hidden border-b border-[#E8E1D2] bg-[#F4EFE3]">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-1/2 opacity-50">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full border border-[#D8E2D5]" />

          <div className="absolute left-16 top-20 h-32 w-32 rounded-full border border-[#E8D5A8]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center lg:grid-cols-[1fr_0.85fr]">

          {/* LEFT */}
          <div className="relative z-10 px-4 py-10 sm:px-6 lg:py-16">

            <div className="flex items-center gap-2 text-xs font-medium text-[#667064]">
              <Link
                to="/"
                className="transition hover:text-[#285C3A]"
              >
                Home
              </Link>

              <span>›</span>

              <span className="text-[#285C3A]">
                Our Story
              </span>
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-[#C79A3B]">
              Our Story
            </p>

            <h1 className="mt-2 max-w-xl font-serif text-4xl font-bold tracking-tight text-[#173F2A] sm:text-5xl lg:text-6xl">
              Traditional goodness,
              <br />
              made for today.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#667064] sm:text-base">
              Chithu's Natural Products brings together
              traditional tastes, selected ingredients and
              wholesome food choices for today's families.
            </p>


            <div className="mt-7 flex flex-wrap gap-3">
              {/* Explore Products */}
              <Link
                to="/shop"
                className="btn-primary gap-2 px-6 py-3.5 text-sm"
              >
                Explore Products
                <ArrowRight size={17} />
              </Link>

              {/* Our Belief */}
              <a
                href="#our-belief"
                className="btn-secondary gap-2 px-6 py-3.5 text-sm"
              >
                Our Belief
              </a>
            </div>


            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#667064]">
              <span className="flex items-center gap-2">
                <Check size={14} className="text-[#285C3A]" />
                Traditional Goodness
              </span>

              <span className="flex items-center gap-2">
                <Check size={14} className="text-[#285C3A]" />
                Made With Love
              </span>
            </div>
          </div>

          {/* HERO IMAGE */}
          <div className="relative hidden h-[420px] overflow-hidden lg:block">

            <img
              src={aboutHeroImage}
              alt="Chithu's Natural Products"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Left blend */}
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#F4EFE3] to-transparent" />

            {/* Bottom blend */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#F4EFE3] to-transparent" />

            {/* Brand badge */}
            <div className="absolute right-7 top-7 flex h-28 w-28 rotate-6 items-center justify-center rounded-full bg-[#173F2A] text-center shadow-xl">
              <div>
                <p className="font-serif text-lg font-bold text-white">
                  Chithu's
                </p>

                <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-[#E8D5A8]">
                  Natural
                  <br />
                  Products
                </p>
              </div>
            </div>
          </div>

          {/* MOBILE IMAGE */}
          <div className="relative h-[300px] lg:hidden">
            <img
              src={aboutHeroImage}
              alt="Chithu's Natural Products"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#F4EFE3] to-transparent" />
          </div>
        </div>
      </section>

      {/* ==================================================
          OUR STORY
      ================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">

          {/* IMAGE */}
          <div className="relative mx-auto w-full max-w-lg">

            <div className="absolute -left-5 -top-5 h-28 w-28 rounded-full border border-[#E8D5A8]" />

            <div className="relative overflow-hidden rounded-[30px] bg-[#E7F0E8] p-4">

              <img
                src={ourStoryImage}
                alt="Traditional food preparation and family traditions"
                className="aspect-[4/5] w-full rounded-[24px] object-cover"
              />

              <div className="absolute bottom-8 left-8 rounded-2xl bg-white/95 px-5 py-4 shadow-[0_10px_30px_rgba(36,40,33,0.12)]">
                <p className="font-serif text-xl font-bold text-[#173F2A]">
                  Traditional
                </p>

                <p className="text-xs text-[#667064]">
                  Goodness • Made With Love
                </p>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">
              Why Chithu's?
            </p>

            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight text-[#173F2A] sm:text-4xl lg:text-5xl">
              Keeping the goodness of tradition alive.
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-7 text-[#667064] sm:text-base">

              <p>
                Food carries more than flavour. It carries
                memories, traditions and the way families
                come together.
              </p>

              <p>
                Chithu's Natural Products is built around
                that idea — bringing traditional tastes and
                wholesome ingredients into convenient choices
                for today's homes.
              </p>

              <p>
                From native millets and grains to herbs,
                native greens, traditional sweets, malts,
                dosai mixes and spice blends, our range is
                inspired by familiar food traditions while
                keeping everyday convenience in mind.
              </p>

            </div>

            <div className="mt-7 h-px w-24 bg-[#C79A3B]" />

            <p className="mt-5 font-serif text-xl italic text-[#285C3A]">
              “Traditional Goodness • Made With Love”
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          OUR BELIEF
      ================================================== */}

      <section
        id="our-belief"
        className="relative overflow-hidden bg-[#173F2A] px-4 py-14 sm:px-6 lg:py-20"
      >
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full border border-white/10" />

        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full border border-[#C79A3B]/20" />

        <div className="relative mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#E8D5A8]">
              What We Believe
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Good food begins with good choices.
            </h2>

            <p className="mt-4 text-sm leading-6 text-[#DCE5D8] sm:text-base">
              Our quality principles are rooted in
              traditional preparation, carefully selected
              ingredients and wholesome family nutrition.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {qualityPillars.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <article
                  key={pillar.title}
                  className="rounded-[22px] border border-white/10 bg-white/[0.07] p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.1]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C79A3B]/15 text-[#E8D5A8]">
                    <Icon size={21} strokeWidth={1.7} />
                  </div>

                  <h3 className="mt-4 font-serif text-lg font-bold text-white">
                    {pillar.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[#C9D8CB]">
                    {pillar.description}
                  </p>
                </article>
              );
            })}

          </div>
        </div>
      </section>

      {/* ==================================================
          PHILOSOPHY + INGREDIENTS IMAGE
      ================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">

        <div className="overflow-hidden rounded-[30px] border border-[#E5DCC8] bg-white shadow-[0_12px_40px_rgba(36,40,33,0.04)]">

          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">

            {/* IMAGE */}
            <div className="relative min-h-[330px] lg:min-h-[480px]">
              <img
                src={ingredientsImage}
                alt="Natural grains, millets, spices and ingredients"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/20 lg:to-white/30" />

              <div className="absolute bottom-6 left-6 rounded-full bg-white/95 px-5 py-2.5 text-xs font-bold text-[#173F2A] shadow-lg">
                Natural Ingredients
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex items-center p-7 sm:p-10 lg:p-14">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">
                  Our Philosophy
                </p>

                <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#173F2A] sm:text-4xl">
                  From heritage kitchens to modern homes.
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#667064]">
                  We want traditional food choices to feel
                  approachable, useful and relevant in everyday
                  family life.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">

                  <div className="rounded-2xl bg-[#F4EFE3] p-5">
                    <span className="font-serif text-4xl font-bold text-[#C79A3B]">
                      01
                    </span>

                    <h3 className="mt-4 font-serif text-lg font-bold text-[#173F2A]">
                      Preserve
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[#667064]">
                      Respect the tastes and food traditions
                      passed through generations.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#E7F0E8] p-5">
                    <span className="font-serif text-4xl font-bold text-[#285C3A]">
                      02
                    </span>

                    <h3 className="mt-4 font-serif text-lg font-bold text-[#173F2A]">
                      Nourish
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[#667064]">
                      Bring together wholesome ingredients
                      and everyday nutrition.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FFF5DB] p-5">
                    <span className="font-serif text-4xl font-bold text-[#C79A3B]">
                      03
                    </span>

                    <h3 className="mt-4 font-serif text-lg font-bold text-[#173F2A]">
                      Share
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[#667064]">
                      Make traditional goodness part of more
                      family kitchens.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          PRODUCT JOURNEY
      ================================================== */}

      <section className="bg-[#F4EFE3] px-4 py-14 sm:px-6 lg:py-20">

        <div className="mx-auto max-w-7xl">

          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">

            {/* JOURNEY CONTENT */}
            <div>

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">
                Our Product Journey
              </p>

              <h2 className="mt-3 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
                From ingredients to your family.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667064]">
                Every step is part of bringing traditional
                goodness into your everyday kitchen.
              </p>

              <div className="relative mt-8">

                <div className="absolute bottom-6 left-6 top-6 hidden w-px bg-[#D8CDAF] sm:block" />

                <div className="space-y-3">

                  {journey.map((step) => (
                    <article
                      key={step.number}
                      className="relative flex gap-5 rounded-[22px] border border-[#E5DCC8] bg-white p-5"
                    >
                      <div className="relative z-10 flex h-12 min-w-12 items-center justify-center rounded-full bg-[#173F2A] font-serif text-lg font-bold text-[#E8D5A8]">
                        {step.number}
                      </div>

                      <div>
                        <h3 className="font-serif text-lg font-bold text-[#173F2A]">
                          {step.title}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-[#667064]">
                          {step.description}
                        </p>
                      </div>
                    </article>
                  ))}

                </div>
              </div>
            </div>

            {/* PREPARATION IMAGE */}
            <div className="relative">

              <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full border border-[#C79A3B]/40" />

              <div className="relative overflow-hidden rounded-[30px] border-8 border-white shadow-[0_15px_45px_rgba(36,40,33,0.12)]">

                <img
                  src={traditionalPreparationImage}
                  alt="Traditional preparation"
                  className="aspect-[4/5] w-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#173F2A]/80 to-transparent p-6 pt-20">
                  <p className="font-serif text-2xl font-bold text-white">
                    Traditional Preparation
                  </p>

                  <p className="mt-1 text-xs text-[#E7F0E8]">
                    Inspired by familiar food traditions
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
    COLLECTIONS — LIVE SUPABASE DATA
================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">
              What We Make
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
              Something for every kitchen.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667064]">
              Explore our collections of traditional sweets, wholesome mixes,
              malts, dosai mixes and authentic spice blends.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex w-fit shrink-0 items-center gap-2 text-sm font-bold text-[#285C3A] transition hover:text-[#C79A3B]"
          >
            View All Products
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Loading state */}
        {categoriesLoading && (
          <div
            className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Loading product categories"
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[22px] border border-[#E5DCC8] bg-white p-5"
              >
                <div className="h-8 w-12 rounded bg-[#E7F0E8]" />
                <div className="mt-6 h-5 w-3/4 rounded bg-gray-100" />
                <div className="mt-3 h-3 w-full rounded bg-gray-100" />
                <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!categoriesLoading && categoriesError && (
          <div
            role="status"
            className="mt-8 rounded-2xl border border-[#E5DCC8] bg-white p-6 text-center"
          >
            <p className="text-sm text-[#667064]">{categoriesError}</p>

            <Link
              to="/shop"
              className="mt-4 inline-flex items-center gap-2 font-semibold text-[#285C3A] hover:text-[#C79A3B]"
            >
              Explore Shop
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Empty state */}
        {!categoriesLoading &&
          !categoriesError &&
          categories.length === 0 && (
            <div className="mt-8 rounded-2xl border border-[#E5DCC8] bg-white p-8 text-center">
              <p className="font-serif text-xl font-bold text-[#173F2A]">
                Collections coming soon
              </p>

              <p className="mt-2 text-sm text-[#667064]">
                Visit our shop to explore available products.
              </p>

              <Link
                to="/shop"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#285C3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173F2A]"
              >
                Explore Products
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

        {/* Live category cards */}
        {!categoriesLoading &&
          !categoriesError &&
          categories.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/shop/${category.slug}`}
                  className="group overflow-hidden rounded-[22px] border border-[#E5DCC8] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#C79A3B] hover:shadow-[0_12px_30px_rgba(36,40,33,0.08)]"
                >
                  {/* Category image, when available */}
                  {category.image_url && (
                    <div className="aspect-[16/9] overflow-hidden bg-[#F4EFE3]">
                      <img
                        src={category.image_url}
                        alt={category.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-3xl font-bold text-[#E8D5A8] transition group-hover:text-[#C79A3B]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <ArrowRight
                        size={18}
                        className="text-[#8A8D87] transition group-hover:translate-x-1 group-hover:text-[#285C3A]"
                      />
                    </div>

                    <h3 className="mt-4 break-words font-serif text-lg font-bold text-[#173F2A]">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#667064]">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
      </section>


      {/* ==================================================
          FINAL CTA
      ================================================== */}

      <section className="relative overflow-hidden bg-[#173F2A] px-4 py-16 sm:px-6 lg:py-20">

        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border border-white/10" />

        <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full border border-[#C79A3B]/20" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.7fr]">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#E8D5A8]">
              Bring Tradition Home
            </p>

            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
              A little tradition can make every meal special.
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#DCE5D8] sm:text-base">
              Discover Chithu's range of traditional sweets,
              wholesome mixes, malts, dosai mixes, masalas,
              noodles and pastas.
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#C79A3B] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#D3AA55]"
            >
              Explore Products
              <ArrowRight size={17} />
            </Link>

          </div>

          {/* FINAL IMAGE */}
          <div className="relative mx-auto w-full max-w-md">

            <div className="absolute inset-5 rounded-[30px] border border-[#E8D5A8]/30" />

            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#285C3A] p-4">

              <img
                src={aboutHeroImage}
                alt="Chithu's Natural Products"
                className="aspect-[4/3] w-full rounded-[22px] object-cover"
              />

              <div className="absolute bottom-7 left-7 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#173F2A] shadow-lg">
                Traditional Goodness
              </div>

            </div>
          </div>

        </div>
      </section>

      <div className="h-8 bg-[#FAF7EF]" />
    </div>
  );
}