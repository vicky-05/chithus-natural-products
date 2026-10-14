import { useEffect, useState } from "react";
import { Languages, Check, ChevronDown } from "lucide-react";

export default function GoogleTranslate() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    // Configure GTranslate with English as the default language.
    window.gtranslateSettings = {
      default_language: "en",
      native_language_names: true,
      languages: ["en", "ta"],
      wrapper_selector: ".gtranslate_wrapper",
    };

    // Prevent loading the widget script more than once.
    if (!document.getElementById("gtranslate-widget-script")) {
      const script = document.createElement("script");

      script.id = "gtranslate-widget-script";
      script.src =
        "https://cdn.gtranslate.net/widgets/latest/dropdown.js";
      script.defer = true;

      document.body.appendChild(script);
    }
  }, []);

  const changeLanguage = (lang) => {
    if (lang === language) {
      setOpen(false);
      return;
    }

    if (typeof window.doGTranslate === "function") {
      window.doGTranslate(`en|${lang}`);
      setLanguage(lang);
      setOpen(false);
    } else {
      console.warn(
        "Google Translate is not ready. Please try again."
      );
    }
  };

  return (
    <div className="navbar-translator relative inline-flex items-center">
      {/* Hidden translation widget */}
      <div
        className="gtranslate_wrapper"
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clipPath: "inset(50%)",
          whiteSpace: "nowrap",
        }}
      />

      {/* Language icon button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Select website language"
        aria-expanded={open}
        className="flex h-10 items-center gap-1.5 rounded-lg px-2.5
          text-[#24352a] transition-colors hover:bg-[#f0eadc]
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-[#c99a3b]"
      >
        <Languages size={21} strokeWidth={1.8} />
        <ChevronDown
          size={14}
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Custom language menu */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Close language menu"
            className="fixed inset-0 z-[90] cursor-default"
            onClick={() => setOpen(false)}
          />

          <div
            role="menu"
            aria-label="Choose language"
            className="absolute right-0 top-full z-[100] mt-2
              min-w-36 overflow-hidden rounded-xl
              border border-[#e8dfcd] bg-white p-1.5
              text-[#24352a] shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => changeLanguage("en")}
              className="flex w-full items-center justify-between
                gap-4 rounded-lg px-3 py-2.5 text-sm
                hover:bg-[#f7f2e7]"
            >
              <span>English</span>
              {language === "en" && (
                <Check size={16} className="text-[#b58a2b]" />
              )}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => changeLanguage("ta")}
              className="flex w-full items-center justify-between
                gap-4 rounded-lg px-3 py-2.5 text-sm
                hover:bg-[#f7f2e7]"
            >
              <span>தமிழ்</span>
              {language === "ta" && (
                <Check size={16} className="text-[#b58a2b]" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}