

import { useState } from "react";

import { Link, useLocation } from "react-router-dom";

import {

  ArrowLeft,

  ArrowRight,

  CheckCircle2,

  Clock3,

  Package,

  PackageCheck,

  Search,

  ShieldCheck,

  Truck,

  XCircle,

} from "lucide-react";

import { supabase } from "../lib/supabaseClient";



const formatPrice = (value) =>

  `₹${Number(value || 0).toLocaleString("en-IN")}`;



const getCourierTrackingUrl = (courierName, trackingNumber, savedUrl = "") => {
  const courier = String(courierName || "").trim().toLowerCase();
  const awb = String(trackingNumber || "").trim();
  const saved = String(savedUrl || "").trim();
  if (saved) {
    try {
      const parsed = new URL(saved);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.href;
    } catch {
      // Fall back to the known courier tracking page.
    }
  }
  if (!awb) return "";
  if (courier.includes("delhivery")) return `https://www.delhivery.com/track/package/${encodeURIComponent(awb)}`;
  if (courier.includes("st courier") || courier === "st") return "https://stcourier.com/";
  if (courier.includes("professional courier")) return "https://www.tpcindia.com/";
  if (courier.includes("india post") || courier.includes("indian post")) return "https://www.indiapost.gov.in/";
  return "";
};

const statusSteps = [

  { key: "pending", label: "Order received", icon: Clock3 },

  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },

  { key: "processing", label: "Preparing order", icon: Package },

  { key: "shipped", label: "Shipped", icon: Truck },

  { key: "delivered", label: "Delivered", icon: PackageCheck },

];



const normalizeStatus = (status) =>

  String(status || "pending").toLowerCase().trim().replace(/[\s-]+/g, "_");



const statusLabel = (status) => {

  const value = normalizeStatus(status);

  const labels = {

    pending: "Pending",

    confirmed: "Confirmed",

    processing: "Processing",

    shipped: "Shipped",

    delivered: "Delivered",

    cancelled: "Cancelled",

    canceled: "Cancelled",

    pending_confirmation: "Pending confirmation",

  };

  return labels[value] || value.replace(/_/g, " ");

};



export default function TrackOrder() {
  const location = useLocation();
  const prefilledLookup = location.state?.lockLookupFields === true;

  const [orderNumber, setOrderNumber] = useState(
    location.state?.orderNumber || "",
  );

  const [mobile, setMobile] = useState(
    String(location.state?.mobile || "").replace(/\D/g, "").slice(-10),
  );

  const [order, setOrder] = useState(null);

  const [items, setItems] = useState([]);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);



  const handleSearch = async (event) => {

    event.preventDefault();

    setError("");

    setOrder(null);

    setItems([]);



    const cleanOrderNumber = orderNumber.trim();

    const cleanMobile = mobile.replace(/\D/g, "").slice(-10);



    if (!cleanOrderNumber) {

      setError("Please enter your order number.");

      return;

    }



    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {

      setError("Enter the 10-digit mobile number used at checkout.");

      return;

    }



    setLoading(true);



    try {

      const { data, error: functionError } =

        await supabase.functions.invoke("track-order", {

          body: {

            orderNumber: cleanOrderNumber,

            mobile: cleanMobile,

          },

        });



      if (functionError) {

        throw new Error(

          data?.error || "Unable to look up your order. Please try again."

        );

      }



      if (!data?.success || !data?.order) {

        throw new Error(

          data?.error || "No matching order was found. Check your details."

        );

      }



      setOrder(data.order);

      setItems(Array.isArray(data.items) ? data.items : []);

    } catch (err) {

      setError(

        err?.message ||

          "We couldn't find your order. Please check the details and try again."

      );

    } finally {

      setLoading(false);

    }

  };



  const currentStatus = normalizeStatus(order?.status);

  const cancelled = ["cancelled", "canceled"].includes(currentStatus);

  const currentStep = statusSteps.findIndex(

    (step) => step.key === currentStatus

  );



  return (

    <main className="min-h-screen bg-[#FAF7EF] text-[#242821]">

      <section className="border-b border-[#E8E1D2] bg-[#F4EFE3]">

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">

          <Link

            to="/"

            className="inline-flex items-center gap-2 text-sm font-medium text-[#667064] hover:text-[#285C3A]"

          >

            <ArrowLeft size={16} />

            Back to home

          </Link>



          <p className="mt-7 text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">

            Your order, your peace of mind

          </p>



          <h1 className="mt-3 font-serif text-4xl font-bold text-[#173F2A] sm:text-5xl">

            Track Your Order

          </h1>



          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#667064] sm:text-base">

            Check your order status and details from Chithu&apos;s Natural

            Products. Use the order number and mobile number you provided

            during checkout.

          </p>

        </div>

      </section>



      <div className="mx-auto grid max-w-6xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-12">

        <section className="h-fit rounded-[24px] border border-[#E5DCC8] bg-white p-5 shadow-sm sm:p-7">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F0E8] text-[#285C3A]">

            <Search size={23} />

          </div>



          <h2 className="mt-5 font-serif text-2xl font-bold text-[#173F2A]">

            Find your order

          </h2>



          <p className="mt-2 text-sm leading-6 text-[#667064]">

            Your mobile number is used to verify the order lookup.

          </p>



          <form onSubmit={handleSearch} className="mt-6 space-y-5">

            <div>

              <label

                htmlFor="orderNumber"

                className="mb-2 block text-sm font-semibold"

              >

                Order number

              </label>

              <input

                id="orderNumber"

                value={orderNumber}

                onChange={(event) => setOrderNumber(event.target.value)}
                readOnly={prefilledLookup}
                aria-readonly={prefilledLookup}
                placeholder="e.g. CH-CCCA345705"
                autoComplete="off"
                className={`h-12 w-full rounded-xl border border-[#DDD8C8] px-4 text-sm outline-none focus:border-[#285C3A] focus:ring-2 focus:ring-[#E7F0E8] ${prefilledLookup ? "cursor-not-allowed bg-[#F3F3EE] text-[#667064]" : "bg-[#FEFDFC]"}`}

              />

            </div>



            <div>

              <label

                htmlFor="mobile"

                className="mb-2 block text-sm font-semibold"

              >

                Checkout mobile number

              </label>

              <input

                id="mobile"

                type="tel"

                inputMode="numeric"

                autoComplete="tel"

                maxLength={10}

                value={mobile}
                onChange={(event) =>
                  setMobile(
                    event.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                readOnly={prefilledLookup}
                aria-readonly={prefilledLookup}
                placeholder="10-digit mobile number"
                className={`h-12 w-full rounded-xl border border-[#DDD8C8] px-4 text-sm outline-none focus:border-[#285C3A] focus:ring-2 focus:ring-[#E7F0E8] ${prefilledLookup ? "cursor-not-allowed bg-[#F3F3EE] text-[#667064]" : "bg-[#FEFDFC]"}`}

              />

            </div>



            {error && (

              <div

                role="alert"

                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"

              >

                <XCircle size={18} className="mt-0.5 shrink-0" />

                <span>{error}</span>

              </div>

            )}



            <button

              type="submit"

              disabled={loading}

              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#173F2A] px-5 text-sm font-bold text-white transition hover:bg-[#285C3A] disabled:cursor-not-allowed disabled:opacity-60"

            >

              {loading ? (

                <>

                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                  Looking up order...

                </>

              ) : (

                <>

                  Track Order

                  <ArrowRight size={17} />

                </>

              )}

            </button>

          </form>



          <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#F4EFE3] p-3 text-xs leading-5 text-[#667064]">

            <ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#285C3A]" />

            Your order details are returned only after the order number and

            mobile number match.

          </div>

        </section>



        <section className="min-w-0">

          {!order ? (

            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#D8D0BD] bg-white/60 px-6 py-10 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">

                <PackageCheck size={30} />

              </div>

              <h2 className="mt-5 font-serif text-2xl font-bold text-[#173F2A]">

                Your order details will appear here

              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-[#667064]">

                Enter your order number and checkout mobile number to view

                the latest order information.

              </p>

            </div>

          ) : (

            <div className="space-y-5">

              <section className="rounded-[24px] border border-[#E5DCC8] bg-white p-5 shadow-sm sm:p-7">

                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-[#667064]">

                      Order number

                    </p>

                    <h2 className="mt-1 break-all font-serif text-2xl font-bold text-[#173F2A]">

                      {order.order_number}

                    </h2>

                    {order.created_at && (

                      <p className="mt-2 text-xs text-[#667064]">

                        Placed on{" "}

                        {new Date(order.created_at).toLocaleString("en-IN", {

                          dateStyle: "medium",

                          timeStyle: "short",

                        })}

                      </p>

                    )}

                  </div>



                  <span className="rounded-full bg-[#E7F0E8] px-3 py-1.5 text-xs font-bold capitalize text-[#285C3A]">

                    {statusLabel(order.status)}

                  </span>

                </div>



                {!cancelled && (

                  <div className="mt-8">

                    <div className="space-y-5">

                      {statusSteps.map((step, index) => {

                        const Icon = step.icon;

                        const reached =

                          currentStep >= 0 && index <= currentStep;

                        const active = index === currentStep;



                        return (

                          <div key={step.key} className="flex gap-3">

                            <div className="flex flex-col items-center">

                              <div

                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${

                                  reached

                                    ? "bg-[#285C3A] text-white"

                                    : "border border-[#DDD8C8] bg-white text-[#8A8D87]"

                                } ${active ? "ring-4 ring-[#E7F0E8]" : ""}`}

                              >

                                <Icon size={17} />

                              </div>

                              {index < statusSteps.length - 1 && (

                                <div

                                  className={`mt-1 h-6 w-0.5 ${

                                    index < currentStep

                                      ? "bg-[#285C3A]"

                                      : "bg-[#DDD8C8]"

                                  }`}

                                />

                              )}

                            </div>

                            <div className="pt-1.5">

                              <p

                                className={`text-sm font-semibold ${

                                  reached ? "text-[#173F2A]" : "text-[#8A8D87]"

                                }`}

                              >

                                {step.label}

                              </p>

                              {active && (

                                <p className="mt-1 text-xs text-[#667064]">

                                  Current order status

                                </p>

                              )}

                            </div>

                          </div>

                        );

                      })}

                    </div>

                  </div>

                )}



                {cancelled && (

                  <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">

                    This order has been cancelled. Please contact the business

                    if you need assistance.

                  </p>

                )}



                {order.tracking_number && !cancelled && (
                  <div className="mt-5 rounded-2xl border border-[#DDE7D8] bg-[#F7FAF4] p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F0E8] text-[#285C3A]">
                        <Truck size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#667064]">Courier tracking</p>
                        <p className="mt-1 text-base font-bold text-[#173F2A]">{order.courier_name || "Courier shipment"}</p>
                        <p className="mt-2 text-sm text-[#667064]">AWB / Tracking number</p>
                        <p className="mt-1 break-all font-semibold text-[#173F2A]">{order.tracking_number}</p>
                        {getCourierTrackingUrl(order.courier_name, order.tracking_number, order.tracking_url) && (
                          <a href={getCourierTrackingUrl(order.courier_name, order.tracking_number, order.tracking_url)} target="_blank" rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#173F2A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#285C3A]">
                            Track shipment <ArrowRight size={16} />
                          </a>
                        )}
                        <p className="mt-3 text-xs leading-5 text-[#667064]">
                          Some courier websites ask you to enter the AWB number again to see live delivery updates.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === -1 && !cancelled && (

                  <p className="mt-5 rounded-xl bg-[#F4EFE3] p-4 text-sm leading-6 text-[#667064]">

                    Your order has status “{statusLabel(order.status)}”.

                    The tracking steps will update when the order status

                    changes.

                  </p>

                )}

              </section>



              <section className="rounded-[24px] border border-[#E5DCC8] bg-white p-5 shadow-sm sm:p-7">

                <h3 className="font-serif text-xl font-bold text-[#173F2A]">

                  Items in your order

                </h3>



                <div className="mt-4 divide-y divide-[#E8E1D2]">

                  {items.map((item) => (

                    <div

                      key={item.id}

                      className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"

                    >

                      <div className="min-w-0">

                        <p className="break-words text-sm font-semibold text-[#173F2A]">

                          {item.product_name}

                        </p>

                        {item.variant_label && (

                          <p className="mt-1 text-xs text-[#667064]">

                            {item.variant_label}

                          </p>

                        )}

                        <p className="mt-1 text-xs text-[#667064]">

                          Qty: {item.quantity}

                        </p>

                      </div>

                      <p className="shrink-0 text-sm font-bold text-[#173F2A]">

                        {formatPrice(item.line_total)}

                      </p>

                    </div>

                  ))}

                </div>



                <div className="mt-5 space-y-3 border-t border-[#E8E1D2] pt-5 text-sm">

                  <div className="flex justify-between gap-4">

                    <span className="text-[#667064]">Subtotal</span>

                    <span>{formatPrice(order.subtotal)}</span>

                  </div>

                  <div className="flex justify-between gap-4">

                    <span className="text-[#667064]">Delivery</span>

                    <span>

                      {Number(order.delivery_charge) === 0

                        ? "FREE"

                        : formatPrice(order.delivery_charge)}

                    </span>

                  </div>

                  <div className="flex justify-between gap-4 border-t border-[#E8E1D2] pt-4 text-base font-bold text-[#173F2A]">

                    <span>Total</span>

                    <span>{formatPrice(order.total_amount)}</span>

                  </div>

                  <div className="flex justify-between gap-4 pt-1">

                    <span className="text-[#667064]">Payment</span>

                    <span className="font-semibold capitalize">

                      {statusLabel(order.payment_status)}

                    </span>

                  </div>

                </div>

              </section>

            </div>

          )}

        </section>

      </div>



      <footer className="border-t border-[#E8E1D2] bg-[#F4EFE3]">

        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-[#667064] sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <p>Chithu&apos;s Natural Products</p>

          <Link

            to="/shop"

            className="inline-flex items-center gap-2 font-semibold text-[#285C3A] hover:underline"

          >

            Continue shopping

            <ArrowRight size={16} />

          </Link>

        </div>

      </footer>

    </main>

  );

}
