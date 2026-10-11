
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  UserRound,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  MessageCircle,
  Bell,
  CheckCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import navbarLogo from "../assets/chithus-navbar-logo.png";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { supabase } from "../lib/supabaseClient";
import AnnouncementBar from "./AnnouncementBar";

/* =====================================================
   HELPERS
===================================================== */

const formatNotificationTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getCustomerNotificationPath = (notification) => {
  if (notification.category === "order") {
    return "/orders";
  }

  return "/notifications";
};

/* =====================================================
   PRODUCT SEARCH
===================================================== */

function ProductSearch({
  value,
  onChange,
  onSearch,
  onSelectProduct,
  mobile = false,
}) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const containerRef = useRef(null);

  const showDropdown = focused && value.trim().length > 0;

  useEffect(() => {
    const query = value.trim();

    if (!query) {
      setSuggestions([]);
      setSearchLoading(false);
      setSearchError("");
      return undefined;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");

      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            short_description,
            description,
            status,
            product_variants (
              id,
              price,
              pack_size_value,
              pack_size_unit,
              is_active,
              stock_quantity
            ),
            product_images (
              image_url,
              is_primary,
              sort_order
            ),
            product_categories (
              categories (
                name,
                slug
              )
            )
          `)
          .eq("status", "active")
          .order("name", { ascending: true });

        if (error) throw error;
        if (cancelled) return;

        const normalizedQuery = query.toLowerCase();

        const matchedProducts = (data || [])
          .map((product) => {
            const categories = (product.product_categories || [])
              .map((entry) => entry.categories)
              .filter(Boolean);

            const images = [...(product.product_images || [])]
              .filter((image) => image.image_url)
              .sort((a, b) => {
                if (a.is_primary !== b.is_primary) {
                  return a.is_primary ? -1 : 1;
                }

                return (
                  (a.sort_order ?? 999) -
                  (b.sort_order ?? 999)
                );
              });

            const variants = (product.product_variants || [])
              .filter((variant) => variant.is_active !== false)
              .sort(
                (a, b) => Number(a.price) - Number(b.price)
              );

            const searchableText = [
              product.name,
              product.short_description,
              product.description,
              ...categories.map((category) => category.name || ""),
              ...categories.map((category) => category.slug || ""),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            const selectedVariant =
              variants.find(
                (variant) => Number(variant.stock_quantity) > 0
              ) || variants[0];

            return {
              id: product.id,
              name: product.name,
              slug: product.slug,
              image: images[0]?.image_url || null,
              categoryName:
                categories[0]?.name || "Natural Products",
              price: selectedVariant?.price ?? null,
              inStock: variants.some(
                (variant) => Number(variant.stock_quantity) > 0
              ),
              searchableText,
            };
          })
          .filter((product) =>
            product.searchableText.includes(normalizedQuery)
          )
          .slice(0, 6);

        setSuggestions(matchedProducts);
      } catch (error) {
        console.error("Product search failed:", error);

        if (!cancelled) {
          setSuggestions([]);
          setSearchError("Unable to search products. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setFocused(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );
    };
  }, []);

  const submitSearch = (event) => {
    event?.preventDefault();
    setFocused(false);
    onSearch(value);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${mobile ? "w-full" : "w-[260px] 2xl:w-[280px]"
        }`}
    >
      <form
        role="search"
        onSubmit={submitSearch}
        className={`relative z-10 flex items-center gap-2 border border-[#DDD8C8] bg-white transition focus-within:border-[#285C3A] focus-within:ring-2 focus-within:ring-[#285C3A]/10 ${mobile
            ? "h-12 w-full rounded-xl px-3"
            : "h-11 w-full rounded-full px-4"
          }`}
      >
        {mobile && (
          <Search
            size={18}
            className="shrink-0 text-[#667064]"
          />
        )}

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setFocused(false);
          }}
          placeholder="Search products..."
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          className={`min-w-0 flex-1 bg-transparent text-[#242821] outline-none placeholder:text-[#92988E] ${mobile ? "text-sm" : "text-[13px]"
            }`}
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setFocused(true);
            }}
            aria-label="Clear search"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#667064] hover:bg-[#E7F0E8] hover:text-[#285C3A]"
          >
            <X size={15} />
          </button>
        )}

        <button
          type="submit"
          aria-label="Search products"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#667064] transition hover:bg-[#E7F0E8] hover:text-[#285C3A]"
        >
          <Search size={18} strokeWidth={1.8} />
        </button>
      </form>

      {showDropdown && (
        <div
          className={`absolute left-0 right-0 top-full z-[300] mt-2 overflow-hidden rounded-2xl border border-[#E2D8C8] bg-[#FFFDF8] shadow-[0_18px_55px_rgba(23,63,42,0.18)] ${mobile
              ? "max-h-[55vh]"
              : "left-auto max-h-[min(70vh,460px)] w-[360px] max-w-[calc(100vw-24px)]"
            }`}
        >
          <div className="flex items-center justify-between border-b border-[#E2D8C8] bg-[#FAF7EF] px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#285C3A]">
              Suggested Products
            </span>

            <span className="text-[11px] text-[#667064]">
              {searchLoading
                ? "Searching..."
                : `${suggestions.length} results`}
            </span>
          </div>

          {searchLoading ? (
            <div
              className="px-5 py-8 text-center"
              role="status"
            >
              <RefreshCw
                size={22}
                className="mx-auto animate-spin text-[#285C3A]"
              />
              <p className="mt-3 text-sm text-[#667064]">
                Finding products...
              </p>
            </div>
          ) : searchError ? (
            <div className="px-5 py-7 text-center">
              <p className="text-sm text-[#A33D36]">
                {searchError}
              </p>

            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="max-h-[320px] overflow-y-auto p-2">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setFocused(false);
                      onSelectProduct(product);
                    }}
                    className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-[#E7F0E8]/70"
                  >
                    <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E9E3D5] bg-white p-1">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Search
                          size={20}
                          className="text-[#92988E]"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[13px] font-semibold leading-5 text-[#173F2A]">
                        {product.name}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-[#737B70]">
                        {product.categoryName}
                      </p>

                      {product.price != null && (
                        <p className="mt-1 text-xs font-bold text-[#285C3A]">
                          ₹
                          {Number(product.price).toLocaleString("en-IN")}
                        </p>
                      )}

                      <p
                        className={`mt-1 text-[10px] ${product.inStock
                            ? "text-[#285C3A]"
                            : "text-[#A33D36]"
                          }`}
                      >
                        {product.inStock ? "In stock" : "Out of stock"}
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="shrink-0 text-[#92988E]"
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={submitSearch}
                className="flex w-full items-center justify-center gap-2 border-t border-[#E2D8C8] bg-[#173F2A] px-4 py-3.5 text-xs font-semibold text-white hover:bg-[#285C3A]"
              >
                View all results
                <Search size={14} />
              </button>
            </>
          ) : (
            <div className="px-5 py-7 text-center">
              <p className="text-sm font-semibold text-[#173F2A]">
                No matching products
              </p>
              <p className="mt-1 text-xs text-[#737B70]">
                Try another product name or category.
              </p>
              <button
                type="button"
                onClick={submitSearch}
                className="mt-3 text-xs font-semibold text-[#285C3A] underline"
              >
                Search the shop
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   MAIN NAVBAR
===================================================== */

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [navbarSearch, setNavbarSearch] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [notificationActionId, setNotificationActionId] = useState(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  /* Authentication */
  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (!error) {
        setCurrentUser(data.session?.user ?? null);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  /* Load notifications belonging to the signed-in user */
  const loadNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!currentUser?.id) {
        setNotifications([]);
        setNotificationsLoading(false);
        return;
      }

      if (!silent) setNotificationsLoading(true);
      setNotificationsError("");

      try {
        const { data, error } = await supabase
          .from("notifications")
          .select(
            "id, user_id, category, type, title, message, icon, link, is_read, metadata, created_at, read_at"
          )
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(30);

        if (error) throw error;

        setNotifications(data ?? []);
      } catch (error) {
        console.error("Customer notification loading failed:", error);
        setNotificationsError(
          error?.message || "Unable to load notifications."
        );
      } finally {
        setNotificationsLoading(false);
      }
    },
    [currentUser?.id]
  );

  /* Supabase Realtime subscription */
  useEffect(() => {
    if (!currentUser?.id) {
      setNotifications([]);
      setNotificationsError("");
      return undefined;
    }

    let cancelled = false;
    let channel;

    loadNotifications();

    const subscribe = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (
        cancelled ||
        error ||
        data.session?.user?.id !== currentUser.id
      ) {
        return;
      }

      channel = supabase
        .channel(`customer-notifications-${currentUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${currentUser.id}`,
          },
          () => loadNotifications({ silent: true })
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            console.error(
              "Customer notification Realtime subscription failed."
            );
          }
        });
    };

    subscribe();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUser?.id, loadNotifications]);

  /* Close notifications on outside click or Escape */
  useEffect(() => {
    if (!notificationsOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (
        event.target instanceof Element &&
        !event.target.closest("[data-notification-root]")
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notificationsOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSearch = (query) => {
    const trimmedQuery = query.trim();

    setMobileMenuOpen(false);

    if (trimmedQuery) {
      navigate(`/shop?search=${encodeURIComponent(trimmedQuery)}`);
    } else {
      navigate("/shop");
    }
  };

  const handleSelectProduct = (product) => {
    setMobileMenuOpen(false);

    if (product.slug) {
      navigate(`/product/${product.slug}`);
    } else {
      handleSearch(product.name || navbarSearch);
    }
  };

  const accountPath = currentUser ? "/my-account" : "/login";

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
    { label: "Our Story", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "FAQ", to: "/faq" },
  ];

  const linkClass = ({ isActive }) =>
    `relative py-3 text-sm font-medium transition ${isActive
      ? "text-brand after:absolute after:bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-gold"
      : "text-text-muted hover:text-brand"
    }`;

  const CartBadge = () => (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
      {cartCount}
    </span>
  );

  const WishlistBadge = () =>
    wishlistCount > 0 ? (
      <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
        {wishlistCount}
      </span>
    ) : null;

  /* Responsive notification bell and dropdown */
  const NotificationButton = ({ mobile = false }) => (
    <div data-notification-root="true" className="relative">
      <button
        type="button"
        onClick={() => {
          if (!currentUser) {
            navigate("/login");
            return;
          }

          setNotificationsOpen((open) => !open);
          loadNotifications({ silent: true });
        }}
        aria-label={
          unreadCount
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={notificationsOpen}
        className={`relative flex items-center justify-center rounded-full text-text transition hover:bg-brand-light hover:text-brand ${mobile ? "h-11 w-11" : "h-10 w-10"
          }`}
      >
        <Bell size={mobile ? 22 : 20} strokeWidth={1.7} />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#B94A48] px-1 text-[10px] font-bold text-white ring-2 ring-cream">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {notificationsOpen && (
        <div
          className={`fixed z-[210] overflow-hidden rounded-2xl border border-[#E2D8C8] bg-[#FFFDF8] shadow-[0_18px_55px_rgba(23,63,42,0.18)] ${mobile
              ? "left-3 right-3 top-[108px] max-h-[calc(100dvh-124px)] w-auto sm:left-auto sm:right-4 sm:top-[112px] sm:w-[370px]"
              : "absolute right-0 top-full mt-3 max-h-[min(70vh,480px)] w-[370px] max-w-[calc(100vw-24px)]"
            }`}
        >
          <div className="flex items-center justify-between border-b border-[#E2D8C8] bg-[#FAF7EF] px-4 py-4">
            <div>
              <h3 className="text-sm font-bold text-[#173F2A]">
                Notifications
              </h3>
              <p className="mt-1 text-[11px] text-[#667064]">
                {unreadCount} unread notification
                {unreadCount === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => loadNotifications()}
                disabled={notificationsLoading}
                aria-label="Refresh notifications"
                className="rounded-full p-2 text-[#667064] transition hover:bg-[#E7F0E8] disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={
                    notificationsLoading ? "animate-spin" : ""
                  }
                />
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (markingAllRead || unreadCount === 0) return;

                  setMarkingAllRead(true);
                  setNotificationsError("");

                  try {
                    const readAt = new Date().toISOString();

                    const { error } = await supabase
                      .from("notifications")
                      .update({
                        is_read: true,
                        read_at: readAt,
                      })
                      .eq("user_id", currentUser.id)
                      .eq("is_read", false);

                    if (error) throw error;

                    setNotifications((items) =>
                      items.map((item) =>
                        item.is_read
                          ? item
                          : {
                            ...item,
                            is_read: true,
                            read_at: readAt,
                          }
                      )
                    );
                  } catch (error) {
                    console.error("Mark all as read failed:", error);
                    setNotificationsError(
                      error?.message ||
                      "Unable to mark notifications as read."
                    );
                  } finally {
                    setMarkingAllRead(false);
                  }
                }}
                disabled={markingAllRead || unreadCount === 0}
                aria-label="Mark all notifications as read"
                title="Mark all as read"
                className="rounded-full p-2 text-[#285C3A] transition hover:bg-[#E7F0E8] disabled:opacity-40"
              >
                {markingAllRead ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <CheckCheck size={17} />
                )}
              </button>

              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                aria-label="Close notifications"
                className="rounded-full p-2 text-[#667064] transition hover:bg-[#E7F0E8]"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {notificationsError && (
            <div className="flex items-start gap-2 border-b border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span className="break-words">{notificationsError}</span>
            </div>
          )}

          <div className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain">
            {notificationsLoading && notifications.length === 0 ? (
              <div
                className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-[#667064]"
                role="status"
              >
                <RefreshCw size={16} className="animate-spin" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-9 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F0E8] text-[#285C3A]">
                  <Bell size={23} />
                </div>
                <p className="mt-3 text-sm font-semibold text-[#173F2A]">
                  You're all caught up
                </p>
                <p className="mt-1 text-xs leading-5 text-[#667064]">
                  Your order confirmations and status updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  disabled={notificationActionId === notification.id}
                  onClick={async () => {
                    if (notificationActionId) return;

                    setNotificationActionId(notification.id);
                    setNotificationsError("");

                    try {
                      if (!notification.is_read) {
                        const readAt = new Date().toISOString();

                        const { error } = await supabase
                          .from("notifications")
                          .update({
                            is_read: true,
                            read_at: readAt,
                          })
                          .eq("id", notification.id)
                          .eq("user_id", currentUser.id)
                          .eq("is_read", false);

                        if (error) throw error;

                        setNotifications((items) =>
                          items.map((item) =>
                            item.id === notification.id
                              ? {
                                ...item,
                                is_read: true,
                                read_at: readAt,
                              }
                              : item
                          )
                        );
                      }

                      setNotificationsOpen(false);
                      navigate(
                        getCustomerNotificationPath(notification)
                      );
                    } catch (error) {
                      console.error("Opening notification failed:", error);
                      setNotificationsError(
                        error?.message ||
                        "Unable to update this notification."
                      );
                    } finally {
                      setNotificationActionId(null);
                    }
                  }}
                  className={`flex w-full items-start gap-3 border-b border-[#EEEBDD] px-4 py-3.5 text-left transition hover:bg-[#E7F0E8]/60 ${!notification.is_read ? "bg-[#F3F7EF]" : ""
                    }`}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E7F0E8] text-[#285C3A]">
                    <ShoppingBag size={17} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-xs leading-5 ${notification.is_read
                          ? "font-medium text-[#566052]"
                          : "font-bold text-[#173F2A]"
                        }`}
                    >
                      {notification.title}
                    </span>

                    <span className="mt-1 block break-words text-xs leading-5 text-[#667064]">
                      {notification.message}
                    </span>

                    <span className="mt-1.5 block text-[10px] text-[#92988E]">
                      {formatNotificationTime(notification.created_at)}
                    </span>
                  </span>

                  {notificationActionId === notification.id ? (
                    <RefreshCw
                      size={14}
                      className="mt-1 shrink-0 animate-spin text-[#285C3A]"
                    />
                  ) : !notification.is_read ? (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#285C3A]" />
                  ) : null}
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(false);
              navigate("/notifications");
            }}
            className="flex min-h-12 w-full items-center justify-center gap-2 border-t border-[#E2D8C8] bg-[#FAF8F2] px-4 py-3 text-xs font-bold text-[#285C3A] transition hover:bg-[#E7F0E8]"
          >
            View all notifications
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Dynamic announcement bar */}
      <AnnouncementBar />

      {/* Main navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-cream/95 backdrop-blur-md">
        <div className="mx-auto grid h-[68px] max-w-[1440px] grid-cols-[44px_minmax(0,1fr)_88px] items-center px-3 sm:h-[72px] sm:px-5 xl:flex xl:h-[82px] xl:px-8 2xl:px-10">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            className="flex h-11 w-11 items-center justify-center justify-self-start rounded-full text-text transition hover:bg-brand-light hover:text-brand xl:hidden"
          >
            <Menu size={23} strokeWidth={1.8} />
          </button>

          {/* Logo */}
          <Link
            to="/"
            aria-label="Chithu's Natural Products - Home"
            onClick={closeMobileMenu}
            className="flex min-w-0 items-center justify-center justify-self-center xl:mr-8 xl:shrink-0"
          >
            <img
              src={navbarLogo}
              alt="Chithu's Natural Products"
              className="block h-auto w-[118px] max-w-full object-contain sm:w-[130px] xl:w-[176px]"
            />
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden flex-1 items-center justify-center xl:flex"
          >
            <div className="flex items-center gap-6 2xl:gap-8">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={linkClass}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Desktop actions */}
          <div className="hidden shrink-0 items-center gap-1 xl:flex">
            <ProductSearch
              value={navbarSearch}
              onChange={setNavbarSearch}
              onSearch={handleSearch}
              onSelectProduct={handleSelectProduct}
            />

            <Link
              to={accountPath}
              aria-label="My account"
              className="flex h-10 w-10 items-center justify-center rounded-full text-text transition hover:bg-brand-light hover:text-brand"
            >
              <UserRound size={20} strokeWidth={1.7} />
            </Link>

            <NotificationButton />

            <Link
              to="/wishlist"
              aria-label={`Wishlist, ${wishlistCount} saved items`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-text transition hover:bg-brand-light hover:text-brand"
            >
              <Heart
                size={20}
                strokeWidth={1.7}
                className={
                  wishlistCount > 0
                    ? "fill-[#B94A48] text-[#B94A48]"
                    : ""
                }
              />
              <WishlistBadge />
            </Link>

            <Link
              to="/cart"
              aria-label={`Shopping cart, ${cartCount} items`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-text transition hover:bg-brand-light hover:text-brand"
            >
              <ShoppingBag size={21} strokeWidth={1.7} />
              <CartBadge />
            </Link>
          </div>

          {/* Mobile notifications + cart */}
          <div className="flex items-center justify-self-end gap-0.5 xl:hidden">
            <NotificationButton mobile />

            <Link
              to="/cart"
              aria-label={`Shopping cart, ${cartCount} items`}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text transition hover:bg-brand-light hover:text-brand"
            >
              <ShoppingBag size={22} strokeWidth={1.8} />
              <CartBadge />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[100] xl:hidden ${mobileMenuOpen
            ? "visible"
            : "invisible pointer-events-none"
          }`}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          tabIndex={mobileMenuOpen ? 0 : -1}
          onClick={closeMobileMenu}
          className={`absolute inset-0 bg-brand-dark/45 backdrop-blur-[2px] transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
        />

        <aside
          aria-label="Mobile navigation"
          className={`absolute right-0 top-0 flex h-full w-[88%] max-w-[390px] flex-col bg-cream shadow-2xl transition-transform duration-300 ease-out ${mobileMenuOpen
              ? "translate-x-0"
              : "translate-x-full"
            }`}
        >
          <div className="flex min-h-[78px] items-center justify-between border-b border-border px-4 sm:px-5">
            <Link
              to="/"
              onClick={closeMobileMenu}
              aria-label="Chithu's Natural Products - Home"
              tabIndex={mobileMenuOpen ? 0 : -1}
              className="flex min-w-0 items-center"
            >
              <img
                src={navbarLogo}
                alt="Chithu's Natural Products"
                className="block h-auto w-[135px] object-contain sm:w-[145px]"
              />
            </Link>

            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close menu"
              tabIndex={mobileMenuOpen ? 0 : -1}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-text shadow-sm transition hover:bg-brand-light hover:text-brand"
            >
              <X size={22} strokeWidth={1.8} />
            </button>
          </div>

          {/* Mobile search */}
          <div className="relative z-[250] px-4 pb-5 pt-5 sm:px-5">
            <ProductSearch
              mobile
              value={navbarSearch}
              onChange={setNavbarSearch}
              onSearch={handleSearch}
              onSelectProduct={handleSelectProduct}
            />
          </div>

          {/* Mobile navigation links */}
          <nav
            aria-label="Mobile main navigation"
            className="flex-1 overflow-y-auto px-4 sm:px-5"
          >
            <div className="border-t border-border">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeMobileMenu}
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  className="flex min-h-[58px] items-center justify-between border-b border-border text-base font-medium text-text transition hover:text-brand"
                >
                  <span>{item.label}</span>
                  <ChevronRight
                    size={19}
                    className="text-text-muted"
                  />
                </Link>
              ))}

              <Link
                to={accountPath}
                onClick={closeMobileMenu}
                tabIndex={mobileMenuOpen ? 0 : -1}
                className="flex min-h-[58px] items-center justify-between border-b border-border text-base font-medium text-text transition hover:text-brand"
              >
                <span className="flex items-center gap-3">
                  <UserRound size={19} />
                  {currentUser ? "My Account" : "Login / Register"}
                </span>
                <ChevronRight
                  size={19}
                  className="text-text-muted"
                />
              </Link>

              <Link
                to="/wishlist"
                onClick={closeMobileMenu}
                tabIndex={mobileMenuOpen ? 0 : -1}
                className="flex min-h-[58px] items-center justify-between border-b border-border text-base font-medium text-text transition hover:text-brand"
              >
                <span className="flex items-center gap-3">
                  <Heart size={19} />
                  Wishlist
                </span>

                <span className="flex items-center gap-2">
                  {wishlistCount > 0 && (
                    <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                  <ChevronRight
                    size={19}
                    className="text-text-muted"
                  />
                </span>
              </Link>

              <Link
                to="/cart"
                onClick={closeMobileMenu}
                tabIndex={mobileMenuOpen ? 0 : -1}
                className="flex min-h-[58px] items-center justify-between border-b border-border text-base font-semibold text-brand"
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag size={19} />
                  My Cart
                </span>

                <span className="flex items-center gap-2">
                  <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-white">
                    {cartCount}
                  </span>
                  <ChevronRight size={19} />
                </span>
              </Link>
            </div>
          </nav>

          {/* WhatsApp */}
          <div className="border-t border-border bg-brand-light p-4 sm:p-5">
            <a
              href="https://wa.me/YOUR_WHATSAPP_NUMBER"
              target="_blank"
              rel="noreferrer"
              tabIndex={mobileMenuOpen ? 0 : -1}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
            >
              <MessageCircle size={19} />
              Chat With Us on WhatsApp
            </a>

            <p className="mt-3 text-center text-[11px] leading-5 text-text-muted">
              Have a question about our products?
              <br />
              We're happy to help.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

export default Navbar;
