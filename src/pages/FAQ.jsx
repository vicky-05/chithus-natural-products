
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Leaf,
  ShoppingCart,
  CreditCard,
  Package,
  RotateCcw,
  Headphones,
  Plus,
  Minus,
  MessageCircle,
  FileText,
  ShieldCheck,
  LockKeyhole,
  Truck,
  ArrowRight,
} from "lucide-react";

import faqHero from "../assets/faq-hero.png";

const categories = [
  { name: "Products & Ingredients", icon: Leaf },
  { name: "Orders & Delivery", icon: ShoppingCart },
  { name: "Payments", icon: CreditCard },
  { name: "Storage & Shelf Life", icon: Package },
  { name: "Returns & Refunds", icon: RotateCcw },
  { name: "Customer Support", icon: Headphones },
];

const questions = [
  {
    category: "Products & Ingredients",
    question: "Are your products made with natural ingredients?",
    answer:
      "Please check the ingredient list printed on each product package for accurate information about its ingredients.",
  },
  {
    category: "Products & Ingredients",
    question: "Do your products contain preservatives?",
    answer:
      "Ingredients and preservatives can vary by product. Refer to the product label or contact our team for confirmation.",
  },
  {
    category: "Products & Ingredients",
    question: "Are your products suitable for children?",
    answer:
      "Suitability depends on the product, its ingredients and the child's individual needs. Check the label and consult a healthcare professional when needed.",
  },
  {
    category: "Products & Ingredients",
    question: "How do I choose the right dosa mix or millet product?",
    answer:
      "Explore the product descriptions and ingredient lists on our Shop page to choose a product that suits your cooking preferences.",
  },
  {
    category: "Products & Ingredients",
    question: "How can I use your masala powders?",
    answer:
      "Follow the preparation suggestions on the product packaging. You can also contact our team for product-specific guidance.",
  },
  {
    category: "Products & Ingredients",
    question: "Do you offer organic products?",
    answer:
      "Please check the individual product description and packaging for organic certification or other product-specific claims.",
  },

  {
    category: "Orders & Delivery",
    question: "How can I track my order?",
    answer:
      "Once your order has been shipped, visit your order details page on our website. You can find your courier's official tracking website link and tracking number there. Open the link, enter your tracking number, and check the latest delivery updates.",
  },
  {
    category: "Orders & Delivery",
    question: "Where can I find my tracking number?",
    answer:
      "Your tracking number or AWB number is available in your order details after your order has been shipped and the tracking information has been added.",
  },
  {
    category: "Orders & Delivery",
    question: "When will my tracking details be available?",
    answer:
      "Tracking details become available after your order is dispatched and the courier tracking information is added to your order. Tracking updates may take some time to appear on the courier's website.",
  },
  {
    category: "Orders & Delivery",
    question: "Where do I check my shipment status?",
    answer:
      "Open your order details page and click the courier's official tracking link. Enter the tracking number provided with your order to view the shipment status and delivery updates.",
  },
  {
    category: "Orders & Delivery",
    question: "Why is my tracking number not showing any updates?",
    answer:
      "Tracking information may take some time to update after dispatch. Please check again later using the official courier website linked in your order details. If the tracking information still does not appear, contact our customer support team with your order number.",
  },
  {
    category: "Orders & Delivery",
    question: "What should I do if my shipment is delayed?",
    answer:
      "Check the latest updates on the courier's official tracking website using the link in your order details. If you need further assistance, contact our customer support team and provide your order number.",
  },
  {
    category: "Orders & Delivery",
    question: "Is my order number the same as my tracking number?",
    answer:
      "No. Your order number identifies your purchase on our website, while the tracking number or AWB number identifies your shipment with the courier. Use the tracking number on the courier's official website to check delivery updates.",
  },

  {
    category: "Payments",
    question: "When do I make the payment?",
    answer:
      "After your order is saved, our team will confirm product availability and share the payment details with you through the agreed communication channel. Your order confirmation may show Payment: Unpaid until payment is completed.",
  },
  {
    category: "Payments",
    question: "Which payment methods do you accept?",
    answer:
      "Please check with our team for the currently available payment methods. We will share the applicable payment instructions when confirming your order.",
  },
  {
    category: "Payments",
    question: "Is my order confirmed when I click Place Order?",
    answer:
      "Clicking Place Order saves your order on our website. Our team will then confirm product availability and share payment details. The order status may remain Pending until our team completes the confirmation process.",
  },
  {
    category: "Payments",
    question: "What should I do if WhatsApp does not open?",
    answer:
      "Return to the order confirmation page and use the WhatsApp button if available. If WhatsApp still does not open, contact our team through the Contact page and provide your order number. Avoid placing another order for the same purchase.",
  },
  {
    category: "Storage & Shelf Life",
    question: "How should I store the products?",
    answer:
      "Follow the storage instructions printed on the product package. Keep products properly sealed and away from conditions specified as unsuitable on the label.",
  },
  {
    category: "Storage & Shelf Life",
    question: "Where can I find the expiry or best-before date?",
    answer:
      "Check the expiry or best-before information printed on the product packaging before use.",
  },
  {
    category: "Returns & Refunds",
    question: "What if I receive a damaged or incorrect product?",
    answer:
      "Contact customer support as soon as possible with your order details and clear photos of the product and packaging. Our team will explain the next steps under the applicable policy.",
  },
  {
    category: "Returns & Refunds",
    question: "Can I cancel or return an order?",
    answer:
      "Cancellation and return eligibility depends on the status of your order and our applicable policy. Please contact us before assuming an order can be cancelled or returned.",
  },
  {
    category: "Customer Support",
    question: "How can I contact your team?",
    answer:
      "Use the Contact page or the WhatsApp support link provided on our website to get in touch.",
  },
];

const helpfulLinks = [
  {
    title: "Shipping Policy",
    description: "Delivery charges and timelines.",
    icon: Truck,
    href: "/shipping-policy",
  },
  {
    title: "Return & Refund Policy",
    description: "Our return and refund guidelines.",
    icon: ShieldCheck,
    href: "/return-policy",
  },
  {
    title: "Privacy Policy",
    description: "How we handle your information.",
    icon: LockKeyhole,
    href: "/privacy-policy",
  },
  {
    title: "Terms & Conditions",
    description: "Terms for using our website.",
    icon: FileText,
    href: "/terms",
  },
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(
    "Products & Ingredients"
  );
  const [openQuestion, setOpenQuestion] = useState(0);
  const [search, setSearch] = useState("");

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return questions.filter((item) => {
      const matchesCategory =
        activeCategory === "All Questions" ||
        item.category === activeCategory;

      const matchesSearch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const selectCategory = (category) => {
    setActiveCategory(category);
    setOpenQuestion(0);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setOpenQuestion(0);
  };

  // Replace this with your business WhatsApp number.
  // Example format: 919876543210
  const whatsappNumber = "YOUR_WHATSAPP_NUMBER";

  const whatsappUrl =
    whatsappNumber !== "YOUR_WHATSAPP_NUMBER"
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hello Chithu's Natural Products, I have a question about your products."
      )}`
      : "/contact";

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#242821]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-[#E8E1D2]">
        <img
          src={faqHero}
          alt="Natural ingredients and products from Chithu's Natural Products"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#FAF7EF] via-[#FAF7EF]/88 to-[#FAF7EF]/10" />

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#B17A20]">
              FAQs
            </p>

            <h1 className="mt-3 max-w-xl font-serif text-4xl font-bold leading-tight text-[#173F2A] sm:text-5xl lg:text-6xl">
              Frequently Asked Questions
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#4F554B] sm:text-lg">
              Find answers to common questions about our products, orders,
              delivery, payments and more.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-7 flex max-w-xl items-center gap-3 rounded-full border border-[#E5DCC8] bg-white/95 p-2 shadow-sm"
            >
              <Search
                size={21}
                className="ml-3 shrink-0 text-[#285C3A]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setOpenQuestion(0);
                }}
                placeholder="Search delivery, payment, ingredients..."
                aria-label="Search frequently asked questions"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[#8A8D87]"
              />

              <button
                type="submit"
                className="rounded-full bg-[#285C3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173F2A]"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Category shortcuts */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => selectCategory(name)}
              className={`flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border p-4 text-center transition ${activeCategory === name
                ? "border-[#285C3A] bg-[#E7F0E8]"
                : "border-[#EDE5D7] bg-white/60 hover:border-[#C79A3B] hover:bg-white"
                }`}
            >
              <Icon
                size={29}
                strokeWidth={1.7}
                className={
                  activeCategory === name
                    ? "text-[#285C3A]"
                    : "text-[#B17A20]"
                }
              />

              <span className="text-sm font-semibold text-[#173F2A]">
                {name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Questions */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-[#E8E1D2] bg-white/70 p-3">
          <button
            type="button"
            onClick={() => selectCategory("All Questions")}
            className={`mb-2 flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left text-sm font-semibold ${activeCategory === "All Questions"
              ? "bg-[#285C3A] text-white"
              : "text-[#242821] hover:bg-[#E7F0E8]"
              }`}
          >
            All Questions
            <ArrowRight size={17} />
          </button>

          {categories.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => selectCategory(name)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-4 text-left text-sm transition ${activeCategory === name
                ? "bg-[#285C3A] font-semibold text-white"
                : "text-[#343B32] hover:bg-[#E7F0E8]"
                }`}
            >
              <Icon
                size={20}
                className={
                  activeCategory === name ? "text-white" : "text-[#A87924]"
                }
              />
              <span>{name}</span>
            </button>
          ))}
        </aside>

        <div className="min-w-0 rounded-3xl border border-[#E8E1D2] bg-white/75 p-5 sm:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <Leaf size={28} className="shrink-0 text-[#285C3A]" />
              <h2 className="font-serif text-2xl font-bold text-[#173F2A] sm:text-3xl">
                {activeCategory === "All Questions"
                  ? "All Frequently Asked Questions"
                  : activeCategory}
              </h2>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#667064]">
              Find helpful information about our products and services.
            </p>
          </div>

          <div className="space-y-2">
            {filteredQuestions.map((item, index) => {
              const isOpen = openQuestion === index;

              return (
                <article
                  key={item.question}
                  className={`overflow-hidden rounded-2xl border transition ${isOpen
                    ? "border-[#DCD3C1] bg-[#FCFAF5]"
                    : "border-[#EDE7DB] bg-white"
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenQuestion(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
                  >
                    <span className="text-sm font-semibold leading-6 text-[#173F2A] sm:text-base">
                      {item.question}
                    </span>

                    {isOpen ? (
                      <Minus
                        size={19}
                        className="shrink-0 text-[#285C3A]"
                      />
                    ) : (
                      <Plus
                        size={19}
                        className="shrink-0 text-[#285C3A]"
                      />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5">
                      <p className="rounded-xl bg-[#F7F2E8] p-4 text-sm leading-7 text-[#50564C]">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}

            {filteredQuestions.length === 0 && (
              <div className="rounded-2xl bg-[#F7F2E8] px-5 py-10 text-center">
                <Search
                  size={28}
                  className="mx-auto text-[#285C3A]"
                />
                <h3 className="mt-3 font-semibold text-[#173F2A]">
                  No matching questions found
                </h3>
                <p className="mt-2 text-sm text-[#667064]">
                  Try a different search term or select another category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    selectCategory("All Questions");
                  }}
                  className="mt-4 text-sm font-semibold text-[#285C3A] underline underline-offset-4"
                >
                  View all questions
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* WhatsApp support */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-8">
        <div className="overflow-hidden rounded-3xl bg-[#E9ECD9]">
          <div className="grid items-center gap-6 p-6 sm:p-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A66C0D]">
                Still have a question?
              </p>

              <h2 className="mt-3 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
                We’re here to help
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#50564C] sm:text-base">
                Can’t find what you’re looking for? Contact our team for help
                with product information, orders and delivery.
              </p>

              <a
                href={whatsappUrl}
                target={whatsappNumber !== "YOUR_WHATSAPP_NUMBER" ? "_blank" : undefined}
                rel={whatsappNumber !== "YOUR_WHATSAPP_NUMBER" ? "noreferrer" : undefined}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#176B3A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#124F2C]"
              >
                <MessageCircle size={19} />
                Chat with us
                <ArrowRight size={17} />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:w-72 lg:grid-cols-1">
              {[
                ["Quick Support", "Help with your questions"],
                ["Order Assistance", "Get help with your order"],
                ["Product Guidance", "Ask about product usage"],
                ["Customer Care", "We're happy to help"],
              ].map(([title, description]) => (
                <div key={title} className="flex items-start gap-3">
                  <Headphones
                    size={23}
                    className="shrink-0 text-[#A87924]"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-[#173F2A]">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#667064]">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Helpful policies */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
        <h2 className="font-serif text-2xl font-bold text-[#173F2A] sm:text-3xl">
          More Helpful Information
        </h2>

        <div className="mt-2 h-1 w-12 rounded-full bg-[#C79A3B]" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {helpfulLinks.map(({ title, description, icon: Icon, href }) => (
            <Link
              key={title}
              to={href}
              className="group rounded-2xl border border-[#E8E1D2] bg-white/70 p-5 transition hover:-translate-y-1 hover:border-[#C79A3B] hover:bg-white"
            >
              <Icon size={27} className="text-[#B17A20]" />

              <h3 className="mt-4 font-semibold text-[#173F2A]">
                {title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#667064]">
                {description}
              </p>

              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#A66C0D]">
                View Policy
                <ArrowRight
                  size={15}
                  className="transition group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}