import { useEffect, useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const SESSION_KEY = "chithus-dismissed-ad-";

export default function AdvertisementPopup() {
  const [advertisement, setAdvertisement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAdvertisement() {
      try {
        const { data, error } = await supabase
          .from("advertisement_campaigns")
          .select("id, title, image_url, target_url")
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (cancelled || !data) return;

        const dismissed =
          sessionStorage.getItem(`${SESSION_KEY}${data.id}`) === "true";

        if (!dismissed) {
          setAdvertisement(data);
        }
      } catch (error) {
        console.error("Unable to load advertisement:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAdvertisement();

    return () => {
      cancelled = true;
    };
  }, []);

  function closeAdvertisement() {
    if (advertisement) {
      sessionStorage.setItem(
        `${SESSION_KEY}${advertisement.id}`,
        "true"
      );
    }

    setAdvertisement(null);
  }

  useEffect(() => {
    if (!advertisement) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") closeAdvertisement();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [advertisement]);

  if (loading || !advertisement) return null;

  const hasTarget = Boolean(advertisement.target_url);
  const isInternal = advertisement.target_url?.startsWith("/");
  const isSafeProtocol =
    !hasTarget ||
    isInternal ||
    /^https?:\/\//i.test(advertisement.target_url);

  const imageContent = (
    <img
      src={advertisement.image_url}
      alt={advertisement.title || "Chithu's Natural Products advertisement"}
      className="block h-auto max-h-[82dvh] w-auto max-w-full object-contain"
    />
  );

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center
                 overflow-y-auto bg-[#10150f]/75 p-3
                 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeAdvertisement();
        }
      }}
      role="presentation"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2
                   h-[min(90vw,650px)] w-[min(90vw,650px)]
                   -translate-x-1/2 -translate-y-1/2 rounded-full
                   bg-[#C79A3B]/15 blur-[100px]"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={advertisement.title || "Advertisement"}
        className="relative z-10 flex max-h-[90dvh] max-w-[94vw]
                   flex-col items-center overflow-hidden rounded-[22px]
                   bg-[#173F2A] shadow-[0_25px_100px_rgba(0,0,0,0.55)]
                   ring-1 ring-white/15 sm:max-w-[min(90vw,560px)]"
      >
        {/* Floating close button */}
        <button
          type="button"
          onClick={closeAdvertisement}
          aria-label="Close advertisement"
          className="absolute right-3 top-3 z-20 flex h-10 w-10
                     items-center justify-center rounded-full
                     border border-white/40 bg-black/45 text-white
                     shadow-lg backdrop-blur-md transition duration-200
                     hover:rotate-90 hover:bg-black/75
                     focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-[#E8D5A8]"
        >
          <X size={21} strokeWidth={2.2} />
        </button>

        {/* Image fills its natural aspect ratio: no white side panels */}
        {hasTarget && isSafeProtocol ? (
          <a
            href={advertisement.target_url}
            target={isInternal ? "_self" : "_blank"}
            rel={isInternal ? undefined : "noopener noreferrer"}
            onClick={closeAdvertisement}
            aria-label={`View offer: ${advertisement.title || "Shop now"}`}
            className="block max-w-full overflow-hidden"
          >
            {imageContent}
          </a>
        ) : (
          imageContent
        )}

        
        
      </section>
    </div>
  );
}
