import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Clock3, LoaderCircle, MessageSquareText, RefreshCw, Search, Star, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const formatDate = (value) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let query = supabase
        .from("product_reviews")
        .select("id, product_id, reviewer_name, rating, review_text, is_approved, created_at, products(name, slug)")
        .order("created_at", { ascending: false });
      if (filter === "pending") query = query.eq("is_approved", false);
      if (filter === "approved") query = query.eq("is_approved", true);
      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      setReviews(data || []);
    } catch (err) {
      console.error("Unable to load reviews:", err);
      setError("Reviews could not be loaded. Check the product_reviews admin RLS policies and try again.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void loadReviews(); }, [loadReviews]);

  const visibleReviews = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reviews;
    return reviews.filter((review) =>
      [review.reviewer_name, review.review_text, review.products?.name]
        .some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [reviews, search]);

  const approveReview = async (review) => {
    setBusyId(review.id); setMessage(""); setError("");
    try {
      const { error: updateError } = await supabase
        .from("product_reviews")
        .update({ is_approved: true, updated_at: new Date().toISOString() })
        .eq("id", review.id)
        .eq("is_approved", false);
      if (updateError) throw updateError;
      setMessage("Review approved. It can now appear on the product page.");
      await loadReviews();
    } catch (err) {
      console.error("Unable to approve review:", err);
      setError("Could not approve this review. Verify your admin RLS policy and try again.");
    } finally { setBusyId(""); }
  };

  const rejectReview = async (review) => {
    const confirmed = window.confirm("Reject and permanently delete this pending review? This cannot be undone.");
    if (!confirmed) return;
    setBusyId(review.id); setMessage(""); setError("");
    try {
      const { error: deleteError } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", review.id)
        .eq("is_approved", false);
      if (deleteError) throw deleteError;
      setMessage("Pending review rejected and deleted.");
      await loadReviews();
    } catch (err) {
      console.error("Unable to reject review:", err);
      setError("Could not reject this review. Verify your admin RLS policy and try again.");
    } finally { setBusyId(""); }
  };

  return (
    <main className="min-h-full bg-[#FAF7EF] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A87826]">Store feedback</p>
            <h1 className="mt-2 text-2xl font-extrabold text-[#244b32] sm:text-3xl">Customer Reviews</h1>
            <p className="mt-2 text-sm text-[#697366]">Review customer feedback before it appears publicly on product pages.</p>
          </div>
          <button onClick={() => void loadReviews()} type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe3d8] bg-white px-4 py-2 text-sm font-semibold text-[#285b3b] hover:bg-[#edf1e8]">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e8e7dc] bg-white p-4"><p className="text-sm text-[#697366]">Loaded reviews</p><p className="mt-2 text-2xl font-extrabold text-[#244b32]">{reviews.length}</p></div>
          <div className="rounded-2xl border border-[#e8e7dc] bg-white p-4"><p className="text-sm text-[#697366]">Pending in current view</p><p className="mt-2 text-2xl font-extrabold text-[#9b7b36]">{filter === "pending" ? reviews.length : "—"}</p></div>
          <div className="rounded-2xl border border-[#e8e7dc] bg-white p-4"><p className="text-sm text-[#697366]">Current filter</p><p className="mt-2 text-lg font-bold capitalize text-[#244b32]">{filter === "all" ? "All reviews" : filter}</p></div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#e8e7dc] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {[{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "all", label: "All reviews" }].map((item) => (
              <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === item.value ? "bg-[#285b3b] text-white" : "bg-[#f2f3ec] text-[#586354] hover:bg-[#e7ecdf]"}`}>{item.label}</button>
            ))}
          </div>
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#e2e3d9] px-3 sm:w-80">
            <Search size={17} className="shrink-0 text-[#899083]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, product, review" className="w-full bg-transparent text-sm outline-none" />
          </label>
        </div>

        {message && <p role="status" className="mt-4 rounded-xl border border-[#cfe2d0] bg-[#edf7ed] p-3 text-sm text-[#285b3b]">{message}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {loading ? (
          <div className="mt-8 flex min-h-48 items-center justify-center gap-3 text-sm text-[#697366]"><LoaderCircle className="animate-spin" size={22} /> Loading reviews…</div>
        ) : visibleReviews.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#d8dccf] bg-white px-5 py-14 text-center">
            <MessageSquareText className="mx-auto text-[#8a9484]" size={34} />
            <h2 className="mt-4 text-lg font-bold text-[#244b32]">No reviews found</h2>
            <p className="mt-2 text-sm text-[#697366]">There are no reviews matching this filter or search.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {visibleReviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-[#e8e7dc] bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-[#244b32]">{review.reviewer_name}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${review.is_approved ? "bg-[#e7f3e7] text-[#285b3b]" : "bg-[#fbf1d9] text-[#8a6823]"}`}>{review.is_approved ? "Approved" : "Pending"}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#697366]">Product: <span className="font-semibold text-[#3f4d40]">{review.products?.name || "Product unavailable"}</span></p>
                    <div className="mt-3 flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} className={star <= Number(review.rating) ? "fill-[#C79A3B] text-[#C79A3B]" : "text-[#ddd8c8]"} />)}
                      <span className="ml-1 text-xs text-[#697366]">{review.rating}/5</span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#4d584d]">{review.review_text}</p>
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-[#858a7e]"><Clock3 size={14} /> Submitted {formatDate(review.created_at)}</p>
                  </div>
                  {!review.is_approved && <div className="flex shrink-0 gap-2 lg:flex-col">
                    <button type="button" disabled={busyId === review.id} onClick={() => void approveReview(review)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#285b3b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e462d] disabled:opacity-50"><Check size={16} /> {busyId === review.id ? "Saving…" : "Approve"}</button>
                    <button type="button" disabled={busyId === review.id} onClick={() => void rejectReview(review)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={16} /> Reject</button>
                  </div>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
