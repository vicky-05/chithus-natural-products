import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { socialLinks } from "../config/socialLinks";
import heroImage from "../assets/chithus-hero.png";
import { useGlobalUI } from "../context/GlobalUIContext";

// --------------------------------------------------
// Demo order data
// Later this will come from Spring Boot using orderId
// --------------------------------------------------

const order = {
  orderId: "CNP-20261008-001",
  orderDate: "8 October 2026",
  status: "Order Received",

  customer: {
    name: "Your Customer",
    mobile: "9876543210",
    email: "customer@example.com",
  },

  address: {
    address: "House No, Street, Area, Landmark",
    city: "Madurai",
    state: "Tamil Nadu",
    pincode: "625001",
  },

  items: [
    {
      id: 1,
      name: "ABC Malt",
      weight: "500 g",
      quantity: 1,
      price: 200,
      image: heroImage,
    },
    {
      id: 2,
      name: "Ragi Laddu",
      weight: "250 g",
      quantity: 2,
      price: 150,
      image: heroImage,
    },
    {
      id: 3,
      name: "Biryani Masala",
      weight: "100 g",
      quantity: 1,
      price: 90,
      image: heroImage,
    },
  ],

  subtotal: 590,
  deliveryCharge: 40,
  total: 630,
};

// --------------------------------------------------
// Product Row
// --------------------------------------------------

function OrderProduct({ item }) {
  return (
    <div className="flex gap-3 border-b border-[#E8E1D2] py-4 last:border-b-0">
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F1EBDD]">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover"
        />

        <span className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#173F2A] px-1 text-[9px] font-bold text-white">
          {item.quantity}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-[#173F2A]">
          {item.name}
        </h3>

        <p className="mt-1 text-xs text-[#667064]">
          {item.weight}
        </p>

        <p className="mt-1 text-[11px] text-[#8A8D87]">
          Quantity: {item.quantity}
        </p>
      </div>

      <p className="shrink-0 text-sm font-bold text-[#173F2A]">
        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

// --------------------------------------------------
// Order Success
// --------------------------------------------------

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { notify } = useGlobalUI();

  const displayOrderId = orderId || order.orderId;

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(displayOrderId);

      notify("Order ID copied to clipboard.", {
        type: "success",
        title: "Copied successfully",
      });
    } catch {
      notify(
        "Unable to copy the order ID. Please copy it manually.",
        {
          type: "error",
          title: "Copy failed",
        }
      );
    }
  };

  const handleWhatsApp = () => {
    const whatsappUrl = socialLinks.whatsapp;

    if (!whatsappUrl) {
      notify(
        "WhatsApp contact is currently unavailable.",
        {
          type: "warning",
          title: "WhatsApp unavailable",
        }
      );
      return;
    }

    const message = encodeURIComponent(
      `Hello Chithu's Natural Products,

I have placed an order.

Order ID: ${displayOrderId}
Name: ${order.customer.name}
Total: ₹${order.total}

I would like to confirm my order.`
    );

    window.open(
      `${whatsappUrl}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  };


  return (
    <div className="min-h-screen bg-[#FAF7EF]">
      {/* ==================================================
          TOP HERO
      ================================================== */}

      <section className="relative overflow-hidden border-b border-[#E8E1D2] bg-[#F4EFE3]">
        {/* Decorative background */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-1/2 opacity-50">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full border border-[#D8E2D5]" />

          <div className="absolute left-16 top-20 h-32 w-32 rounded-full border border-[#E8D5A8]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center lg:grid-cols-[1fr_0.75fr]">
          {/* LEFT */}
          <div className="relative z-10 px-4 py-9 sm:px-6 lg:py-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#667064]">
              <Link
                to="/"
                className="transition hover:text-[#285C3A]"
              >
                Home
              </Link>

              <span>›</span>

              <span className="text-[#285C3A]">
                Order Confirmed
              </span>
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.28em] text-[#C79A3B]">
              Thank You
            </p>

            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#173F2A] sm:text-5xl lg:text-6xl">
              Order Confirmed
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#667064] sm:text-base">
              Your order has been received. We're getting
              your wholesome goodness ready.
            </p>
          </div>

          {/* RIGHT — SAME IMAGE POSITION AS CHECKOUT */}
          <div className="relative hidden h-[230px] overflow-hidden lg:block">
            <img
              src={heroImage}
              alt="Chithu's Natural Products"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Cream fade */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F4EFE3] via-[#F4EFE3]/20 to-transparent" />

            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F4EFE3] to-transparent" />


          </div>
        </div>
      </section>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        <section className="relative overflow-hidden rounded-[30px] border border-[#DCE5D8] bg-white px-5 py-10 text-center shadow-[0_15px_45px_rgba(36,40,33,0.05)] sm:px-10 sm:py-12">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full border border-[#E7F0E8]" />

          <div className="pointer-events-none absolute -bottom-20 -right-10 h-48 w-48 rounded-full border border-[#E8D5A8]" />

          {/* Success icon */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
            <CheckCircle2
              size={46}
              strokeWidth={1.6}
            />

            <span className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#C79A3B] text-white">
              <Check size={13} strokeWidth={3} />
            </span>
          </div>

          <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">
            Successfully Placed
          </p>

          <h2 className="relative mt-2 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
            Thank you for your order!
          </h2>

          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-6 text-[#667064]">
            We've received your order details. Our team will
            contact you on WhatsApp to confirm the order and
            share the payment details.
          </p>

          {/* Order ID */}
          <div className="relative mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-[#F3F0E8] px-4 py-2.5">
            <span className="text-xs text-[#667064]">
              Order ID
            </span>

            <span className="text-sm font-bold text-[#173F2A]">
              {displayOrderId}
            </span>

            <button
              type="button"
              onClick={copyOrderId}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#285C3A] transition hover:bg-[#E7F0E8]"
              aria-label="Copy order ID"
            >
              <Copy size={13} />
            </button>
          </div>

          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_25px_rgba(37,211,102,0.2)] transition hover:scale-[1.02] hover:bg-[#20BE5A]"
          >
            <MessageCircle size={19} />
            Confirm on WhatsApp
            <ArrowRight size={17} />
          </button>
        </section>

        {/* ==================================================
            ORDER STATUS
        ================================================== */}

        <section className="mt-6 rounded-[26px] border border-[#E5DCC8] bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C79A3B]">
                Order Status
              </p>

              <h2 className="mt-1 font-serif text-2xl font-bold text-[#173F2A]">
                Your order journey
              </h2>
            </div>

            <span className="hidden rounded-full bg-[#E7F0E8] px-4 py-2 text-xs font-bold text-[#285C3A] sm:block">
              Order Received
            </span>
          </div>

          <div className="mt-7 grid grid-cols-4">
            {/* Received */}
            <div className="relative text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#285C3A] text-white">
                <Check size={20} strokeWidth={3} />
              </div>

              <p className="mt-2 text-xs font-bold text-[#173F2A]">
                Order Received
              </p>

              <p className="mt-1 hidden text-[10px] text-[#8A8D87] sm:block">
                Now
              </p>

              <div className="absolute left-1/2 top-5 -z-0 h-px w-full bg-[#DCE5D8]" />
            </div>

            {/* Confirm */}
            <div className="relative text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#C9C7BE] bg-white text-[#8A8D87]">
                <Clock3 size={19} />
              </div>

              <p className="mt-2 text-xs font-medium text-[#667064]">
                Confirmed
              </p>

              <p className="mt-1 hidden text-[10px] text-[#8A8D87] sm:block">
                Pending
              </p>

              <div className="absolute left-1/2 top-5 -z-0 h-px w-full bg-[#DCE5D8]" />
            </div>

            {/* Packed */}
            <div className="relative text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#C9C7BE] bg-white text-[#8A8D87]">
                <Package size={19} />
              </div>

              <p className="mt-2 text-xs font-medium text-[#667064]">
                Packed
              </p>

              <p className="mt-1 hidden text-[10px] text-[#8A8D87] sm:block">
                Pending
              </p>

              <div className="absolute left-1/2 top-5 -z-0 h-px w-full bg-[#DCE5D8]" />
            </div>

            {/* Delivered */}
            <div className="relative text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#C9C7BE] bg-white text-[#8A8D87]">
                <Truck size={19} />
              </div>

              <p className="mt-2 text-xs font-medium text-[#667064]">
                Delivered
              </p>

              <p className="mt-1 hidden text-[10px] text-[#8A8D87] sm:block">
                Pending
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================
            ORDER DETAILS GRID
        ================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* LEFT — PRODUCTS */}
          <section className="rounded-[26px] border border-[#E5DCC8] bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-[#E8E1D2] pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C79A3B]">
                  Your Order
                </p>

                <h2 className="mt-1 font-serif text-2xl font-bold text-[#173F2A]">
                  Order Items
                </h2>
              </div>

              <span className="rounded-full bg-[#F3F0E8] px-3 py-1.5 text-xs font-semibold text-[#667064]">
                {order.items.length} products
              </span>
            </div>

            <div className="mt-2">
              {order.items.map((item) => (
                <OrderProduct
                  key={item.id}
                  item={item}
                />
              ))}
            </div>

            {/* Continue shopping */}
            <div className="mt-4 border-t border-[#E8E1D2] pt-5">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#285C3A] transition hover:text-[#C79A3B]"
              >
                <ShoppingBag size={17} />
                Continue Shopping
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* PRICE SUMMARY */}
            <section className="rounded-[26px] border border-[#DCE5D8] bg-[#F0F4EA] p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C79A3B]">
                Payment Summary
              </p>

              <h2 className="mt-1 font-serif text-2xl font-bold text-[#173F2A]">
                Order Total
              </h2>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#667064]">
                    Subtotal
                  </span>

                  <span className="font-semibold text-[#242821]">
                    ₹
                    {order.subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#667064]">
                    Delivery Charge
                  </span>

                  <span className="font-semibold text-[#242821]">
                    ₹
                    {order.deliveryCharge.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="border-t border-[#D5DDCF] pt-4">
                  <div className="flex items-end justify-between">
                    <span className="font-serif text-lg font-bold text-[#173F2A]">
                      Total
                    </span>

                    <span className="font-serif text-3xl font-bold text-[#173F2A]">
                      ₹
                      {order.total.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] text-[#667064]">
                    Payment details will be shared through
                    WhatsApp.
                  </p>
                </div>
              </div>
            </section>

            {/* DELIVERY */}
            <section className="rounded-[26px] border border-[#E5DCC8] bg-white p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
                  <MapPin size={19} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#C79A3B]">
                    Delivering To
                  </p>

                  <h3 className="mt-1 font-serif text-lg font-bold text-[#173F2A]">
                    {order.customer.name}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[#667064]">
                    {order.address.address}
                    <br />
                    {order.address.city},{" "}
                    {order.address.state}
                    <br />
                    {order.address.pincode}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-[#667064]">
                    <Phone size={13} />
                    {order.customer.mobile}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ==================================================
            WHAT HAPPENS NEXT
        ================================================== */}

        <section className="mt-6 rounded-[26px] bg-[#173F2A] px-5 py-8 sm:px-8">
          <div className="grid gap-7 lg:grid-cols-[1fr_1.5fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#E8D5A8]">
                What Happens Next?
              </p>

              <h2 className="mt-2 font-serif text-3xl font-bold text-white">
                We're preparing your goodness.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#DCE5D8]">
                Our team will review your order, contact you
                through WhatsApp, share payment details and
                confirm your order.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <MessageCircle
                  size={22}
                  className="text-[#E8D5A8]"
                />

                <p className="mt-3 text-xs font-bold text-white">
                  01. Contact
                </p>

                <p className="mt-1 text-[10px] leading-4 text-[#C9D8CB]">
                  We'll connect with you on WhatsApp.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <CheckCircle2
                  size={22}
                  className="text-[#E8D5A8]"
                />

                <p className="mt-3 text-xs font-bold text-white">
                  02. Confirm
                </p>

                <p className="mt-1 text-[10px] leading-4 text-[#C9D8CB]">
                  Your order will be confirmed.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <Package
                  size={22}
                  className="text-[#E8D5A8]"
                />

                <p className="mt-3 text-xs font-bold text-white">
                  03. Prepare
                </p>

                <p className="mt-1 text-[10px] leading-4 text-[#C9D8CB]">
                  We'll carefully prepare your order.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#285C3A] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#173F2A]"
          >
            Continue Shopping
            <ArrowRight size={17} />
          </Link>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#C79A3B] bg-white px-7 py-3.5 text-sm font-bold text-[#8B641B] transition hover:bg-[#FFF9EC]"
          >
            <MessageCircle size={18} />
            Contact on WhatsApp
          </button>
        </div>

        {/* ==================================================
            BRAND PROMISE
        ================================================== */}

        <section className="mt-10 border-t border-[#E5DCC8] pt-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
                <CheckCircle2 size={19} />
              </div>

              <p className="mt-2 text-xs font-bold text-[#173F2A]">
                Traditional Recipes
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
                <Package size={19} />
              </div>

              <p className="mt-2 text-xs font-bold text-[#173F2A]">
                Carefully Packed
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
                <Truck size={19} />
              </div>

              <p className="mt-2 text-xs font-bold text-[#173F2A]">
                Reliable Delivery
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
                <MessageCircle size={19} />
              </div>

              <p className="mt-2 text-xs font-bold text-[#173F2A]">
                WhatsApp Support
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}