import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  ArrowRight,
  Clock3,
  CircleCheck,
  Truck,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Boxes,
  CalendarDays,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
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

const normalizeStatus = (value) =>
  String(value || "pending")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

const displayStatus = (value) =>
  normalizeStatus(value).replace(/\b\w/g, (letter) => letter.toUpperCase());

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-violet-50 text-violet-700",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-50 text-red-700",
  refunded: "bg-slate-100 text-slate-700",
};

const getCustomerKey = (order) => {
  const email = String(order.email || "").trim().toLowerCase();
  const phone = String(order.phone || "").replace(/\D/g, "");

  // Prefer email where available; otherwise use the phone number.
  return email || phone || "";
};

const getOrderAmount = (order) => {
  if (order.total_amount !== null && order.total_amount !== undefined) {
    return Number(order.total_amount) || 0;
  }

  return (
    (Number(order.subtotal) || 0) +
    (Number(order.delivery_charge) || 0)
  );
};

function StatCard({ title, value, subtitle, icon: Icon, accent }) {
  const accentStyles = {
    green: "bg-[#e9f0e6] text-[#285b3b]",
    gold: "bg-[#f8efd9] text-[#a17a2d]",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="rounded-2xl border border-[#e9e7dc] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#7c8277]">{title}</p>

          <h2 className="mt-3 break-words text-2xl font-extrabold tracking-tight text-[#244b32] sm:text-3xl">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            accentStyles[accent] || accentStyles.green
          }`}
        >
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-[#92978c]">{subtitle}</p>
    </div>
  );
}

function SectionHeader({ title, description, action, to }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-[#244b32]">{title}</h2>

        {description && (
          <p className="mt-1 text-sm text-[#858a7e]">{description}</p>
        )}
      </div>

      {action && (
        <Link
          to={to}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#285b3b] hover:text-[#a17a2d]"
        >
          {action}
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-[#e3e3d8] px-4 py-8 text-center">
      <Boxes size={25} className="mb-3 text-[#a4aa9c]" />
      <p className="text-sm text-[#858a7e]">{message}</p>
    </div>
  );
}

function SalesChart({ orders, range }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const chartData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    if (range === "year") {
      const months = Array.from({ length: 12 }, (_, index) => ({
        day: new Date(year, index, 1).toLocaleDateString("en-IN", {
          month: "short",
        }),
        sales: 0,
      }));

      orders.forEach((order) => {
        const date = new Date(order.created_at);

        if (
          Number.isNaN(date.getTime()) ||
          date.getFullYear() !== year ||
          normalizeStatus(order.payment_status) !== "paid"
        ) {
          return;
        }

        months[date.getMonth()].sales += getOrderAmount(order);
      });

      return months;
    }

    if (range === "month") {
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const days = Array.from({ length: daysInMonth }, (_, index) => ({
        day: String(index + 1),
        sales: 0,
      }));

      orders.forEach((order) => {
        const date = new Date(order.created_at);

        if (
          Number.isNaN(date.getTime()) ||
          date.getFullYear() !== year ||
          date.getMonth() !== month ||
          normalizeStatus(order.payment_status) !== "paid"
        ) {
          return;
        }

        days[date.getDate() - 1].sales += getOrderAmount(order);
      });

      return days;
    }

    const startOfToday = new Date(year, month, now.getDate());
    const mondayOffset = (startOfToday.getDay() + 6) % 7;

    const monday = new Date(startOfToday);
    monday.setDate(monday.getDate() - mondayOffset);

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      return {
        day: date.toLocaleDateString("en-IN", { weekday: "short" }),
        dateKey: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        sales: 0,
      };
    });

    orders.forEach((order) => {
      const date = new Date(order.created_at);

      if (
        Number.isNaN(date.getTime()) ||
        normalizeStatus(order.payment_status) !== "paid"
      ) {
        return;
      }

      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const day = days.find((item) => item.dateKey === key);

      if (day) day.sales += getOrderAmount(order);
    });

    return days;
  }, [orders, range]);

  const maxSales = Math.max(...chartData.map((item) => item.sales), 1);

  const chartHeight = 190;
  const chartWidth = 640;
  const leftPadding = 38;
  const rightPadding = 12;
  const topPadding = 18;
  const bottomPadding = 27;

  const plotWidth = chartWidth - leftPadding - rightPadding;
  const plotHeight = chartHeight - topPadding - bottomPadding;

  const points = chartData.map((item, index) => ({
    ...item,
    x:
      leftPadding +
      (index / Math.max(chartData.length - 1, 1)) * plotWidth,
    y: topPadding + plotHeight - (item.sales / maxSales) * plotHeight,
  }));

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    )
    .join(" ");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${
          chartHeight - bottomPadding
        } L ${points[0].x} ${chartHeight - bottomPadding} Z`
      : "";

  const formatCompact = (value) =>
    value >= 1000
      ? `₹${(value / 1000).toLocaleString("en-IN", {
          maximumFractionDigits: 1,
        })}k`
      : formatCurrency(value);

  return (
    <div>
      <div className="mb-4 flex justify-between text-[11px] text-[#92978c]">
        <span>{formatCompact(maxSales)}</span>
        <span>{formatCompact(maxSales * 0.5)}</span>
        <span>₹0</span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label={`Paid sales by ${range}`}
          className="w-full overflow-visible"
        >
          {[0, 0.5, 1].map((fraction) => {
            const y = topPadding + plotHeight * fraction;

            return (
              <line
                key={fraction}
                x1={leftPadding}
                y1={y}
                x2={chartWidth - rightPadding}
                y2={y}
                stroke="#ecece4"
                strokeDasharray="4 5"
              />
            );
          })}

          <path d={areaPath} fill="#285b3b" opacity="0.08" />

          <path
            d={linePath}
            fill="none"
            stroke="#285b3b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            <g key={`${point.day}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredIndex === index ? 5 : 3}
                fill="#fffdf7"
                stroke="#285b3b"
                strokeWidth="2"
              />

              <rect
                x={point.x - 10}
                y={topPadding}
                width="20"
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          ))}

          {points
            .filter((_, index) => {
              const step =
                range === "month" ? 5 : range === "year" ? 2 : 1;

              return index % step === 0 || index === points.length - 1;
            })
            .map((point, index) => (
              <text
                key={`${point.day}-label-${index}`}
                x={point.x}
                y={chartHeight - 5}
                textAnchor="middle"
                fill="#92978c"
                fontSize="10"
              >
                {point.day}
              </text>
            ))}
        </svg>

        {hoveredIndex !== null && points[hoveredIndex] && (
          <div className="mt-2 rounded-lg bg-[#edf1e8] px-3 py-2 text-sm text-[#285b3b]">
            <span className="font-semibold">
              {points[hoveredIndex].day}
            </span>

            <span className="ml-2">
              {formatCurrency(points[hoveredIndex].sales)}
            </span>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-[#92978c]">
        Only orders marked as paid are included. Values are based on order
        creation dates.
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [range, setRange] = useState("week");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (quiet = false) => {
    if (quiet) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [ordersResult, productsResult] = await Promise.all([
        supabase
          .from("orders")
          .select(
            `
              id,
              order_number,
              customer_name,
              phone,
              email,
              created_at,
              status,
              payment_status,
              subtotal,
              delivery_charge,
              total_amount
            `,
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("products")
          .select(`
            id,
            name,
            status,
            product_variants (
              id,
              stock_quantity,
              is_active
            )
          `)
          .order("created_at", { ascending: false }),
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (productsResult.error) throw productsResult.error;

      setOrders(ordersResult.data || []);
      setProducts(productsResult.data || []);
    } catch (err) {
      console.error("Unable to load admin dashboard:", err);

      setError(
        err?.message ||
          "Unable to load dashboard data. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const paidOrders = orders.filter(
      (order) => normalizeStatus(order.payment_status) === "paid",
    );

    const paidRevenue = paidOrders.reduce(
      (total, order) => total + getOrderAmount(order),
      0,
    );

    const customers = new Set(
      orders.map(getCustomerKey).filter(Boolean),
    );

    const lowStockVariants = products.flatMap((product) =>
      (product.product_variants || [])
        .filter((variant) => {
          const stock = Number(variant.stock_quantity);

          return (
            variant.is_active !== false &&
            Number.isFinite(stock) &&
            stock <= 5
          );
        })
        .map((variant) => ({
          id: variant.id,
          productId: product.id,
          name: product.name,
          stock: Number(variant.stock_quantity),
        })),
    );

    return {
      paidRevenue,
      totalOrders: orders.length,
      customerCount: customers.size,
      productCount: products.length,
      lowStockVariants,
    };
  }, [orders, products]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const orderStatuses = useMemo(() => {
    const definitions = [
      {
        label: "Pending",
        icon: Clock3,
        color: "text-amber-700",
        bg: "bg-amber-50",
      },
      {
        label: "Processing",
        icon: Package,
        color: "text-blue-700",
        bg: "bg-blue-50",
      },
      {
        label: "Shipped",
        icon: Truck,
        color: "text-violet-700",
        bg: "bg-violet-50",
      },
      {
        label: "Delivered",
        icon: CircleCheck,
        color: "text-emerald-700",
        bg: "bg-emerald-50",
      },
    ];

    return definitions.map((definition) => ({
      ...definition,
      count: orders.filter(
        (order) =>
          normalizeStatus(order.status) ===
          definition.label.toLowerCase(),
      ).length,
    }));
  }, [orders]);

  const metricCards = [
    {
      title: "Paid Revenue",
      value: formatCurrency(stats.paidRevenue),
      subtitle: "Total value of orders marked paid",
      icon: IndianRupee,
      accent: "green",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString("en-IN"),
      subtitle: "All orders returned by the database",
      icon: ShoppingBag,
      accent: "gold",
    },
    {
      title: "Customers",
      value: stats.customerCount.toLocaleString("en-IN"),
      subtitle: "Unique customer contacts in orders",
      icon: Users,
      accent: "blue",
    },
    {
      title: "Products",
      value: stats.productCount.toLocaleString("en-IN"),
      subtitle: `${stats.lowStockVariants.length} variants need stock attention`,
      icon: Package,
      accent: "purple",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-[#285b3b]">
        <RefreshCw className="animate-spin" size={30} />
        <p className="text-sm font-medium">Loading your real store data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#285b3b] p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[40px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-[#d6b35d]/10" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#e5cf8e]">
            YOUR STORE AT A GLANCE
          </p>

          <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">
            Welcome to your store dashboard!
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
            Manage your products, monitor incoming orders, and review your
            store's actual performance from one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 rounded-xl bg-[#f4df9d] px-4 py-3 text-sm font-bold text-[#244b32] transition hover:bg-white"
            >
              <Package size={17} />
              Manage Products
            </Link>

            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View Orders
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Refresh and errors */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#344637]">
            Live database overview
          </p>
          <p className="mt-1 text-xs text-[#858a7e]">
            Values refresh when you reload the dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-[#dcded2] bg-white px-4 py-2.5 text-sm font-semibold text-[#285b3b] transition hover:bg-[#edf1e8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh data"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <AlertCircle size={21} className="mt-0.5 shrink-0 text-red-600" />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-red-800">
              Dashboard data could not be loaded
            </p>
            <p className="mt-1 break-words text-sm text-red-700">{error}</p>
            <p className="mt-2 text-xs text-red-700">
              Check your Supabase connection, table permissions, and admin
              Row Level Security policies. No sample figures are displayed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics */}
      <section>
        <SectionHeader
          title="Store overview"
          description="Calculated from your actual database records."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      </section>

      {/* Sales chart and order status */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#e9e7dc] bg-white p-5 sm:p-6 xl:col-span-2">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={19} className="text-[#285b3b]" />
                <h2 className="text-lg font-bold text-[#244b32]">
                  Sales overview
                </h2>
              </div>

              <p className="mt-1 text-sm text-[#858a7e]">
                Paid order revenue from your database
              </p>
            </div>

            <div className="flex rounded-xl bg-[#f4f4ed] p-1">
              {[
                ["week", "Week"],
                ["month", "Month"],
                ["year", "Year"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRange(value)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    range === value
                      ? "bg-[#285b3b] text-white shadow-sm"
                      : "text-[#7b8176] hover:text-[#285b3b]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <EmptyState message="Sales data is unavailable until the database query succeeds." />
          ) : (
            <SalesChart orders={orders} range={range} />
          )}
        </div>

        <div className="rounded-2xl border border-[#e9e7dc] bg-white p-5 sm:p-6">
          <SectionHeader
            title="Order status"
            description="Current order counts by status"
          />

          {error ? (
            <EmptyState message="Order statuses could not be loaded." />
          ) : (
            orderStatuses.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between border-b border-[#f0efe7] py-4 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
                    >
                      <Icon size={19} />
                    </div>

                    <span className="text-sm font-medium text-[#596356]">
                      {item.label}
                    </span>
                  </div>

                  <span className="text-lg font-extrabold text-[#244b32]">
                    {item.count}
                  </span>
                </div>
              );
            })
          )}

          <Link
            to="/admin/orders"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#edf1e8] px-4 py-3 text-sm font-semibold text-[#285b3b] transition hover:bg-[#e1e9db]"
          >
            Manage orders
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Recent orders */}
      <section className="rounded-2xl border border-[#e9e7dc] bg-white p-5 sm:p-6">
        <SectionHeader
          title="Recent orders"
          description="The latest orders returned by Supabase."
          action="View all orders"
          to="/admin/orders"
        />

        {error ? (
          <EmptyState message="Recent orders could not be loaded." />
        ) : recentOrders.length === 0 ? (
          <EmptyState message="No orders have been placed yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b border-[#ecebe3] text-[11px] uppercase tracking-wider text-[#93978d]">
                  <th className="px-3 py-4 font-semibold">Order ID</th>
                  <th className="px-3 py-4 font-semibold">Customer</th>
                  <th className="px-3 py-4 font-semibold">Date</th>
                  <th className="px-3 py-4 font-semibold">Amount</th>
                  <th className="px-3 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => {
                  const status = normalizeStatus(order.status);

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-[#f2f1eb] last:border-0 hover:bg-[#fffdf7]"
                    >
                      <td className="px-3 py-4 text-sm font-bold text-[#285b3b]">
                        {order.order_number || order.id}
                      </td>

                      <td className="px-3 py-4">
                        <p className="text-sm font-medium text-[#3f4c40]">
                          {order.customer_name || "Customer"}
                        </p>
                        <p className="mt-1 text-xs text-[#858a7e]">
                          {order.phone || order.email || "No contact provided"}
                        </p>
                      </td>

                      <td className="px-3 py-4 text-sm text-[#858a7e]">
                        {formatDate(order.created_at)}
                      </td>

                      <td className="px-3 py-4 text-sm font-bold text-[#244b32]">
                        {formatCurrency(getOrderAmount(order))}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                            statusStyles[status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {displayStatus(order.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Inventory alerts */}
      <section>
        <SectionHeader
          title="Inventory alerts"
          description="Product variants with five or fewer units in stock, including out-of-stock variants."
          action="Manage products"
          to="/admin/products"
        />

        {error ? (
          <EmptyState message="Inventory data could not be loaded." />
        ) : stats.lowStockVariants.length === 0 ? (
          <EmptyState message="No low-stock variants found." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.lowStockVariants.slice(0, 8).map((product) => (
              <div
                key={product.id}
                className="flex items-start gap-3 rounded-2xl border border-[#e9e7dc] bg-white p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fbf0d8] text-[#9b762e]">
                  <AlertTriangle size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#344637]">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-xs text-[#858a7e]">
                    {product.stock === 0
                      ? "Out of stock"
                      : `Only ${product.stock} units left`}
                  </p>

                  <span className="mt-2 inline-block rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                    {product.stock === 0 ? "OUT OF STOCK" : "LOW STOCK"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-[#dfe8dc] bg-[#f4f8f1] p-4">
        <CalendarDays
          size={20}
          className="mt-0.5 shrink-0 text-[#285b3b]"
        />

        <div>
          <p className="text-sm font-bold text-[#285b3b]">
            Database-connected dashboard
          </p>

          <p className="mt-1 text-xs leading-5 text-[#667562]">
            Orders, revenue, customer contacts, product counts, stock alerts,
            and chart values are calculated from Supabase responses. Customer
            count represents unique contacts in the returned orders, not
            necessarily every registered account.
          </p>
        </div>
      </div>
    </div>
  );
}