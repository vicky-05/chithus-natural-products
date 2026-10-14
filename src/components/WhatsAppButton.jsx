
import { MessageCircle } from "lucide-react";
import { socialLinks } from "../config/socialLinks";

function WhatsAppButton() {
  const message = encodeURIComponent(
    "Hello Chithu's Natural Products, I would like to know more about your products."
  );

  const whatsappUrl = socialLinks.whatsapp
    ? `${socialLinks.whatsapp}?text=${message}`
    : "";

  if (!whatsappUrl) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Chithu's Natural Products on WhatsApp"

      className="group fixed bottom-[calc(66px+env(safe-area-inset-bottom)+12px)] right-4 z-[80] flex items-center gap-3 transition-all duration-300 sm:bottom-6 sm:right-6 sm:z-[100]"

    >
      {/* Label */}
      <span className="hidden rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#242821] shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:-translate-x-1 sm:block">
        Chat with us
      </span>

      {/* WhatsApp button */}
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.35)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_10px_35px_rgba(37,211,102,0.45)] sm:h-16 sm:w-16">
        {/* Pulse */}
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-20" />

        <MessageCircle
          size={28}
          strokeWidth={2}
          className="fill-white text-[#25D366]"
        />
      </span>
    </a>
  );
}

export default WhatsAppButton;
