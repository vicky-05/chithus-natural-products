
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  PackageCheck,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Leaf,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getNotificationPath = (notification) => {
  const link = notification.link;

  if (notification.category === "order") {
    return "/orders";
  }

  const allowedRoutes = [
    "/",
    "/shop",
    "/cart",
    "/my-account",
    "/my-addresses",
    "/orders",
    "/track-order",
    "/wishlist",
  ];

  return allowedRoutes.includes(link) ? link : "/my-account";
};

export default function Notifications() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const loadNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      setError("");

      try {
        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!currentUser) {
          setUser(null);
          setNotifications([]);
          return;
        }

        setUser(currentUser);

        const { data, error: queryError } = await supabase
          .from("notifications")
          .select(
            "id, user_id, category, type, title, message, icon, link, is_read, metadata, created_at, read_at"
          )
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(100);

        if (queryError) throw queryError;

        setNotifications(data ?? []);
      } catch (err) {
        console.error("Loading notifications failed:", err);
        setError(err?.message || "Unable to load notifications.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    let channel;

    const initialise = async () => {
      await loadNotifications();

      if (cancelled) return;

      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (cancelled || authError || !currentUser) return;

      channel = supabase
        .channel(`customer-notifications-page-${currentUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${currentUser.id}`,
          },
          () => {
            loadNotifications({ silent: true });
          }
        )
        .subscribe();
    };

    initialise();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadNotifications]);

  const markOneAsRead = async (notification) => {
    if (!user || notification.is_read || actionId) return true;

    setActionId(notification.id);
    setError("");

    const readAt = new Date().toISOString();

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: readAt,
        })
        .eq("id", notification.id)
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (updateError) throw updateError;

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true, read_at: readAt }
            : item
        )
      );

      return true;
    } catch (err) {
      console.error("Marking notification as read failed:", err);
      setError(err?.message || "Unable to mark notification as read.");
      return false;
    } finally {
      setActionId(null);
    }
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0 || markingAll) return;

    setMarkingAll(true);
    setError("");

    const readAt = new Date().toISOString();

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: readAt,
        })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (updateError) throw updateError;

      setNotifications((current) =>
        current.map((item) =>
          item.is_read
            ? item
            : { ...item, is_read: true, read_at: readAt }
        )
      );
    } catch (err) {
      console.error("Mark all as read failed:", err);
      setError(err?.message || "Unable to update notifications.");
    } finally {
      setMarkingAll(false);
    }
  };

  const openNotification = async (notification) => {
    if (actionId) return;

    const success = await markOneAsRead(notification);

    if (success) {
      navigate(getNotificationPath(notification));
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="flex items-center justify-center gap-3 text-sm text-[#667064]">
          <RefreshCw size={19} className="animate-spin" />
          Loading your notifications...
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F0E8] text-[#285C3A]">
          <Bell size={28} />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-[#173F2A]">
          Sign in to view notifications
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#737B70]">
          Sign in to see your order confirmations and updates.
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-6 rounded-xl bg-[#285C3A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173F2A]"
        >
          Sign in
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Page heading */}
      <div className="overflow-hidden rounded-3xl border border-[#E6E4D8] bg-[#FFFDF8]">
        <div className="relative overflow-hidden bg-[#173F2A] px-5 py-8 text-white sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Bell size={27} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8D5A8]">
                YOUR ACCOUNT
              </p>

              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                Notifications
              </h1>

              <p className="mt-2 text-xs leading-5 text-white/75 sm:text-sm">
                Stay updated on your orders and account activity.
              </p>
            </div>
          </div>
        </div>

        {/* Summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECE9DE] px-5 py-4 sm:px-8">
          <div>
            <p className="text-sm font-bold text-[#173F2A]">
              Your inbox
            </p>
            <p className="mt-1 text-xs text-[#737B70]">
              {notifications.length} notification
              {notifications.length === 1 ? "" : "s"} · {unreadCount} unread
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadNotifications()}
              disabled={loading}
              aria-label="Refresh notifications"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2D8C8] text-[#285C3A] transition hover:bg-[#E7F0E8] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
            </button>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || markingAll}
              className="flex min-h-10 items-center gap-2 rounded-xl border border-[#DCE6D7] bg-[#F2F6EE] px-3 text-xs font-semibold text-[#285C3A] transition hover:bg-[#E7F0E8] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
            >
              {markingAll ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <CheckCheck size={16} />
              )}
              <span className="hidden sm:inline">Mark all read</span>
              <span className="sm:hidden">Read all</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="m-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700 sm:m-6">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {/* Notifications list */}
        {notifications.length === 0 ? (
          <div className="px-5 py-16 text-center sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F0E8] text-[#285C3A]">
              <Bell size={28} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#173F2A]">
              You're all caught up
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#737B70]">
              When you place an order or its status changes, your
              notifications will appear here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#285C3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173F2A]"
            >
              Explore products
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#EEEBDD]">
            {notifications.map((notification) => {
              const isOrder = notification.category === "order";

              return (
                <article
                  key={notification.id}
                  className={`flex items-start gap-3 px-4 py-5 transition sm:gap-4 sm:px-8 ${
                    notification.is_read
                      ? "bg-white"
                      : "bg-[#F5F8F1]"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      isOrder
                        ? "bg-[#E7F0E8] text-[#285C3A]"
                        : "bg-[#F5EEDB] text-[#92743A]"
                    }`}
                  >
                    {isOrder ? (
                      <ShoppingBag size={20} />
                    ) : (
                      <Leaf size={20} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        className={`break-words text-sm ${
                          notification.is_read
                            ? "font-semibold text-[#455346]"
                            : "font-bold text-[#173F2A]"
                        }`}
                      >
                        {notification.title}
                      </h2>

                      {!notification.is_read && (
                        <span className="rounded-full bg-[#E0ECDD] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#285C3A]">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 break-words text-sm leading-6 text-[#667064]">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-[11px] text-[#92988E]">
                      {formatDate(notification.created_at)}
                    </p>

                    <button
                      type="button"
                      onClick={() => openNotification(notification)}
                      disabled={actionId === notification.id}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#285C3A] transition hover:text-[#173F2A] disabled:opacity-50"
                    >
                      {actionId === notification.id ? (
                        <RefreshCw
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <ArrowRight size={14} />
                      )}
                      {isOrder ? "View my orders" : "View details"}
                    </button>
                  </div>

                  {!notification.is_read && (
                    <span
                      aria-label="Unread"
                      className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#39744B]"
                    />
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-[#E6E4D8] bg-[#FAF8F2] px-5 py-4 text-xs text-[#737B70] sm:px-8">
          <PackageCheck size={16} className="shrink-0 text-[#285C3A]" />
          Your order updates are available whenever you sign in.
        </div>
      </div>
    </section>
  );
}
