import { useState } from "react";
import {
  ChevronDown,
  Leaf,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import faqImage from "../assets/FAQImage.png";

const faqs = [
  {
    question: "What makes Chithu’s products special?",
    answer:
      "Our products are inspired by traditional recipes and prepared with selected natural ingredients. We focus on traditional taste, wholesome nutrition and careful preparation for everyday family meals.",
  },
  {
    question: "Are the products traditionally prepared?",
    answer:
      "Traditional preparation is one of our core quality principles. Our products are inspired by heritage tastes and traditional food practices.",
  },
  {
    question: "What ingredients are used?",
    answer:
      "Our range includes native millets, grains, herbs, native greens and other selected ingredients. Individual ingredients can vary from product to product, so please check the product label for the complete ingredient list.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Browse our products, select the items you would like to order and proceed through the ordering process. Our team will confirm the order and provide the required payment details.",
  },
  {
    question: "Do you deliver across India?",
    answer:
      "Delivery locations and charges may vary. Please contact our team to confirm whether delivery is available to your location and to know the applicable delivery charges.",
  },
  {
    question: "How can I contact you about an order?",
    answer:
      "You can contact our team through the contact details provided on our website. We will be happy to help with product questions, orders and delivery-related queries.",
  },
];

function FAQItem({ item, isOpen, onClick, index }) {
  return (
    <div
      className={`overflow-hidden rounded-[20px] border transition-all duration-300 ${
        isOpen
          ? "border-[#C79A3B]/40 bg-[#FAF7EF] shadow-[0_12px_35px_rgba(39,66,45,0.08)]"
          : "border-[#DDD8C8] bg-white hover:border-[#C79A3B]/40"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
          {/* Number */}
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
              isOpen
                ? "bg-[#285C3A] text-white"
                : "bg-[#E7F0E8] text-[#285C3A]"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* Question */}
          <span
            className={`text-[15px] font-semibold leading-6 sm:text-base ${
              isOpen ? "text-[#173F2A]" : "text-[#242821]"
            }`}
          >
            {item.question}
          </span>
        </div>

        {/* Arrow */}
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            isOpen
              ? "rotate-180 bg-[#285C3A] text-white"
              : "bg-[#E7F0E8] text-[#285C3A]"
          }`}
        >
          <ChevronDown size={18} strokeWidth={2} />
        </span>
      </button>

      {/* Answer */}
      <div
        className={`grid transition-all duration-300 ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-6 pl-[68px] pr-6 sm:pl-[76px]">
            <div className="mb-4 h-px bg-[#DDD8C8]" />

            <p className="max-w-2xl text-sm leading-7 text-[#667064]">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="relative overflow-hidden bg-[#FAF7EF] py-20 sm:py-24 lg:py-28">
      {/* =========================================
          BACKGROUND DECORATIONS
      ========================================== */}

      <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-[#E7F0E8]/70 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#E8D5A8]/30 blur-3xl" />

      {/* Decorative leaf */}
      <div className="pointer-events-none absolute right-[7%] top-20 hidden text-[#285C3A]/10 lg:block">
        <Leaf size={130} strokeWidth={0.8} />
      </div>

      {/* =========================================
          CONTAINER
      ========================================== */}

      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        {/* =========================================
            SECTION HEADER
        ========================================== */}

        <div className="mb-12 text-center lg:mb-16">
          {/* Small Label */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C79A3B]/30 bg-white/70 px-4 py-2">
            <Sparkles
              size={14}
              strokeWidth={1.8}
              className="text-[#C79A3B]"
            />

            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#285C3A]">
              FAQs
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-4xl leading-tight text-[#173F2A] sm:text-5xl lg:text-6xl">
            Everything You’d
            <br className="hidden sm:block" />

            <span className="italic text-[#285C3A]">
              {" "}
              Like to Know
            </span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#667064] sm:text-base">
            From ingredients and traditional preparation to ordering and
            delivery, here are some of the questions our customers ask us
            most.
          </p>
        </div>

        {/* =========================================
            MAIN FAQ LAYOUT
        ========================================== */}

        <div className="grid items-stretch gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12">
          {/* =========================================
              LEFT — IMAGE / STORY PANEL
          ========================================== */}

          <div className="relative overflow-hidden rounded-[30px] bg-[#173F2A] p-7 text-white sm:p-9 lg:p-10">
            {/* Decorative circles */}

            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full border border-[#C79A3B]/20" />

            {/* Decorative leaf */}

            <div className="pointer-events-none absolute right-7 top-7 text-[#C79A3B]/50">
              <Leaf size={70} strokeWidth={0.8} />
            </div>

            <div className="relative z-10 flex h-full flex-col">
              {/* Text */}

              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E8D5A8]">
                  Natural Goodness
                </span>

                <h3 className="mt-5 max-w-md font-serif text-3xl leading-tight sm:text-4xl">
                  Good food should feel{" "}
                  <span className="italic text-[#E8D5A8]">
                    simple.
                  </span>
                </h3>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
                  We believe traditional food has a special place in modern
                  homes — wholesome ingredients, familiar flavours and food
                  prepared with care.
                </p>
              </div>

              {/* =========================================
                  LARGE IMAGE
              ========================================== */}

              <div className="relative my-8 flex flex-1 items-center justify-center sm:my-10">
                {/* Image glow */}

                <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-[#C79A3B]/10 blur-3xl" />

                {/* Image frame */}

                <div className="relative w-full max-w-[430px] overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-2 shadow-2xl">
                  <div className="relative overflow-hidden rounded-[24px]">
                    <img
                      src={faqImage}
                      alt="Natural ingredients from Chithu's Natural Products"
                      className="h-[260px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[300px]"
                    />

                    {/* Image gradient */}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#173F2A]/80 via-[#173F2A]/10 to-transparent" />

                    {/* Image text */}

                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E8D5A8] sm:text-xs">
                        Natural Goodness
                      </p>

                      <p className="mt-1 font-serif text-xl text-white sm:text-2xl">
                        From nature to your kitchen
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================================
                  BOTTOM BADGE
              ========================================== */}

              <div className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#C79A3B] text-[#173F2A]">
                  <Leaf size={20} strokeWidth={1.8} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Traditional Goodness
                  </p>

                  <p className="mt-0.5 text-xs text-white/55">
                    Made with care for every family
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================
              RIGHT — FAQ ACCORDION
          ========================================== */}

          <div className="flex flex-col">
            <div className="space-y-3">
              {faqs.map((item, index) => (
                <FAQItem
                  key={item.question}
                  item={item}
                  index={index}
                  isOpen={openIndex === index}
                  onClick={() =>
                    setOpenIndex(
                      openIndex === index ? -1 : index
                    )
                  }
                />
              ))}
            </div>

            {/* =========================================
                CONTACT CTA
            ========================================== */}

            <div className="mt-7 flex flex-col gap-4 rounded-[22px] border border-[#DDD8C8] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
                  <MessageCircle
                    size={20}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#242821]">
                    Still have a question?
                  </p>

                  <p className="mt-1 text-xs text-[#667064]">
                    We’re happy to help you.
                  </p>
                </div>
              </div>

              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#285C3A] px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#173F2A]"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          ORGANIC BOTTOM WAVE
      ========================================== */}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
        <div className="absolute -bottom-20 left-[-5%] h-28 w-[110%] rounded-[50%] bg-[#173F2A]" />
      </div>
    </section>
  );
}

export default FAQSection;