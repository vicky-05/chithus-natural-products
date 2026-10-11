import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Package,
  Camera,
  Clock,
  RefreshCw,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  CircleHelp,
  FileText,
} from "lucide-react";

const returnSteps = [
  {
    number: "01",
    title: "Contact Our Team",
    description:
      "Tell us about the issue and provide your order details.",
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "Share the Details",
    description:
      "Provide clear photos of the product and packaging when relevant.",
    icon: Camera,
  },
  {
    number: "03",
    title: "Review",
    description:
      "Our team will review your request and explain the available options.",
    icon: FileText,
  },
  {
    number: "04",
    title: "Resolution",
    description:
      "We will communicate the next steps based on the circumstances and applicable policy.",
    icon: CheckCircle2,
  },
];

const faqs = [
  {
    question: "What if I receive a damaged product?",
    answer:
      "Contact us promptly with your order details and clear photographs of the damaged product and packaging. Our team will review the issue and advise you on the next steps.",
  },
  {
    question: "What if I receive the wrong product?",
    answer:
      "Please contact customer support with your order details and photographs of the product received so we can investigate the issue.",
  },
  {
    question: "Can I return a food product after opening it?",
    answer:
      "Return eligibility depends on the nature of the issue and applicable law and policy. Please contact our team before sending any product back. Do not consume a product you believe may be unsafe.",
  },
  {
    question: "Can I cancel an order?",
    answer:
      "Cancellation may depend on whether the order has been processed or dispatched. Contact us as soon as possible to ask whether cancellation is possible.",
  },
  {
    question: "How will a refund be processed?",
    answer:
      "If a refund is approved, our team will explain the refund method and expected processing time before proceeding.",
  },
  {
    question: "Who should I contact about a return or refund?",
    answer:
      "Use our Contact page or the customer support link below. Include your order details so we can assist you more efficiently.",
  },
];

export default function ReturnPolicy() {
  const whatsappNumber = "YOUR_WHATSAPP_NUMBER";

  const whatsappUrl =
    whatsappNumber !== "YOUR_WHATSAPP_NUMBER"
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          "Hello Chithu's Natural Products, I need help with a return or refund."
        )}`
      : "/contact";

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#242821]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#E8E1D2]">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#E7F0E8] opacity-70 blur-3xl" />
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
                Customer Care Policy
              </div>

              <h1 className="mt-5 max-w-2xl font-serif text-4xl font-bold leading-tight text-[#173F2A] sm:text-5xl lg:text-6xl">
                Return & Refund Policy
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-[#667064] sm:text-lg">
                Your experience matters to us. Find out how to contact our
                team if an order arrives damaged, incorrect or with another
                issue.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#return-process"
                  className="inline-flex items-center gap-2 rounded-full bg-[#285C3A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173F2A]"
                >
                  How It Works
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
                  <RefreshCw size={32} className="text-[#285C3A]" />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#B17A20]">
                  Here to Help
                </p>

                <h2 className="mt-2 font-serif text-3xl font-bold text-[#173F2A]">
                  Let’s resolve it together.
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#667064]">
                  If something is not right with your order, contact us with
                  the details so we can understand the issue and guide you
                  through the next steps.
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-[#EDE5D7] pt-5">
                  <ShieldCheck
                    size={23}
                    className="shrink-0 text-[#B17A20]"
                  />
                  <p className="text-sm font-medium text-[#285C3A]">
                    Every request is reviewed individually
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policy overview */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B17A20]">
            Our Policy
          </p>

          <h2 className="mt-3 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
            What happens if there is a problem?
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#667064] sm:text-base">
            Please contact us if you receive a damaged or incorrect product,
            or experience another order issue. We will review the information
            you provide and explain the available resolution under our
            applicable policy and consumer protection requirements.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-[#E8E1D2] bg-white/75 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5EBD6]">
              <Package size={25} className="text-[#A66C0D]" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#173F2A]">
              Damaged Products
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#667064]">
              Contact us with photos of the product and parcel so the damage
              can be reviewed.
            </p>
          </article>

          <article className="rounded-2xl border border-[#E8E1D2] bg-white/75 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5EBD6]">
              <AlertCircle size={25} className="text-[#A66C0D]" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#173F2A]">
              Incorrect Orders
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#667064]">
              Let us know if the product delivered does not match your order.
            </p>
          </article>

          <article className="rounded-2xl border border-[#E8E1D2] bg-white/75 p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5EBD6]">
              <Clock size={25} className="text-[#A66C0D]" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#173F2A]">
              Refund Updates
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#667064]">
              If a refund is approved, we will communicate the method and
              expected processing timeline.
            </p>
          </article>
        </div>
      </section>

      {/* Return process */}
      <section
        id="return-process"
        className="border-y border-[#E8E1D2] bg-white/50"
      >
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B17A20]">
              Simple Process
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
              How to report an issue
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#667064]">
              Follow these steps to help us understand your concern.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {returnSteps.map(
              ({ number, title, description, icon: Icon }) => (
                <article
                  key={number}
                  className="rounded-2xl border border-[#E8E1D2] bg-[#FAF7EF] p-6"
                >
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
              )
            )}
          </div>
        </div>
      </section>

      {/* Important guidance */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#E8E1D2] bg-white/75 p-7 sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E7F0E8]">
              <Camera size={25} className="text-[#285C3A]" />
            </div>

            <h2 className="mt-5 font-serif text-2xl font-bold text-[#173F2A]">
              Information to share
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#667064]">
              To help us review your request, please provide the following
              where applicable:
            </p>

            <ul className="mt-5 space-y-3">
              {[
                "Your order number or order details",
                "Name and contact information used for the order",
                "A description of the issue",
                "Clear photographs of the product and packaging, if relevant",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-6 text-[#50564C]"
                >
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-[#285C3A]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-[#E8E1D2] bg-[#F1EBD9] p-7 sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/80">
              <AlertCircle size={25} className="text-[#A66C0D]" />
            </div>

            <h2 className="mt-5 font-serif text-2xl font-bold text-[#173F2A]">
              Please note
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#50564C]">
              Food products can have special handling and safety
              considerations. Contact us before sending a product back so
              that we can provide the appropriate instructions.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#50564C]">
              Nothing in this policy is intended to limit any rights or
              remedies available to customers under applicable law.
            </p>

            <Link
              to="/shipping-policy"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#285C3A] hover:underline"
            >
              Read Shipping Policy
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-4xl px-5 pb-12 sm:px-8 sm:pb-16">
        <div className="text-center">
          <CircleHelp size={32} className="mx-auto text-[#B17A20]" />

          <h2 className="mt-4 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
            Return & Refund FAQs
          </h2>
        </div>

        <div className="mt-8 space-y-3">
          {faqs.map(({ question, answer }) => (
            <details
              key={question}
              className="group rounded-2xl border border-[#E8E1D2] bg-white/75 p-5 open:bg-white"
            >
              <summary className="cursor-pointer list-none font-semibold text-[#173F2A]">
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

      {/* Support */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-[#173F2A] p-7 sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5C67F]">
              Need Assistance?
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">
              We’re here to listen.
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/75">
              Contact us with your order details and our team will guide you
              through the next steps.
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