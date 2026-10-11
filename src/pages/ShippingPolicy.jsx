import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Truck,
  MapPin,
  Clock,
  MessageCircle,
  ShoppingBag,
  ShieldCheck,
  CircleHelp,
  CheckCircle2,
} from "lucide-react";

const shippingSteps = [
  {
    number: "01",
    title: "Order Placed",
    description: "Your order details are received and recorded.",
    icon: ShoppingBag,
  },
  {
    number: "02",
    title: "Order Processing",
    description: "Your products are prepared for dispatch.",
    icon: Package,
  },
  {
    number: "03",
    title: "Order Dispatched",
    description: "Your parcel is handed over for delivery.",
    icon: Truck,
  },
  {
    number: "04",
    title: "Delivered to You",
    description: "Your order arrives at the delivery address.",
    icon: CheckCircle2,
  },
];

const shippingDetails = [
  {
    icon: MapPin,
    title: "Delivery Locations",
    description:
      "Delivery availability depends on your location. Contact our team to confirm whether we can deliver to your address.",
  },
  {
    icon: Clock,
    title: "Delivery Timeline",
    description:
      "Delivery timelines depend on product availability, order processing and your delivery location. We will confirm the expected timeline when your order is placed.",
  },
  {
    icon: Truck,
    title: "Shipping Charges",
    description:
      "Applicable delivery charges and any free-delivery eligibility will be communicated before your order is confirmed.",
  },
  {
    icon: Package,
    title: "Packaging",
    description:
      "We take care to pack your products appropriately for dispatch. Please check the parcel and products when your order arrives.",
  },
];

const shippingFaqs = [
  {
    question: "How do I place an order?",
    answer:
      "Browse the products on our website, add your chosen items to the cart and follow the available checkout or ordering instructions.",
  },
  {
    question: "How can I find out whether you deliver to my location?",
    answer:
      "Contact our team with your PIN code and delivery location. We will confirm delivery availability before the order is finalised.",
  },
  {
    question: "How can I check my order status?",
    answer:
      "Contact our customer support team with your order details to request an update on processing or delivery.",
  },
  {
    question: "What should I do if my parcel arrives damaged?",
    answer:
      "Please contact us promptly with your order details and clear photographs of the parcel and affected products so we can review the issue.",
  },
  {
    question: "What if my delivery is delayed?",
    answer:
      "Delivery may be affected by location, courier operations or unforeseen circumstances. Contact our team for an update on your order.",
  },
];

export default function ShippingPolicy() {
  const whatsappNumber = "YOUR_WHATSAPP_NUMBER";

  const whatsappUrl =
    whatsappNumber !== "YOUR_WHATSAPP_NUMBER"
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          "Hello Chithu's Natural Products, I have a question about shipping and delivery."
        )}`
      : "/contact";

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#242821]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#E8E1D2]">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#E7F0E8] opacity-70 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#F0E3C5] opacity-40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#667064] transition hover:text-[#285C3A]"
          >
            <ArrowLeft size={17} />
            Back to FAQs
          </Link>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D9E5D8] bg-white/70 px-4 py-2 text-sm font-semibold text-[#285C3A]">
                <Truck size={17} />
                Shipping & Delivery
              </div>

              <h1 className="mt-5 max-w-2xl font-serif text-4xl font-bold leading-tight text-[#173F2A] sm:text-5xl lg:text-6xl">
                From Our Home to Yours
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-[#667064] sm:text-lg">
                Every order matters to us. Find out how we process, pack and
                deliver your favourite Chithu’s Natural Products.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#shipping-details"
                  className="inline-flex items-center gap-2 rounded-full bg-[#285C3A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173F2A]"
                >
                  Explore Shipping Details
                  <ArrowRight size={17} />
                </a>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-[#D9D4C8] bg-white/70 px-6 py-3.5 text-sm font-semibold text-[#285C3A] transition hover:bg-white"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-4 rounded-[2rem] bg-[#E7F0E8]" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[#E5DCC8] bg-white p-7 shadow-sm sm:p-9">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F0E8]">
                  <Package size={34} className="text-[#285C3A]" />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#B17A20]">
                  Chithu’s Natural Products
                </p>

                <h2 className="mt-2 font-serif text-3xl font-bold text-[#173F2A]">
                  Carefully packed.
                  <br />
                  Thoughtfully delivered.
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#667064]">
                  We aim to make your shopping experience simple, clear and
                  convenient from order placement to delivery.
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-[#EDE5D7] pt-5">
                  <ShieldCheck
                    size={23}
                    className="shrink-0 text-[#B17A20]"
                  />
                  <p className="text-sm font-medium text-[#285C3A]">
                    Delivery details confirmed before order completion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policy introduction */}
      <section
        id="shipping-details"
        className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B17A20]">
            Our Shipping Policy
          </p>

          <h2 className="mt-3 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
            What you need to know
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#667064] sm:text-base">
            This page explains our general shipping and delivery process.
            Delivery availability, applicable charges and estimated timelines
            should be confirmed with our team before your order is finalised.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shippingDetails.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#E8E1D2] bg-white/75 p-6 transition hover:-translate-y-1 hover:border-[#C79A3B]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5EBD6]">
                <Icon size={25} className="text-[#A66C0D]" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#173F2A]">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#667064]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Delivery process */}
      <section className="border-y border-[#E8E1D2] bg-white/50">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B17A20]">
              How It Works
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
              Your order journey
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#667064]">
              Here is a general overview of the steps involved in getting your
              order ready.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shippingSteps.map(
              ({ number, title, description, icon: Icon }, index) => (
                <div key={number} className="relative">
                  <article className="h-full rounded-2xl border border-[#E8E1D2] bg-[#FAF7EF] p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-3xl font-bold text-[#D5C5A4]">
                        {number}
                      </span>
                      <Icon size={25} className="text-[#285C3A]" />
                    </div>

                    <h3 className="mt-5 font-bold text-[#173F2A]">{title}</h3>

                    <p className="mt-2 text-sm leading-6 text-[#667064]">
                      {description}
                    </p>
                  </article>

                  {index < shippingSteps.length - 1 && (
                    <ArrowRight
                      size={19}
                      className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-[#C79A3B] lg:block"
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Shipping FAQs */}
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="text-center">
          <CircleHelp size={32} className="mx-auto text-[#B17A20]" />

          <h2 className="mt-4 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
            Shipping FAQs
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#667064]">
            Quick answers to common delivery questions.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {shippingFaqs.map(({ question, answer }) => (
            <details
              key={question}
              className="group rounded-2xl border border-[#E8E1D2] bg-white/75 p-5 open:bg-white"
            >
              <summary className="cursor-pointer list-none pr-6 font-semibold text-[#173F2A] marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {question}
                  <span className="text-xl text-[#A66C0D] transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>

              <p className="mt-4 border-t border-[#EDE5D7] pt-4 text-sm leading-7 text-[#667064]">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-[#173F2A] p-7 sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5C67F]">
              Need Assistance?
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">
              We’re happy to help.
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/75">
              Have a question about delivery availability, charges or an
              existing order? Contact our team for assistance.
            </p>
          </div>

          <a
            href={whatsappUrl}
            target={
              whatsappNumber !== "YOUR_WHATSAPP_NUMBER" ? "_blank" : undefined
            }
            rel={
              whatsappNumber !== "YOUR_WHATSAPP_NUMBER"
                ? "noreferrer"
                : undefined
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#F1D79C] px-6 py-3.5 text-sm font-bold text-[#173F2A] transition hover:bg-white lg:self-center"
          >
            <MessageCircle size={19} />
            Contact Support
            <ArrowRight size={17} />
          </a>
        </div>
      </section>
    </main>
  );
}
