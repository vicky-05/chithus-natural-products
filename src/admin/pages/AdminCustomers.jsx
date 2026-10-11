import { useMemo, useState } from "react";
import {
  Search,
  Users,
  UserRound,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  ShoppingBag,
  IndianRupee,
  ChevronRight,
  Package,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  RotateCcw,
  ArrowUpRight,
  UserCheck,
} from "lucide-react";

import { useAdminData } from "../context/AdminDataContext";

/* =========================================================
   CONSTANTS
========================================================= */

const CUSTOMER_FILTERS = [
  { value: "all", label: "All customers" },
  { value: "new", label: "One-time customers" },
  { value: "returning", label: "Returning customers" },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const firstValue = (...values) =>
  values.find(
    (value) => value !== undefined && value !== null && value !== "",
  );

const normalizeText = (value) =>
  String(value ?? "").trim().toLowerCase();

const getOrderDate = (order) =>
  firstValue(
    order?.createdAt,
    order?.created_at,
    order?.date,
    order?.orderDate,
    order?.order_date,
  );

const getOrderItems = (order) => {
  const items = firstValue(
    order?.items,
    order?.orderItems,
    order?.order_items,
    order?.cart_items,
    [],
  );

  return Array.isArray(items) ? items : [];
};

const getOrderStatus = (order) =>
  String(
    firstValue(order?.status, order?.order_status, "pending"),
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const getPaymentStatus = (order) =>
  String(
    firstValue(
      order?.paymentStatus,
      order?.payment_status,
      order?.payment?.status,
      "pending",
    ),
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const getOrderNumber = (order) =>
  firstValue(
    order?.orderNumber,
    order?.order_number,
    order?.id,
    "Order",
  );

const getOrderTotal = (order) => {
  const savedTotal = firstValue(
    order?.totalAmount,
    order?.total_amount,
    order?.grandTotal,
    order?.grand_total,
    order?.total,
    order?.amount,
    order?.final_amount,
  );

  if (savedTotal !== undefined) {
    return Number(savedTotal) || 0;
  }

  const subtotal = firstValue(
    order?.subtotal,
    order?.sub_total,
    order?.itemsSubtotal,
    order?.items_subtotal,
  );

  if (subtotal !== undefined) {
    return (
      (Number(subtotal) || 0) +
      (Number(
        firstValue(
          order?.deliveryCharge,
          order?.delivery_charge,
          order?.shippingFee,
          order?.shipping_fee,
          0,
        ),
      ) || 0)
    );
  }

  const itemsTotal = getOrderItems(order).reduce((sum, item) => {
    const savedLineTotal = firstValue(
      item?.lineTotal,
      item?.line_total,
      item?.total,
      item?.total_price,
    );

    if (savedLineTotal !== undefined) {
      return sum + (Number(savedLineTotal) || 0);
    }

    const price = Number(
      firstValue(
        item?.unitPrice,
        item?.unit_price,
        item?.price,
        item?.product?.price_inr,
        item?.product?.price,
        0,
      ),
    );

    const quantity = Number(
      firstValue(item?.quantity, item?.qty, 0),
    );

    return sum + price * quantity;
  }, 0);

  return (
    itemsTotal +
    (Number(
      firstValue(
        order?.deliveryCharge,
        order?.delivery_charge,
        order?.shippingFee,
        order?.shipping_fee,
        0,
      ),
    ) || 0)
  );
};

const getCustomerName = (order) =>
  firstValue(
    order?.customerName,
    order?.customer_name,
    order?.customer,
    order?.shippingAddress?.fullName,
    order?.shippingAddress?.name,
    order?.shipping_address?.full_name,
    order?.shipping_address?.name,
    order?.user?.full_name,
    order?.user?.name,
    order?.full_name,
    order?.name,
    "Customer",
  );

const getCustomerEmail = (order) =>
  firstValue(
    order?.email,
    order?.customerEmail,
    order?.customer_email,
    order?.shippingAddress?.email,
    order?.shipping_address?.email,
    order?.user?.email,
  );

const getCustomerPhone = (order) =>
  firstValue(
    order?.phone,
    order?.customerPhone,
    order?.customer_phone,
    order?.mobile,
    order?.shippingAddress?.phone,
    order?.shippingAddress?.mobile,
    order?.shipping_address?.phone,
    order?.shipping_address?.mobile,
    order?.user?.phone,
  );

const getCustomerId = (order) =>
  firstValue(
    order?.user_id,
    order?.userId,
    order?.customerId,
    order?.customer_id,
    order?.user?.id,
  );

const getAddressObject = (order) =>
  firstValue(
    order?.shippingAddress,
    order?.shipping_address,
    order?.deliveryAddress,
    order?.delivery_address,
    order?.addressDetails,
    order?.address_details,
  );

const getAddressText = (order) => {
  const address = getAddressObject(order);

  if (typeof address === "string") {
    return address;
  }

  if (address && typeof address === "object") {
    return [
      address.fullAddress,
      address.full_address,
      address.address,
      address.address_line_1,
      address.address_line_2,
      address.street,
      address.city,
      address.district,
      address.state,
      address.postalCode,
      address.postal_code,
      address.pincode,
    ]
      .filter(Boolean)
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

const getCustomerCity = (order) => {
  const address = getAddressObject(order);

  return firstValue(
    typeof address === "object" ? address?.city : undefined,
    typeof address === "object" ? address?.district : undefined,
    order?.city,
    order?.district,
    "",
  );
};

const getCustomerState = (order) => {
  const address = getAddressObject(order);

  return firstValue(
    typeof address === "object" ? address?.state : undefined,
    order?.state,
    "",
  );
};

const getOrderLabel = (order) =>
  firstValue(
    order?.orderNumber,
    order?.order_number,
    order?.id,
    "Order",
  );

const getItemName = (item) =>
  firstValue(
    item?.productName,
    item?.product_name,
    item?.name,
    item?.product?.name,
    item?.title,
    "Product",
  );

const getItemQuantity = (item) =>
  Math.max(
    0,
    Number(firstValue(item?.quantity, item?.qty, 0)) || 0,
  );

/* =========================================================
   CUSTOMER AGGREGATION

   Customers are derived from real order records.

   Primary identity: user_id / userId.
   Fallback identity: email, then phone, then order ID.

   If your store supports registered customers who have never
   placed an order, those users need to be loaded separately
   from the appropriate customer/auth profile source.
========================================================= */

function buildCustomersFromOrders(orders) {
  const customerMap = new Map();

  for (const order of orders) {
    const userId = getCustomerId(order);
    const email = normalizeText(getCustomerEmail(order));
    const phone = String(getCustomerPhone(order) || "").trim();

    const identity = userId
      ? `user:${userId}`
      : email
        ? `email:${email}`
        : phone
          ? `phone:${phone}`
          : `order:${order?.id ?? getOrderNumber(order)}`;

    const date = getOrderDate(order);
    const timestamp = date ? new Date(date).getTime() : 0;
    const safeTimestamp = Number.isNaN(timestamp) ? 0 : timestamp;

    if (!customerMap.has(identity)) {
      customerMap.set(identity, {
        id: userId || identity,
        identity,
        userId: userId || null,
        name: getCustomerName(order),
        email: getCustomerEmail(order) || "",
        phone,
        city: getCustomerCity(order),
        state: getCustomerState(order),
        address: getAddressText(order),
        addresses: [],
        orders: [],
        spent: 0,
        joined: date || null,
        lastOrder: date || null,
        lastOrderTimestamp: safeTimestamp,
      });
    }

    const customer = customerMap.get(identity);

    // Keep the most informative available customer details.
    if (
      (!customer.name || customer.name === "Customer") &&
      getCustomerName(order) !== "Customer"
    ) {
      customer.name = getCustomerName(order);
    }

    customer.email ||= getCustomerEmail(order) || "";
    customer.phone ||= phone;
    customer.city ||= getCustomerCity(order);
    customer.state ||= getCustomerState(order);
    customer.address ||= getAddressText(order);

    if (date) {
      if (!customer.joined) {
        customer.joined = date;
      } else {
        const currentJoined = new Date(customer.joined).getTime();
        const newJoined = new Date(date).getTime();

        if (
          !Number.isNaN(newJoined) &&
          (Number.isNaN(currentJoined) || newJoined < currentJoined)
        ) {
          customer.joined = date;
        }
      }

      if (safeTimestamp >= customer.lastOrderTimestamp) {
        customer.lastOrder = date;
        customer.lastOrderTimestamp = safeTimestamp;

        const latestAddress = getAddressText(order);

        if (latestAddress) {
          customer.address = latestAddress;
          customer.city = getCustomerCity(order) || customer.city;
          customer.state = getCustomerState(order) || customer.state;
        }
      }
    }

    const address = getAddressText(order);

    if (address) {
      const addressKey = normalizeText(address);

      if (
        !customer.addresses.some(
          (entry) => normalizeText(entry.address) === addressKey,
        )
      ) {
        customer.addresses.push({
          label:
            customer.addresses.length === 0
              ? "Delivery address"
              : `Address ${customer.addresses.length + 1}`,
          address,
        });
      }
    }

    // Each order contributes once to this customer aggregate.
    customer.orders.push(order);

    // Cancelled orders are excluded from customer purchase value.
    if (!["cancelled", "canceled"].includes(getOrderStatus(order))) {
      customer.spent += getOrderTotal(order);
    }
  }

  return Array.from(customerMap.values())
    .map((customer) => ({
      ...customer,
      orderCount: customer.orders.length,
      orderHistory: [...customer.orders].sort((a, b) => {
        const dateA = new Date(getOrderDate(a) || 0).getTime();
        const dateB = new Date(getOrderDate(b) || 0).getTime();

        return (
          (Number.isNaN(dateB) ? 0 : dateB) -
          (Number.isNaN(dateA) ? 0 : dateA)
        );
      }),
      status: customer.orders.length > 1 ? "Returning" : "One-time",
    }))
    .sort((a, b) => b.lastOrderTimestamp - a.lastOrderTimestamp);
}

/* =========================================================
   BADGES
========================================================= */

function CustomerBadge({ status }) {
  const isReturning = status === "Returning";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
        isReturning
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isReturning ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {status}
    </span>
  );
}

function OrderStatusBadge({ status }) {
  const normalized = String(status || "pending")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const styles = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-sky-50 text-sky-700",
    processing: "bg-purple-50 text-purple-700",
    shipped: "bg-blue-50 text-blue-700",
    delivered: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
    canceled: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[normalized] || "bg-stone-100 text-stone-600"
      }`}
    >
      {normalized
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-[#e9e7dc] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#858a7e]">{label}</p>

          <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-[#244b32]">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-[#858a7e]">
            {description}
          </p>
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf1e8] text-[#285b3b]">
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   CUSTOMER PROFILE MODAL
========================================================= */

function CustomerModal({ customer, onClose }) {
  if (!customer) return null;

  const initials = String(customer.name || "Customer")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-[2px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-dialog-title"
        className="my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-[#fffdf7] shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#e9e7dc] bg-[#fffdf7]/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8a5d]">
              Customer relationship management
            </p>

            <h2
              id="customer-dialog-title"
              className="mt-1 text-xl font-extrabold text-[#244b32]"
            >
              Customer profile
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close customer details"
            className="rounded-xl p-2 text-[#697366] transition hover:bg-[#edf1e8]"
          >
            <X size={21} />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          {/* Customer identity */}
          <section className="flex flex-col gap-4 rounded-2xl border border-[#e9e7dc] bg-white p-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#edf1e8] text-xl font-extrabold text-[#285b3b]">
              {initials || "C"}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="break-words text-xl font-bold text-[#244b32]">
                {customer.name}
              </h3>

              <p className="mt-1 break-all text-xs text-[#858a7e]">
                Customer ID: {customer.userId || "Not available"}
              </p>

              <div className="mt-3">
                <CustomerBadge status={customer.status} />
              </div>
            </div>

            <div className="rounded-xl bg-[#f7f1df] px-4 py-3">
              <p className="text-xs text-[#858a7e]">Total purchase value</p>

              <p className="mt-1 text-lg font-extrabold text-[#806328]">
                {formatCurrency(customer.spent)}
              </p>
            </div>
          </section>

          {/* Contact information */}
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-[#e9e7dc] bg-white p-4">
              <Mail
                className="mt-0.5 shrink-0 text-[#52725a]"
                size={18}
              />

              <div className="min-w-0">
                <p className="text-xs text-[#858a7e]">Email address</p>

                {customer.email ? (
                  <a
                    href={`mailto:${customer.email}`}
                    className="mt-1 block break-all text-sm font-medium text-[#344637] hover:text-[#285b3b] hover:underline"
                  >
                    {customer.email}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-[#92978c]">
                    Not available
                  </p>
                )}
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-[#e9e7dc] bg-white p-4">
              <Phone
                className="mt-0.5 shrink-0 text-[#52725a]"
                size={18}
              />

              <div className="min-w-0">
                <p className="text-xs text-[#858a7e]">Phone number</p>

                {customer.phone ? (
                  <a
                    href={`tel:${customer.phone}`}
                    className="mt-1 block break-all text-sm font-medium text-[#344637] hover:text-[#285b3b] hover:underline"
                  >
                    {customer.phone}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-[#92978c]">
                    Not available
                  </p>
                )}
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-[#e9e7dc] bg-white p-4">
              <CalendarDays
                className="mt-0.5 shrink-0 text-[#52725a]"
                size={18}
              />

              <div>
                <p className="text-xs text-[#858a7e]">First order</p>

                <p className="mt-1 text-sm font-medium text-[#344637]">
                  {formatDate(customer.joined)}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-[#e9e7dc] bg-white p-4">
              <ShoppingBag
                className="mt-0.5 shrink-0 text-[#52725a]"
                size={18}
              />

              <div>
                <p className="text-xs text-[#858a7e]">Orders placed</p>

                <p className="mt-1 text-sm font-medium text-[#344637]">
                  {customer.orderCount}{" "}
                  {customer.orderCount === 1 ? "order" : "orders"}
                </p>
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="rounded-2xl border border-[#e9e7dc] bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="text-[#52725a]" size={19} />
              <h3 className="font-bold text-[#244b32]">
                Delivery addresses
              </h3>
            </div>

            {customer.addresses.length > 0 ? (
              <div className="space-y-3">
                {customer.addresses.map((address, index) => (
                  <div
                    key={`${customer.identity}-${index}`}
                    className="rounded-xl border border-[#e9e7dc] bg-[#faf9f3] p-4"
                  >
                    <span className="rounded-full bg-[#edf1e8] px-2.5 py-1 text-xs font-semibold text-[#285b3b]">
                      {address.label}
                    </span>

                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#465345]">
                      {address.address}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#858a7e]">
                No delivery address was found in the available order records.
              </p>
            )}

            <p className="mt-3 text-xs leading-5 text-[#92978c]">
              These addresses are taken from available order details. They
              are not a separate saved-address directory.
            </p>
          </section>

          {/* Purchase summary */}
          <section className="rounded-2xl border border-[#e9e7dc] bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Package className="text-[#52725a]" size={19} />
              <h3 className="font-bold text-[#244b32]">
                Purchase summary
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#faf9f3] p-4">
                <p className="text-xs text-[#858a7e]">Total orders</p>

                <p className="mt-2 text-xl font-extrabold text-[#244b32]">
                  {customer.orderCount}
                </p>
              </div>

              <div className="rounded-xl bg-[#faf9f3] p-4">
                <p className="text-xs text-[#858a7e]">Last order</p>

                <p className="mt-2 text-sm font-bold text-[#244b32]">
                  {formatDate(customer.lastOrder)}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-[#edf1e8] p-4">
              <p className="text-xs text-[#697366]">
                Purchase value excluding cancelled orders
              </p>

              <p className="mt-1 text-xl font-extrabold text-[#244b32]">
                {formatCurrency(customer.spent)}
              </p>
            </div>
          </section>

          {/* Order history */}
          <section className="rounded-2xl border border-[#e9e7dc] bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-bold text-[#244b32]">Order history</h3>

              <span className="rounded-full bg-[#edf1e8] px-3 py-1 text-xs font-semibold text-[#285b3b]">
                {customer.orderHistory.length}
              </span>
            </div>

            {customer.orderHistory.length > 0 ? (
              <div className="space-y-3">
                {customer.orderHistory.map((order) => (
                  <div
                    key={order.id || getOrderNumber(order)}
                    className="flex flex-col gap-3 rounded-xl border border-[#e9e7dc] bg-[#fffdf7] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="break-all text-sm font-bold text-[#285b3b]">
                        {getOrderLabel(order)}
                      </p>

                      <p className="mt-1 text-xs text-[#858a7e]">
                        {formatDate(getOrderDate(order))}
                      </p>

                      <p className="mt-2 text-xs text-[#697366]">
                        {getOrderItems(order).reduce(
                          (sum, item) => sum + getItemQuantity(item),
                          0,
                        )}{" "}
                        items
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                      <OrderStatusBadge status={getOrderStatus(order)} />

                      <p className="text-sm font-bold text-[#244b32]">
                        {formatCurrency(getOrderTotal(order))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#858a7e]">
                No order history is available.
              </p>
            )}
          </section>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#285b3b] px-5 py-3 font-semibold text-white transition hover:bg-[#1e462d]"
          >
            Close customer profile
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN ADMIN CUSTOMERS PAGE
========================================================= */

export default function AdminCustomers() {
  const {
    orders,
    ordersLoading,
    ordersRefreshing,
    ordersError,
    reloadOrders,
  } = useAdminData();

  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState(null);

  const safeOrders = Array.isArray(orders) ? orders : [];

  /*
   * The page intentionally does not use the previous demo customers
   * array. Customer profiles are built from real order records.
   */
  const customers = useMemo(
    () => buildCustomersFromOrders(safeOrders),
    [safeOrders],
  );

  /* =======================================================
     STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    const totalSpent = customers.reduce(
      (total, customer) => total + customer.spent,
      0,
    );

    const totalOrders = customers.reduce(
      (total, customer) => total + customer.orderCount,
      0,
    );

    const returningCustomers = customers.filter(
      (customer) => customer.orderCount > 1,
    ).length;

    const oneTimeCustomers = customers.filter(
      (customer) => customer.orderCount === 1,
    ).length;

    return {
      total: customers.length,
      returning: returningCustomers,
      oneTime: oneTimeCustomers,
      orders: totalOrders,
      spent: totalSpent,
    };
  }, [customers]);

  /* =======================================================
     SEARCH AND FILTER
  ======================================================= */

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const searchableValues = [
        customer.id,
        customer.userId,
        customer.name,
        customer.email,
        customer.phone,
        customer.city,
        customer.state,
        ...customer.addresses.map((address) => address.address),
      ];

      const matchesSearch =
        !term ||
        searchableValues.some((value) =>
          String(value || "").toLowerCase().includes(term),
        );

      const matchesFilter =
        customerFilter === "all" ||
        (customerFilter === "new" && customer.orderCount === 1) ||
        (customerFilter === "returning" && customer.orderCount > 1);

      return matchesSearch && matchesFilter;
    });
  }, [customers, search, customerFilter]);

  const hasActiveFilters = Boolean(search) || customerFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setCustomerFilter("all");
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    if (refreshing || ordersRefreshing || ordersLoading) return;

    if (typeof reloadOrders !== "function") {
      setNotice({
        type: "error",
        message:
          "Order refresh is not available in AdminDataContext.",
      });
      return;
    }

    setRefreshing(true);
    setNotice(null);

    try {
      await reloadOrders({ quiet: true });

      setNotice({
        type: "success",
        message: "Customer data refreshed from the latest available orders.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error?.message || "Unable to refresh customer data.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6 pb-8">
      {/* Page heading */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8a5d]">
            Customer relationship management
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#244b32] sm:text-3xl">
            Customers
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#858a7e]">
            Understand your customers, review their purchase history, and
            see who returns to shop with Chithu’s Natural Products.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || ordersRefreshing || ordersLoading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#dfe2d7] bg-white px-4 py-3 text-sm font-semibold text-[#285b3b] transition hover:bg-[#edf1e8] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw
            size={16}
            className={
              refreshing || ordersRefreshing ? "animate-spin" : ""
            }
          />
          Refresh data
        </button>
      </header>

      {/* Data source notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#d9e8d4] bg-[#edf5e9] px-4 py-3 text-sm text-[#285b3b]">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

        <div>
          <p className="font-semibold">Order-based customer directory</p>

          <p className="mt-1 text-xs leading-5 text-[#52725a]">
            Customer profiles and purchase totals are calculated from the
            orders available in your existing data context. Customers who
            have never placed an order will not appear in this list.
          </p>
        </div>
      </div>

      {/* Feedback */}
      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#d9e8d4] bg-[#edf5e9] text-[#285b3b]"
          }`}
        >
          <div className="flex min-w-0 items-start gap-2">
            {notice.type === "error" ? (
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}

            <p className="break-words">{notice.message}</p>
          </div>

          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss message"
            className="shrink-0 rounded-md p-1 hover:bg-black/5"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Loading error */}
      {ordersError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">Unable to load customer data</p>
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

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total customers"
          value={stats.total.toLocaleString("en-IN")}
          description="Unique customers identified from orders"
        />

        <StatCard
          icon={UserCheck}
          label="Returning customers"
          value={stats.returning.toLocaleString("en-IN")}
          description="Customers with more than one order"
        />

        <StatCard
          icon={ShoppingBag}
          label="Orders placed"
          value={stats.orders.toLocaleString("en-IN")}
          description="Orders across the customer directory"
        />

        <StatCard
          icon={IndianRupee}
          label="Purchase value"
          value={formatCurrency(stats.spent)}
          description="Excludes orders marked cancelled"
        />
      </section>

      {/* Customer directory */}
      <section className="overflow-hidden rounded-2xl border border-[#e9e7dc] bg-white">
        {/* Section header and filters */}
        <div className="border-b border-[#e9e7dc] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-bold text-[#244b32]">
                Customer directory
              </h2>

              <p className="mt-1 text-sm text-[#858a7e]">
                {filteredCustomers.length} of {customers.length} customers
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-[#e1e2d6] px-3 transition focus-within:border-[#285b3b] focus-within:ring-2 focus-within:ring-[#285b3b]/10 sm:w-80">
                <Search
                  size={18}
                  className="shrink-0 text-[#92978c]"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, email, phone, city..."
                  aria-label="Search customers"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#344637] outline-none placeholder:text-[#a0a499]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear customer search"
                    className="rounded-md p-1 text-[#92978c] hover:bg-[#edf1e8]"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <select
                value={customerFilter}
                onChange={(event) =>
                  setCustomerFilter(event.target.value)
                }
                aria-label="Filter customers"
                className="min-w-0 rounded-xl border border-[#e1e2d6] bg-white px-3 py-3 text-sm text-[#344637] outline-none transition focus:border-[#285b3b] sm:min-w-[190px]"
              >
                {CUSTOMER_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-[#858a7e]">
                Showing filtered customers
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#285b3b] transition hover:text-[#a17a2d]"
              >
                <RotateCcw size={14} />
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {ordersLoading && safeOrders.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Loader2
              size={30}
              className="mx-auto mb-3 animate-spin text-[#285b3b]"
            />

            <p className="font-bold text-[#344637]">
              Loading customer data...
            </p>

            <p className="mt-1 text-sm text-[#858a7e]">
              Fetching the latest available order records.
            </p>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-[#faf9f3] text-xs uppercase tracking-wide text-[#858a7e]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Contact</th>
                    <th className="px-5 py-4 font-semibold">Location</th>
                    <th className="px-5 py-4 font-semibold">Orders</th>
                    <th className="px-5 py-4 font-semibold">Purchase value</th>
                    <th className="px-5 py-4 font-semibold">Customer type</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0efe7]">
                  {filteredCustomers.map((customer) => {
                    const initials = String(customer.name || "C")
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part.charAt(0).toUpperCase())
                      .join("");

                    return (
                      <tr
                        key={customer.identity}
                        className="transition hover:bg-[#fffdf7]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf1e8] font-bold text-[#285b3b]">
                              {initials || "C"}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate text-sm font-semibold text-[#344637]">
                                {customer.name}
                              </p>

                              <p className="mt-1 max-w-[220px] truncate text-xs text-[#92978c]">
                                {customer.userId
                                  ? `ID: ${customer.userId}`
                                  : customer.email || customer.phone || "Customer"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-[220px] truncate text-sm text-[#465345]">
                            {customer.email || "No email"}
                          </p>

                          <p className="mt-1 text-xs text-[#92978c]">
                            {customer.phone || "No phone"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-[#465345]">
                            {customer.city || "—"}
                          </p>

                          <p className="mt-1 text-xs text-[#92978c]">
                            {customer.state || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-[#344637]">
                          {customer.orderCount}
                        </td>

                        <td className="px-5 py-4 text-sm font-bold text-[#244b32]">
                          {formatCurrency(customer.spent)}
                        </td>

                        <td className="px-5 py-4">
                          <CustomerBadge status={customer.status} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(customer)}
                            aria-label={`View ${customer.name}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#dfe2d7] px-3 py-2 text-sm font-semibold text-[#285b3b] transition hover:border-[#285b3b] hover:bg-[#edf1e8]"
                          >
                            <Eye size={15} />
                            View
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile customer cards */}
            <div className="divide-y divide-[#f0efe7] md:hidden">
              {filteredCustomers.map((customer) => {
                const initials = String(customer.name || "C")
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part.charAt(0).toUpperCase())
                  .join("");

                return (
                  <article
                    key={customer.identity}
                    className="space-y-4 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf1e8] font-bold text-[#285b3b]">
                        {initials || "C"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words font-bold text-[#344637]">
                            {customer.name}
                          </h3>

                          <CustomerBadge status={customer.status} />
                        </div>

                        <p className="mt-1 break-all text-xs text-[#92978c]">
                          {customer.userId || customer.email || customer.phone}
                        </p>

                        <p className="mt-2 break-all text-sm text-[#465345]">
                          {customer.email || "No email available"}
                        </p>

                        <p className="mt-1 text-sm text-[#697366]">
                          {customer.phone || "No phone available"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#faf9f3] p-3">
                      <div>
                        <p className="text-xs text-[#858a7e]">Orders</p>

                        <p className="mt-1 font-bold text-[#244b32]">
                          {customer.orderCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#858a7e]">
                          Purchase value
                        </p>

                        <p className="mt-1 break-words font-bold text-[#244b32]">
                          {formatCurrency(customer.spent)}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-[#858a7e]">Location</p>

                        <p className="mt-1 text-sm text-[#465345]">
                          {[customer.city, customer.state]
                            .filter(Boolean)
                            .join(", ") || "Not available"}
                        </p>
                      </div>

                      <div className="col-span-2 border-t border-[#e9e7dc] pt-3">
                        <p className="text-xs text-[#858a7e]">
                          Last order
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#344637]">
                          {formatDate(customer.lastOrder)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(customer)}
                      className="flex w-full items-center justify-between rounded-xl border border-[#dfe2d7] px-4 py-3 text-sm font-semibold text-[#285b3b] transition hover:bg-[#edf1e8]"
                    >
                      View customer profile
                      <ChevronRight size={17} />
                    </button>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="px-5 py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf1e8] text-[#52725a]">
              <Users size={26} />
            </span>

            <h3 className="mt-4 font-bold text-[#244b32]">
              {hasActiveFilters
                ? "No matching customers"
                : "No customers found yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#858a7e]">
              {hasActiveFilters
                ? "Try another search term or change the customer filter."
                : "Customers will appear here when order records containing identifiable customer information are available."}
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

            {!hasActiveFilters && ordersError && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing || ordersRefreshing || ordersLoading}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#285b3b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e462d] disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                Try again
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-[#e9e7dc] bg-[#fffdf7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#858a7e]">
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>

          <p className="text-xs text-[#858a7e]">
            Calculated from available order records
          </p>
        </div>
      </section>

      {/* Customer profile modal */}
      {selectedCustomer && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}