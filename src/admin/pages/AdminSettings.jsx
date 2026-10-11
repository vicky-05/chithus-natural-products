
import { useEffect, useState } from "react";
import {
  Store,
  Truck,
  CreditCard,
  Bell,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Mail,
  ShieldCheck,
  IndianRupee,
} from "lucide-react";
import { useAdminData } from "../context/AdminDataContext";

const tabs = [
  { id: "store", label: "Store Profile", icon: Store },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const inputClass =
  "w-full rounded-xl border border-[#e1e2d6] bg-white px-4 py-3 text-sm text-[#344637] outline-none transition placeholder:text-[#a4a99e] focus:border-[#285b3b] focus:ring-2 focus:ring-[#285b3b]/10";


const defaultSettings = {
  storeName: "Chithu's Natural Products",
  tagline: "Natural goodness for every home",
  email: "chithusnaturalproducts@gmail.com",
  phone: "+91 6381447316",
  whatsapp: "+91 6381447316",
  address: "Aduthurai",
  state: "Tamil Nadu",
  postalCode: "625001",
  currency: "INR",

  // Delivery policy
  freeDeliveryMinimum: 600,
  deliveryCharge: 40,
  estimatedDelivery: "3–5 business days",

  // Payment methods
  codEnabled: true,
  upiEnabled: true,
  cardEnabled: true,
  bankTransferEnabled: false,

  // Notifications
  orderEmailNotifications: true,
  lowStockNotifications: true,
  marketingEmails: false,
};

function Field({ label, hint, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-[#465345]">
        {label}
      </span>

      {children}

      {hint && (
        <span className="mt-1.5 block text-xs leading-5 text-[#92978c]">
          {hint}
        </span>
      )}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  min,
  step,
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      min={min}
      step={step}
      className={inputClass}
    />
  );
}

function Toggle({ checked, onChange, title, description }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#344637]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#858a7e]">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-[#285b3b]" : "bg-stone-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e9e7dc] bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-[#f0efe7] px-5 py-5 sm:px-6">
        <div className="rounded-xl bg-[#e9f0e6] p-2.5 text-[#285b3b]">
          <Icon size={20} />
        </div>

        <div>
          <h2 className="font-bold text-[#244b32]">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-[#858a7e]">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function formatRupees(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function AdminSettings() {
  const { settings, setSettings, resetSettings } = useAdminData();

  const [draft, setDraft] = useState(() => ({
    ...defaultSettings,
    ...settings,
  }));

  const [activeTab, setActiveTab] = useState("store");
  const [notice, setNotice] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    setDraft({
      ...defaultSettings,
      ...settings,
    });
  }, [settings]);

  const update = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    setNotice(null);
  };

  const save = (event) => {
    event.preventDefault();

    if (!draft.storeName.trim()) {
      setNotice({
        type: "error",
        message: "Please enter a store name.",
      });
      setActiveTab("store");
      return;
    }

    if (!draft.email.trim() || !draft.phone.trim()) {
      setNotice({
        type: "error",
        message: "Please enter a contact email and phone number.",
      });
      setActiveTab("store");
      return;
    }

    if (
      Number(draft.deliveryCharge) < 0 ||
      Number(draft.freeDeliveryMinimum) < 0 ||
      draft.deliveryCharge === "" ||
      draft.freeDeliveryMinimum === ""
    ) {
      setNotice({
        type: "error",
        message: "Delivery charges cannot be negative or empty.",
      });
      setActiveTab("delivery");
      return;
    }

    const paymentEnabled = [
      draft.codEnabled,
      draft.upiEnabled,
      draft.cardEnabled,
      draft.bankTransferEnabled,
    ].some(Boolean);

    if (!paymentEnabled) {
      setNotice({
        type: "error",
        message: "Enable at least one payment method.",
      });
      setActiveTab("payments");
      return;
    }

    const cleanedSettings = {
      ...draft,
      storeName: draft.storeName.trim(),
      tagline: draft.tagline.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      whatsapp: draft.whatsapp.trim(),
      address: draft.address.trim(),
      state: draft.state.trim(),
      postalCode: draft.postalCode.trim(),
      deliveryCharge: Number(draft.deliveryCharge),
      freeDeliveryMinimum: Number(draft.freeDeliveryMinimum),
      estimatedDelivery: draft.estimatedDelivery.trim(),
    };

    setSettings(cleanedSettings);
    setDraft(cleanedSettings);

    setNotice({
      type: "success",
      message:
        "Settings saved to shared admin demo data. They will reset when the page is refreshed.",
    });
  };

  const reset = () => {
    if (typeof resetSettings === "function") {
      resetSettings();
    } else {
      setSettings({ ...defaultSettings });
    }

    setDraft({ ...defaultSettings });
    setResetConfirm(false);

    setNotice({
      type: "success",
      message: "Settings restored to the original demo defaults.",
    });
  };

  const enabledPayments = [
    draft.codEnabled && "Cash on delivery",
    draft.upiEnabled && "UPI",
    draft.cardEnabled && "Cards",
    draft.bankTransferEnabled && "Bank transfer",
  ].filter(Boolean);

  return (
    <div className="space-y-6 pb-8">
      {/* Page heading */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#9b7b36]">
            Store configuration
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#244b32] sm:text-3xl">
            Admin Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#858a7e]">
            Manage your store profile, delivery rules, payment preferences,
            and notification settings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setResetConfirm(true)}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#dfe2d7] bg-white px-4 py-2.5 text-sm font-semibold text-[#586354] transition hover:border-[#285b3b] hover:text-[#285b3b] sm:self-auto"
        >
          <RotateCcw size={16} />
          Reset demo settings
        </button>
      </header>

      {/* Demo warning */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#e8dfc4] bg-[#f8efd9] p-4 text-sm text-[#806328]">
        <AlertCircle size={19} className="mt-0.5 shrink-0" />

        <p className="leading-6">
          <strong>Demo mode:</strong> These settings are shared between admin
          pages through React context. They do not change your live storefront,
          checkout calculations, payment processing, or email delivery.
        </p>
      </div>

      {/* Success and error messages */}
      {notice && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          )}

          <span>{notice.message}</span>
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        {/* Settings navigation */}
        <nav
          aria-label="Settings sections"
          className="grid grid-cols-2 gap-2 rounded-2xl border border-[#e9e7dc] bg-white p-2 sm:grid-cols-4 xl:grid-cols-1 xl:p-3"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? "page" : undefined}
              className={`flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                activeTab === id
                  ? "bg-[#285b3b] text-white shadow-sm"
                  : "text-[#586354] hover:bg-[#f3f4ed] hover:text-[#244b32]"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
            </button>
          ))}

          {/* Live preview */}
          <div className="col-span-2 mt-1 rounded-xl bg-[#faf8f1] p-3 sm:col-span-4 xl:col-span-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9b7b36]">
              <ShieldCheck size={15} />
              Preview summary
            </div>

            <p className="mt-2 break-words text-sm font-bold text-[#244b32]">
              {draft.storeName || "Your store"}
            </p>

            <p className="mt-1 text-xs leading-5 text-[#858a7e]">
              {enabledPayments.join(" · ") || "No payment methods enabled"}
            </p>

            <p className="mt-2 text-xs text-[#858a7e]">
              Free delivery above{" "}
              {formatRupees(draft.freeDeliveryMinimum)}
            </p>
          </div>
        </nav>

        {/* Settings form */}
        <form onSubmit={save} className="min-w-0 space-y-5">
          {/* Store profile */}
          {activeTab === "store" && (
            <>
              <SectionCard
                icon={Store}
                title="Store profile"
                description="Manage your brand name and customer-facing contact details."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Store name *">
                    <TextInput
                      value={draft.storeName}
                      onChange={(e) => update("storeName", e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Tagline">
                    <TextInput
                      value={draft.tagline}
                      onChange={(e) => update("tagline", e.target.value)}
                      placeholder="Your store tagline"
                    />
                  </Field>

                  <Field label="Contact email *">
                    <TextInput
                      type="email"
                      value={draft.email}
                      onChange={(e) => update("email", e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Contact phone *">
                    <TextInput
                      type="tel"
                      value={draft.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      required
                    />
                  </Field>

                  <Field
                    label="WhatsApp number"
                    hint="Demo only. This page does not send WhatsApp messages."
                  >
                    <TextInput
                      type="tel"
                      value={draft.whatsapp}
                      onChange={(e) => update("whatsapp", e.target.value)}
                      placeholder="+91..."
                    />
                  </Field>

                  <Field label="Currency">
                    <div className="flex items-center gap-2 rounded-xl border border-[#e1e2d6] bg-[#f7f7f0] px-4 py-3 text-sm text-[#586354]">
                      <IndianRupee size={17} />
                      Indian Rupee (INR)
                    </div>
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                icon={MapPin}
                title="Business location"
                description="Manage the sample location displayed in your store profile."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="City / town">
                    <TextInput
                      value={draft.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="Madurai"
                    />
                  </Field>

                  <Field label="State">
                    <TextInput
                      value={draft.state}
                      onChange={(e) => update("state", e.target.value)}
                      placeholder="Tamil Nadu"
                    />
                  </Field>

                  <Field label="PIN code">
                    <TextInput
                      value={draft.postalCode}
                      onChange={(e) => update("postalCode", e.target.value)}
                      placeholder="625001"
                    />
                  </Field>
                </div>
              </SectionCard>
            </>
          )}

          {/* Delivery settings */}
          {activeTab === "delivery" && (
            <SectionCard
              icon={Truck}
              title="Delivery rules"
              description="Configure the sample delivery charges and free-delivery threshold."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Standard delivery charge (₹)"
                  hint="Sample charge for orders below the free-delivery threshold."
                >
                  <TextInput
                    type="number"
                    min="0"
                    step="1"
                    value={String(draft.deliveryCharge)}
                    onChange={(e) => update("deliveryCharge", e.target.value)}
                    required
                  />
                </Field>

                <Field
                  label="Free delivery threshold (₹)"
                  hint="Orders at or above this value qualify under the sample rule."
                >
                  <TextInput
                    type="number"
                    min="0"
                    step="1"
                    value={String(draft.freeDeliveryMinimum)}
                    onChange={(e) =>
                      update("freeDeliveryMinimum", e.target.value)
                    }
                    required
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Estimated delivery time">
                    <TextInput
                      value={draft.estimatedDelivery}
                      onChange={(e) =>
                        update("estimatedDelivery", e.target.value)
                      }
                      placeholder="3–5 business days"
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[#e8dfc4] bg-[#fffaf0] p-4">
                <p className="text-sm font-bold text-[#806328]">
                  Example preview
                </p>

                <p className="mt-1 text-sm leading-6 text-[#806328]">
                  A ₹400 order would show a delivery charge of{" "}
                  {formatRupees(draft.deliveryCharge)}. An order worth{" "}
                  {formatRupees(draft.freeDeliveryMinimum)} or more would
                  qualify for free delivery under this sample rule.
                </p>

                <p className="mt-2 text-xs text-[#92784a]">
                  Estimated delivery:{" "}
                  {draft.estimatedDelivery || "Not specified"}
                </p>
              </div>
            </SectionCard>
          )}

          {/* Payment settings */}
          {activeTab === "payments" && (
            <SectionCard
              icon={CreditCard}
              title="Payment methods"
              description="Choose the payment methods enabled in this settings preview."
            >
              <div className="divide-y divide-[#f0efe7]">
                <Toggle
                  checked={draft.codEnabled}
                  onChange={(value) => update("codEnabled", value)}
                  title="Cash on delivery"
                  description="Allow customers to pay when their order arrives."
                />

                <Toggle
                  checked={draft.upiEnabled}
                  onChange={(value) => update("upiEnabled", value)}
                  title="UPI payments"
                  description="UPI apps and QR-based payments. No payment gateway is connected."
                />

                <Toggle
                  checked={draft.cardEnabled}
                  onChange={(value) => update("cardEnabled", value)}
                  title="Credit and debit cards"
                  description="Card processing must be configured separately before launch."
                />

                <Toggle
                  checked={draft.bankTransferEnabled}
                  onChange={(value) => update("bankTransferEnabled", value)}
                  title="Bank transfer"
                  description="Manual transfer instructions are not configured in this demo."
                />
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#edf1e8] p-4 text-sm text-[#315b43]">
                <ShieldCheck size={19} className="mt-0.5 shrink-0" />
                <p className="leading-6">
                  These switches only update shared demo settings. They do not
                  enable, disable, or process real payments.
                </p>
              </div>
            </SectionCard>
          )}

          {/* Notification settings */}
          {activeTab === "notifications" && (
            <SectionCard
              icon={Bell}
              title="Notification preferences"
              description="Choose which sample alerts the admin would prefer to receive."
            >
              <div className="divide-y divide-[#f0efe7]">
                <Toggle
                  checked={draft.orderEmailNotifications}
                  onChange={(value) =>
                    update("orderEmailNotifications", value)
                  }
                  title="New order notifications"
                  description="Notify the store team when a new order is placed."
                />

                <Toggle
                  checked={draft.lowStockNotifications}
                  onChange={(value) =>
                    update("lowStockNotifications", value)
                  }
                  title="Low-stock alerts"
                  description="Flag products when inventory falls to a low level."
                />

                <Toggle
                  checked={draft.marketingEmails}
                  onChange={(value) => update("marketingEmails", value)}
                  title="Marketing and product updates"
                  description="Optional announcements and product-related email updates."
                />
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#f7f1df] p-4 text-sm text-[#806328]">
                <Mail size={19} className="mt-0.5 shrink-0" />
                <p className="leading-6">
                  No emails or alerts are sent from this demo page.
                  Notification delivery can be connected later through a
                  secure backend.
                </p>
              </div>
            </SectionCard>
          )}

          {/* Save actions */}
          <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-[#e9e7dc] bg-[#fffdf7]/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <p className="hidden text-xs text-[#858a7e] sm:block">
              Demo settings · Shared React memory
            </p>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285b3b] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1e462d] focus:outline-none focus:ring-2 focus:ring-[#285b3b]/30"
            >
              <Save size={17} />
              Save settings
            </button>
          </div>
        </form>
      </div>

      {/* Reset confirmation */}
      {resetConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-settings-title"
            className="w-full max-w-md rounded-2xl bg-[#fffdf7] p-6 shadow-2xl"
          >
            <div className="mb-4 inline-flex rounded-xl bg-[#f7f1df] p-3 text-[#9b7b36]">
              <RotateCcw size={22} />
            </div>

            <h2
              id="reset-settings-title"
              className="text-lg font-extrabold text-[#244b32]"
            >
              Reset demo settings?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#858a7e]">
              All settings on this page will return to their sample defaults.
              No database or storefront changes will be made.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setResetConfirm(false)}
                className="rounded-xl border border-[#dfe2d7] px-4 py-2.5 text-sm font-semibold text-[#586354] hover:bg-[#f3f3ec]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={reset}
                className="rounded-xl bg-[#285b3b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1e462d]"
              >
                Reset settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
