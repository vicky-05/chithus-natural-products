import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import GlobalLoader from "./common/GlobalLoader";

const fallbackDescriptions = {
  "laddus-traditional-sweets": "Traditional taste with natural goodness",
  "health-mixes-powders": "Nutritious blends for a healthier you",
  malts: "Traditional nourishment for all ages",
  "dosai-mixes": "Healthy & tasty everyday",
  "masala-powders": "Authentic flavours for your special dishes",
  noodles: "Tasty & healthy noodles for everyone",
  pastas: "Wholesome pasta made with goodness",
};

function CollectionCard({ item, className = "" }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [item.image_url]);

  return (
    <a
      href={`/shop/${item.slug}`}
      className={`
        group relative block overflow-hidden rounded-[28px]
        border border-[#E5DCC8] bg-[#F4E8CE]
        shadow-[0_8px_30px_rgba(39,70,45,0.08)]
        transition-all duration-500
        hover:-translate-y-1
        hover:shadow-[0_15px_40px_rgba(39,70,45,0.15)]
        ${className}
      `}
    >
      {item.image_url && !imageFailed ? (
        <img
          src={item.image_url}
          alt={item.name}
          draggable="false"
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="
            absolute inset-0 h-full w-full object-cover
            transition-transform duration-700
            group-hover:scale-105
          "
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#E7F0E8] via-[#F4E8CE] to-[#D9E4D7]"
        />
      )}

      <div
        className={`absolute inset-0 ${
          item.featured
            ? "bg-gradient-to-r from-[#173F2A]/95 via-[#173F2A]/65 via-55% to-transparent"
            : "bg-gradient-to-t from-[#FAF7EF]/98 via-[#FAF7EF]/55 via-70% to-transparent"
        }`}
      />

      <div
        className={`relative z-10 flex h-full flex-col ${
          item.featured
            ? "justify-center px-7 py-8 sm:px-9"
            : "justify-end px-6 pb-5 pt-16"
        }`}
      >
        <div
          className={`mb-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            item.featured
              ? "bg-white/15 text-[#E8D5A8]"
              : "bg-[#E7F0E8] text-[#285C3A]"
          }`}
        >
          <span className="text-base" aria-hidden="true">
            🌿
          </span>
        </div>

        <h3
          className={`max-w-[360px] font-serif font-bold leading-[1.05] ${
            item.featured
              ? "text-3xl text-white sm:text-4xl"
              : "text-[20px] text-[#173F2A] sm:text-[22px]"
          }`}
        >
          {item.name}
        </h3>

        <p
          className={`mt-1.5 max-w-[330px] text-[13px] leading-5 ${
            item.featured ? "text-white/85" : "text-[#334438]"
          }`}
        >
          {item.description ||
            fallbackDescriptions[item.slug] ||
            "Explore our natural product collection"}
        </p>

        <div
          className={`mt-4 flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-300 ${
            item.featured
              ? "bg-[#FAF7EF] text-[#173F2A] group-hover:bg-white"
              : "bg-[#285C3A] text-white group-hover:bg-[#173F2A]"
          }`}
        >
          <span>Explore</span>
          <span
            className="transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
        </div>
      </div>
    </a>
  );
}

export default function CollectionsSection() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      setLoading(true);
      setLoadError("");

      try {
        const { data, error } = await supabase
          .from("categories")
          .select(
            "id, name, slug, description, image_url, is_active, sort_order"
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true });

        if (error) throw error;
        if (!mounted) return;

        setCollections(
          (data || []).map((category) => ({
            ...category,
            featured: category.slug === "health-mixes-powders",
          }))
        );
      } catch (error) {
        console.error("Failed to load categories from Supabase:", error);

        if (mounted) {
          setLoadError("We couldn't load collections right now.");
          setCollections([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  // Use the same full-screen loading approach as ProductDetails.jsx.
  if (loading) {
    return (
      <GlobalLoader message="Preparing our natural product collections..." />
    );
  }

  const bySlug = Object.fromEntries(
    collections.map((category) => [category.slug, category])
  );

  // Preserve the original category order and featured layout.
  const topRow = [
    bySlug["laddus-traditional-sweets"],
    bySlug["health-mixes-powders"],
    bySlug.malts,
  ].filter(Boolean);

  const bottomRow = [
    bySlug["dosai-mixes"],
    bySlug["masala-powders"],
    bySlug.noodles,
    bySlug.pastas,
  ].filter(Boolean);

  const knownSlugs = new Set([
    "laddus-traditional-sweets",
    "health-mixes-powders",
    "malts",
    "dosai-mixes",
    "masala-powders",
    "noodles",
    "pastas",
  ]);

  const extraCategories = collections.filter(
    (category) => !knownSlugs.has(category.slug)
  );

  const mobileOrder = [
    ...topRow.slice(0, 1),
    ...topRow.slice(1),
    ...bottomRow,
    ...extraCategories,
  ];

  return (
    <section className="relative overflow-hidden bg-[#FAF7EF] py-14 sm:py-18 lg:py-20">
      <div className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
        {/* Section heading */}
        <div className="mx-auto mb-7 max-w-4xl text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-[#C79A3B]" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#285C3A] sm:text-sm">
              Shop Our Collections
            </span>
            <span className="h-px w-12 bg-[#C79A3B]" />
          </div>

          <h2 className="font-serif text-4xl font-bold leading-[1.08] text-[#173F2A] sm:text-5xl lg:text-6xl">
            Traditional choices for{" "}
            <span className="relative inline-block text-[#C79A3B]">
              every kitchen
              <span className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-[#C79A3B]/30" />
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#667064] sm:text-base">
            From wholesome traditional sweets to everyday kitchen essentials,
            discover our range of carefully prepared natural products.
          </p>
        </div>

        {loadError ? (
          <p className="rounded-xl border border-[#E5DCC8] bg-white/70 px-5 py-4 text-center text-sm text-[#667064]">
            {loadError} Please refresh the page to try again.
          </p>
        ) : collections.length === 0 ? (
          <p className="rounded-xl border border-[#E5DCC8] bg-white/70 px-5 py-4 text-center text-sm text-[#667064]">
            No active collections are available yet.
          </p>
        ) : (
          <>
            {/* Desktop collection layout */}
            <div className="hidden lg:grid lg:grid-cols-4 lg:grid-rows-[265px_265px] lg:gap-5">
              {topRow.map((item) => (
                <CollectionCard
                  key={item.id}
                  item={item}
                  className={
                    item.slug === "health-mixes-powders"
                      ? "lg:col-span-2 lg:row-span-1"
                      : "lg:col-span-1 lg:row-span-1"
                  }
                />
              ))}

              {bottomRow.map((item) => (
                <CollectionCard
                  key={item.id}
                  item={item}
                  className="lg:col-span-1 lg:row-span-1"
                />
              ))}

              {extraCategories.map((item) => (
                <CollectionCard
                  key={item.id}
                  item={item}
                  className="lg:col-span-1 lg:row-span-1"
                />
              ))}
            </div>

            {/* Mobile and tablet collection layout */}
            <div className="grid grid-cols-2 gap-3 lg:hidden">
              {mobileOrder.map((item) => (
                <CollectionCard
                  key={item.id}
                  item={item}
                  className={
                    item.slug === "health-mixes-powders"
                      ? "col-span-2 h-[260px]"
                      : "h-[205px]"
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* Section footer */}
        <div className="mt-9 text-center sm:mt-11">
          <div className="mx-auto flex max-w-xl items-center justify-center gap-4">
            <span className="h-px flex-1 bg-[#C79A3B]/40" />
            <span className="whitespace-nowrap font-serif text-lg italic text-[#285C3A] sm:text-xl">
              From our kitchen to your family
            </span>
            <span className="h-px flex-1 bg-[#C79A3B]/40" />
          </div>
        </div>
      </div>
    </section>
  );
}