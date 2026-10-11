import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../lib/supabaseClient";

const AdminDataContext = createContext(null);

export const initialSettings = {
  storeName: "Chithu's Natural Products",
  tagline: "Natural goodness for every home",
  email: "hello@chithusnaturalproducts.in",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  address: "Madurai",
  state: "Tamil Nadu",
  postalCode: "625001",
  currency: "INR",
  freeDeliveryMinimum: 500,
  deliveryCharge: 40,
  estimatedDelivery: "3–5 business days",
  codEnabled: true,
  upiEnabled: true,
  cardEnabled: true,
  bankTransferEnabled: false,
  orderEmailNotifications: true,
  lowStockNotifications: true,
  marketingEmails: false,
};

/* =========================================================
   SHARED HELPERS
========================================================= */

function getErrorMessage(error, fallback = "Something went wrong.") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  return error.message || fallback;
}

function toTitleCase(value) {
  if (!value) return "";

  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalizeOrderStatus(status) {
  return String(status || "pending")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/* =========================================================
   CATEGORY MAPPER
========================================================= */

function mapCategory(row, productCount = 0) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    image: row.image_url || "",
    status: row.is_active ? "Active" : "Draft",
    productCount,
    parentId: row.parent_id || null,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

/* =========================================================
   PRODUCT MAPPER
========================================================= */

function mapProduct(row) {
  const variants = (row.product_variants || []).map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    packSizeValue: Number(variant.pack_size_value),
    packSizeUnit: variant.pack_size_unit,
    price: Number(variant.price),
    stock: Number(variant.stock_quantity),
    barcode: variant.barcode || "",
    isActive: variant.is_active,
  }));

  const categoryRecords = (row.product_categories || [])
    .map((link) => link.categories)
    .filter(Boolean);

  const images = (row.product_images || [])
    .slice()
    .sort(
      (a, b) =>
        Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
    )
    .map((image) => ({
      id: image.id,
      url: image.image_url,
      altText: image.alt_text || "",
      sortOrder: image.sort_order,
      isPrimary: image.is_primary,
    }));

  const detailsRow = Array.isArray(row.product_details)
    ? row.product_details[0]
    : row.product_details;

  const details = detailsRow
    ? {
        ingredients: detailsRow.ingredients || "",
        allergen_information:
          detailsRow.allergen_information || "",
        storage_instructions:
          detailsRow.storage_instructions || "",
        shelf_life: detailsRow.shelf_life || "",
        net_weight_description:
          detailsRow.net_weight_description || "",
        country_of_origin:
          detailsRow.country_of_origin || "India",
        manufacturer_name:
          detailsRow.manufacturer_name || "",
        customer_support_information:
          detailsRow.customer_support_information || "",
        nutritional_information:
          detailsRow.nutritional_information ?? null,
      }
    : null;

  const primaryVariant = variants[0] || null;

  const primaryImage =
    images.find((image) => image.isPrimary) ||
    images[0] ||
    null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    shortDescription: row.short_description || "",

    status:
      row.status === "active"
        ? "Active"
        : row.status === "archived"
          ? "Archived"
          : "Draft",

    isFeatured: Boolean(row.is_featured),
    badgeType: row.badge_type || "",

    category: categoryRecords[0]?.name || "",
    categoryIds: categoryRecords.map((category) => category.id),

    categories: categoryRecords.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    })),

    variants,
    images,
    image: primaryImage?.url || "",
    details,

    sku: primaryVariant?.sku || "",
    price: primaryVariant?.price ?? 0,
    stock: primaryVariant?.stock ?? 0,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* =========================================================
   ORDER ITEM MAPPER
========================================================= */

function mapOrderItem(item) {
  return {
    id: item.id,
    orderId: item.order_id,
    productId: item.product_id || null,
    variantId: item.variant_id || null,

    productName: item.product_name || "Product",
    variantLabel: item.variant_label || "",
    sku: item.sku || "",

    unitPrice: Number(item.unit_price ?? 0),
    quantity: Number(item.quantity ?? 0),
    lineTotal: Number(item.line_total ?? 0),

    createdAt: item.created_at,
  };
}

/* =========================================================
   ORDER MAPPER
========================================================= */

function mapOrder(row) {
  const items = (row.order_items || []).map(mapOrderItem);

  const customerAddress = [
    row.address,
    row.city,
    row.state,
    row.postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  const normalizedStatus = normalizeOrderStatus(row.status);

  return {
    id: row.id,
    orderId: row.id,
    orderNumber: row.order_number || "",
    order_number: row.order_number || "",

    userId: row.user_id || null,
    user_id: row.user_id || null,

    customerName: row.customer_name || "Customer",
    customer: row.customer_name || "Customer",
    phone: row.phone || "",
    email: row.email || "",

    address: row.address || "",
    city: row.city || "",
    state: row.state || "",
    postalCode: row.postal_code || "",
    postal_code: row.postal_code || "",
    fullAddress: customerAddress,

    subtotal: Number(row.subtotal ?? 0),
    deliveryCharge: Number(row.delivery_charge ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
    total: Number(row.total_amount ?? 0),

    status: toTitleCase(normalizedStatus),
    statusValue: normalizedStatus,

    paymentStatus: row.payment_status || "unpaid",
    payment_status: row.payment_status || "unpaid",

    paymentReference: row.payment_reference || "",
    payment_reference: row.payment_reference || "",

    orderSource: row.order_source || "",
    customerNotes: row.customer_notes || "",
    idempotencyKey: row.idempotency_key || null,

    courierName: row.courier_name || "",
    trackingNumber: row.tracking_number || "",
    trackingUrl: row.tracking_url || "",
    shippedAt: row.shipped_at || null,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
    date: row.created_at,

    items,
    itemCount: items.reduce(
      (total, item) => total + item.quantity,
      0
    ),
  };
}

/* =========================================================
   REUSABLE ORDER SELECT
========================================================= */

const ORDER_SELECT = `
  id,
  order_number,
  customer_name,
  phone,
  email,
  address,
  city,
  state,
  postal_code,
  customer_notes,
  subtotal,
  delivery_charge,
  total_amount,
  status,
  payment_status,
  payment_reference,
  order_source,
  created_at,
  updated_at,
  user_id,
  idempotency_key,
  courier_name,
  tracking_number,
  tracking_url,
  shipped_at,
  order_items (
    id,
    order_id,
    product_id,
    variant_id,
    product_name,
    variant_label,
    sku,
    unit_price,
    quantity,
    line_total,
    created_at
  )
`;

/* =========================================================
   ADMIN DATA PROVIDER
========================================================= */

export function AdminDataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categoryRecords, setCategoryRecords] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customerRecords, setCustomerRecords] = useState([]);

  const [settings, setSettings] = useState(() => ({
    ...initialSettings,
  }));

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersRefreshing, setOrdersRefreshing] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  /* =======================================================
     LOAD PRODUCTS AND CATEGORIES
  ======================================================= */

  const loadCatalogue = useCallback(
    async ({ quiet = false } = {}) => {
      if (quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const [
          categoryResult,
          productResult,
          detailsResult,
        ] = await Promise.all([
          supabase
            .from("categories")
            .select(`
              id,
              name,
              slug,
              description,
              image_url,
              parent_id,
              is_active,
              sort_order,
              created_at,
              updated_at
            `)
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),

          supabase
            .from("products")
            .select(`
              id,
              name,
              slug,
              short_description,
              description,
              status,
              is_featured,
              badge_type,
              created_at,
              updated_at,
              product_categories (
                category_id,
                categories (
                  id,
                  name,
                  slug,
                  is_active
                )
              ),
              product_variants (
                id,
                sku,
                pack_size_value,
                pack_size_unit,
                price,
                stock_quantity,
                barcode,
                is_active
              ),
              product_images (
                id,
                image_url,
                alt_text,
                sort_order,
                is_primary
              )
            `)
            .order("created_at", { ascending: false }),

          supabase
            .from("product_details")
            .select(`
              product_id,
              ingredients,
              allergen_information,
              storage_instructions,
              shelf_life,
              nutritional_information,
              net_weight_description,
              country_of_origin,
              manufacturer_name,
              customer_support_information
            `),
        ]);

        if (categoryResult.error) {
          throw categoryResult.error;
        }

        if (productResult.error) {
          throw productResult.error;
        }

        if (detailsResult.error) {
          throw detailsResult.error;
        }

        const productRows = productResult.data || [];

        const detailsByProductId = new Map(
          (detailsResult.data || []).map((detailsRow) => [
            detailsRow.product_id,
            detailsRow,
          ])
        );

        const mappedProducts = productRows.map((row) =>
          mapProduct({
            ...row,
            product_details:
              detailsByProductId.get(row.id) || null,
          })
        );

        const productCounts = new Map();

        for (const product of productRows) {
          for (const link of product.product_categories || []) {
            const categoryId = link.category_id;

            productCounts.set(
              categoryId,
              (productCounts.get(categoryId) || 0) + 1
            );
          }
        }

        setProducts(mappedProducts);

        setCategoryRecords(
          (categoryResult.data || []).map((row) =>
            mapCategory(row, productCounts.get(row.id) || 0)
          )
        );
      } catch (loadError) {
        const message = getErrorMessage(
          loadError,
          "Unable to load the catalogue from Supabase."
        );

        setError(message);
        throw loadError;
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* =======================================================
     LOAD REAL ORDERS FROM SUPABASE
  ======================================================= */

  const loadOrders = useCallback(
    async ({ quiet = false } = {}) => {
      if (quiet) {
        setOrdersRefreshing(true);
      } else {
        setOrdersLoading(true);
      }

      setOrdersError("");

      try {
        const { data, error: fetchError } = await supabase
          .from("orders")
          .select(ORDER_SELECT)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        const mappedOrders = (data || []).map(mapOrder);

        setOrders(mappedOrders);

        return mappedOrders;
      } catch (loadError) {
        const message = getErrorMessage(
          loadError,
          "Unable to load orders from Supabase."
        );

        setOrdersError(message);
        throw loadError;
      } finally {
        setOrdersLoading(false);
        setOrdersRefreshing(false);
      }
    },
    []
  );

  /* =======================================================
     UPDATE ORDER STATUS
  ======================================================= */

  const updateOrderStatus = useCallback(
    async (orderId, nextStatus) => {
      if (!orderId) {
        throw new Error("Order ID is required.");
      }

      const normalizedStatus = normalizeOrderStatus(nextStatus);

      const allowedStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(normalizedStatus)) {
        throw new Error(`Unsupported order status: ${nextStatus}`);
      }

      const existingOrder = orders.find(
        (order) => order.id === orderId
      );

      if (!existingOrder) {
        throw new Error("Order not found in the current order list.");
      }

      /*
       * UPI payment must be confirmed through the secure RPC.
       * Do not use the regular status updater to mark an
       * unpaid order as confirmed or processing.
       */
      const isPaid =
        String(existingOrder.paymentStatus || "").toLowerCase() ===
        "paid";

      if (
        !isPaid &&
        ["confirmed", "processing", "shipped", "delivered"].includes(
          normalizedStatus
        )
      ) {
        throw new Error(
          "Confirm the payment first using the transaction reference before advancing this order."
        );
      }

      const { data, error: updateError } = await supabase
        .from("orders")
        .update({
          status: normalizedStatus,
          ...(normalizedStatus === "shipped"
            ? { shipped_at: new Date().toISOString() }
            : {}),
        })
        .eq("id", orderId)
        .select(ORDER_SELECT)
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (!data) {
        throw new Error(
          "The order was not updated. Check your admin permissions and the orders table RLS policies."
        );
      }

      const mappedOrder = mapOrder(data);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? mappedOrder : order
        )
      );

      return data;
    },
    [orders]
  );

  /* =======================================================
     CONFIRM PAYMENT THROUGH SECURE SUPABASE RPC
  ======================================================= */

  const confirmOrderPayment = useCallback(
    async (orderId, paymentReference) => {
      if (!orderId) {
        throw new Error("Order ID is required.");
      }

      const reference = String(paymentReference || "").trim();

      if (reference.length < 3 || reference.length > 200) {
        throw new Error(
          "Enter a valid transaction reference (3–200 characters)."
        );
      }

      const { data, error: rpcError } = await supabase.rpc(
        "confirm_order_payment",
        {
          p_order_id: orderId,
          p_payment_reference: reference,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      await loadOrders({ quiet: true });

      return data;
    },
    [loadOrders]
  );

  /* =======================================================
     SAVE COURIER TRACKING DETAILS
  ======================================================= */

  const saveCourierTracking = useCallback(
    async (orderId, tracking) => {
      if (!orderId) {
        throw new Error("Order ID is required.");
      }

      const courierName = String(
        tracking?.courierName || ""
      ).trim();

      const trackingNumber = String(
        tracking?.trackingNumber || ""
      ).trim();

      const rawTrackingUrl = String(
        tracking?.trackingUrl || ""
      ).trim();

      if (!courierName) {
        throw new Error("Enter the courier name.");
      }

      if (!trackingNumber) {
        throw new Error("Enter the AWB or tracking number.");
      }

      let trackingUrl;

      try {
        const parsedUrl = new URL(rawTrackingUrl);

        if (
          parsedUrl.protocol !== "https:" &&
          parsedUrl.protocol !== "http:"
        ) {
          throw new Error("Use an HTTP or HTTPS tracking URL.");
        }

        trackingUrl = parsedUrl.href;
      } catch {
        throw new Error(
          "Enter a valid courier tracking URL beginning with https:// or http://."
        );
      }

      const { data, error: updateError } = await supabase
        .from("orders")
        .update({
          courier_name: courierName,
          tracking_number: trackingNumber,
          tracking_url: trackingUrl,
        })
        .eq("id", orderId)
        .select(`
          id,
          courier_name,
          tracking_number,
          tracking_url,
          shipped_at
        `)
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (!data) {
        throw new Error(
          "Tracking details were not saved. Check admin permissions and the orders table RLS policies."
        );
      }

      const updatedTracking = {
        courierName: data.courier_name || "",
        trackingNumber: data.tracking_number || "",
        trackingUrl: data.tracking_url || "",
        shippedAt: data.shipped_at || null,
      };

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? { ...order, ...updatedTracking }
            : order
        )
      );

      return data;
    },
    []
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadCatalogue().catch(() => {
      // The catalogue error is available through context.
    });

    loadOrders().catch(() => {
      // The orders error is available through context.
    });
  }, [loadCatalogue, loadOrders]);

  /* =======================================================
     SAVE CATEGORY
  ======================================================= */

  const saveCategory = useCallback(
    async (category) => {
      const payload = {
        name: category.name.trim(),
        slug: category.slug.trim().toLowerCase(),
        description: category.description?.trim() || null,
        image_url: category.image?.trim() || null,
        is_active: category.status !== "Draft",
        sort_order: Number(category.sortOrder ?? 0),
        parent_id: category.parentId || null,
      };

      const result = category.id
        ? await supabase
            .from("categories")
            .update(payload)
            .eq("id", category.id)
            .select()
            .single()
        : await supabase
            .from("categories")
            .insert(payload)
            .select()
            .single();

      if (result.error) {
        throw result.error;
      }

      await loadCatalogue({ quiet: true });

      return result.data;
    },
    [loadCatalogue]
  );

  /* =======================================================
     DELETE CATEGORY
  ======================================================= */

  const deleteCategory = useCallback(
    async (categoryId) => {
      const { error: deleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (deleteError) {
        throw deleteError;
      }

      await loadCatalogue({ quiet: true });
    },
    [loadCatalogue]
  );

  /* =======================================================
     RESET HELPERS
  ======================================================= */

  const resetSettings = useCallback(() => {
    setSettings({ ...initialSettings });
  }, []);

  // Reload real orders; this does not delete database records.
  const resetOrders = useCallback(async () => {
    return loadOrders({ quiet: true });
  }, [loadOrders]);

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const categories = useMemo(
    () => categoryRecords,
    [categoryRecords]
  );

  const value = useMemo(
    () => ({
      // Products
      products,
      setProducts,

      // Categories
      categories,
      setCategories: setCategoryRecords,

      // Orders
      orders,
      setOrders,
      updateOrderStatus,
      confirmOrderPayment,
      saveCourierTracking,
      reloadOrders: loadOrders,
      resetOrders,
      ordersLoading,
      ordersRefreshing,
      ordersError,

      // Customers
      customers: customerRecords,
      setCustomers: setCustomerRecords,

      // Settings
      settings,
      setSettings,
      resetSettings,

      // Catalogue loading state
      loading,
      refreshing,
      error,
      reloadCatalogue: loadCatalogue,

      // Category actions
      saveCategory,
      deleteCategory,
    }),
    [
      products,
      categories,
      orders,
      updateOrderStatus,
      confirmOrderPayment,
      saveCourierTracking,
      loadOrders,
      resetOrders,
      ordersLoading,
      ordersRefreshing,
      ordersError,
      customerRecords,
      settings,
      resetSettings,
      loading,
      refreshing,
      error,
      loadCatalogue,
      saveCategory,
      deleteCategory,
    ]
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

/* =========================================================
   CONTEXT HOOK
========================================================= */

export function useAdminData() {
  const context = useContext(AdminDataContext);

  if (!context) {
    throw new Error(
      "useAdminData must be used inside AdminDataProvider."
    );
  }

  return context;
}