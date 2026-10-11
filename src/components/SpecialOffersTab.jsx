import { useEffect, useState } from "react";
import { Gift, X, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function SpecialOffersTab() {
    const [campaign, setCampaign] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadCampaign() {
            try {
                const now = new Date().toISOString();

                const { data, error } = await supabase
                    .from("advertisement_campaigns")
                    .select("id, title, image_url, target_url")
                    .eq("is_active", true)
                    .or(`starts_at.is.null,starts_at.lte.${now}`)
                    .or(`ends_at.is.null,ends_at.gte.${now}`)
                    .order("updated_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) throw error;

                if (!cancelled) {
                    setCampaign(data);
                }
            } catch (error) {
                console.error("Unable to load special offer:", error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadCampaign();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    if (loading || !campaign) return null;

    const destination = campaign.target_url?.trim() || "";

    const isInternal =
        destination.startsWith("/") && !destination.startsWith("//");

    const validDestination =
        isInternal || /^https?:\/\/\S+$/i.test(destination);

    return (
        <>
            
            {/* Compact floating Special Offers button */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="View special offers"
                aria-expanded={open}
                className="
    fixed right-2 top-1/2 z-[80]
    flex h-11 w-11 -translate-y-1/2
    items-center justify-center
    rounded-full border border-[#C79A3B]/60
    bg-[#173F2A] text-[#F8EBCB]
    shadow-md transition duration-200
    hover:bg-[#285C3A] hover:shadow-lg
    active:scale-95
    focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-[#C79A3B]
    sm:right-3 sm:h-12 sm:w-12
  "
            >
                <Gift size={21} />
            </button>

            {/* Backdrop and offer panel */}
            {open && (
                <div
                    className="
            fixed inset-0 z-[10001]
            flex justify-end
            bg-black/45 backdrop-blur-[3px]
          "
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setOpen(false);
                        }
                    }}
                    role="presentation"
                >
                    <aside
                        role="dialog"
                        aria-modal="true"
                        aria-label="Special offers"
                        className="
              relative flex h-full w-full max-w-md
              flex-col overflow-y-auto
              bg-[#FAF7EF] shadow-2xl
              animate-in slide-in-from-right duration-300
            "
                    >
                        {/* Panel header */}
                        <div
                            className="
                relative overflow-hidden
                bg-[#173F2A] px-5 pb-5 pt-7
                text-white sm:px-6 sm:pb-6 sm:pt-8
              "
                        >
                            <div
                                aria-hidden="true"
                                className="
                  pointer-events-none absolute
                  -right-10 -top-10 h-36 w-36
                  rounded-full bg-[#C79A3B]/15 blur-2xl
                "
                            />

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Close special offers"
                                className="
                  absolute right-3 top-3
                  flex h-9 w-9 items-center justify-center
                  rounded-full border border-white/20
                  bg-white/10 transition hover:bg-white/20
                  sm:right-4 sm:top-4 sm:h-10 sm:w-10
                "
                            >
                                <X size={19} />
                            </button>

                            <div className="relative flex items-center gap-2 text-[#E8D5A8]">
                                <Sparkles size={16} />

                                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-xs">
                                    Made with love
                                </span>
                            </div>

                            <h2 className="relative mt-3 text-xl font-bold sm:text-2xl">
                                Special Offers
                            </h2>

                            <p className="relative mt-2 max-w-xs text-sm leading-6 text-white/75">
                                Discover traditional goodness from Chithu's Natural Products.
                            </p>
                        </div>

                        {/* Campaign content */}
                        <div className="flex-1 p-4 sm:p-6">
                            <div className="overflow-hidden rounded-2xl border border-[#DDD8C8] bg-white shadow-sm">
                                <img
                                    src={campaign.image_url}
                                    alt={campaign.title || "Special offer"}
                                    className="
                    mx-auto block max-h-[52dvh]
                    w-full bg-[#FAF7EF] object-contain
                  "
                                />

                                <div className="p-4 sm:p-5">
                                    <span
                                        className="
                      inline-flex items-center gap-1.5
                      rounded-full bg-[#E7F0E8]
                      px-3 py-1 text-xs font-semibold
                      text-[#285C3A]
                    "
                                    >
                                        <Gift size={13} />
                                        Featured campaign
                                    </span>

                                    <h3 className="mt-3 break-words text-lg font-bold text-[#242821] sm:text-xl">
                                        {campaign.title}
                                    </h3>

                                    {validDestination && (
                                        <a
                                            href={destination}
                                            target={isInternal ? "_self" : "_blank"}
                                            rel={
                                                isInternal ? undefined : "noopener noreferrer"
                                            }
                                            onClick={() => setOpen(false)}
                                            className="
                        mt-4 inline-flex w-full items-center
                        justify-center gap-2 rounded-xl
                        bg-[#285C3A] px-4 py-3
                        text-sm font-semibold text-white
                        transition hover:bg-[#173F2A]
                        sm:mt-5 sm:py-3.5
                      "
                                        >
                                            Explore Offer
                                            <ArrowRight size={17} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                                Traditional goodness, made with love.
                            </p>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}
