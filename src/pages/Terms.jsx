import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  ShoppingBag,
  IndianRupee,
  Package,
  Leaf,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  CircleHelp,
  MessageCircle,
} from "lucide-react";

const termsSections = [
  {
    id: "acceptance",
    icon: UserCheck,
    title: "1. Acceptance of Terms",
    paragraphs: [
      "These Terms & Conditions apply to your use of the Chithu’s Natural Products website and the services offered through it.",
      "By accessing the website or placing an order, you agree to the applicable terms. If you do not agree, please discontinue use of the website.",
    ],
  },
  {
    id: "products",
    icon: Leaf,
    title: "2. Product Information",
    paragraphs: [
      "We aim to provide clear product descriptions, images and ingredient information. Actual packaging and appearance may vary from website photographs.",
      "Please read the ingredient list, allergen information, preparation instructions and storage directions on the product label before use.",
      "Do not rely on general website descriptions as a substitute for the product label or professional medical advice.",
    ],
  },
  {
    id: "orders",
    icon: ShoppingBag,
    title: "3. Orders and Confirmation",
    paragraphs: [
      "Placing an order is a request to purchase the selected products. Order acceptance and confirmation will follow the ordering process shown on the website or communicated by our team.",
      "Please check your selected products, quantities, delivery address and contact information before completing your order.",
      "If an order cannot be fulfilled, our team should communicate the issue and any applicable next steps.",
    ],
  },
  {
    id: "pricing",
    icon: IndianRupee,
    title: "4. Pricing and Payments",
    paragraphs: [
      "Prices, applicable taxes, shipping charges and the total payable amount should be displayed or confirmed before an order is finalised.",
      "Payment methods depend on the options made available during checkout or confirmed by our team.",
      "If a pricing or calculation error is identified, we will contact the customer to explain the issue and resolve it appropriately before proceeding.",
    ],
  },
  {
    id: "delivery",
    icon: Package,
    title: "5. Shipping and Delivery",
    paragraphs: [
      "Delivery availability, charges and estimated timelines depend on the delivery location, product availability and order processing.",
      "Please provide an accurate delivery address and reachable contact number. Delays may occur because of courier operations or circumstances beyond our reasonable control.",
      "Please read our Shipping Policy for additional information.",
    ],
  },
  {
    id: "returns",
    icon: ShieldCheck,
    title: "6. Cancellations, Returns and Refunds",
    paragraphs: [
      "Cancellation, return and refund requests are handled according to our applicable Return & Refund Policy and consumer protection requirements.",
      "If you receive a damaged or incorrect product, contact us promptly with your order details and supporting photographs where relevant.",
      "Nothing in these terms is intended to exclude or limit rights that cannot lawfully be excluded under applicable law.",
    ],
  },
  {
    id: "responsibilities",
    icon: UserCheck,
    title: "7. Customer Responsibilities",
    paragraphs: [
      "You are responsible for providing accurate information when placing an order and for checking order details before confirmation.",
      "You must not misuse the website, interfere with its operation, submit fraudulent orders or attempt unauthorised access to website systems.",
      "Please follow the product's preparation, storage and usage instructions printed on its packaging.",
    ],
  },
  {
    id: "food-safety",
    icon: Leaf,
    title: "8. Food Product Information",
    paragraphs: [
      "Customers should review ingredient and allergen declarations and consider their individual dietary requirements before consuming a product.",
      "Store products according to the instructions on the package and check the best-before or expiry information before use.",
      "Product-specific nutritional or health claims should be assessed using the information provided on the actual product label and any applicable supporting documentation.",
    ],
  },
  {
    id: "intellectual-property",
    icon: FileText,
    title: "9. Website Content and Intellectual Property",
    paragraphs: [
      "Website text, branding, logos, product photographs and other content may be protected by applicable intellectual property laws.",
      "You may not reproduce, distribute or commercially use website content without permission from the relevant rights holder, except where permitted by law.",
    ],
  },
  {
    id: "privacy",
    icon: ShieldCheck,
    title: "10. Privacy",
    paragraphs: [
      "Personal information collected through the website is handled as described in our Privacy Policy.",
      "Please review that policy to understand the information we collect, how it is used and the circumstances in which it may be shared.",
    ],
  },
  {
    id: "liability",
    icon: AlertCircle,
    title: "11. Liability and Applicable Law",
    paragraphs: [
      "We aim to keep our website information accurate and available, but uninterrupted operation cannot be guaranteed.",
      "These terms are subject to applicable Indian law. Nothing in this section limits liability or consumer rights where such limitation is not permitted by law.",
      "Any disputes will be handled through the processes and forums available under applicable law.",
    ],
  },
  {
    id: "changes",
    icon: FileText,
    title: "12. Changes to These Terms",
    paragraphs: [
      "We may update these terms to reflect changes in our services, website features or legal requirements.",
      "Updated terms will be published on this page. Please review this page periodically for changes.",
    ],
  },
];

const relatedPolicies = [
  {
    title: "Shipping Policy",
    description: "Delivery areas, charges and timelines.",
    href: "/shipping-policy",
  },
  {
    title: "Return & Refund Policy",
    description: "Guidance for returns and order issues.",
    href: "/return-policy",
  },
  {
    title: "Privacy Policy",
    description: "How customer information is handled.",
    href: "/privacy-policy",
  },
];

export default function Terms() {
  const whatsappNumber = "YOUR_WHATSAPP_NUMBER";

  const contactUrl =
    whatsappNumber !== "YOUR_WHATSAPP_NUMBER"
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          "Hello Chithu's Natural Products, I have a question about your Terms and Conditions."
        )}`
      : "/contact";

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#242821]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#E8E1D2]">
        <div className="absolute -right-16 -top-20 h-80 w-80 rounded-full bg-[#E7F0E8] opacity-70 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-[#F0E3C5] opacity-40 blur-3xl" />

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
                <FileText size={17} />
                Website Guidelines
              </div>

              <h1 className="mt-5 max-w-2xl font-serif text-4xl font-bold leading-tight text-[#173F2A] sm:text-5xl lg:text-6xl">
                Terms & Conditions
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-[#667064] sm:text-lg">
                Please read these terms before using our website or ordering
                products from Chithu’s Natural Products.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#terms-details"
                  className="inline-flex items-center gap-2 rounded-full bg-[#285C3A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173F2A]"
                >
                  Read the Terms
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

              <div className="relative rounded-[1.75rem] border border-[#E5DCC8] bg-white p-7 shadow-sm sm:p-9">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F0E8]">
                  <FileText size={32} className="text-[#285C3A]" />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#B17A20]">
                  Chithu’s Natural Products
                </p>

                <h2 className="mt-2 font-serif text-3xl font-bold text-[#173F2A]">
                  Clear terms. Better experiences.
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#667064]">
                  These guidelines explain the general rules for using our
                  website, ordering products and contacting our team.
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-[#EDE5D7] pt-5">
                  <ShieldCheck
                    size={23}
                    className="shrink-0 text-[#B17A20]"
                  />
                  <p className="text-sm font-medium text-[#285C3A]">
                    Transparent customer information
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms content */}
      <section
        id="terms-details"
        className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16"
      >
        <div className="grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-[#E8E1D2] bg-white/75 p-5 lg:sticky lg:top-24">
            <h2 className="font-serif text-xl font-bold text-[#173F2A]">
              On This Page
            </h2>

            <nav className="mt-4 space-y-1">
              {termsSections.map(({ id, title }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block rounded-lg px-3 py-2 text-sm leading-5 text-[#667064] transition hover:bg-[#E7F0E8] hover:text-[#285C3A]"
                >
                  {title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 rounded-2xl border border-[#E8E1D2] bg-white/75 p-6 sm:p-9">
            <p className="text-sm leading-7 text-[#667064]">
              These Terms & Conditions provide a general framework for using
              the Chithu’s Natural Products website. The final version should
              reflect your actual checkout process, business practices and
              applicable legal requirements.
            </p>

            <div className="mt-5 rounded-xl bg-[#F5EBD6] p-4">
              <p className="text-sm leading-6 text-[#50564C]">
                <strong>Effective date:</strong> Insert the date on which
                your business approves and publishes these terms.
              </p>
            </div>

            <div className="mt-8 divide-y divide-[#EDE5D7]">
              {termsSections.map(
                ({ id, icon: Icon, title, paragraphs }) => (
                  <article
                    key={id}
                    id={id}
                    className="scroll-mt-28 py-7 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7F0E8]">
                        <Icon size={22} className="text-[#285C3A]" />
                      </div>

                      <div className="min-w-0">
                        <h2 className="font-serif text-xl font-bold text-[#173F2A] sm:text-2xl">
                          {title}
                        </h2>

                        <div className="mt-3 space-y-3">
                          {paragraphs.map((paragraph) => (
                            <p
                              key={paragraph}
                              className="text-sm leading-7 text-[#667064]"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related policies */}
      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <h2 className="font-serif text-2xl font-bold text-[#173F2A] sm:text-3xl">
          More Helpful Information
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relatedPolicies.map(({ title, description, href }) => (
            <Link
              key={title}
              to={href}
              className="group rounded-2xl border border-[#E8E1D2] bg-white/75 p-5 transition hover:-translate-y-1 hover:border-[#C79A3B] hover:bg-white"
            >
              <FileText size={25} className="text-[#B17A20]" />

              <h3 className="mt-4 font-semibold text-[#173F2A]">{title}</h3>

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

      {/* Support CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-[#173F2A] p-7 sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5C67F]">
              Questions About Our Terms?
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">
              We’re happy to clarify.
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/75">
              Contact our team if you need help understanding our ordering
              process, policies or website guidelines.
            </p>
          </div>

          <a
            href={contactUrl}
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
            Contact Us
            <ArrowRight size={17} />
          </a>
        </div>
      </section>
    </main>
  );
}
