import {
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Wallet,
  Clock3,
} from "lucide-react";

const paymentSteps = [
  {
    number: "01",
    title: "Place Your Order",
    description:
      "Choose your favourite products and complete checkout on our website.",
    icon: ShoppingBag,
  },
  {
    number: "02",
    title: "Confirm on WhatsApp",
    description:
      "WhatsApp opens with your order details. Review the message and tap Send.",
    icon: MessageCircle,
  },
  {
    number: "03",
    title: "Receive Payment Details",
    description:
      "Our team confirms product availability and shares the UPI ID or QR code.",
    icon: QrCode,
  },
  {
    number: "04",
    title: "Pay Using UPI",
    description:
      "Use your preferred UPI app to complete the payment using the details provided.",
    icon: Wallet,
  },
];

export default function HowToPaySection() {
  return (
    <section className="relative overflow-hidden bg-[#FAF7EF] px-4 py-14 sm:px-6 sm:py-20">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full border border-[#DCE5D8]" />
      <div className="pointer-events-none absolute -right-20 bottom-12 h-72 w-72 rounded-full border border-[#E8D5A8]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE5D8] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#285C3A]">
            <Wallet size={15} />
            Simple & Convenient Payments
          </span>

          <h2 className="mt-5 font-serif text-3xl font-bold leading-tight text-[#173F2A] sm:text-4xl lg:text-5xl">
            How to Pay for
            <span className="mt-1 block text-[#B5832F]">
              Your Order
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#667064] sm:text-base">
            A simple, guided payment process from order confirmation
            to UPI payment.
          </p>
        </div>

        {/* Payment method highlight */}
        <div className="mx-auto mt-9 max-w-3xl rounded-[28px] border border-[#DCE5D8] bg-white p-5 shadow-[0_10px_35px_rgba(23,63,42,0.05)] sm:p-7">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E7F0E8] text-[#285C3A]">
              <QrCode size={32} strokeWidth={1.7} />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B17A20]">
                Available Payment Method
              </p>

              <h3 className="mt-2 font-serif text-2xl font-bold text-[#173F2A]">
                UPI & QR Code
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#667064]">
                Receive the UPI ID or QR code from our team after
                your order details have been confirmed.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#E7F0E8] px-4 py-2 text-sm font-semibold text-[#285C3A]">
              <CheckCircle2 size={17} />
              Easy Payment
            </div>
          </div>
        </div>

        {/* Four payment steps */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-5">
          {paymentSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className="group relative rounded-[26px] border border-[#E8E1D2] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#C9D8CB] hover:shadow-[0_16px_38px_rgba(36,40,33,0.08)] sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-3xl font-bold text-[#D6D9CD] transition group-hover:text-[#C79A3B]">
                    {step.number}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F4EA] text-[#285C3A]">
                    <Icon size={23} strokeWidth={1.8} />
                  </div>
                </div>

                <h3 className="mt-6 font-serif text-xl font-bold text-[#173F2A]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#667064]">
                  {step.description}
                </p>

                {index < paymentSteps.length - 1 && (
                  <div className="mt-5 hidden items-center gap-2 text-xs text-[#A1AA9B] lg:flex">
                    <span className="h-px flex-1 bg-[#DCE5D8]" />
                    <ArrowRight size={15} />
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Important payment notice */}
        <div className="mt-8 rounded-[24px] border border-[#E8D5A8] bg-[#FFF8E9] p-5 sm:mt-10 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F6E7C6] text-[#8D671D]">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-[#173F2A] sm:text-xl">
                A quick reminder before you pay
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#665A43]">
                Please wait for our team to confirm product
                availability and share the payment details.
                Verify the recipient in your UPI app before
                approving the payment. Never share your UPI PIN
                or OTP with anyone.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom reassurance */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-[#667064] sm:gap-x-9">
          <span className="flex items-center gap-2">
            <MessageCircle size={16} className="text-[#285C3A]" />
            WhatsApp Order Confirmation
          </span>

          <span className="flex items-center gap-2">
            <Clock3 size={16} className="text-[#285C3A]" />
            Payment After Confirmation
          </span>

          <span className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#285C3A]" />
            Verify Before Paying
          </span>
        </div>
      </div>
    </section>
  );
}