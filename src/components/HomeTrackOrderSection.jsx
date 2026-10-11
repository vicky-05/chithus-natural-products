
import {
  PackageCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function HomeTrackOrderSection() {
  const steps = [
    {
      number: "01",
      title: "Payment Completed",
      description: "Your payment is received and verified.",
      icon: CreditCard,
    },
    {
      number: "02",
      title: "Order Confirmed",
      description: "Your order is confirmed and prepared for dispatch.",
      icon: CheckCircle2,
    },
    {
      number: "03",
      title: "Order Shipped",
      description:
        "Your courier details and tracking number are available in your order.",
      icon: PackageCheck,
    },
    {
      number: "04",
      title: "Track Your Shipment",
      description:
        "Open your order details, visit the courier's official website, and enter your tracking number.",
      icon: Truck,
    },
  ];

  return (
    <section className="overflow-hidden bg-[#FAF8F2] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE6D9] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#285C3A]">
            <PackageCheck size={15} />
            Order tracking
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#173F2A] sm:text-4xl">
            Your Order,{" "}
            <span className="text-[#8A9A63]">Every Step</span>
            <br className="hidden sm:block" /> of the Way
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
            From payment confirmation to delivery, discover how to follow
            your order with Chithu's Natural Products.
          </p>
        </div>

        {/* Four-step order journey */}
        <div className="relative mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-[#E8E3D8] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#C7D7C2] hover:shadow-md sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold tracking-widest text-[#9AA58F]">
                    {step.number}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EDF3E9] text-[#285C3A] transition-colors group-hover:bg-[#285C3A] group-hover:text-white">
                    <Icon size={22} />
                  </div>
                </div>

                <h3 className="mt-5 text-base font-semibold text-[#173F2A]">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="mt-5 hidden items-center gap-2 text-xs font-medium text-[#82917B] lg:flex">
                    Next step <ArrowRight size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tracking instructions */}
        <div className="mx-auto mt-8 flex max-w-4xl flex-col items-start gap-4 rounded-2xl border border-[#DCE6D9] bg-[#F0F4EB] p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#285C3A]">
            <Truck size={23} />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-[#173F2A]">
              Where can you track your order?
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              After your order is shipped, visit your order details page.
              There you can find your courier's official tracking link and
              tracking number. Open that link and enter the number to check
              your delivery status.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
