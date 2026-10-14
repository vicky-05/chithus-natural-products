import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  FileText,
  Mail,
  MapPin,
  MapPinned,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "../assets/dosa-mix-cart.png";
import { useCart } from "../context/CartContext";
import { socialLinks } from "../config/socialLinks";
import { supabase } from "../lib/supabaseClient";
import { useGlobalUI } from "../context/GlobalUIContext";
import { AppLauncher } from "@capacitor/app-launcher";
import { Capacitor } from "@capacitor/core";

const states = ["Tamil Nadu"];
const PINCODE_LOOKUP_URL = "https://api.postalpincode.in/pincode";

async function lookupTamilNaduPincode(pincode, signal) {
  if (!/^\d{6}$/.test(pincode)) {
    throw new Error("Enter a valid 6-digit PIN code.");
  }

  const response = await fetch(`${PINCODE_LOOKUP_URL}/${pincode}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(
      "PIN-code verification is temporarily unavailable. Please try again."
    );
  }

  const result = await response.json();
  const offices = result?.[0]?.PostOffice;

  if (
    result?.[0]?.Status !== "Success" ||
    !Array.isArray(offices) ||
    offices.length === 0
  ) {
    throw new Error(
      "This PIN code could not be verified. Please check it and try again."
    );
  }

  const statesFound = [
    ...new Set(
      offices.map((office) =>
        String(office.State || "").trim().toLowerCase()
      )
    ),
  ];

  if (
    statesFound.length !== 1 ||
    statesFound[0] !== "tamil nadu"
  ) {
    throw new Error(
      "Sorry, we currently deliver only within Tamil Nadu. Please enter a Tamil Nadu PIN code."
    );
  }

  return { state: "Tamil Nadu", offices };
}

const FREE_DELIVERY_THRESHOLD = 600;
const DELIVERY_CHARGE = 40;
const IDEMPOTENCY_STORAGE_KEY = "chithus_checkout_idempotency_v1";

const WHATSAPP_NUMBER = socialLinks.whatsappNumber.replace(/\D/g, "");

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F0E8] text-[#285C3A]">
        <Icon size={22} strokeWidth={1.8} />
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-[#173F2A] sm:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-5 text-[#667064] sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

function InputField({
  label,
  required = false,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  maxLength,
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold text-[#242821]">
        {label}
        {required && (
          <span className="ml-1 text-[#B94A48]">*</span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8D87]"
          />
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#242821] shadow-sm outline-none transition duration-200 placeholder:text-[#A0A39D] hover:border-[#B9C9B6] focus-visible:ring-4 focus-visible:ring-[#E7F0E8] ${Icon ? "pl-11" : ""
            } ${error
              ? "border-[#B94A48] focus:border-[#B94A48]"
              : "border-[#DDD8C8] focus:border-[#285C3A] focus:ring-4 focus:ring-[#E7F0E8]"
            }`}
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-[#B94A48]">{error}</p>
      )}
    </div>
  );
}

function SummaryProduct({ item }) {
  return (
    <div className="flex gap-3 border-b border-[#DCE5D8] py-3 first:pt-0 last:border-b-0">
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F0E9D9]">
        <img
          src={item.image || heroImage}
          alt={item.name}
          className="h-full w-full object-cover"
        />
        <span className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#173F2A] px-1 text-[9px] font-bold text-white">
          {item.quantity}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#173F2A]">
              {item.name}
            </h3>
            <p className="mt-0.5 text-[11px] text-[#667064]">
              {item.selectedWeight || item.weight || "Standard pack"}
            </p>
            <p className="mt-1 text-[11px] text-[#667064]">
              Qty: {item.quantity}
            </p>
          </div>

          <p className="shrink-0 text-sm font-bold text-[#173F2A]">
            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}

function getCheckoutIdempotencyKey(customer, items) {
  const fingerprint = JSON.stringify({
    customer: {
      fullName: customer.fullName,
      mobile: customer.mobile,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      notes: customer.notes,
    },
    items: items
      .map((item) => ({
        variantId: item.variantId,
        quantity: Number(item.quantity),
      }))
      .sort((a, b) => a.variantId.localeCompare(b.variantId)),
  });

  try {
    const saved = JSON.parse(
      sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY) || "null"
    );

    if (saved?.fingerprint === fingerprint && saved?.key) {
      return saved.key;
    }

    if (!globalThis.crypto?.randomUUID) {
      throw new Error("Secure key generation is unavailable.");
    }

    const key = globalThis.crypto.randomUUID();

    sessionStorage.setItem(
      IDEMPOTENCY_STORAGE_KEY,
      JSON.stringify({ fingerprint, key })
    );

    return key;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Secure key")
    ) {
      throw error;
    }

    throw new Error(
      "Checkout session storage is unavailable. Please enable session storage and try again."
    );
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { notify } = useGlobalUI();

  const [completedOrder, setCompletedOrder] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
    saveAddress: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLock = useRef(false);
  useEffect(() => {
    if (!isSubmitting) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSubmitting]);

  const [pincodeVerification, setPincodeVerification] = useState({
    pincode: "",
    status: "idle",
    message: "",
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressMessage, setAddressMessage] = useState("");

  const checkoutItems = useMemo(
    () =>
      cartItems.map((item) => ({
        ...item,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 0,
        image: item.image || heroImage,
      })),
    [cartItems]
  );

  const calculatedSubtotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const subtotal =
    Number.isFinite(Number(cartTotal)) && Number(cartTotal) > 0
      ? Number(cartTotal)
      : calculatedSubtotal;

  const deliveryCharge =
    subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;

  const total = subtotal + deliveryCharge;

  const totalItems = checkoutItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const remainingForFreeDelivery = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD - subtotal
  );

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  const applySavedAddress = useCallback((address) => {
    setForm((current) => ({
      ...current,
      fullName: address.full_name ?? "",
      mobile: (address.phone ?? "").replace(/\D/g, "").slice(-10),
      address: [
        address.address_line_1,
        address.address_line_2,
        address.landmark ? `Near ${address.landmark}` : "",
      ]
        .filter(Boolean)
        .join(", "),
      city: address.city ?? "",
      state: address.state ?? "",
      pincode: address.postal_code ?? "",
    }));

    setErrors({});
    setAddressMessage("");
  }, []);

  const loadCustomerAddresses = useCallback(async () => {
    setLoadingAddresses(true);

    try {
      const { data, error: authError } = await supabase.auth.getUser();

      if (authError || !data.user) {
        setCurrentUser(null);
        setSavedAddresses([]);
        setSelectedAddressId("");
        return;
      }

      setCurrentUser(data.user);

      const { data: addresses, error: addressError } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("user_id", data.user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (addressError) throw addressError;

      const rows = addresses ?? [];
      setSavedAddresses(rows);

      const defaultAddress = rows.find(
        (address) => address.is_default
      );

      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        applySavedAddress(defaultAddress);
      }
    } catch (error) {
      console.error("Unable to load saved addresses:", error);
      setAddressMessage(
        "We couldn't load saved addresses. You can still enter your address manually."
      );
    } finally {
      setLoadingAddresses(false);
    }
  }, [applySavedAddress]);

  useEffect(() => {
    loadCustomerAddresses();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        loadCustomerAddresses();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadCustomerAddresses]);

  useEffect(() => {
    const pincode = form.pincode;

    if (!/^\d{6}$/.test(pincode)) {
      setPincodeVerification({
        pincode,
        status: "idle",
        message: "",
      });
      return undefined;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      setPincodeVerification({
        pincode,
        status: "checking",
        message: "Verifying PIN code...",
      });

      try {
        const result = await lookupTamilNaduPincode(
          pincode,
          controller.signal
        );

        if (controller.signal.aborted) return;

        setPincodeVerification({
          pincode,
          status: "valid",
          message: "Delivery location verified: Tamil Nadu.",
        });

        setForm((current) =>
          current.pincode === pincode
            ? { ...current, state: result.state }
            : current
        );

        setErrors((current) => ({
          ...current,
          pincode: "",
          state: "",
        }));
      } catch (error) {
        if (controller.signal.aborted) return;

        setPincodeVerification({
          pincode,
          status: "invalid",
          message:
            error?.message ||
            "Unable to verify this PIN code. Please try again.",
        });

        setErrors((current) => ({
          ...current,
          pincode:
            error?.message ||
            "Unable to verify this PIN code. Please try again.",
        }));
      }
    }, 400);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [form.pincode]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number.";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.address.trim()) {
      newErrors.address = "Please enter your delivery address.";
    }

    if (!form.city.trim()) {
      newErrors.city = "Please enter your city.";
    }

    if (!form.state) {
      newErrors.state = "Please select your state.";
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit PIN code.";
    } else if (
      pincodeVerification.pincode !== form.pincode ||
      pincodeVerification.status !== "valid"
    ) {
      newErrors.pincode =
        pincodeVerification.status === "checking"
          ? "Please wait while we verify your PIN code."
          : pincodeVerification.status === "invalid"
            ? pincodeVerification.message
            : "Please verify your PIN code before placing the order.";
    }

    if (
      pincodeVerification.pincode === form.pincode &&
      pincodeVerification.status === "valid" &&
      form.state !== "Tamil Nadu"
    ) {
      newErrors.state = "Your delivery state must be Tamil Nadu.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveCheckoutAddress = async () => {
    if (!currentUser || !form.saveAddress) return;

    const selectedAddress = savedAddresses.find(
      (address) => address.id === selectedAddressId
    );

    const payload = {
      user_id: currentUser.id,
      full_name: form.fullName.trim(),
      phone: form.mobile.trim(),
      address_line_1: form.address.trim(),
      address_line_2: null,
      landmark: null,
      city: form.city.trim(),
      state: form.state,
      postal_code: form.pincode.trim(),
      address_type: selectedAddress?.address_type ?? "Home",
      is_default:
        selectedAddress?.is_default ?? savedAddresses.length === 0,
    };

    if (selectedAddressId) {
      const { error } = await supabase
        .from("customer_addresses")
        .update(payload)
        .eq("id", selectedAddressId)
        .eq("user_id", currentUser.id);

      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from("customer_addresses")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setSelectedAddressId(data.id);
    }

    await loadCustomerAddresses();
  };

  const handlePlaceOrder = async () => {
    if (submissionLock.current || isSubmitting) return;

    if (checkoutItems.length === 0) {
      navigate("/shop");
      return;
    }

    if (!validateForm()) {
      window.scrollTo({
        top: 250,
        behavior: "smooth",
      });
      return;
    }

    if (
      !WHATSAPP_NUMBER ||
      WHATSAPP_NUMBER === "YOUR_WHATSAPP_NUMBER"
    ) {
      notify(
        "Please configure the business WhatsApp number before placing orders.",
        {
          type: "warning",
          title: "WhatsApp ordering unavailable",
        }
      );
      return;
    }

    const missingVariant = checkoutItems.some(
      (item) => !item.variantId
    );

    if (missingVariant) {
      notify(
        "Some cart items are missing their Supabase variant IDs. Please remove those items, add them again from the product page, and try again.",
        {
          type: "warning",
          title: "Product information missing",
          duration: 6000,
        }
      );
      return;
    }

    const invalidQuantity = checkoutItems.some(
      (item) =>
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        Number(item.quantity) > 100
    );

    if (invalidQuantity) {
      notify(
        "One or more product quantities are invalid. Please review your cart.",
        {
          type: "warning",
          title: "Invalid quantity",
        }
      );
      return;
    }

    setIsSubmitting(true);
    submissionLock.current = true;
    setAddressMessage("");

    // Open synchronously to reduce browser popup blocking.
    const whatsappWindow = window.open("about:blank", "_blank");

    // Show a branded processing page in the temporary tab.
    if (whatsappWindow) {
      try {
        whatsappWindow.document.title =
          "Preparing Your Order | Chithu's Natural Products";

        whatsappWindow.document.body.innerHTML = `
        <main style="
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:24px;
          box-sizing:border-box;
          background:#FAF7EF;
          font-family:Arial,sans-serif;
          color:#173F2A;
        ">
          <section style="
            width:100%;
            max-width:420px;
            padding:36px 24px;
            box-sizing:border-box;
            text-align:center;
            background:white;
            border:1px solid #DCE5D8;
            border-radius:24px;
            box-shadow:0 16px 50px rgba(23,63,42,.08);
          ">
            <div style="
              width:48px;
              height:48px;
              margin:0 auto 24px;
              border:4px solid #D5E3D1;
              border-top-color:#285C3A;
              border-radius:50%;
              animation:spin 1s linear infinite;
            "></div>

            <p style="
              color:#C79A3B;
              font-size:12px;
              font-weight:bold;
              letter-spacing:2px;
            ">
              CHITHU'S NATURAL PRODUCTS
            </p>

            <h1 style="font-size:26px;">
              Preparing Your Order
            </h1>

            <p style="
              color:#667064;
              font-size:15px;
              line-height:1.7;
            ">
              We're securely saving your order details.
              Please wait while we prepare your WhatsApp message.
            </p>

            <div style="
              margin-top:24px;
              padding:16px;
              border-radius:14px;
              background:#F0F4EA;
              font-size:13px;
              line-height:1.7;
            ">
              Your order is being processed.
              <br />
              Please keep this page open.
            </div>
          </section>
        </main>

        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      `;
      } catch (popupError) {
        console.warn(
          "Unable to display the processing page:",
          popupError
        );
      }
    }

    try {
      // Verify the delivery pincode.
      const verifiedPincode = await lookupTamilNaduPincode(
        form.pincode.trim()
      );

      if (verifiedPincode.state !== "Tamil Nadu") {
        throw new Error(
          "Delivery is available only within Tamil Nadu."
        );
      }

      // Save the address when requested.
      if (currentUser && form.saveAddress) {
        await saveCheckoutAddress();
      }

      const customer = {
        fullName: form.fullName.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state,
        pincode: form.pincode.trim(),
        notes: form.notes.trim(),
      };

      const orderItems = checkoutItems.map((item) => ({
        variantId: item.variantId,
        quantity: Number(item.quantity),
      }));

      const idempotencyKey = getCheckoutIdempotencyKey(
        customer,
        orderItems
      );

      // Create the order in Supabase.
      const { data, error } = await supabase.functions.invoke(
        "create-order",
        {
          body: {
            customer,
            items: orderItems,
            idempotencyKey,
          },
        }
      );

      if (error || !data?.success || !data?.order?.id) {
        throw new Error(
          data?.error ||
          error?.message ||
          "We couldn't save your order. Please try again."
        );
      }

      const savedOrder = data.order;
      const savedItems = Array.isArray(data.items)
        ? data.items
        : [];

      const orderNumber =
        savedOrder.orderNumber ??
        savedOrder.order_number ??
        savedOrder.orderNo ??
        "Order saved";

      // Use totals returned by the server.
      const verifiedSubtotal = Number(savedOrder.subtotal);

      const verifiedDelivery = Number(
        savedOrder.deliveryCharge ??
        savedOrder.delivery_charge
      );

      const verifiedTotal = Number(
        savedOrder.total ?? savedOrder.total_amount
      );

      // Validate the saved order response before preparing WhatsApp.
      if (
        !Number.isFinite(verifiedSubtotal) ||
        !Number.isFinite(verifiedDelivery) ||
        !Number.isFinite(verifiedTotal) ||
        verifiedSubtotal < 0 ||
        verifiedDelivery < 0 ||
        verifiedTotal < 0 ||
        Math.abs(
          verifiedSubtotal + verifiedDelivery - verifiedTotal
        ) > 0.01 ||
        !Array.isArray(data.items) ||
        data.items.length === 0 ||
        data.items.some(
          (item) =>
            !item.product_name ||
            !Number.isFinite(Number(item.quantity)) ||
            Number(item.quantity) < 1 ||
            !Number.isFinite(Number(item.line_total))
        )
      ) {
        throw new Error(
          `The server response for order ${orderNumber} is incomplete. ` +
          "Do not create another order. Retry with the same details or contact the business."
        );
      }

      // Prepare the product list from saved order items.
      const productLines = savedItems
        .map(
          (item) =>
            `• ${item.product_name} - ${item.variant_label || "Standard pack"
            } x ${item.quantity} = ₹${Number(
              item.line_total
            ).toLocaleString("en-IN")}`
        )
        .join("\n");

      // Prepare the WhatsApp message.
      const message = `
Hello Chithu's Natural Products,

I have submitted an order through your website.

ORDER NUMBER: ${orderNumber}

CUSTOMER DETAILS

Name: ${customer.fullName}
Mobile: ${customer.mobile}
Email: ${customer.email || "Not provided"}

DELIVERY ADDRESS

${customer.address}
${customer.city}, ${customer.state} - ${customer.pincode}

ORDER DETAILS

${productLines}

Subtotal: ₹${verifiedSubtotal.toLocaleString("en-IN")}

Delivery: ${verifiedDelivery === 0
          ? "FREE"
          : `₹${verifiedDelivery.toLocaleString("en-IN")}`
        }

Total: ₹${verifiedTotal.toLocaleString("en-IN")}

Order Notes:
${customer.notes || "None"}

Please confirm my order and share the payment details.
    `.trim();

      const temporaryOrder = {
        orderId: savedOrder.id,
        orderNumber,
        customer: { ...customer },
        items: savedItems,
        subtotal: verifiedSubtotal,
        deliveryCharge: verifiedDelivery,
        total: verifiedTotal,
        status: savedOrder.status || "pending",
        paymentStatus:
          savedOrder.paymentStatus ??
          savedOrder.payment_status ??
          "unpaid",
        createdAt:
          savedOrder.created_at || new Date().toISOString(),
      };

      // Remove spaces, plus signs and other formatting from the
      // WhatsApp number. Configure the number with India's 91 prefix.
      const cleanWhatsAppNumber = String(WHATSAPP_NUMBER).replace(
        /\D/g,
        ""
      );

      const whatsappUrl =
        `https://wa.me/${cleanWhatsAppNumber}?text=` +
        encodeURIComponent(message);

      const confirmation = {
        id: savedOrder.id,
        orderNumber,
        subtotal: verifiedSubtotal,
        deliveryCharge: verifiedDelivery,
        total: verifiedTotal,
        status: savedOrder.status || "pending",
        paymentStatus:
          savedOrder.paymentStatus ??
          savedOrder.payment_status ??
          "unpaid",
        whatsappUrl,
      };

      // Store the confirmation for the existing success screen.
      try {
        localStorage.setItem(
          "chithus_pending_order",
          JSON.stringify({
            ...temporaryOrder,
            ...confirmation,
            customer: { ...customer },
            items: savedItems,
          })
        );
      } catch (storageError) {
        console.warn(
          "Unable to save the local order copy:",
          storageError
        );
      }

      // IMPORTANT:
      // Redirect the temporary tab to WhatsApp instead of closing it.
      // Keep the original checkout tab available for the success screen.

      // Show order success immediately after Supabase confirms the order.
      // WhatsApp launching must not block the checkout success screen.
      setCompletedOrder(confirmation);
      clearCart();

      // Open WhatsApp using the native Android launcher when available.
      try {
        if (whatsappWindow && !whatsappWindow.closed) {
          whatsappWindow.close();
        }

        if (Capacitor.isNativePlatform()) {
          const { value: canOpenWhatsApp } =
            await AppLauncher.canOpenUrl({
              url: "whatsapp://send",
            });

          if (canOpenWhatsApp) {
            await AppLauncher.openUrl({
              url: whatsappUrl,
            });
          } else {
            notify(
              "Your order was saved. Please open WhatsApp using the button on the confirmation screen.",
              {
                type: "info",
                title: "Order saved successfully",
                duration: 6000,
              }
            );
          }
        } else if (whatsappWindow && !whatsappWindow.closed) {
          whatsappWindow.location.replace(whatsappUrl);
        } else {
          window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        }
      } catch (whatsappError) {
        console.warn("Unable to open WhatsApp:", whatsappError);

        notify(
          "Your order was saved successfully. You can contact us through WhatsApp from the confirmation screen.",
          {
            type: "info",
            title: "Order saved successfully",
            duration: 6000,
          }
        );
      }


      // If the popup was blocked, the existing confirmation screen
      // can still provide its WhatsApp button.
      if (!whatsappOpened) {
        console.warn(
          "WhatsApp could not be opened automatically. Use the WhatsApp button on the confirmation screen."
        );
      }

      // Clear the retry key only after the order has been saved.
      try {
        sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
      } catch (storageError) {
        console.warn(
          "Unable to clear checkout session key:",
          storageError
        );
      }
    } catch (error) {
      console.error("Unable to place order:", error);

      // Close the temporary tab only if order processing failed.
      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close();
      }

      notify(
        error?.message ||
        "We couldn't save your order. Please try again.",
        {
          type: "error",
          title: "Unable to place order",
          duration: 6000,
        }
      );
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);

    }
  };
  // Processing screen while the order is being saved.
  if (isSubmitting) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-[#FAF7EF] px-4 py-10"
        role="status"
        aria-live="polite"
      >
        <section className="w-full max-w-md rounded-[28px] border border-[#DCE5D8] bg-white p-8 text-center shadow-[0_16px_50px_rgba(23,63,42,0.08)] sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E7F0E8]">
            <div
              className="h-11 w-11 animate-spin rounded-full border-4 border-[#D5E3D1] border-t-[#285C3A]"
              aria-hidden="true"
            />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">
            Chithu's Natural Products
          </p>

          <h1 className="mt-3 font-serif text-3xl font-bold text-[#173F2A]">
            Processing Your Order
          </h1>

          <p className="mt-4 text-sm leading-6 text-[#667064]">
            We're securely saving your order details. Please keep this page
            open while we finish.
          </p>

          <div className="mt-7 rounded-2xl border border-[#DCE5D8] bg-[#F0F4EA] p-4 text-left">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0 text-[#285C3A]"
              />

              <div>
                <p className="text-sm font-semibold text-[#173F2A]">
                  Please don't refresh or close this page
                </p>

                <p className="mt-1 text-xs leading-5 text-[#667064]">
                  We are checking your delivery PIN code and saving your order.
                  This may take a few moments.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-[#285C3A]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#285C3A]" />
            Please wait...
          </div>
        </section>
      </main>
    );
  }


  // Order confirmation screen.
  if (completedOrder) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#FAF7EF] px-4 py-12">
        <section className="w-full max-w-xl rounded-[28px] border border-[#E5DCC8] bg-white p-6 text-center shadow-[0_16px_50px_rgba(23,63,42,0.08)] sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
            <Check size={40} strokeWidth={2.5} />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">
            Chithu's Natural Products
          </p>

          <h1 className="mt-3 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
            Order placed successfully!
          </h1>

          <p className="mt-4 text-sm leading-6 text-[#667064]">
            Your order has been saved. Our team will confirm availability
            and share payment details with you.
          </p>

          <div className="mt-7 rounded-2xl border border-[#DCE5D8] bg-[#F0F4EA] p-5 text-left">
            <p className="text-xs font-medium text-[#667064]">
              Order number
            </p>

            <p className="mt-1 break-all text-xl font-bold text-[#173F2A]">
              {completedOrder.orderNumber}
            </p>

            <div className="my-4 border-t border-[#D5DDCF]" />

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[#667064]">Subtotal</span>
              <span className="font-semibold text-[#242821]">
                ₹{Number(completedOrder.subtotal).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4 text-sm">
              <span className="text-[#667064]">Delivery</span>
              <span className="font-semibold text-[#242821]">
                {Number(completedOrder.deliveryCharge) === 0
                  ? "FREE"
                  : `₹${Number(
                    completedOrder.deliveryCharge
                  ).toLocaleString("en-IN")}`}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#D5DDCF] pt-4">
              <span className="font-bold text-[#173F2A]">Total</span>
              <span className="text-2xl font-bold text-[#173F2A]">
                ₹{Number(completedOrder.total).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-[#285C3A]">
                Status: {completedOrder.status}
              </span>

              <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-[#8B641B]">
                Payment: {completedOrder.paymentStatus}
              </span>
            </div>
          </div>

          {completedOrder.whatsappUrl ? (
            <a
              href={completedOrder.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#173F2A] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#285C3A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C9DCC6]"
            >
              <MessageCircle size={19} />
              Continue to WhatsApp
              <ArrowRight size={17} />
            </a>
          ) : (
            <p className="mt-5 rounded-xl bg-[#FFF5DB] p-3 text-left text-xs leading-5 text-[#6D5324]">
              Your order was saved, but WhatsApp confirmation could not be
              prepared. Contact the business and share your order number.
            </p>
          )}

          <Link
            to="/shop"
            className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#285C3A] hover:text-[#C79A3B]"
          >
            Continue shopping
            <ArrowRight size={16} />
          </Link>

          <p className="mt-5 text-xs leading-5 text-[#667064]">
            Keep your order number for reference. Payment has not yet been
            recorded unless separately confirmed.
          </p>
        </section>
      </main>
    );
  }

  // Empty cart state.
  if (checkoutItems.length === 0) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#FAF7EF] px-4 py-16">
        <div className="w-full max-w-md rounded-[28px] border border-[#E5DCC8] bg-white p-8 text-center shadow-[0_16px_50px_rgba(23,63,42,0.06)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
            <ShoppingBag size={34} />
          </div>

          <h1 className="mt-5 font-serif text-3xl font-bold text-[#173F2A]">
            Your cart is empty
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#667064]">
            Add your favourite products before proceeding to checkout.
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#173F2A] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#285C3A]"
          >
            Explore Products
            <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7EF]">
      {/* Checkout hero */}
      <section className="relative overflow-hidden border-b border-[#E8E1D2] bg-[#F4EFE3]">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-1/2 opacity-50">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full border border-[#D8E2D5]" />
          <div className="absolute left-16 top-20 h-32 w-32 rounded-full border border-[#E8D5A8]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center lg:grid-cols-[1fr_0.75fr]">
          <div className="relative z-10 px-4 py-9 sm:px-6 lg:py-12">
            <div className="flex items-center gap-2 text-xs font-medium text-[#667064]">
              <Link to="/" className="transition hover:text-[#285C3A]">
                Home
              </Link>
              <span>›</span>
              <Link to="/cart" className="transition hover:text-[#285C3A]">
                Cart
              </Link>
              <span>›</span>
              <span className="text-[#285C3A]">Checkout</span>
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.28em] text-[#C79A3B]">
              Almost There
            </p>

            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#173F2A] sm:text-5xl lg:text-6xl">
              Checkout
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#667064] sm:text-base">
              A few more details to bring goodness to your home.
            </p>
          </div>

          <div className="relative hidden h-[230px] overflow-hidden lg:block">
            <img
              src={heroImage}
              alt="Chithu's Natural Products"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F4EFE3] via-[#F4EFE3]/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F4EFE3] to-transparent" />
          </div>
        </div>
      </section>

      {/* Checkout progress */}
      <div className="mx-auto max-w-7xl px-4 pt-7 sm:px-6 lg:pt-9">
        <div className="mx-auto flex max-w-xl items-center">
          <div className="flex flex-1 flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#285C3A] text-white">
              <Check size={16} strokeWidth={3} />
            </div>
            <span className="mt-1.5 text-[10px] font-semibold text-[#285C3A] sm:text-xs">
              Cart
            </span>
          </div>

          <div className="h-px flex-1 bg-[#285C3A]" />

          <div className="flex flex-1 flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#285C3A] text-sm font-bold text-white">
              2
            </div>
            <span className="mt-1.5 text-[10px] font-semibold text-[#285C3A] sm:text-xs">
              Checkout
            </span>
          </div>

          <div className="h-px flex-1 bg-[#DDD8C8]" />

          <div className="flex flex-1 flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C9C7BE] bg-white text-sm font-semibold text-[#667064]">
              3
            </div>
            <span className="mt-1.5 text-[10px] text-[#667064] sm:text-xs">
              Order Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* Main checkout */}
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-5">
            {/* Customer information */}
            <section className="rounded-[28px] border border-[#E5DCC8] bg-white p-5 shadow-[0_12px_36px_rgba(36,40,33,0.055)] transition-shadow duration-300 hover:shadow-[0_16px_42px_rgba(36,40,33,0.075)] sm:p-7">
              <SectionHeader
                icon={User}
                title="Customer Information"
                description="Let us know who to contact for this order."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Full Name"
                  required
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(e) =>
                    updateField("fullName", e.target.value)
                  }
                  icon={User}
                  error={errors.fullName}
                />

                <InputField
                  label="Mobile Number"
                  required
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={form.mobile}
                  maxLength={10}
                  onChange={(e) =>
                    updateField(
                      "mobile",
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  icon={Phone}
                  error={errors.mobile}
                />

                <div className="sm:col-span-2">
                  <InputField
                    label="Email Address (Optional)"
                    type="email"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    icon={Mail}
                    error={errors.email}
                  />
                </div>
              </div>
            </section>

            {/* Delivery address */}
            <section className="rounded-[28px] border border-[#E5DCC8] bg-white p-5 shadow-[0_12px_36px_rgba(36,40,33,0.055)] transition-shadow duration-300 hover:shadow-[0_16px_42px_rgba(36,40,33,0.075)] sm:p-7">
              <SectionHeader
                icon={MapPin}
                title="Delivery Address"
                description="Where should we deliver your order?"
              />

              {currentUser && (
                <div className="mb-6 rounded-2xl border border-[#DCE5D8] bg-[#F0F4EA] p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#285C3A]">
                      <MapPinned size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#173F2A]">
                        Use a saved address
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#667064]">
                        Select an address to fill your delivery details.
                      </p>
                    </div>
                  </div>

                  {loadingAddresses ? (
                    <p className="mt-4 text-sm text-[#667064]">
                      Loading your addresses...
                    </p>
                  ) : savedAddresses.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      <select
                        value={selectedAddressId}
                        onChange={(event) => {
                          const id = event.target.value;
                          setSelectedAddressId(id);

                          const address = savedAddresses.find(
                            (item) => item.id === id
                          );

                          if (address) {
                            applySavedAddress(address);
                          } else {
                            setAddressMessage("");
                          }
                        }}
                        className="h-12 w-full rounded-xl border border-[#DDD8C8] bg-white px-4 text-sm text-[#242821] outline-none transition focus:border-[#285C3A] focus:ring-4 focus:ring-[#E7F0E8]"
                      >
                        <option value="">Enter a different address</option>
                        {savedAddresses.map((address) => (
                          <option key={address.id} value={address.id}>
                            {address.address_type}
                            {address.is_default ? " (Default)" : ""} —{" "}
                            {address.city}, {address.postal_code}
                          </option>
                        ))}
                      </select>

                      <Link
                        to="/my-addresses"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#285C3A] hover:underline"
                      >
                        Manage saved addresses <ArrowRight size={14} />
                      </Link>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[#667064]">
                      No saved addresses yet. Enter your details below and
                      select the save option to keep the address.
                    </p>
                  )}

                  {addressMessage && (
                    <p
                      className="mt-3 text-xs leading-5 text-[#B94A48]"
                      role="status"
                    >
                      {addressMessage}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#242821]">
                    Address <span className="text-[#B94A48]">*</span>
                  </label>

                  <textarea
                    value={form.address}
                    onChange={(e) => {
                      updateField("address", e.target.value);
                      setSelectedAddressId("");
                    }}
                    placeholder="House No, Street, Area, Landmark"
                    rows={3}
                    className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-[#242821] shadow-sm outline-none transition placeholder:text-[#A0A39D] focus:ring-4 focus:ring-[#E7F0E8] ${errors.address
                      ? "border-[#B94A48]"
                      : "border-[#DDD8C8] focus:border-[#285C3A]"
                      }`}
                  />

                  {errors.address && (
                    <p className="mt-1 text-xs text-[#B94A48]">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <InputField
                    label="City"
                    required
                    placeholder="Enter city"
                    value={form.city}
                    onChange={(e) => {
                      updateField("city", e.target.value);
                      setSelectedAddressId("");
                    }}
                    error={errors.city}
                  />

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#242821]">
                      State <span className="text-[#B94A48]">*</span>
                    </label>

                    <div className="relative">
                      <select
                        value={form.state}
                        onChange={(e) => {
                          updateField("state", e.target.value);
                          setSelectedAddressId("");
                        }}
                        className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-sm text-[#242821] shadow-sm outline-none transition focus:ring-4 focus:ring-[#E7F0E8] ${errors.state
                          ? "border-[#B94A48]"
                          : "border-[#DDD8C8] focus:border-[#285C3A]"
                          }`}
                      >
                        <option value="">Select state</option>
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8D87]"
                      />
                    </div>

                    {errors.state && (
                      <p className="mt-1 text-xs text-[#B94A48]">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <InputField
                    label="Pincode"
                    required
                    type="tel"
                    placeholder="6-digit pincode"
                    value={form.pincode}
                    maxLength={6}
                    onChange={(e) => {
                      const pincode = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);

                      updateField("pincode", pincode);
                      setSelectedAddressId("");

                      setPincodeVerification({
                        pincode,
                        status: "idle",
                        message: "",
                      });

                      setForm((current) => ({
                        ...current,
                        state: "",
                      }));
                    }}
                    icon={MapPin}
                    error={errors.pincode}
                  />
                </div>

                {pincodeVerification.message && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`text-xs ${pincodeVerification.status === "valid"
                      ? "text-[#285C3A]"
                      : pincodeVerification.status === "invalid"
                        ? "text-[#B94A48]"
                        : "text-[#667064]"
                      }`}
                  >
                    {pincodeVerification.status === "checking" ? "⏳ " : ""}
                    {pincodeVerification.status === "valid" ? "✓ " : ""}
                    {pincodeVerification.message}
                  </p>
                )}

                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={form.saveAddress}
                    onChange={(e) =>
                      updateField("saveAddress", e.target.checked)
                    }
                    className="h-4 w-4 accent-[#285C3A]"
                  />

                  <span className="text-xs text-[#667064]">
                    Save this address for future orders
                    {!currentUser && (
                      <span className="mt-1 block">
                        Log in to save addresses to your account.
                      </span>
                    )}
                  </span>
                </label>
              </div>
            </section>

            {/* Order notes */}
            <section className="rounded-[28px] border border-[#E5DCC8] bg-white p-5 shadow-[0_12px_36px_rgba(36,40,33,0.055)] transition-shadow duration-300 hover:shadow-[0_16px_42px_rgba(36,40,33,0.075)] sm:p-7">
              <SectionHeader
                icon={FileText}
                title="Order Notes"
                description="Any special instructions for your order?"
              />

              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="E.g. preferred delivery time, landmark, etc."
                rows={3}
                className="w-full resize-none rounded-xl border border-[#DDD8C8] bg-white px-4 py-3 text-sm text-[#242821] shadow-sm outline-none transition placeholder:text-[#A0A39D] focus:border-[#285C3A] focus:ring-4 focus:ring-[#E7F0E8]"
              />
            </section>
          </div>

          {/* Order summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[28px] border border-[#DCE5D8] bg-gradient-to-b from-[#F4F7F0] to-[#EAF1E5] p-5 shadow-[0_12px_36px_rgba(40,92,58,0.07)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-serif text-xl font-bold text-[#173F2A] sm:text-2xl">
                  Order Summary
                  <span className="ml-2 font-sans text-sm font-medium text-[#667064]">
                    ({totalItems} items)
                  </span>
                </h2>

                <Link
                  to="/cart"
                  className="shrink-0 text-xs font-semibold text-[#285C3A] transition hover:text-[#C79A3B]"
                >
                  Edit Cart
                </Link>
              </div>

              <div className="mt-5 rounded-2xl bg-white/70 p-4">
                {checkoutItems.map((item, index) => (
                  <SummaryProduct
                    key={item.variantId || item.id || index}
                    item={item}
                  />
                ))}
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#667064]">
                    Subtotal ({totalItems} items)
                  </span>
                  <span className="font-semibold text-[#242821]">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#667064]">Delivery Charge</span>
                  <span className="font-semibold text-[#242821]">
                    {deliveryCharge === 0
                      ? "FREE"
                      : `₹${deliveryCharge}`}
                  </span>
                </div>
              </div>

              {deliveryCharge > 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#E0ECD9] px-3 py-3 text-xs font-medium text-[#285C3A]">
                  <Truck size={17} />
                  <span>
                    Add ₹
                    {remainingForFreeDelivery.toLocaleString("en-IN")} more
                    for free delivery.
                  </span>
                </div>
              )}

              <div className="mt-5 border-t border-[#D5DDCF] pt-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#173F2A]">
                      Total
                    </h3>
                    <p className="mt-0.5 text-[10px] text-[#667064]">
                      Delivery included
                    </p>
                  </div>

                  <p className="font-serif text-3xl font-bold text-[#173F2A]">
                    ₹{total.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#173F2A] px-5 py-4 text-sm font-bold text-white shadow-[0_8px_25px_rgba(23,63,42,0.18)] transition hover:bg-[#285C3A] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C9DCC6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MessageCircle size={19} />
                {isSubmitting
                  ? "Saving order..."
                  : "Place Order & Continue to WhatsApp"}
                {!isSubmitting && <ArrowRight size={17} />}
              </button>

              <div className="mt-4 flex gap-3 rounded-2xl bg-[#FFF5DB] p-3.5">
                <CircleAlert
                  size={19}
                  className="mt-0.5 shrink-0 text-[#B57C19]"
                />
                <p className="text-[11px] leading-5 text-[#6D5324]">
                  Your order will first be saved in our database. WhatsApp
                  will then open with your order details for confirmation.
                  The business will confirm availability and payment details.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#D5DDCF] pt-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={22} className="text-[#285C3A]" />
                  <div>
                    <p className="text-[11px] font-semibold text-[#173F2A]">
                      Simple Ordering
                    </p>
                    <p className="text-[9px] text-[#667064]">
                      Order assistance
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Truck size={22} className="text-[#285C3A]" />
                  <div>
                    <p className="text-[11px] font-semibold text-[#173F2A]">
                      Delivery
                    </p>
                    <p className="text-[9px] text-[#667064]">
                      Confirmed by team
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <PackageCheck size={22} className="text-[#285C3A]" />
                  <div>
                    <p className="text-[11px] font-semibold text-[#173F2A]">
                      Carefully Packed
                    </p>
                    <p className="text-[9px] text-[#667064]">
                      Packed with care
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MessageCircle size={22} className="text-[#285C3A]" />
                  <div>
                    <p className="text-[11px] font-semibold text-[#173F2A]">
                      Chat Support
                    </p>
                    <p className="text-[9px] text-[#667064]">
                      We're here to help
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Brand promise */}
        <section className="mt-8 rounded-[24px] border border-[#E5DCC8] bg-white px-5 py-5 shadow-sm sm:px-8">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {[
              ["♧", "Traditional Recipes", "Inspired by heritage"],
              ["❧", "Natural Ingredients", "Wholesome and pure"],
              ["♡", "For Families", "Everyday goodness"],
              ["✦", "Our Promise", "Quality you can trust"],
            ].map(([symbol, title, description]) => (
              <div key={title} className="flex items-center gap-3">
                <span className="text-2xl text-[#C79A3B]">{symbol}</span>
                <div>
                  <p className="text-xs font-bold text-[#173F2A]">
                    {title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#667064]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-7">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#285C3A] transition hover:text-[#C79A3B]"
          >
            <ArrowLeft size={17} />
            Back to Cart
          </Link>
        </div>
      </main>
    </div>
  );
}