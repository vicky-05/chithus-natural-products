
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Leaf,
  Package,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
  XCircle,
  Ban,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useGlobalUI } from "../context/GlobalUIContext";

const filters = [
  "All Orders",
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const statusStyles = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-sky-100 text-sky-800",
  Processing: "bg-amber-100 text-amber-800",
  Shipped: "bg-blue-100 text-blue-800",
  Delivered: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-red-100 text-red-700",
};

const statusIcons = {
  Pending: Clock3,
  Confirmed: PackageCheck,
  Processing: Clock3,
  Shipped: Truck,
  Delivered: PackageCheck,
  Cancelled: XCircle,
};

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeStatus = (status) => {
  const value = String(status || "pending").trim().toLowerCase();

  const statuses = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };

  return statuses[value] || "Pending";
};

const normalizePayment = (status) => {
  const value = String(status || "unpaid").trim().toLowerCase();

  const payments = {
    paid: "Paid",
    unpaid: "Unpaid",
    pending: "Payment pending",
    failed: "Payment failed",
    refunded: "Refunded",
    partially_refunded: "Partially refunded",
  };

  return payments[value] || value.replaceAll("_", " ");
};

const canCancelOrder = (status) =>
  status === "Pending" || status === "Confirmed";

const getTimeline = (status, createdAt) => {
  const stages = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  if (status === "Cancelled") {
    return [
      {
        label: "Order placed",
        date: formatDate(createdAt),
        done: true,
      },
      {
        label: "Cancelled",
        date: "This order was cancelled",
        done: true,
        cancelled: true,
      },
    ];
  }

  const currentIndex = stages.indexOf(status);

  return stages.map((label, index) => ({
    label,
    date:
      index === 0
        ? formatDate(createdAt)
        : index < currentIndex
          ? "Completed"
          : index === currentIndex
            ? "Current status"
            : "Awaiting update",
    done: index <= currentIndex,
    active: index === currentIndex,
  }));
};

function OrderStatus({ status }) {
  const Icon = statusIcons[status] || Package;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[status] || "bg-gray-100 text-gray-700"
        }`}
    >
      <Icon size={14} />
      {status}
    </span>
  );
}

function ProductPreview({ item }) {
  return (
    <div className="min-w-0">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#F7F4EA] p-2">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Package size={32} className="text-[#9AA093]" />
        )}
      </div>

      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-4 text-[#30372D]">
        {item.name}
      </p>

      <p className="mt-1 text-xs text-[#7C8277]">
        {item.size ? `${item.size} × ` : "Qty: "}
        {item.quantity}
      </p>
    </div>
  );
}

function OrderTimeline({ timeline }) {
  return (
    <div>
      {timeline.map((step, index) => (
        <div
          key={`${step.label}-${index}`}
          className="flex gap-3"
        >
          <div className="flex w-5 shrink-0 flex-col items-center">
            <span
              className={`z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 ${step.cancelled
                ? "border-red-500 bg-red-500 text-white"
                : step.done
                  ? "border-[#285C3A] bg-[#285C3A] text-white"
                  : step.active
                    ? "border-[#9AB69A] bg-[#E7F0E8]"
                    : "border-[#D8DCD2] bg-white"
                }`}
            >
              {step.cancelled ? (
                <XCircle size={13} />
              ) : step.done ? (
                <Check size={12} strokeWidth={3} />
              ) : null}
            </span>

            {index < timeline.length - 1 && (
              <span
                className={`min-h-7 w-0.5 flex-1 ${step.done ? "bg-[#9AB69A]" : "bg-[#E4E6DE]"
                  }`}
              />
            )}
          </div>

          <div className="pb-5">
            <p
              className={`text-xs font-semibold ${step.active || step.done
                ? "text-[#30372D]"
                : "text-[#82877E]"
                }`}
            >
              {step.label}
            </p>

            <p className="mt-1 text-xs leading-4 text-[#858A80]">
              {step.date}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

const getCourierTrackingUrl = (
  courierName,
  trackingNumber,
  savedUrl = ""
) => {
  const courier = String(courierName || "").trim().toLowerCase();
  const awb = String(trackingNumber || "").trim();
  const saved = String(savedUrl || "").trim();

  if (saved) {
    try {
      const parsed = new URL(saved);

      if (
        parsed.protocol === "https:" ||
        parsed.protocol === "http:"
      ) {
        return parsed.href;
      }
    } catch {
      // Fall back to the known courier tracking page.
    }
  }

  if (!awb) return "";

  if (courier.includes("delhivery")) {
    return `https://www.delhivery.com/track/package/${encodeURIComponent(awb)}`;
  }

  if (courier.includes("st courier") || courier === "st") {
    return "https://stcourier.com/";
  }

  if (courier.includes("professional courier")) {
    return "https://www.tpcindia.com/";
  }

  if (
    courier.includes("india post") ||
    courier.includes("indian post")
  ) {
    return "https://www.indiapost.gov.in/";
  }

  return "";
};

function OrderCard({
  order,
  onCancelOrder,
  cancellingOrderId,
}) {
  const displayedItems = order.items.slice(0, 3);
  const remaining = order.items.length - displayedItems.length;
  const isCancelling = cancellingOrderId === order.id;
  const showCancelButton = canCancelOrder(order.status);

  const trackingUrl = getCourierTrackingUrl(
    order.courier_name,
    order.tracking_number,
    order.tracking_url
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-[#EAE6DA] bg-white shadow-[0_5px_22px_rgba(40,92,58,0.035)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F0EEE7] px-5 py-5 sm:px-6">
        <div>
          <p className="break-all text-sm font-bold text-[#242821]">
            Order #{order.order_number || order.id}
          </p>

          <p className="mt-1.5 text-xs text-[#7B8177]">
            {formatDate(order.created_at)}
            {formatTime(order.created_at)
              ? ` · ${formatTime(order.created_at)}`
              : ""}
          </p>
        </div>

        <OrderStatus status={order.status} />
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="min-w-0">
          {order.items.length ? (
            <div className="grid grid-cols-3 gap-3 sm:max-w-md">
              {displayedItems.map((item, index) => (
                <ProductPreview
                  key={item.id || `${item.name}-${index}`}
                  item={item}
                />
              ))}

              {remaining > 0 && (
                <div className="flex aspect-square flex-col items-center justify-center rounded-xl bg-[#F7F4EA] text-[#647060]">
                  <span className="text-lg font-semibold">
                    +{remaining}
                  </span>
                  <span className="text-xs">more items</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#72796E]">
              No item details are available for this order.
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-[#F0EEE7] pt-4">
            <div>
              <p className="text-xs text-[#7B8177]">
                Total amount
              </p>

              <p className="mt-1 text-xl font-bold text-[#174B2F]">
                {formatPrice(order.total_amount)}
              </p>
            </div>

            <p className="text-xs text-[#7B8177]">
              Payment:{" "}
              <span className="font-medium text-[#4F594B]">
                {normalizePayment(order.payment_status)}
              </span>
            </p>
          </div>

          <Link
            to="/track-order"
            state={{
              orderNumber: order.order_number || "",
              mobile: order.phone || "",
              lockLookupFields: true,
            }}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#204A2F]"
          >
            Track this order
            <ArrowRight size={16} />
          </Link>

          {order.tracking_number && (
            <div className="mt-3 rounded-xl border border-[#DDE7D8] bg-[#F7FAF4] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#647060]">
                Shipment tracking
              </p>

              <p className="mt-2 break-words text-sm font-semibold text-[#242821]">
                {order.courier_name || "Courier"} · AWB:{" "}
                {order.tracking_number}
              </p>

              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#285C3A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#204A2F]"
                >
                  Track shipment
                  <ArrowRight size={15} />
                </a>
              )}

              <p className="mt-2 text-xs leading-5 text-[#72796E]">
                If the courier page asks for a tracking number, enter
                the AWB shown above.
              </p>
            </div>
          )}

          {showCancelButton && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => onCancelOrder(order)}
                disabled={Boolean(cancellingOrderId)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCancelling ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Cancelling order...
                  </>
                ) : (
                  <>
                    <Ban size={16} />
                    Cancel order
                  </>
                )}
              </button>

              <p className="mt-2 text-center text-xs leading-5 text-[#858A80]">
                Cancellation is available while your order is pending
                or confirmed.
              </p>
            </div>
          )}

          {order.status === "Processing" ||
            order.status === "Shipped" ? (
            <p className="mt-3 rounded-xl bg-[#F7F4EA] px-4 py-3 text-xs leading-5 text-[#72796E]">
              This order is already being prepared or shipped. Please{" "}
              <Link
                to="/contact"
                className="font-semibold text-[#285C3A] underline"
              >
                contact us
              </Link>{" "}
              if you need assistance.
            </p>
          ) : null}
        </div>

        <div className="border-t border-[#F0EEE7] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-1">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#777F72]">
            Order progress
          </p>

          <OrderTimeline timeline={order.timeline} />
        </div>
      </div>
    </article>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const { confirm, notify } = useGlobalUI();
  const [activeFilter, setActiveFilter] = useState("All Orders");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  // Initially show only the four newest orders.
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(4);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setOrders([]);
        setError("Please sign in to view your orders.");
        return;
      }

      const { data, error: queryError } = await supabase
        .from("orders")
        .select(`
    id,
    user_id,
    order_number,
    phone,
    created_at,
    status,
    payment_status,
    courier_name,
    tracking_number,
    tracking_url,
    shipped_at,
    subtotal,
    delivery_charge,
    total_amount,
    order_items (
      id,
      product_id,
      product_name,
      variant_label,
      quantity,
      unit_price,
      line_total
    )
  `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });


      if (queryError) throw queryError;

      const productIds = [
        ...new Set(
          (data || [])
            .flatMap((order) => order.order_items || [])
            .map((item) => item.product_id)
            .filter(Boolean)
        ),
      ];

      let imageByProductId = {};

      if (productIds.length > 0) {
        const { data: imageRows, error: imageError } = await supabase
          .from("product_images")
          .select("product_id, image_url")
          .in("product_id", productIds);

        if (imageError) {
          console.error("Unable to load product images:", imageError);
        } else {
          for (const image of imageRows || []) {
            if (image.image_url && !imageByProductId[image.product_id]) {
              imageByProductId[image.product_id] = image.image_url;
            }
          }
        }
      }

      const mappedOrders = (data || []).map((order) => {
        const status = normalizeStatus(order.status);

        const items = (order.order_items || []).map((item) => ({
          id: item.id,
          name: item.product_name || "Product",
          size: item.variant_label || "",
          quantity: Number(item.quantity) || 0,
          price: Number(item.unit_price) || 0,
          lineTotal: Number(item.line_total) || 0,
          image: imageByProductId[item.product_id] || "",
        }));

        return {
          ...order,
          status,
          subtotal: Number(order.subtotal) || 0,
          delivery_charge: Number(order.delivery_charge) || 0,
          total_amount: Number(order.total_amount) || 0,
          items,
          timeline: getTimeline(status, order.created_at),
        };
      });

      setOrders(mappedOrders);
    } catch (err) {
      console.error("Unable to load customer orders:", err);
      setOrders([]);
      setError(
        err.message || "We couldn't load your orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);


  const handleCancelOrder = useCallback(
    async (order) => {
      if (!order?.id || !canCancelOrder(order.status)) {
        notify("This order is no longer eligible for online cancellation.", {
          type: "warning",
          title: "Cancellation unavailable",
        });
        return;
      }

      const orderLabel = order.order_number || order.id;

      const confirmed = await confirm({
        title: "Cancel this order?",
        message: `Are you sure you want to cancel order #${orderLabel}?\n\nThis action cannot be undone.`,
        confirmText: "Cancel order",
        cancelText: "Keep order",
        variant: "danger",
      });

      if (!confirmed) return;

      setCancellingOrderId(order.id);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          throw new Error("Please sign in again to cancel your order.");
        }

        const { data, error: cancelError } = await supabase.rpc(
          "cancel_my_order",
          {
            p_order_id: order.id,
          }
        );

        if (cancelError) throw cancelError;

        if (!data?.success) {
          throw new Error(
            data?.message || "We couldn't cancel this order."
          );
        }

        await loadOrders();

        notify(
          `Order #${data.order_number || orderLabel} was cancelled successfully.`,
          {
            type: "success",
            title: "Order cancelled",
          }
        );
      } catch (err) {
        console.error("Unable to cancel customer order:", err);

        notify(
          err.message ||
          "We couldn't cancel this order. Please contact support if the problem continues.",
          {
            type: "error",
            title: "Cancellation failed",
            duration: 6000,
          }
        );
      } finally {
        setCancellingOrderId(null);
      }
    },
    [confirm, notify, loadOrders]
  );


  const counts = useMemo(() => {
    const result = { "All Orders": orders.length };

    filters.slice(1).forEach((filter) => {
      result[filter] = orders.filter(
        (order) => order.status === filter
      ).length;
    });

    return result;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        activeFilter === "All Orders" ||
        order.status === activeFilter;

      const matchesSearch =
        !term ||
        String(order.order_number || order.id)
          .toLowerCase()
          .includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [orders, activeFilter, search]);

  // Reset pagination when the user changes the filter or search.
  useEffect(() => {
    setVisibleOrdersCount(4);
  }, [activeFilter, search]);

  const visibleOrders = filteredOrders.slice(0, visibleOrdersCount);
  const hasMoreOrders = visibleOrdersCount < filteredOrders.length;

  const handleLoadMoreOrders = () => {
    setVisibleOrdersCount((current) => current + 4);
  };

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#242821]">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <Link
          to="/my-account"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#647060] hover:text-[#285C3A]"
        >
          <ArrowLeft size={17} />
          Back to My Account
        </Link>

        <div className="mt-7 grid items-start gap-7 lg:grid-cols-[245px_minmax(0,1fr)]">
          {/* Sticky desktop sidebar */}
          <aside className="sticky top-24 hidden h-fit self-start lg:block">
            <div className="rounded-2xl border border-[#EAE6DA] bg-white p-5">
              <p className="text-lg font-bold">My Account</p>

              <div className="mt-5 flex items-center gap-3 border-b border-[#F0EEE7] pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DDEBD7] text-lg font-bold text-[#285C3A]">
                  <Leaf size={22} />
                </div>

                <div>
                  <p className="text-sm font-semibold">My Account</p>
                  <p className="mt-1 text-xs text-[#82877E]">
                    Your orders and profile
                  </p>
                </div>
              </div>

              <nav className="mt-4 space-y-1">
                <Link
                  to="/my-account"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#596253] hover:bg-[#F5F7F1]"
                >
                  <Leaf size={18} />
                  My Profile
                </Link>

                <Link
                  to="/orders"
                  className="flex items-center gap-3 rounded-xl bg-[#E7F0E8] px-3 py-3 text-sm font-semibold text-[#285C3A]"
                >
                  <ShoppingBag size={18} />
                  My Orders
                </Link>

                <Link
                  to="/my-addresses"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#596253] hover:bg-[#F5F7F1]"
                >
                  <Package size={18} />
                  Saved Addresses
                </Link>

                <Link
                  to="/wishlist"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#596253] hover:bg-[#F5F7F1]"
                >
                  <PackageCheck size={18} />
                  Wishlist
                </Link>
              </nav>
            </div>

            <div className="mt-5 rounded-2xl border border-[#E3E7D9] bg-[#F0F3E8] p-5">
              <CircleHelp size={25} className="text-[#285C3A]" />

              <h3 className="mt-3 font-semibold">Need help?</h3>

              <p className="mt-2 text-xs leading-5 text-[#72796E]">
                Have a question about your order? Our team is here to help.
              </p>

              <Link
                to="/contact"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#285C3A] hover:underline"
              >
                Contact us
                <ChevronRight size={15} />
              </Link>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-7">
              <div className="flex items-center gap-2 text-xs text-[#858A80]">
                <Link to="/" className="hover:text-[#285C3A]">
                  Home
                </Link>

                <ChevronRight size={13} />

                <Link
                  to="/my-account"
                  className="hover:text-[#285C3A]"
                >
                  My Account
                </Link>

                <ChevronRight size={13} />

                <span className="text-[#454D40]">My Orders</span>
              </div>

              <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7F0E8] text-[#285C3A]">
                      <ShoppingBag size={23} />
                    </span>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                      My Orders
                    </h1>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#72796E] sm:text-base">
                    View your order history and track deliveries.
                  </p>
                </div>

                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#DDE2D7] bg-white px-4 py-3 text-sm font-semibold text-[#285C3A] hover:border-[#285C3A]"
                >
                  Shop products
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="order-search" className="sr-only">
                Search order number
              </label>

              <input
                id="order-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by order number..."
                className="w-full rounded-xl border border-[#E2E4D9] bg-white px-4 py-3 text-sm outline-none focus:border-[#285C3A] focus:ring-4 focus:ring-[#285C3A]/10 sm:max-w-sm"
              />
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${activeFilter === filter
                    ? "border-[#174B2F] bg-[#174B2F] text-white"
                    : "border-[#E6E3D9] bg-white text-[#62695E] hover:border-[#B6C8B5] hover:text-[#285C3A]"
                    }`}
                >
                  {filter} ({counts[filter] || 0})
                </button>
              ))}
            </div>

            {actionMessage && (
              <div
                role="status"
                aria-live="polite"
                className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-6 ${actionMessage.toLowerCase().includes("successfully")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p>{actionMessage}</p>

                  <button
                    type="button"
                    onClick={() => setActionMessage("")}
                    aria-label="Dismiss message"
                    className="shrink-0 rounded p-1 hover:bg-black/5"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl border border-[#EAE6DA] bg-white px-6 py-14 text-center">
                <RefreshCw
                  size={28}
                  className="mx-auto animate-spin text-[#285C3A]"
                />

                <p className="mt-4 text-sm text-[#72796E]">
                  Loading your orders...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
                <p className="text-sm text-red-700">{error}</p>

                <button
                  type="button"
                  onClick={loadOrders}
                  className="mt-5 rounded-xl bg-[#285C3A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#204A2F]"
                >
                  Try again
                </button>

                <div>
                  <Link
                    to="/login"
                    className="mt-4 inline-block text-sm font-semibold text-[#285C3A] hover:underline"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <p className="text-sm text-[#72796E]">
                    Showing{" "}
                    <span className="font-semibold text-[#30372D]">
                      {Math.min(
                        visibleOrdersCount,
                        filteredOrders.length
                      )}
                    </span>{" "}
                    of {filteredOrders.length}{" "}
                    {filteredOrders.length === 1 ? "order" : "orders"}
                  </p>

                  <span className="inline-flex items-center gap-1.5 text-xs text-[#72796E]">
                    <PackageCheck size={15} />
                    Order history
                  </span>
                </div>

                {filteredOrders.length > 0 ? (
                  <>
                    <div className="space-y-5">
                      {visibleOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onCancelOrder={handleCancelOrder}
                          cancellingOrderId={cancellingOrderId}
                        />
                      ))}
                    </div>

                    {hasMoreOrders && (
                      <div className="flex justify-center pt-6">
                        <button
                          type="button"
                          onClick={handleLoadMoreOrders}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#285C3A] bg-white px-7 py-3 text-sm font-semibold text-[#285C3A] transition hover:bg-[#285C3A] hover:text-white"
                        >
                          Load More Orders
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-3xl border border-dashed border-[#D9DFD3] bg-white px-6 py-14 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F0E8] text-[#285C3A]">
                      <ShoppingBag size={30} />
                    </div>

                    <h2 className="mt-5 text-xl font-semibold">
                      {orders.length
                        ? "No matching orders"
                        : "No orders linked to your account"}
                    </h2>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#72796E]">
                      {orders.length
                        ? "Try another filter or search for a different order number."
                        : "Orders will appear here when they are linked to your signed-in account. You can still track guest orders using the Track Order page."}
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <Link
                        to="/track-order"
                        className="inline-flex items-center gap-2 rounded-xl border border-[#DDE2D7] px-5 py-3 text-sm font-semibold text-[#285C3A] hover:border-[#285C3A]"
                      >
                        Track an order
                        <ArrowRight size={16} />
                      </Link>

                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#285C3A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#204A2F]"
                      >
                        Shop products
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#E5E8DC] bg-[#F0F3E8] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="font-semibold text-[#30372D]">
                  Looking for something delicious?
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#72796E]">
                  Explore traditional mixes, podis, laddus and more.
                </p>
              </div>

              <Link
                to="/shop"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#204A2F]"
              >
                Explore products
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
