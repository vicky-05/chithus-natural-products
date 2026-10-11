import { useCallback, useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  Eye,
  X,
  Truck,
  CheckCircle2,
  Clock3,
  RotateCcw,
  IndianRupee,
  MapPin,
  Phone,
  CalendarDays,
  RefreshCw,
  Package,
  AlertCircle,
  Loader2,
  CreditCard,
  ChevronRight,
  Mail,
  FileText,
} from "lucide-react";

import { useAdminData } from "../context/AdminDataContext";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const PAYMENT_FILTERS = [
  "All Payments",
  "Paid",
  "Unpaid",
  "Pending",
  "Refunded",
  "Partially Refunded",
  "Payment Failed",
  "Cancelled",
];

const ALL_STATUSES = "All Statuses";

const firstValue = (...values) =>
  values.find(
    (value) => value !== undefined && value !== null && value !== ""
  );

const normalizeStatus = (value) =>
  String(value || "pending")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const titleCase = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getOrderStatus = (order) =>
  firstValue(order?.status, order?.order_status, "Pending");

const getPaymentStatus = (order) =>
  firstValue(
    order?.paymentStatus,
    order?.payment_status,
    order?.payment?.status,
    "Pending"
  );

const getPaymentReference = (order) =>
  firstValue(
    order?.paymentReference,
    order?.payment_reference,
    ""
  );

const getOrderDate = (order) =>
  firstValue(
    order?.createdAt,
    order?.created_at,
    order?.date,
    order?.orderDate,
    order?.order_date
  );

const getOrderLabel = (order) =>
  firstValue(
    order?.orderNumber,
    order?.order_number,
    order?.orderNo,
    order?.order_no,
    order?.id,
    "Order"
  );

const getCustomerName = (order) =>
  firstValue(
    order?.customerName,
    order?.customer_name,
    order?.customer,
    order?.shippingAddress?.fullName,
    order?.shipping_address?.full_name,
    order?.shipping_address?.name,
    order?.user?.full_name,
    order?.user?.name,
    "Customer"
  );

const getCustomerEmail = (order) =>
  firstValue(
    order?.email,
    order?.customerEmail,
    order?.customer_email,
    order?.shippingAddress?.email,
    order?.shipping_address?.email,
    order?.user?.email
  );

const getCustomerPhone = (order) =>
  firstValue(
    order?.phone,
    order?.customerPhone,
    order?.customer_phone,
    order?.mobile,
    order?.shippingAddress?.phone,
    order?.shipping_address?.phone,
    order?.shipping_address?.mobile,
    order?.user?.phone
  );

const getOrderItems = (order) => {
  const items = firstValue(
    order?.items,
    order?.orderItems,
    order?.order_items,
    order?.cart_items,
    []
  );

  return Array.isArray(items) ? items : [];
};

const getItemName = (item) =>
  firstValue(
    item?.productName,
    item?.product_name,
    item?.name,
    item?.product?.name,
    item?.title,
    "Product"
  );

const getItemPrice = (item) =>
  Number(
    firstValue(
      item?.unitPrice,
      item?.unit_price,
      item?.price,
      item?.product?.price_inr,
      item?.product?.price,
      0
    )
  ) || 0;

const getItemQuantity = (item) =>
  Math.max(
    0,
    Number(firstValue(item?.quantity, item?.qty, 0)) || 0
  );

const getItemLineTotal = (item) => {
  const savedTotal = firstValue(
    item?.lineTotal,
    item?.line_total,
    item?.total,
    item?.total_price
  );

  if (savedTotal !== undefined) {
    return Number(savedTotal) || 0;
  }

  return getItemPrice(item) * getItemQuantity(item);
};

const getDeliveryCharge = (order) =>
  Number(
    firstValue(
      order?.deliveryCharge,
      order?.delivery_charge,
      order?.shippingFee,
      order?.shipping_fee,
      0
    )
  ) || 0;

const getSubtotal = (order) => {
  const savedSubtotal = firstValue(
    order?.subtotal,
    order?.sub_total,
    order?.itemsSubtotal,
    order?.items_subtotal
  );

  if (savedSubtotal !== undefined) {
    return Number(savedSubtotal) || 0;
  }

  return getOrderItems(order).reduce(
    (sum, item) => sum + getItemLineTotal(item),
    0
  );
};

const orderTotal = (order) => {
  const savedTotal = firstValue(
    order?.totalAmount,
    order?.total_amount,
    order?.total,
    order?.grandTotal,
    order?.grand_total,
    order?.amount,
    order?.final_amount
  );

  if (savedTotal !== undefined) {
    return Number(savedTotal) || 0;
  }

  return getSubtotal(order) + getDeliveryCharge(order);
};

const getOrderAddress = (order) => {
  const addressObject = firstValue(
    order?.shippingAddress,
    order?.shipping_address,
    order?.deliveryAddress,
    order?.delivery_address,
    order?.addressDetails,
    order?.address_details
  );

  if (typeof addressObject === "string") {
    return addressObject;
  }

  if (addressObject && typeof addressObject === "object") {
    return [
      addressObject.fullAddress,
      addressObject.full_address,
      addressObject.address,
      addressObject.address_line_1,
      addressObject.address_line_2,
      addressObject.city,
      addressObject.district,
      addressObject.state,
      addressObject.postalCode,
      addressObject.postal_code,
      addressObject.pincode,
    ]
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index)
      .join(", ");
  }

  return [
    order?.fullAddress,
    order?.full_address,
    order?.address,
    order?.address_line_1,
    order?.address_line_2,
    order?.city,
    order?.district,
    order?.state,
    order?.postalCode,
    order?.postal_code,
    order?.pincode,
  ]
    .filter(Boolean)
    .join(", ");
};

const getCustomerNotes = (order) =>
  firstValue(
    order?.customerNotes,
    order?.customer_notes,
    order?.notes,
    order?.orderNotes,
    order?.order_notes
  );

const getPaymentMethod = (order) =>
  firstValue(
    order?.paymentMethod,
    order?.payment_method,
    order?.payment?.method,
    order?.paymentMode,
    order?.payment_mode
  );

const getOrderSource = (order) =>
  firstValue(
    order?.orderSource,
    order?.order_source,
    order?.source,
    "Unknown"
  );

const displayPaymentStatus = (status) => {
  const normalized = normalizeStatus(status);

  const labels = {
    paid: "Paid",
    unpaid: "Unpaid",
    pending: "Pending",
    refunded: "Refunded",
    partially_refunded: "Partially Refunded",
    failed: "Payment Failed",
    payment_failed: "Payment Failed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    successful: "Paid",
    completed: "Paid",
  };

  return labels[normalized] || titleCase(normalized) || "Unknown";
};

const isPaymentPaid = (status) =>
  ["paid", "successful", "completed"].includes(
    normalizeStatus(status)
  );

function getCourierTrackingUrl(courierName, trackingNumber) {
  const awb = encodeURIComponent(
    String(trackingNumber || "").trim()
  );

  switch (courierName) {
    case "ST Courier":
      return "https://www.stcourier.com/track/shipment";

    case "Professional Courier":
      return "https://www.tpcindia.com/";

    case "Delhivery":
      return `https://www.delhivery.com/track/package/${awb}`;

    case "India Post":
      return "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx";

    default:
      return "";
  }
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status, type = "order" }) {
  const normalized = normalizeStatus(status);

  const orderStyles = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    confirmed: "bg-sky-50 text-sky-700 ring-sky-200",
    processing: "bg-purple-50 text-purple-700 ring-purple-200",
    shipped: "bg-blue-50 text-blue-700 ring-blue-200",
    delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
    canceled: "bg-red-50 text-red-700 ring-red-200",
  };

  const paymentStyles = {
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    successful: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    unpaid: "bg-amber-50 text-amber-700 ring-amber-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    refunded: "bg-purple-50 text-purple-700 ring-purple-200",
    partially_refunded: "bg-purple-50 text-purple-700 ring-purple-200",
    failed: "bg-red-50 text-red-700 ring-red-200",
    payment_failed: "bg-red-50 text-red-700 ring-red-200",
    cancelled: "bg-gray-100 text-gray-600 ring-gray-200",
    canceled: "bg-gray-100 text-gray-600 ring-gray-200",
  };

  const styles = type === "payment" ? paymentStyles : orderStyles;

  const label =
    type === "payment"
      ? displayPaymentStatus(status)
      : titleCase(status);

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
        styles[normalized] || "bg-gray-100 text-gray-600 ring-gray-200"
      }`}
    >
      {label || "Unknown"}
    </span>
  );
}

function FeedbackMessage({ notice, onDismiss }) {
  if (!notice) return null;

  const isError = notice.type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-[#d9e8d4] bg-[#edf5e9] text-[#285b3b]"
      }`}
    >
      <span className="flex min-w-0 items-start gap-2">
        {isError ? (
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
        ) : (
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
        )}

        <span className="break-words">{notice.message}</span>
      </span>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="shrink-0 rounded-md p-1 hover:bg-black/5"
      >
        <X size={17} />
      </button>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-[#e9e7dc] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#858a7e]">
            {label}
          </p>

          <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-[#244b32]">
            {value}
          </p>

          {description && (
            <p className="mt-2 text-xs leading-5 text-[#858a7e]">
              {description}
            </p>
          )}
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf1e8] text-[#285b3b]">
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   ORDER DETAILS MODAL
========================================================= */

function OrderDetails({
  order,
  onClose,
  onUpdateStatus,
  onSaveTracking,
  onTrackingSaved,
  onConfirmPayment,
  savingStatus,
}) {
  const currentStatus = titleCase(getOrderStatus(order));
  const paymentStatus = getPaymentStatus(order);
  const paymentIsPaid = isPaymentPaid(paymentStatus);

  const [nextStatus, setNextStatus] = useState(currentStatus);
  const [statusError, setStatusError] = useState("");

  const [paymentReference, setPaymentReference] = useState(
    getPaymentReference(order)
  );
  const [paymentConfirming, setPaymentConfirming] = useState(false);
  const [paymentConfirmError, setPaymentConfirmError] = useState("");
  const [paymentConfirmSuccess, setPaymentConfirmSuccess] = useState("");

  const supportedCouriers = [
    "ST Courier",
    "Professional Courier",
    "Delhivery",
    "India Post",
  ];

  const savedCourierName =
    order?.courierName || order?.courier_name || "";

  const [courierName, setCourierName] = useState(
    supportedCouriers.includes(savedCourierName)
      ? savedCourierName
      : ""
  );

  const [trackingNumber, setTrackingNumber] = useState(
    order?.trackingNumber || order?.tracking_number || ""
  );

  const [savingTracking, setSavingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [trackingSuccess, setTrackingSuccess] = useState("");

  const items = getOrderItems(order);
  const subtotal = getSubtotal(order);
  const deliveryCharge = getDeliveryCharge(order);
  const total = orderTotal(order);

  const customerName = getCustomerName(order);
  const customerEmail = getCustomerEmail(order);
  const customerPhone = getCustomerPhone(order);
  const address = getOrderAddress(order);
  const customerNotes = getCustomerNotes(order);
  const paymentMethod = getPaymentMethod(order);

  const handleSaveStatus = async () => {
    if (
      nextStatus === currentStatus ||
      savingStatus ||
      !order?.id
    ) {
      return;
    }

    setStatusError("");

    try {
      await onUpdateStatus(order.id, nextStatus);
    } catch (error) {
      setStatusError(
        error?.message || "Unable to update the order status."
      );
    }
  };

  const handleConfirmPayment = async () => {
    const reference = paymentReference.trim();

    if (!reference) {
      setPaymentConfirmError(
        "Enter the verified transaction reference."
      );
      setPaymentConfirmSuccess("");
      return;
    }

    if (reference.length < 3 || reference.length > 200) {
      setPaymentConfirmError(
        "The transaction reference must contain 3–200 characters."
      );
      setPaymentConfirmSuccess("");
      return;
    }

    if (typeof onConfirmPayment !== "function") {
      setPaymentConfirmError(
        "Payment confirmation is not available in AdminDataContext."
      );
      setPaymentConfirmSuccess("");
      return;
    }

    if (paymentConfirming || !order?.id) return;

    const confirmed = window.confirm(
      `Confirm that ₹${total.toFixed(2)} was received in your business account and that transaction reference "${reference}" has been verified?`
    );

    if (!confirmed) return;

    setPaymentConfirming(true);
    setPaymentConfirmError("");
    setPaymentConfirmSuccess("");

    try {
      await onConfirmPayment(order.id, reference);

      setPaymentConfirmSuccess(
        "Payment confirmed successfully. The order has been refreshed."
      );

      setNextStatus("Confirmed");
    } catch (error) {
      setPaymentConfirmError(
        error?.message || "Unable to confirm payment. Please try again."
      );
    } finally {
      setPaymentConfirming(false);
    }
  };

  const handleSaveTracking = async () => {
    if (savingTracking || !order?.id) return;

    const cleanCourierName = courierName.trim();
    const cleanTrackingNumber = trackingNumber.trim();
    const cleanTrackingUrl = getCourierTrackingUrl(
      cleanCourierName,
      cleanTrackingNumber
    );

    if (!supportedCouriers.includes(cleanCourierName)) {
      setTrackingError("Select one of the supported courier services.");
      setTrackingSuccess("");
      return;
    }

    if (!cleanTrackingNumber) {
      setTrackingError("Enter the tracking or AWB number.");
      setTrackingSuccess("");
      return;
    }

    if (typeof onSaveTracking !== "function") {
      setTrackingError(
        "Courier tracking is not available in AdminDataContext."
      );
      setTrackingSuccess("");
      return;
    }

    setSavingTracking(true);
    setTrackingError("");
    setTrackingSuccess("");

    try {
      const savedOrder = await onSaveTracking(order.id, {
        courierName: cleanCourierName,
        trackingNumber: cleanTrackingNumber,
        trackingUrl: cleanTrackingUrl,
      });

      onTrackingSaved?.({
        ...order,
        ...(savedOrder && typeof savedOrder === "object"
          ? savedOrder
          : {}),
        courierName: cleanCourierName,
        courier_name: cleanCourierName,
        trackingNumber: cleanTrackingNumber,
        tracking_number: cleanTrackingNumber,
        trackingUrl: cleanTrackingUrl,
        tracking_url: cleanTrackingUrl,
      });

      setTrackingSuccess(
        "Courier tracking details saved successfully."
      );
    } catch (error) {
      setTrackingError(
        error?.message || "Unable to save courier tracking details."
      );
    } finally {
      setSavingTracking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-[2px] sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !savingStatus &&
          !paymentConfirming &&
          !savingTracking
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
        className="my-auto max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-[#fffdf7] shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#e9e7dc] bg-[#fffdf7]/95 px-5 py-5 backdrop-blur sm:px-7">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8a5d]">
              Order details
            </p>

            <h2
              id="order-details-title"
              className="mt-1 break-words text-xl font-extrabold text-[#244b32] sm:text-2xl"
            >
              {getOrderLabel(order)}
            </h2>

            <p className="mt-1 text-xs text-[#858a7e]">
              Placed on {formatDateTime(getOrderDate(order))}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={savingStatus || paymentConfirming || savingTracking}
            aria-label="Close order details"
            className="shrink-0 rounded-xl p-2 text-[#697366] transition hover:bg-[#edf1e8] disabled:opacity-50"
          >
            <X size={21} />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-7">
          {/* Order overview */}
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e9e7dc] bg-white p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#858a7e]">
                Current order status
              </p>

              <div className="mt-2">
                <StatusBadge status={getOrderStatus(order)} />
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-[#858a7e]">
                Order total
              </p>

              <p className="mt-2 text-xl font-extrabold text-[#244b32]">
                {formatPrice(total)}
              </p>
            </div>
          </section>

          {/* Customer and delivery */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#e9e7dc] bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-[#285b3b]">
                <ShoppingBag size={18} />
                <h3 className="font-bold">Customer</h3>
              </div>

              <p className="break-words font-semibold text-[#344637]">
                {customerName}
              </p>

              {customerEmail && (
                <p className="mt-2 flex items-start gap-2 break-all text-sm text-[#697366]">
                  <Mail size={15} className="mt-0.5 shrink-0" />
                  {customerEmail}
                </p>
              )}

              {customerPhone && (
                <p className="mt-2 flex items-start gap-2 text-sm text-[#697366]">
                  <Phone size={15} className="mt-0.5 shrink-0" />
                  <a
                    href={`tel:${customerPhone}`}
                    className="break-all hover:text-[#285b3b] hover:underline"
                  >
                    {customerPhone}
                  </a>
                </p>
              )}

              {!customerEmail && !customerPhone && (
                <p className="mt-2 text-xs text-[#92978c]">
                  No additional contact details available.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-[#e9e7dc] bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-[#285b3b]">
                <MapPin size={18} />
                <h3 className="font-bold">Delivery address</h3>
              </div>

              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#697366]">
                {address || "No delivery address available"}
              </p>

              {customerNotes && (
                <div className="mt-3 border-t border-[#f0efe7] pt-3">
                  <p className="flex items-center gap-2 text-xs font-semibold text-[#858a7e]">
                    <FileText size={14} />
                    Customer notes
                  </p>

                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#697366]">
                    {customerNotes}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Payment information and confirmation */}
          <section className="rounded-2xl border border-[#dfe7d9] bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf1e8] text-[#285b3b]">
                <CreditCard size={19} />
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[#244b32]">
                  Payment information
                </h3>

                <div className="mt-2">
                  <StatusBadge type="payment" status={paymentStatus} />
                </div>

                {paymentMethod && (
                  <p className="mt-3 text-sm text-[#697366]">
                    <span className="font-semibold">Method:</span>{" "}
                    {titleCase(paymentMethod)}
                  </p>
                )}

                <p className="mt-2 text-xs text-[#858a7e]">
                  Order source: {titleCase(getOrderSource(order))}
                </p>
              </div>
            </div>

            {paymentIsPaid ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <CheckCircle2 size={18} />
                  Payment marked as paid
                </div>

                <p className="mt-3 text-xs font-semibold text-emerald-800">
                  Recorded transaction reference
                </p>

                <p className="mt-1 break-all text-sm text-emerald-900">
                  {getPaymentReference(order) || "No reference recorded"}
                </p>
              </div>
            ) : (
              <div className="mt-4 border-t border-[#f0efe7] pt-4">
                <h4 className="font-bold text-[#244b32]">
                  Verify UPI payment
                </h4>

                <p className="mt-1 text-xs leading-5 text-[#858a7e]">
                  Verify the transaction in your actual business UPI or
                  bank account before confirming. A screenshot alone
                  is not proof of payment.
                </p>

                <label className="mt-3 block">
                  <span className="mb-1.5 block text-xs font-semibold text-[#697366]">
                    Transaction reference / UTR
                  </span>

                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(event) => {
                      setPaymentReference(event.target.value);
                      setPaymentConfirmError("");
                      setPaymentConfirmSuccess("");
                    }}
                    placeholder="Enter verified transaction ID"
                    maxLength={200}
                    disabled={paymentConfirming}
                    className="w-full rounded-xl border border-[#e1e2d6] bg-white px-3 py-3 text-sm text-[#344637] outline-none transition placeholder:text-[#a0a499] focus:border-[#285b3b] focus:ring-2 focus:ring-[#285b3b]/10 disabled:opacity-60"
                  />
                </label>

                {paymentConfirmError && (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    {paymentConfirmError}
                  </p>
                )}

                {paymentConfirmSuccess && (
                  <p
                    role="status"
                    className="mt-3 rounded-lg border border-[#d9e8d4] bg-[#edf5e9] px-3 py-2 text-sm text-[#285b3b]"
                  >
                    {paymentConfirmSuccess}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={paymentConfirming || !order?.id}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#285b3b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1e462d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paymentConfirming ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Confirming payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Confirm Payment & Confirm Order
                    </>
                  )}
                </button>
              </div>
            )}
          </section>

          {/* Courier tracking */}
          <section className="rounded-2xl border border-[#dfe7d9] bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf1e8] text-[#285b3b]">
                <Truck size={19} />
              </span>

              <div className="min-w-0">
                <h3 className="font-bold text-[#244b32]">
                  Courier tracking
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#858a7e]">
                  Select the courier and enter the tracking or AWB number.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#697366]">
                  Courier service *
                </span>

                <select
                  value={courierName}
                  onChange={(event) => {
                    setCourierName(event.target.value);
                    setTrackingError("");
                    setTrackingSuccess("");
                  }}
                  disabled={savingTracking}
                  className="w-full rounded-xl border border-[#e1e2d6] bg-white px-3 py-3 text-sm text-[#344637] outline-none focus:border-[#285b3b] disabled:opacity-60"
                >
                  <option value="">Select courier service</option>
                  {supportedCouriers.map((courier) => (
                    <option key={courier} value={courier}>
                      {courier}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#697366]">
                  Tracking / AWB number *
                </span>

                <input
                  value={trackingNumber}
                  onChange={(event) => {
                    setTrackingNumber(event.target.value);
                    setTrackingError("");
                    setTrackingSuccess("");
                  }}
                  placeholder="Enter tracking number"
                  disabled={savingTracking}
                  className="w-full rounded-xl border border-[#e1e2d6] bg-white px-3 py-3 text-sm text-[#344637] outline-none focus:border-[#285b3b] disabled:opacity-60"
                />
              </label>
            </div>

            {trackingError && (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {trackingError}
              </p>
            )}

            {trackingSuccess && (
              <p
                role="status"
                className="mt-3 rounded-lg border border-[#d9e8d4] bg-[#edf5e9] px-3 py-2 text-sm text-[#285b3b]"
              >
                {trackingSuccess}
              </p>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleSaveTracking}
                disabled={savingTracking || !order?.id}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285b3b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1e462d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingTracking ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving tracking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Save tracking
                  </>
                )}
              </button>
            </div>

            {(order?.trackingNumber || order?.tracking_number) && (
              <p className="mt-3 break-all text-xs text-[#697366]">
                Current tracking number:{" "}
                <span className="font-semibold text-[#344637]">
                  {order?.trackingNumber || order?.tracking_number}
                </span>
              </p>
            )}
          </section>

          {/* Order items */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-bold text-[#244b32]">Items ordered</h3>

              <span className="rounded-full bg-[#edf1e8] px-3 py-1 text-xs font-semibold text-[#285b3b]">
                {items.length} product{items.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#e9e7dc] bg-white">
              <table className="w-full min-w-[420px] text-left">
                <thead className="bg-[#f7f6ef] text-xs text-[#858a7e]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => {
                    const itemName = getItemName(item);
                    const price = getItemPrice(item);
                    const quantity = getItemQuantity(item);
                    const lineTotal = getItemLineTotal(item);

                    const variantLabel = firstValue(
                      item?.variantLabel,
                      item?.variant_label,
                      item?.variant,
                      item?.packSize,
                      item?.pack_size
                    );

                    return (
                      <tr
                        key={
                          item?.id ||
                          item?.product_id ||
                          `${itemName}-${index}`
                        }
                        className="border-t border-[#f0efe7]"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-[#465345]">
                          <p className="break-words">{itemName}</p>

                          {variantLabel && (
                            <p className="mt-1 text-xs text-[#92978c]">
                              {typeof variantLabel === "object"
                                ? JSON.stringify(variantLabel)
                                : variantLabel}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-[#92978c]">
                            {formatPrice(price)} each
                          </p>
                        </td>

                        <td className="px-4 py-3 text-sm text-[#697366]">
                          {quantity}
                        </td>

                        <td className="px-4 py-3 text-right text-sm font-bold text-[#244b32]">
                          {formatPrice(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}

                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-sm text-[#858a7e]"
                      >
                        No order items are available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-3 rounded-2xl bg-[#edf1e8] p-4">
              <div className="flex justify-between gap-4 text-sm text-[#697366]">
                <span>Subtotal</span>
                <span className="font-medium">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm text-[#697366]">
                <span>Delivery charge</span>
                <span className="font-medium">
                  {formatPrice(deliveryCharge)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-t border-[#dce4d5] pt-3 font-extrabold text-[#244b32]">
                <span>Order total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </section>

          {/* Order timeline */}
          <section className="rounded-2xl border border-[#e9e7dc] bg-white p-4">
            <div className="flex items-center gap-2 text-[#285b3b]">
              <CalendarDays size={18} />
              <h3 className="font-bold">Order timeline</h3>
            </div>

            <p className="mt-3 text-sm font-semibold text-[#344637]">
              {formatDateTime(getOrderDate(order))}
            </p>

            <p className="mt-1 text-xs text-[#858a7e]">
              Order created
            </p>

            <div className="mt-3">
              <StatusBadge status={getOrderStatus(order)} />
            </div>
          </section>

          {/* Order status */}
          <section className="rounded-2xl border border-[#e4d9b8] bg-[#fcf7e9] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f2e7c9] text-[#8b6b2b]">
                <Truck size={19} />
              </span>

              <div className="min-w-0">
                <h3 className="font-bold text-[#755b28]">
                  Update order status
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#8c7950]">
                  Unpaid orders must be confirmed through the payment
                  confirmation action before moving into fulfilment.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <select
                value={nextStatus}
                onChange={(event) => {
                  setNextStatus(event.target.value);
                  setStatusError("");
                }}
                disabled={savingStatus}
                aria-label="Choose new order status"
                className="min-w-0 flex-1 rounded-xl border border-[#e4d9b8] bg-white px-3 py-3 text-sm outline-none focus:border-[#285b3b] disabled:opacity-60"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={
                  savingStatus ||
                  nextStatus === currentStatus ||
                  !order?.id
                }
                onClick={handleSaveStatus}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285b3b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1e462d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingStatus ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Save status
                  </>
                )}
              </button>
            </div>

            {statusError && (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {statusError}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN ADMIN ORDERS PAGE
========================================================= */

export default function AdminOrders() {
  const {
    orders,
    updateOrderStatus,
    confirmOrderPayment,
    saveCourierTracking,
    reloadOrders,
    ordersLoading,
    ordersRefreshing,
    ordersError,
  } = useAdminData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [paymentFilter, setPaymentFilter] = useState("All Payments");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState(null);

  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return safeOrders.filter((order) => {
      const orderLabel = String(getOrderLabel(order)).toLowerCase();
      const orderId = String(order?.id || "").toLowerCase();
      const customerName = String(getCustomerName(order)).toLowerCase();
      const email = String(getCustomerEmail(order) || "").toLowerCase();
      const phone = String(getCustomerPhone(order) || "").toLowerCase();

      const matchesSearch =
        !query ||
        orderLabel.includes(query) ||
        orderId.includes(query) ||
        customerName.includes(query) ||
        email.includes(query) ||
        phone.includes(query);

      const matchesStatus =
        statusFilter === ALL_STATUSES ||
        normalizeStatus(getOrderStatus(order)) ===
          normalizeStatus(statusFilter);

      const paymentLabel = displayPaymentStatus(getPaymentStatus(order));

      const matchesPayment =
        paymentFilter === "All Payments" ||
        paymentLabel === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [safeOrders, search, statusFilter, paymentFilter]);

  const pendingCount = useMemo(
    () =>
      safeOrders.filter(
        (order) =>
          normalizeStatus(getOrderStatus(order)) === "pending"
      ).length,
    [safeOrders]
  );

  const processingCount = useMemo(
    () =>
      safeOrders.filter((order) =>
        ["processing", "shipped"].includes(
          normalizeStatus(getOrderStatus(order))
        )
      ).length,
    [safeOrders]
  );

  const deliveredCount = useMemo(
    () =>
      safeOrders.filter(
        (order) =>
          normalizeStatus(getOrderStatus(order)) === "delivered"
      ).length,
    [safeOrders]
  );

  const paidOrderValue = useMemo(
    () =>
      safeOrders
        .filter((order) => isPaymentPaid(getPaymentStatus(order)))
        .reduce((sum, order) => sum + orderTotal(order), 0),
    [safeOrders]
  );

  const handleUpdateStatus = useCallback(
    async (orderId, status) => {
      if (savingOrderId) return;

      if (typeof updateOrderStatus !== "function") {
        throw new Error(
          "Order status update is not available in AdminDataContext."
        );
      }

      setSavingOrderId(orderId);
      setNotice(null);

      try {
        await updateOrderStatus(orderId, status);

        const normalizedStatus = normalizeStatus(status);
        const savedStatus = titleCase(normalizedStatus);

        setSelectedOrder((current) =>
          current?.id === orderId
            ? {
                ...current,
                status: savedStatus,
                order_status: savedStatus,
                statusValue: normalizedStatus,
              }
            : current
        );

        setNotice({
          type: "success",
          message: `Order status saved successfully as ${savedStatus}.`,
        });
      } catch (error) {
        setNotice({
          type: "error",
          message:
            error?.message ||
            "Could not update the order status. Please try again.",
        });

        throw error;
      } finally {
        setSavingOrderId(null);
      }
    },
    [savingOrderId, updateOrderStatus]
  );

  const handleRefresh = async () => {
    if (refreshing || ordersRefreshing || ordersLoading) return;

    if (typeof reloadOrders !== "function") {
      setNotice({
        type: "error",
        message: "Refresh is not available in AdminDataContext.",
      });
      return;
    }

    setRefreshing(true);
    setNotice(null);

    try {
      await reloadOrders({ quiet: true });

      setNotice({
        type: "success",
        message: "Orders refreshed successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error?.message || "Unable to refresh orders.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(ALL_STATUSES);
    setPaymentFilter("All Payments");
  };

  const hasActiveFilters =
    Boolean(search) ||
    statusFilter !== ALL_STATUSES ||
    paymentFilter !== "All Payments";

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a17a2d]">
            Store management
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#244b32] sm:text-3xl">
            Order Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#858a7e]">
            Manage customer orders, verify payments, and keep every
            delivery moving.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || ordersRefreshing || ordersLoading}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#dfe2d7] bg-white px-4 py-3 text-sm font-semibold text-[#285b3b] transition hover:bg-[#edf1e8] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw
            size={16}
            className={
              refreshing || ordersRefreshing ? "animate-spin" : ""
            }
          />
          Refresh orders
        </button>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total orders"
          value={safeOrders.length.toLocaleString("en-IN")}
          icon={ShoppingBag}
          description="All orders currently loaded"
        />

        <SummaryCard
          label="Pending orders"
          value={pendingCount.toLocaleString("en-IN")}
          icon={Clock3}
          description="Orders awaiting action"
        />

        <SummaryCard
          label="Processing / shipped"
          value={processingCount.toLocaleString("en-IN")}
          icon={Truck}
          description={`${deliveredCount} delivered`}
        />

        <SummaryCard
          label="Paid order value"
          value={formatPrice(paidOrderValue)}
          icon={IndianRupee}
          description="Value of orders marked as paid"
        />
      </section>

      <FeedbackMessage
        notice={notice}
        onDismiss={() => setNotice(null)}
      />

      {ordersError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">Unable to load orders</p>
            <p className="mt-1 break-words">{ordersError}</p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || ordersRefreshing || ordersLoading}
            className="shrink-0 font-semibold underline disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Orders table */}
      <section className="overflow-hidden rounded-2xl border border-[#e9e7dc] bg-white">
        <div className="border-b border-[#e9e7dc] px-4 py-5 sm:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf1e8] text-[#285b3b]">
              <ShoppingBag size={19} />
            </span>

            <div>
              <h2 className="font-bold text-[#244b32]">All orders</h2>
              <p className="mt-1 text-xs text-[#858a7e]">
                Search and filter your store orders
              </p>
            </div>

            <span className="ml-auto rounded-full bg-[#edf1e8] px-3 py-1.5 text-xs font-semibold text-[#285b3b]">
              {filteredOrders.length} result
              {filteredOrders.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Search and filters */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-[#e1e2d6] bg-white px-3 transition focus-within:border-[#285b3b] focus-within:ring-2 focus-within:ring-[#285b3b]/10">
              <Search size={18} className="shrink-0 text-[#92978c]" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Order, customer, email or phone..."
                aria-label="Search orders"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#344637] outline-none placeholder:text-[#a0a499]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="rounded-md p-1 text-[#92978c] hover:bg-[#edf1e8] hover:text-[#285b3b]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter orders by status"
              className="min-w-0 rounded-xl border border-[#e1e2d6] bg-white px-3 py-3 text-sm text-[#344637] outline-none focus:border-[#285b3b]"
            >
              <option value={ALL_STATUSES}>{ALL_STATUSES}</option>

              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={(event) => setPaymentFilter(event.target.value)}
              aria-label="Filter orders by payment status"
              className="min-w-0 rounded-xl border border-[#e1e2d6] bg-white px-3 py-3 text-sm text-[#344637] outline-none focus:border-[#285b3b]"
            >
              {PAYMENT_FILTERS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#858a7e]">
                Showing filtered orders
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#285b3b] hover:text-[#a17a2d]"
              >
                <RotateCcw size={14} />
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-[#faf9f3]">
              <tr className="border-b border-[#e9e7dc] text-[10px] uppercase tracking-wider text-[#858a7e]">
                <th className="px-5 py-4 font-bold">Order</th>
                <th className="px-4 py-4 font-bold">Customer</th>
                <th className="px-4 py-4 font-bold">Date</th>
                <th className="px-4 py-4 font-bold">Amount</th>
                <th className="px-4 py-4 font-bold">Payment</th>
                <th className="px-4 py-4 font-bold">Order status</th>
                <th className="px-5 py-4 text-right font-bold">
                  Details
                </th>
              </tr>
            </thead>

            <tbody>
              {ordersLoading && safeOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Loader2
                      size={30}
                      className="mx-auto mb-3 animate-spin text-[#285b3b]"
                    />
                    <p className="font-bold text-[#344637]">
                      Loading orders...
                    </p>
                    <p className="mt-1 text-sm text-[#858a7e]">
                      Fetching orders from your database.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemCount = getOrderItems(order).reduce(
                    (sum, item) => sum + getItemQuantity(item),
                    0
                  );

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-[#f0efe7] transition last:border-0 hover:bg-[#fffdf7]"
                    >
                      <td className="px-5 py-4">
                        <p className="break-all text-sm font-bold text-[#285b3b]">
                          {getOrderLabel(order)}
                        </p>

                        <p className="mt-1 text-xs text-[#999d93]">
                          {itemCount} item{itemCount === 1 ? "" : "s"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="max-w-[210px] truncate text-sm font-semibold text-[#344637]">
                          {getCustomerName(order)}
                        </p>

                        <p className="mt-1 text-xs text-[#92978c]">
                          {getCustomerPhone(order) || "No phone"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-[#697366]">
                        {formatDate(getOrderDate(order))}
                      </td>

                      <td className="px-4 py-4 text-sm font-bold text-[#244b32]">
                        {formatPrice(orderTotal(order))}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          type="payment"
                          status={getPaymentStatus(order)}
                        />
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={getOrderStatus(order)} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNotice(null);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#dfe2d7] px-3 py-2 text-xs font-semibold text-[#285b3b] transition hover:border-[#285b3b] hover:bg-[#edf1e8]"
                        >
                          <Eye size={15} />
                          View
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}

              {!ordersLoading &&
                filteredOrders.length === 0 &&
                !ordersError && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf1e8] text-[#82917b]">
                        <Package size={29} />
                      </span>

                      <p className="font-bold text-[#344637]">
                        No orders found
                      </p>

                      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#858a7e]">
                        {hasActiveFilters
                          ? "No orders match your current search and filters. Try changing them."
                          : "There are no orders to display yet. New customer orders will appear here when available."}
                      </p>

                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#285b3b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e462d]"
                        >
                          <RotateCcw size={15} />
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#e9e7dc] bg-[#fffdf7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#858a7e]">
            Showing {filteredOrders.length} of {safeOrders.length} orders
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#858a7e]">
            <span className="h-2 w-2 rounded-full bg-[#6d9c65]" />
            <span>Connected to your order data context</span>
          </div>
        </div>
      </section>

      {/* Order details modal */}
      {selectedOrder && (
        <OrderDetails
          key={selectedOrder.id}
          order={
            safeOrders.find((order) => order.id === selectedOrder.id) ||
            selectedOrder
          }
          onClose={() => {
            if (!savingOrderId) setSelectedOrder(null);
          }}
          onUpdateStatus={handleUpdateStatus}
          onSaveTracking={saveCourierTracking}
          onConfirmPayment={confirmOrderPayment}
          onTrackingSaved={(updatedOrder) => {
            setSelectedOrder(updatedOrder);
          }}
          savingStatus={savingOrderId === selectedOrder.id}
        />
      )}
    </div>
  );
}