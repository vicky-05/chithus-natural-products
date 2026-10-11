import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  UserRound,
  Database,
  Cookie,
  Eye,
  Share2,
  MessageCircle,
  CircleHelp,
  FileText,
} from "lucide-react";

const privacySections = [
  {
    id: "information",
    icon: UserRound,
    title: "1. Information We Collect",
    paragraphs: [
      "When you place an order or contact us, we may collect information such as your name, phone number, email address, delivery address and order details.",
      "We collect only the information reasonably needed to process orders, coordinate delivery, respond to enquiries and operate our business.",
    ],
  },
  {
    id: "usage",
    icon: Database,
    title: "2. How We Use Your Information",
    paragraphs: [
      "We may use your information to confirm and process orders, arrange delivery, communicate order updates, respond to customer support requests and improve our services.",
      "We may also use information to maintain business records and meet applicable legal obligations.",
    ],
  },
  {
    id: "payments",
    icon: LockKeyhole,
    title: "3. Payments and Payment Information",
    paragraphs: [
      "Payments may be handled through the payment method or service selected for your order.",
      "We do not intend to collect or store full payment card credentials through this policy page. The information handled depends on the payment method and provider used.",
    ],
  },
  {
    id: "sharing",
    icon: Share2,
    title: "4. When Information May Be Shared",
    paragraphs: [
      "We may share relevant information with service providers involved in fulfilling your order, such as delivery partners or payment providers, where necessary.",
      "Information may also be disclosed where required by law or where necessary to protect legitimate rights and prevent misuse.",
      "We do not describe customer information as being sold or shared for advertising unless our actual business practices and applicable notices support that statement.",
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "5. Cookies and Website Data",
    paragraphs: [
      "Our website may use cookies or similar technologies to support essential website functions and improve the browsing experience.",
      "The types of cookies used depend on the website features and third-party services enabled. Any optional tracking or analytics tools should be disclosed according to their actual configuration.",
    ],
  },
  {
    id: "security",
    icon: ShieldCheck,
    title: "6. Data Security",
    paragraphs: [
      "We take reasonable steps to protect customer information against unauthorised access, disclosure, alteration or loss.",
      "No method of online transmission or electronic storage can be guaranteed to be completely secure. Access to customer information should be limited to authorised purposes.",
    ],
  },
  {
    id: "retention",
    icon: FileText,
    title: "7. Data Retention",
    paragraphs: [
      "We retain information for as long as reasonably necessary for order fulfilment, customer support, business records and applicable legal requirements.",
      "Retention periods may vary depending on the type of information and the purpose for which it was collected.",
    ],
  },
  {
    id: "rights",
    icon: Eye,
    title: "8. Your Privacy Choices",
    paragraphs: [
      "You may contact us to ask about the personal information associated with your orders or to request an appropriate correction or other action, subject to applicable law and verification requirements.",
      "Some information may need to be retained where required for legal, accounting or legitimate business purposes.",
    ],
  },
  {
    id: "children",
    icon: UserRound,
    title: "9. Children's Privacy",
    paragraphs: [
      "Our website is intended for customers who can lawfully place orders. We do not knowingly seek personal information directly from children where parental consent or other legal requirements apply.",
      "If you believe a child has provided personal information inappropriately, please contact us.",
    ],
  },
  {
    id: "changes",
    icon: FileText,
    title: "10. Changes to This Policy",
    paragraphs: [
      "We may update this policy when our business practices, website features or applicable legal requirements change.",
      "The revised policy will be published on this page with an updated effective date.",
    ],
  },
];

const quickLinks = [
  {
    title: "Shipping Policy",
    description: "Delivery and order information.",
    href: "/shipping-policy",
  },
  {
    title: "Return & Refund Policy",
    description: "How order issues are handled.",
    href: "/return-policy",
  },
  {
    title: "Terms & Conditions",
    description: "Rules for using our website.",
    href: "/terms",
  },
];

export default function PrivacyPolicy() {
  const whatsappNumber = "YOUR_WHATSAPP_NUMBER";

  const contactUrl =
    whatsappNumber !== "YOUR_WHATSAPP_NUMBER"
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          "Hello Chithu's Natural Products, I have a privacy-related enquiry."
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
                <ShieldCheck size={17} />
                Your Privacy Matters
              </div>

              <h1 className="mt-5 max-w-2xl font-serif text-4xl font-bold leading-tight text-[#173F2A] sm:text-5xl lg:text-6xl">
                Privacy Policy
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-[#667064] sm:text-lg">
                Learn how Chithu’s Natural Products handles information when
                you browse our website, place an order or contact our team.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#privacy-details"
                  className="inline-flex items-center gap-2 rounded-full bg-[#285C3A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173F2A]"
                >
                  Read the Policy
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
                  <LockKeyhole size={32} className="text-[#285C3A]" />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#B17A20]">
                  Chithu’s Natural Products
                </p>

                <h2 className="mt-2 font-serif text-3xl font-bold text-[#173F2A]">
                  Your information deserves care.
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#667064]">
                  We aim to handle customer information responsibly and use it
                  for clear, legitimate business purposes.
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-[#EDE5D7] pt-5">
                  <ShieldCheck
                    size={23}
                    className="shrink-0 text-[#B17A20]"
                  />
                  <p className="text-sm font-medium text-[#285C3A]">
                    Transparency in how information is handled
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policy content */}
      <section
        id="privacy-details"
        className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16"
      >
        <div className="grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* Table of contents */}
          <aside className="rounded-2xl border border-[#E8E1D2] bg-white/75 p-5 lg:sticky lg:top-24">
            <h2 className="font-serif text-xl font-bold text-[#173F2A]">
              On This Page
            </h2>

            <nav className="mt-4 space-y-1">
              {privacySections.map(({ id, title }) => (
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

          {/* Main policy */}
          <div className="min-w-0">
            <div className="rounded-2xl border border-[#E8E1D2] bg-white/75 p-6 sm:p-9">
              <p className="text-sm leading-7 text-[#667064]">
                This Privacy Policy describes how Chithu’s Natural Products
                handles personal information in connection with our website
                and customer interactions. The final policy should reflect
                the actual tools, service providers and processes used by the
                business.
              </p>

              <div className="mt-5 rounded-xl bg-[#F5EBD6] p-4">
                <p className="text-sm leading-6 text-[#50564C]">
                  <strong>Effective date:</strong> Please insert the date this
                  policy is approved and published by your business.
                </p>
              </div>

              <div className="mt-8 divide-y divide-[#EDE5D7]">
                {privacySections.map(
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
        </div>
      </section>

      {/* Related pages */}
      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <h2 className="font-serif text-2xl font-bold text-[#173F2A] sm:text-3xl">
          More Helpful Information
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map(({ title, description, href }) => (
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

      {/* Contact banner */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-[#173F2A] p-7 sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5C67F]">
              Privacy Enquiries
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">
              Have a privacy question?
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/75">
              Contact our team if you have a question about the personal
              information associated with your orders or interactions with us.
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