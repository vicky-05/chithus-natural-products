
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Search,
  Leaf,
  ChevronDown,
  ArrowUpRight,
  ShoppingBag,
  Package,
  X,
  Check,
  CheckCheck,
  RefreshCw,
  AlertCircle,
  LayoutDashboard,
  Users,
  Tags,
  LogOut,
  UserRound,
  Settings,
  Command,
  Sprout,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import { supabase } from "../../lib/supabaseClient";

const pageTitles = {
  "/admin": {
    title: "Dashboard",
    description: "A clear view of your store, orders, and daily activity.",
    icon: LayoutDashboard,
  },
  "/admin/products": {
    title: "Products",
    description: "Manage your products, pricing, and inventory.",
    icon: Package,
  },
  "/admin/categories": {
    title: "Categories",
    description: "Organize your natural products into collections.",
    icon: Tags,
  },
  "/admin/orders": {
    title: "Orders",
    description: "Review customer purchases and manage order progress.",
    icon: ShoppingBag,
  },
  "/admin/customers": {
    title: "Customers",
    description: "Build better relationships with your customers.",
    icon: Users,
  },
  "/admin/reports": {
    title: "Reports",
    description: "Understand your store's performance and activity.",
    icon: LayoutDashboard,
  },
};


const allowedRoutes = [
  "/admin",
  "/admin/orders",
  "/admin/products",
  "/admin/categories",
  "/admin/customers",
  "/admin/reviews",
  "/account/orders",
];


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

const getNotificationDestination = (notification) => {
  return allowedRoutes.includes(notification?.link)
    ? notification.link
    : "/admin/orders";
};

const getNotificationIcon = (notification) => {
  const category = String(
    notification?.category || notification?.type || ""
  ).toLowerCase();

  if (category.includes("order")) return ShoppingBag;
  if (category.includes("product") || category.includes("stock")) {
    return Package;
  }
  if (category.includes("customer")) return Users;

  return Leaf;
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState("");
  const [notificationActionId, setNotificationActionId] = useState(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const notificationPanelRef = useRef(null);
  const profilePanelRef = useRef(null);
  const searchPanelRef = useRef(null);

  const page = useMemo(() => {
    const exactPage = pageTitles[location.pathname];

    if (exactPage) return exactPage;

    const matchingPrefix = Object.keys(pageTitles)
      .filter((path) => path !== "/admin" && location.pathname.startsWith(path))
      .sort((a, b) => b.length - a.length)[0];

    return (
      pageTitles[matchingPrefix] || {
        title: "Administration",
        description: "Manage your store and business activity.",
        icon: Leaf,
      }
    );
  }, [location.pathname]);

  const PageIcon = page.icon;

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const loadNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setNotificationsLoading(true);
    }

    setNotificationsError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setNotifications([]);
        setNotificationsError("Please sign in to view notifications.");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select(
          "id, user_id, category, type, title, message, icon, link, is_read, metadata, created_at, read_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;

      setNotifications(data ?? []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotificationsError(
        error?.message || "Unable to load notifications."
      );
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    let channel;
    let cancelled = false;

    const initializeNotifications = async () => {
      await loadNotifications();

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user || cancelled) return;

        channel = supabase
          .channel(`admin-notifications-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              loadNotifications({ silent: true });
            }
          )
          .subscribe((status) => {
            if (status === "CHANNEL_ERROR") {
              console.error(
                "Notification Realtime subscription failed."
              );
            }
          });
      } catch (error) {
        console.error("Unable to subscribe to notifications:", error);
      }
    };

    initializeNotifications();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadNotifications]);

  useEffect(() => {
    setSidebarOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }

      if (
        profilePanelRef.current &&
        !profilePanelRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        searchPanelRef.current &&
        !searchPanelRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const goToSearchResult = (query) => {
    const value = query.trim().toLowerCase();

    if (!value) return;

    if (
      value.includes("dashboard") ||
      value.includes("overview") ||
      value === "home"
    ) {
      navigate("/admin");
    } else if (
      value.includes("order") ||
      value.includes("purchase") ||
      value.includes("delivery")
    ) {
      navigate("/admin/orders");
    } else if (
      value.includes("product") ||
      value.includes("stock") ||
      value.includes("inventory")
    ) {
      navigate("/admin/products");
    } else if (
      value.includes("categor") ||
      value.includes("collection")
    ) {
      navigate("/admin/categories");
    } else if (
      value.includes("customer") ||
      value.includes("buyer")
    ) {
      navigate("/admin/customers");
    } else if (
      value.includes("report") ||
      value.includes("analytics") ||
      value.includes("sales")
    ) {
      navigate("/admin/reports");
    } else {
      return;
    }

    setSearchOpen(false);
    setSearchQuery("");
  };

  const markNotificationRead = async (notification) => {
    if (notification.is_read || notificationActionId) return;

    setNotificationActionId(notification.id);
    setNotificationsError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please sign in again.");

      const readAt = new Date().toISOString();

      const { data, error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: readAt,
        })
        .eq("id", notification.id)
        .eq("user_id", user.id)
        .eq("is_read", false)
        .select("id");

      if (error) throw error;

      if (!data?.length) {
        await loadNotifications({ silent: true });
      } else {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true, read_at: readAt }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      setNotificationsError(
        error?.message || "Unable to update this notification."
      );
    } finally {
      setNotificationActionId(null);
    }
  };

  const markAllNotificationsRead = async () => {
    if (markingAllRead || unreadCount === 0) return;

    setMarkingAllRead(true);
    setNotificationsError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please sign in again.");

      const readAt = new Date().toISOString();

      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: readAt,
        })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications((current) =>
        current.map((item) =>
          item.is_read
            ? item
            : { ...item, is_read: true, read_at: readAt }
        )
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      setNotificationsError(
        error?.message || "Unable to mark notifications as read."
      );
    } finally {
      setMarkingAllRead(false);
    }
  };

  const openNotification = async (notification) => {
    if (!notification.is_read) {
      await markNotificationRead(notification);
    }

    setNotificationsOpen(false);
    navigate(getNotificationDestination(notification));
  };

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setNotifications([]);
      setProfileOpen(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Sign out failed:", error);
      window.alert(error?.message || "Unable to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f1] text-[#263b2c]">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-72">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 border-b border-[#e8e9df] bg-[#fffef9]/95 backdrop-blur-xl">
          <div className="flex h-[70px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                className="rounded-xl p-2.5 text-[#285b3b] transition hover:bg-[#edf2e9] focus:outline-none focus:ring-2 focus:ring-[#9ab49a] lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-[#285b3b] text-white shadow-sm sm:flex lg:hidden">
                <Leaf size={21} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-bold tracking-tight text-[#244b32] sm:text-base">
                    {page.title}
                  </h2>
                  <span className="hidden rounded-full border border-[#e2e8dc] bg-[#f1f5ed] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#547354] md:inline-flex">
                    Store admin
                  </span>
                </div>

                <p className="mt-0.5 hidden text-[11px] text-[#899083] sm:block">
                  Chithu's Natural Products
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              {/* Search */}
              <div className="relative" ref={searchPanelRef}>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen((open) => !open);
                    setNotificationsOpen(false);
                    setProfileOpen(false);
                  }}
                  aria-label="Toggle admin search"
                  aria-expanded={searchOpen}
                  className={`flex h-10 items-center gap-2 rounded-xl border px-3 transition focus:outline-none focus:ring-2 focus:ring-[#c4d5bd] ${
                    searchOpen
                      ? "border-[#b8cbb8] bg-[#f1f5ee]"
                      : "border-transparent bg-transparent hover:border-[#e7e8df] hover:bg-white"
                  }`}
                >
                  <Search size={18} className="text-[#667365]" />
                  <span className="hidden text-xs text-[#899083] md:block">
                    Search
                  </span>
                  <span className="hidden rounded border border-[#e4e6dc] px-1 py-0.5 text-[9px] text-[#92998c] lg:inline-flex">
                    /
                  </span>
                </button>

                {searchOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[min(350px,calc(100vw-24px))] rounded-2xl border border-[#e7e8df] bg-white p-3 shadow-xl shadow-[#243c2b]/10">
                    <div className="flex items-center gap-2 rounded-xl border border-[#e6e8df] bg-[#fcfcf8] px-3 focus-within:border-[#9ab49a]">
                      <Search
                        size={16}
                        className="shrink-0 text-[#899083]"
                      />
                      <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={(event) =>
                          setSearchQuery(event.target.value)
                        }
                        placeholder="Search pages..."
                        aria-label="Search admin pages"
                        className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#a1a69a]"
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            setSearchOpen(false);
                          }

                          if (event.key === "Enter") {
                            goToSearchResult(searchQuery);
                          }
                        }}
                      />

                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          aria-label="Clear search"
                          className="rounded-lg p-1 text-[#899083] hover:bg-[#f0f2eb]"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <p className="px-1 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a8a5d]">
                      Quick navigation
                    </p>

                    <div className="space-y-1">
                      {[
                        {
                          title: "Dashboard",
                          hint: "Store overview",
                          path: "/admin",
                          icon: LayoutDashboard,
                        },
                        {
                          title: "Products",
                          hint: "Products and inventory",
                          path: "/admin/products",
                          icon: Package,
                        },
                        {
                          title: "Categories",
                          hint: "Organize collections",
                          path: "/admin/categories",
                          icon: Tags,
                        },
                        {
                          title: "Orders",
                          hint: "Purchases and delivery",
                          path: "/admin/orders",
                          icon: ShoppingBag,
                        },
                        {
                          title: "Customers",
                          hint: "Customer information",
                          path: "/admin/customers",
                          icon: Users,
                        },
                        {
                          title: "Reports",
                          hint: "Store performance",
                          path: "/admin/reports",
                          icon: LayoutDashboard,
                        },
                      ]
                        .filter((item) => {
                          const query = searchQuery.trim().toLowerCase();

                          return (
                            !query ||
                            item.title.toLowerCase().includes(query) ||
                            item.hint.toLowerCase().includes(query)
                          );
                        })
                        .map((item) => {
                          const Icon = item.icon;

                          return (
                            <button
                              key={item.path}
                              type="button"
                              onClick={() => {
                                navigate(item.path);
                                setSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#f1f5ed]"
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf3e9] text-[#356746]">
                                <Icon size={17} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-xs font-semibold text-[#344b37]">
                                  {item.title}
                                </span>
                                <span className="mt-0.5 block text-[10px] text-[#899083]">
                                  {item.hint}
                                </span>
                              </span>
                              <ArrowUpRight
                                size={14}
                                className="text-[#a1a69a]"
                              />
                            </button>
                          );
                        })}

                      {searchQuery &&
                        ![
                          "dashboard",
                          "products",
                          "categories",
                          "orders",
                          "customers",
                          "reports",
                        ].some((item) =>
                          item.includes(searchQuery.trim().toLowerCase())
                        ) && (
                          <p className="px-3 py-4 text-center text-xs text-[#899083]">
                            No matching admin pages found.
                          </p>
                        )}
                    </div>

                    <div className="mt-2 flex items-center gap-2 border-t border-[#edf0e8] px-1 pt-3 text-[10px] text-[#9a9f92]">
                      <Command size={12} />
                      <span>Choose a page to navigate</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationPanelRef}>
                <button
                  type="button"
                  onClick={() => {
                    const nextOpen = !notificationsOpen;

                    setNotificationsOpen(nextOpen);
                    setSearchOpen(false);
                    setProfileOpen(false);

                    if (nextOpen) {
                      loadNotifications({ silent: true });
                    }
                  }}
                  aria-label={
                    unreadCount
                      ? `Notifications, ${unreadCount} unread`
                      : "Notifications"
                  }
                  aria-expanded={notificationsOpen}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition focus:outline-none focus:ring-2 focus:ring-[#c4d5bd] ${
                    notificationsOpen
                      ? "bg-[#eaf0e6] text-[#285b3b]"
                      : "text-[#667365] hover:bg-[#edf2e9]"
                  }`}
                >
                  <Bell size={19} strokeWidth={1.8} />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-[#fffef9] bg-[#b84d3b] px-1 text-[9px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[#e7e8df] bg-white shadow-2xl shadow-[#243c2b]/10">
                    <div className="flex items-center justify-between border-b border-[#edf0e8] px-4 py-4">
                      <div>
                        <h2 className="text-sm font-bold text-[#244b32]">
                          Notifications
                        </h2>
                        <p className="mt-1 text-[11px] text-[#899083]">
                          {unreadCount} unread notification
                          {unreadCount === 1 ? "" : "s"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => loadNotifications()}
                          disabled={notificationsLoading}
                          title="Refresh notifications"
                          aria-label="Refresh notifications"
                          className="rounded-lg p-2 text-[#7a8576] transition hover:bg-[#f0f4eb] disabled:opacity-50"
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
                          onClick={markAllNotificationsRead}
                          disabled={markingAllRead || unreadCount === 0}
                          title="Mark all as read"
                          aria-label="Mark all notifications as read"
                          className="rounded-lg p-2 text-[#285b3b] transition hover:bg-[#f0f4eb] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {markingAllRead ? (
                            <RefreshCw
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCheck size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setNotificationsOpen(false)}
                          aria-label="Close notifications"
                          className="rounded-lg p-2 text-[#899083] transition hover:bg-[#f0f4eb]"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>

                    {notificationsError && (
                      <div className="flex gap-2 border-b border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
                        <AlertCircle
                          size={15}
                          className="mt-0.5 shrink-0"
                        />
                        <span className="break-words">
                          {notificationsError}
                        </span>
                      </div>
                    )}

                    <div className="max-h-[420px] overflow-y-auto">
                      {notificationsLoading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-[#899083]">
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />
                          Loading notifications...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff4eb] text-[#285b3b]">
                            <Bell size={21} />
                          </div>
                          <p className="mt-3 text-sm font-semibold text-[#344b37]">
                            You're all caught up
                          </p>
                          <p className="mx-auto mt-1 max-w-[245px] text-xs leading-5 text-[#899083]">
                            New orders and updates will appear here when
                            notifications are available.
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification) => {
                          const NotificationIcon =
                            getNotificationIcon(notification);

                          return (
                            <button
                              type="button"
                              key={notification.id}
                              onClick={() => openNotification(notification)}
                              disabled={
                                notificationActionId === notification.id
                              }
                              className={`flex w-full items-start gap-3 border-b border-[#f0f1e9] px-4 py-3.5 text-left transition hover:bg-[#f8faf5] disabled:opacity-60 ${
                                !notification.is_read ? "bg-[#f5f8f1]" : ""
                              }`}
                            >
                              <div
                                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                  !notification.is_read
                                    ? "bg-[#e9f1e5] text-[#285b3b]"
                                    : "bg-[#f4efdf] text-[#92743a]"
                                }`}
                              >
                                <NotificationIcon size={17} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p
                                    className={`text-xs leading-5 ${
                                      notification.is_read
                                        ? "font-medium text-[#566052]"
                                        : "font-bold text-[#244b32]"
                                    }`}
                                  >
                                    {notification.title || "Store update"}
                                  </p>

                                  {!notification.is_read && (
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#39744b]" />
                                  )}
                                </div>

                                <p className="mt-1 text-[11px] leading-[1.6] text-[#7b8376]">
                                  {notification.message || ""}
                                </p>

                                <p className="mt-1.5 text-[10px] text-[#a0a496]">
                                  {formatNotificationTime(
                                    notification.created_at
                                  )}
                                </p>
                              </div>

                              <span className="mt-1 text-[#9ba394]">
                                {notificationActionId === notification.id ? (
                                  <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : notification.is_read ? null : (
                                  <Check size={14} />
                                )}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate("/admin/orders");
                      }}
                      className="flex w-full items-center justify-center gap-2 border-t border-[#edf0e8] px-4 py-3 text-xs font-semibold text-[#285b3b] transition hover:bg-[#f6f8f2]"
                    >
                      View orders
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="mx-1 hidden h-8 w-px bg-[#e5e7dc] sm:block" />

              {/* Admin profile menu */}
              <div className="relative" ref={profilePanelRef}>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((open) => !open);
                    setNotificationsOpen(false);
                    setSearchOpen(false);
                  }}
                  aria-label="Open admin profile menu"
                  aria-expanded={profileOpen}
                  className="group flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-[#f0f3eb] focus:outline-none focus:ring-2 focus:ring-[#c4d5bd]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#39744b] to-[#244b32] text-white shadow-sm">
                    <Leaf size={17} />
                  </div>

                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-bold text-[#304834]">
                      Chithu's
                    </p>
                    <p className="text-[10px] text-[#899083]">
                      Store Admin
                    </p>
                  </div>

                  <ChevronDown
                    size={14}
                    className={`hidden text-[#899083] transition group-hover:text-[#285b3b] sm:block ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-[#e7e8df] bg-white shadow-xl shadow-[#243c2b]/10">
                    <div className="border-b border-[#edf0e8] bg-[#f8faf5] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#285b3b] text-white">
                          <Sprout size={21} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#244b32]">
                            Chithu's Natural Products
                          </p>
                          <p className="mt-1 text-[10px] text-[#899083]">
                            Store administration
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/admin");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#52604f] transition hover:bg-[#f1f5ed] hover:text-[#285b3b]"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/admin/customers");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#52604f] transition hover:bg-[#f1f5ed] hover:text-[#285b3b]"
                      >
                        <UserRound size={16} />
                        Customer management
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/admin/products");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#52604f] transition hover:bg-[#f1f5ed] hover:text-[#285b3b]"
                      >
                        <Settings size={16} />
                        Store management
                      </button>
                    </div>

                    <div className="border-t border-[#edf0e8] p-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#a4483d] transition hover:bg-[#fff1ee] disabled:opacity-50"
                      >
                        {signingOut ? (
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <LogOut size={16} />
                        )}
                        {signingOut ? "Signing out..." : "Sign out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <div className="relative mb-7 overflow-hidden rounded-2xl border border-[#e9e8dc] bg-[#fffef9] px-5 py-5 sm:px-7 sm:py-6">
            <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-[#edf2e7] opacity-80 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 right-28 h-32 w-32 rounded-full bg-[#f5eedb] opacity-70 blur-2xl" />

            <div className="relative flex items-center gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#e1e9dc] bg-[#f0f4eb] text-[#285b3b] sm:flex">
                <PageIcon size={22} />
              </div>

              <div className="min-w-0">
                <p className="mb-1.5 flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#9a8a5d] sm:text-[10px] sm:tracking-[0.22em]">
                  <span>CHITHU'S NATURAL PRODUCTS</span>
                  <span className="text-[#c9c8b9]">/</span>
                  <span>ADMINISTRATION</span>
                </p>

                <h1 className="text-2xl font-extrabold tracking-tight text-[#244b32] sm:text-3xl">
                  {page.title}
                </h1>

                <p className="mt-1.5 text-xs leading-5 text-[#7a8074] sm:text-sm">
                  {page.description}
                </p>
              </div>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
