import { useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Package,
  Users,
  CalendarDays,
  Download,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowUpRight,
  ChartColumnIncreasing,
  Layers3,
  ClipboardList,
} from "lucide-react";
import { useAdminData } from "../context/AdminDataContext";

const PERIODS = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "All time", value: "all" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const getOrderTotal = (order) => {
  const itemTotal = (order.items || []).reduce(
    (sum, item) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  );

  return itemTotal + (Number(order.deliveryCharge) || 0);
};

const getOrderDate = (order) => {
  if (!order.date) return null;

  const date = new Date(order.date);

  return Number.isNaN(date.getTime()) ? null : date;
};

const getStatus = (order) =>
  String(order.status || "Pending").trim().toLowerCase();

const isCancelled = (order) => getStatus(order) === "cancelled";
const isDelivered = (order) => getStatus(order) === "delivered";

const isPending = (order) =>
  ["pending", "processing", "confirmed", "shipped"].includes(
    getStatus(order),
  );

const getProductName = (product) =>
  product.name || product.title || product.productName || "Unnamed product";

const getStock = (product) =>
  Number(product.stock ?? product.quantityInStock ?? product.quantity ?? 0);

const getItemProductName = (item) =>
  item.name || item.title || item.productName || "Unknown product";

const getCategoryName = (product) =>
  product.category || "Uncategorised";

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDateLabel(date, options = {}) {
  return date.toLocaleDateString("en-IN", options);
}

function getDateRange(period) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  if (period === "all") {
    return { start: null, end };
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (Number(period) - 1));

  return { start, end };
}

function getEligibleOrders(orders, period) {
  const { start, end } = getDateRange(period);

  return orders.filter((order) => {
    const date = getOrderDate(order);

    if (!date) return false;
    if (date > end) return false;
    if (start && date < start) return false;

    return true;
  });
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
}) {
  return (
    <article className="rounded-2xl border border-[#e9e7dc] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#858a7e]">{title}</p>
          <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-[#244b32] sm:text-3xl">
            {value}
          </p>
        </div>

        <div className={`shrink-0 rounded-xl p-3 ${accent}`}>
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-[#858a7e]">
        {description}
      </p>
    </article>
  );
}

function Panel({ title, subtitle, icon: Icon, children, action }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e9e7dc] bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-[#f0efe7] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[#e9f0e6] p-2.5 text-[#285b3b]">
            <Icon size={19} />
          </div>

          <div>
            <h2 className="font-bold text-[#244b32]">{title}</h2>

            {subtitle && (
              <p className="mt-1 text-xs leading-5 text-[#858a7e]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center text-center">
      <BarChart3 size={30} className="text-[#b8c5b4]" />

      <p className="mt-3 text-sm font-semibold text-[#586354]">
        No report data available
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-[#92978c]">
        {message}
      </p>
    </div>
  );
}

function SalesChart({ data, valueKey = "revenue" }) {
  const maximum = Math.max(
    ...data.map((item) => Number(item[valueKey]) || 0),
    1,
  );

  if (!data.length || data.every((item) => !item[valueKey])) {
    return (
      <EmptyState message="Sales will appear here when your orders contain valid dates and order items." />
    );
  }

  return (
    <div>
      <div className="flex h-56 items-end gap-2 border-b border-l border-[#e9e7dc] px-2 pt-5 sm:gap-3 sm:px-4">
        {data.map((item) => {
          const value = Number(item[valueKey]) || 0;
          const height = Math.max((value / maximum) * 100, value ? 4 : 0);

          return (
            <div
              key={item.key}
              className="group flex h-full min-w-0 flex-1 flex-col justify-end"
              title={`${item.label}: ${formatCurrency(value)}`}
            >
              <div className="flex h-full items-end justify-center">
                <div
                  className="w-full max-w-12 rounded-t-lg bg-[#477851] transition-all duration-300 group-hover:bg-[#b89a50]"
                  style={{ height: `${height}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2 px-2 sm:gap-3 sm:px-4">
        {data.map((item) => (
          <div key={item.key} className="min-w-0 flex-1 text-center">
            <span className="block truncate text-[10px] text-[#858a7e] sm:text-xs">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalBar({ label, value, maximum, suffix = "" }) {
  const width = maximum > 0 ? (value / maximum) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-medium text-[#465345]">
          {label}
        </span>

        <span className="shrink-0 font-bold text-[#244b32]">
          {formatNumber(value)}
          {suffix}
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-[#edf0e8]">
        <div
          className="h-full rounded-full bg-[#477851] transition-all duration-300"
          style={{ width: `${Math.min(width, 100)}%` }}
        />
      </div>
    </div>
  );
}

function StatusRow({ label, count, total, color, icon: Icon }) {
  const percentage = total ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className={`rounded-xl p-2.5 ${color}`}>
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-3 text-sm">
          <span className="truncate font-medium text-[#465345]">
            {label}
          </span>
          <span className="font-bold text-[#244b32]">{count}</span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf0e8]">
          <div
            className="h-full rounded-full bg-[#477851]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminReports() {
  const {
    products = [],
    categories = [],
    orders = [],
  } = useAdminData();

  const [period, setPeriod] = useState("30");

  const report = useMemo(() => {
    const datedOrders = getEligibleOrders(orders, period);

    // Cancelled orders do not count as sales revenue.
    const validOrders = datedOrders.filter((order) => !isCancelled(order));

    const revenue = validOrders.reduce(
      (sum, order) => sum + getOrderTotal(order),
      0,
    );

    const deliveredOrders = datedOrders.filter(isDelivered);
    const pendingOrders = datedOrders.filter(isPending);
    const cancelledOrders = datedOrders.filter(isCancelled);

    const averageOrderValue = validOrders.length
      ? revenue / validOrders.length
      : 0;

    // Daily buckets for short periods; monthly buckets for all-time reports.
    const isAllTime = period === "all";
    const now = new Date();
    const dailyBuckets = [];

    if (isAllTime) {
      const firstDate = datedOrders
        .map(getOrderDate)
        .filter(Boolean)
        .sort((a, b) => a - b)[0];

      if (firstDate) {
        const cursor = new Date(
          firstDate.getFullYear(),
          firstDate.getMonth(),
          1,
        );

        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        while (cursor <= lastMonth && dailyBuckets.length < 36) {
          const bucketDate = new Date(cursor);

          dailyBuckets.push({
            key: `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`,
            label: getDateLabel(bucketDate, { month: "short" }),
            fullLabel: getDateLabel(bucketDate, {
              month: "long",
              year: "numeric",
            }),
            revenue: 0,
          });

          cursor.setMonth(cursor.getMonth() + 1);
        }
      }
    } else {
      const { start } = getDateRange(period);

      for (let i = 0; i < Number(period); i += 1) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);

        dailyBuckets.push({
          key: getDateKey(date),
          label:
            Number(period) > 7
              ? getDateLabel(date, {
                  day: "numeric",
                  month: "short",
                })
              : getDateLabel(date, { weekday: "short" }),
          fullLabel: getDateLabel(date, {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          revenue: 0,
        });
      }
    }

    const bucketMap = new Map(
      dailyBuckets.map((bucket) => [bucket.key, bucket]),
    );

    validOrders.forEach((order) => {
      const date = getOrderDate(order);
      if (!date) return;

      const key = isAllTime
        ? `${date.getFullYear()}-${date.getMonth()}`
        : getDateKey(date);

      const bucket = bucketMap.get(key);
      if (bucket) bucket.revenue += getOrderTotal(order);
    });

    // Aggregate product sales from order line items.
    const productSales = new Map();

    validOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = getItemProductName(item);
        const quantity = Number(item.quantity) || 0;
        const sales = (Number(item.price) || 0) * quantity;

        const current = productSales.get(name) || {
          name,
          quantity: 0,
          revenue: 0,
        };

        current.quantity += quantity;
        current.revenue += sales;

        productSales.set(name, current);
      });
    });

    const bestProducts = [...productSales.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Product/category performance based on item line sales.
    const categorySales = new Map();

    validOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const category =
          item.category ||
          products.find(
            (product) =>
              getProductName(product).toLowerCase() ===
              getItemProductName(item).toLowerCase(),
          )?.category ||
          "Uncategorised";

        categorySales.set(
          category,
          (categorySales.get(category) || 0) +
            (Number(item.price) || 0) * (Number(item.quantity) || 0),
        );
      });
    });

    const categoryPerformance = [...categorySales.entries()]
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6);

    // Derive low-stock products from available product fields.
    const lowStockProducts = products
      .map((product) => ({
        ...product,
        reportName: getProductName(product),
        reportStock: getStock(product),
      }))
      .filter(
        (product) =>
          product.isActive !== false &&
          product.status !== "Inactive" &&
          product.reportStock >= 0 &&
          product.reportStock <= 5,
      )
      .sort((a, b) => a.reportStock - b.reportStock)
      .slice(0, 6);

    const statusCounts = {
      pending: datedOrders.filter(
        (order) => getStatus(order) === "pending",
      ).length,
      processing: datedOrders.filter((order) =>
        ["processing", "confirmed", "shipped"].includes(getStatus(order)),
      ).length,
      delivered: deliveredOrders.length,
      cancelled: cancelledOrders.length,
    };

    return {
      datedOrders,
      validOrders,
      revenue,
      averageOrderValue,
      deliveredOrders,
      pendingOrders,
      cancelledOrders,
      bestProducts,
      categoryPerformance,
      lowStockProducts,
      statusCounts,
      salesBuckets: dailyBuckets,
      uniqueBuyers: new Set(
        validOrders.map((order) => order.customer).filter(Boolean),
      ).size,
    };
  }, [orders, products, period]);

  const allTimeRevenue = useMemo(
    () =>
      orders
        .filter((order) => !isCancelled(order))
        .reduce((sum, order) => sum + getOrderTotal(order), 0),
    [orders],
  );

  const exportCSV = () => {
    const rows = [
      ["Report", "Value"],
      [
        "Period",
        PERIODS.find((item) => item.value === period)?.label || "All time",
      ],
      ["Revenue", report.revenue],
      ["Eligible orders", report.validOrders.length],
      ["Average order value", Math.round(report.averageOrderValue)],
      ["Delivered orders", report.deliveredOrders.length],
      ["Pending / processing orders", report.pendingOrders.length],
      ["Cancelled orders", report.cancelledOrders.length],
      [],
      ["Best-selling products"],
      ["Product", "Quantity sold", "Product revenue"],
      ...report.bestProducts.map((product) => [
        product.name,
        product.quantity,
        product.revenue,
      ]),
      [],
      ["Category sales"],
      ["Category", "Sales"],
      ...report.categoryPerformance.map((category) => [
        category.name,
        category.sales,
      ]),
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = rows.map((row) => row.map(escapeCSV).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `chithus-reports-${period === "all" ? "all-time" : `${period}-days`}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const maximumProductQuantity = Math.max(
    ...report.bestProducts.map((item) => item.quantity),
    1,
  );

  const maximumCategorySales = Math.max(
    ...report.categoryPerformance.map((item) => item.sales),
    1,
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-medium text-[#9b7b36]">
            Store performance
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#244b32] sm:text-3xl">
            Reports & Analytics
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#858a7e]">
            Understand your sales, monitor orders, and identify your
            best-selling products.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex items-center gap-2 rounded-xl border border-[#e1e2d6] bg-white px-3 py-2.5">
            <CalendarDays
              size={17}
              className="shrink-0 text-[#285b3b]"
            />

            <span className="sr-only">Report date range</span>

            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="min-w-0 bg-transparent text-sm font-semibold text-[#344637] outline-none"
            >
              {PERIODS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285b3b] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e462d]"
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </header>

      {/* Demo notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#e8dfc4] bg-[#f8efd9] p-4 text-sm text-[#806328]">
        <AlertTriangle size={19} className="mt-0.5 shrink-0" />

        <p className="leading-6">
          <strong>Demo analytics:</strong> These reports are calculated from
          shared mock orders and products. Revenue excludes cancelled orders;
          all-time revenue currently totals {formatCurrency(allTimeRevenue)}.
          No Supabase queries or storefront changes are made.
        </p>
      </div>

      {/* Summary metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          title="Revenue"
          value={formatCurrency(report.revenue)}
          description="Eligible orders in the selected period, excluding cancelled orders."
          icon={IndianRupee}
          accent="bg-[#e9f0e6] text-[#285b3b]"
        />

        <MetricCard
          title="Orders"
          value={formatNumber(report.datedOrders.length)}
          description={`${report.deliveredOrders.length} delivered · ${report.cancelledOrders.length} cancelled`}
          icon={ShoppingBag}
          accent="bg-[#f7f1df] text-[#9b7b36]"
        />

        <MetricCard
          title="Average order value"
          value={formatCurrency(report.averageOrderValue)}
          description="Revenue divided by non-cancelled orders."
          icon={TrendingUp}
          accent="bg-[#e8edf5] text-[#46658a]"
        />

        <MetricCard
          title="Customers"
          value={formatNumber(report.uniqueBuyers)}
          description="Distinct customer names among eligible orders."
          icon={Users}
          accent="bg-[#f6e9df] text-[#9a6540]"
        />
      </section>

      {/* Sales trend */}
      <Panel
        title="Sales trend"
        subtitle={
          period === "all"
            ? "Monthly revenue based on available order dates."
            : "Daily revenue based on available order dates."
        }
        icon={ChartColumnIncreasing}
        action={
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#e9f0e6] px-3 py-1.5 text-xs font-bold text-[#285b3b]">
            <span className="h-2 w-2 rounded-full bg-[#477851]" />
            Revenue
          </span>
        }
      >
        {report.datedOrders.length === 0 ? (
          <EmptyState message="No orders with valid dates were found in this period. Try another date range or check your order dates." />
        ) : (
          <SalesChart data={report.salesBuckets} />
        )}

        <div className="mt-5 rounded-xl bg-[#faf8f1] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#465345]">
            <TrendingUp size={17} className="text-[#285b3b]" />
            Selected-period summary
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-[#858a7e]">Revenue</p>
              <p className="mt-1 font-extrabold text-[#244b32]">
                {formatCurrency(report.revenue)}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#858a7e]">Non-cancelled orders</p>
              <p className="mt-1 font-extrabold text-[#244b32]">
                {formatNumber(report.validOrders.length)}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-[#858a7e]">Average order</p>
              <p className="mt-1 font-extrabold text-[#244b32]">
                {formatCurrency(report.averageOrderValue)}
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {/* Product and category performance */}
      <section className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel
          title="Best-selling products"
          subtitle="Ranked by units sold in the selected period."
          icon={Trophy}
        >
          {report.bestProducts.length === 0 ? (
            <EmptyState message="Product sales will appear here when orders contain item names and quantities." />
          ) : (
            <div className="space-y-5">
              {report.bestProducts.map((product, index) => (
                <div key={product.name} className="flex gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                      index === 0
                        ? "bg-[#f7e9be] text-[#8c6b22]"
                        : "bg-[#edf1e8] text-[#477851]"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-sm font-bold text-[#344637]">
                        {product.name}
                      </p>

                      <span className="shrink-0 text-xs font-bold text-[#285b3b]">
                        {product.quantity} sold
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf0e8]">
                      <div
                        className="h-full rounded-full bg-[#477851]"
                        style={{
                          width: `${
                            (product.quantity / maximumProductQuantity) * 100
                          }%`,
                        }}
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-[#858a7e]">
                      Product revenue: {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Category performance"
          subtitle="Revenue grouped by product category."
          icon={Layers3}
        >
          {report.categoryPerformance.length === 0 ? (
            <EmptyState message="Category sales will appear when order items can be matched to product categories." />
          ) : (
            <div className="space-y-5">
              {report.categoryPerformance.map((category) => (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-[#465345]">
                      {category.name}
                    </span>

                    <span className="shrink-0 text-sm font-bold text-[#244b32]">
                      {formatCurrency(category.sales)}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-[#edf0e8]">
                    <div
                      className="h-full rounded-full bg-[#b89a50]"
                      style={{
                        width: `${
                          (category.sales / maximumCategorySales) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {categories.length > 0 && (
            <p className="mt-5 border-t border-[#f0efe7] pt-4 text-xs leading-5 text-[#858a7e]">
              {categories.length} categories are currently available in your
              shared admin data.
            </p>
          )}
        </Panel>
      </section>

      {/* Order statuses */}
      <section className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel
          title="Order status breakdown"
          subtitle="Status distribution for orders in the selected period."
          icon={ClipboardList}
        >
          {report.datedOrders.length === 0 ? (
            <EmptyState message="No dated orders are available for this period." />
          ) : (
            <div className="space-y-5">
              <StatusRow
                label="Pending"
                count={report.statusCounts.pending}
                total={report.datedOrders.length}
                icon={Clock3}
                color="bg-[#fff3d6] text-[#a17622]"
              />

              <StatusRow
                label="Processing / confirmed / shipped"
                count={report.statusCounts.processing}
                total={report.datedOrders.length}
                icon={ShoppingBag}
                color="bg-[#e8edf5] text-[#46658a]"
              />

              <StatusRow
                label="Delivered"
                count={report.statusCounts.delivered}
                total={report.datedOrders.length}
                icon={CheckCircle2}
                color="bg-[#e4f2e5] text-[#327447]"
              />

              <StatusRow
                label="Cancelled"
                count={report.statusCounts.cancelled}
                total={report.datedOrders.length}
                icon={XCircle}
                color="bg-[#fae7e4] text-[#ae4d42]"
              />
            </div>
          )}
        </Panel>

        <Panel
          title="Inventory alerts"
          subtitle="Active products with five or fewer units in the stock field."
          icon={Package}
          action={
            <span className="rounded-full bg-[#fff3d6] px-3 py-1.5 text-xs font-bold text-[#a17622]">
              {report.lowStockProducts.length} alerts
            </span>
          }
        >
          {report.lowStockProducts.length === 0 ? (
            <div className="flex min-h-36 flex-col items-center justify-center text-center">
              <CheckCircle2 size={30} className="text-[#477851]" />

              <p className="mt-3 text-sm font-semibold text-[#344637]">
                No low-stock products detected
              </p>

              <p className="mt-1 text-xs leading-5 text-[#92978c]">
                Products with a stock field of five or fewer units appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {report.lowStockProducts.map((product) => (
                <div
                  key={product.id ?? product.reportName}
                  className="flex items-center gap-3 rounded-xl border border-[#f0efe7] p-3"
                >
                  <div className="rounded-xl bg-[#f7f1df] p-2.5 text-[#9b7b36]">
                    <Package size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#344637]">
                      {product.reportName}
                    </p>

                    <p className="mt-1 text-xs text-[#858a7e]">
                      {getCategoryName(product)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-extrabold ${
                      product.reportStock === 0
                        ? "bg-[#fae7e4] text-[#ae4d42]"
                        : "bg-[#fff3d6] text-[#a17622]"
                    }`}
                  >
                    {product.reportStock === 0
                      ? "Out of stock"
                      : `${product.reportStock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-xs leading-5 text-[#92978c]">
            This report reads the stock field from shared admin data. It does
            not update inventory.
          </p>
        </Panel>
      </section>

      {/* Recent orders */}
      <Panel
        title="Orders in this period"
        subtitle="Recent orders matching the selected date range."
        icon={ShoppingBag}
      >
        {report.datedOrders.length === 0 ? (
          <EmptyState message="No orders were found in the selected period." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e9e7dc] text-xs uppercase tracking-wider text-[#858a7e]">
                  <th className="px-3 py-3 font-bold">Order</th>
                  <th className="px-3 py-3 font-bold">Customer</th>
                  <th className="px-3 py-3 font-bold">Date</th>
                  <th className="px-3 py-3 font-bold">Status</th>
                  <th className="px-3 py-3 text-right font-bold">Total</th>
                </tr>
              </thead>

              <tbody>
                {[...report.datedOrders]
                  .sort(
                    (a, b) =>
                      (getOrderDate(b)?.getTime() || 0) -
                      (getOrderDate(a)?.getTime() || 0),
                  )
                  .slice(0, 8)
                  .map((order, index) => {
                    const status = getStatus(order);

                    const statusStyle =
                      status === "delivered"
                        ? "bg-[#e4f2e5] text-[#327447]"
                        : status === "cancelled"
                          ? "bg-[#fae7e4] text-[#ae4d42]"
                          : status === "pending"
                            ? "bg-[#fff3d6] text-[#a17622]"
                            : "bg-[#e8edf5] text-[#46658a]";

                    return (
                      <tr
                        key={order.id ?? order.orderNumber ?? index}
                        className="border-b border-[#f0efe7] last:border-0 hover:bg-[#faf9f3]"
                      >
                        <td className="px-3 py-4 font-bold text-[#285b3b]">
                          {order.orderNumber ||
                            (order.id ? `#${order.id}` : `Order ${index + 1}`)}
                        </td>

                        <td className="px-3 py-4 text-[#465345]">
                          {order.customer || "Customer"}
                        </td>

                        <td className="px-3 py-4 text-[#858a7e]">
                          {getOrderDate(order)
                            ? getDateLabel(getOrderDate(order), {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyle}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-right font-bold text-[#244b32]">
                          {formatCurrency(getOrderTotal(order))}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Footer */}
      <footer className="flex flex-col gap-2 border-t border-[#e9e7dc] pt-4 text-xs leading-5 text-[#92978c] sm:flex-row sm:items-center sm:justify-between">
        <span>Chithu's Natural Products · Admin Reports</span>

        <span className="inline-flex items-center gap-1.5">
          <ArrowUpRight size={14} />
          Generated from current shared admin data
        </span>
      </footer>
    </div>
  );
}