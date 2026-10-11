
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  RefreshCw,
  Search,
  Users,
  Mail,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("newsletter_subscribers")
        .select("email, is_active, subscribed_at, created_at")
        .order("subscribed_at", { ascending: false });

      if (queryError) throw queryError;

      setSubscribers(data ?? []);
    } catch (err) {
      console.error("Newsletter subscribers error:", err);
      setError(
        err?.code === "42501" || err?.code === "PGRST301"
          ? "You do not have permission to view subscribers. Sign in with an admin account."
          : "Could not load subscribers. Check the table, permissions, and connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  const filteredSubscribers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return subscribers;

    return subscribers.filter((subscriber) =>
      subscriber.email?.toLowerCase().includes(term)
    );
  }, [subscribers, search]);

  const exportCsv = () => {
    if (!filteredSubscribers.length) return;

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      ["Email", "Status", "Subscribed At"],
      ...filteredSubscribers.map((subscriber) => [
        subscriber.email,
        subscriber.is_active ? "Active" : "Inactive",
        subscriber.subscribed_at || subscriber.created_at || "",
      ]),
    ];

    const csv = "\uFEFF" + rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `chithus-newsletter-subscribers-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const activeCount = subscribers.filter(
    (subscriber) => subscriber.is_active
  ).length;

  return (
    <div className="min-h-screen space-y-6 bg-[#FAF8F2] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#65836B]">
            Customer Marketing
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#173F2A] sm:text-3xl">
            Newsletter Subscribers
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            View and export customers who subscribed to your newsletter.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadSubscribers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8E2D6] bg-white px-4 py-3 text-sm font-semibold text-[#285C3A] transition hover:bg-[#F0F5EF] disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCsv}
            disabled={!filteredSubscribers.length || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#173F2A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E8DD] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total subscribers</p>
              <p className="mt-2 text-3xl font-bold text-[#173F2A]">
                {loading ? "—" : subscribers.length}
              </p>
            </div>
            <div className="rounded-xl bg-[#E7F0E8] p-3 text-[#285C3A]">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E8DD] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active subscribers</p>
              <p className="mt-2 text-3xl font-bold text-[#173F2A]">
                {loading ? "—" : activeCount}
              </p>
            </div>
            <div className="rounded-xl bg-[#F7EED9] p-3 text-[#9A7426]">
              <Mail size={24} />
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#E5E8DD] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#EAEDE5] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-semibold text-[#173F2A]">
              Subscriber list
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {loading
                ? "Loading subscriber records..."
                : `${filteredSubscribers.length} result${
                    filteredSubscribers.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by email..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#65836B] focus:ring-2 focus:ring-[#E7F0E8]"
            />
          </div>
        </div>

        {error && (
          <div className="m-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load subscribers</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-gray-500">
            <LoaderCircle size={20} className="animate-spin" />
            Loading subscribers...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Check the error above, then select Refresh.
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
            <div className="rounded-full bg-[#E7F0E8] p-4 text-[#285C3A]">
              {search ? <Search size={25} /> : <Mail size={25} />}
            </div>
            <h3 className="mt-4 font-semibold text-[#173F2A]">
              {search ? "No matching subscribers" : "No subscribers yet"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              {search
                ? "Try another email address or clear your search."
                : "New newsletter signups will appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-[#F7F8F3] text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Email address</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Subscribed on</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubscribers.map((subscriber) => (
                    <tr
                      key={subscriber.email}
                      className="transition hover:bg-[#FAFBF8]"
                    >
                      <td className="px-5 py-4 font-medium text-gray-800">
                        {subscriber.email}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            subscriber.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <CheckCircle2 size={13} />
                          {subscriber.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {subscriber.subscribed_at || subscriber.created_at
                          ? new Date(
                              subscriber.subscribed_at ||
                                subscriber.created_at
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 px-5 py-4 text-xs text-gray-500">
              Email addresses are private customer data. Export and use them responsibly.
            </div>
          </>
        )}
      </section>
    </div>
  );
}
