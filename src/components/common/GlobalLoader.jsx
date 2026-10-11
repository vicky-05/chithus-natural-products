
import React from "react";
import logo from "../../assets/chithus-navbar-logo.png";

export default function GlobalLoader({
  fullScreen = true,
  message = "Preparing something natural for you...",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative flex flex-col items-center justify-center
        overflow-hidden bg-[#FAF8F2] px-6 ${
          fullScreen
            ? "fixed inset-0 z-[9999] min-h-screen"
            : "min-h-[320px] w-full rounded-2xl"
        }`}
    >
      <style>{`
        @keyframes botanicalOrbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes reverseOrbit {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes logoBreath {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.055);
          }
        }

        @keyframes softGlow {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.92);
          }
          50% {
            opacity: 0.55;
            transform: scale(1.08);
          }
        }

        @keyframes loadingProgress {
          0% {
            transform: translateX(-110%);
          }
          100% {
            transform: translateX(250%);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dotPulse {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-4px);
          }
        }

        .botanical-orbit {
          animation: botanicalOrbit 9s linear infinite;
        }

        .botanical-orbit-reverse {
          animation: reverseOrbit 13s linear infinite;
        }

        .botanical-logo {
          animation: logoBreath 3s ease-in-out infinite;
        }

        .botanical-glow {
          animation: softGlow 3s ease-in-out infinite;
        }

        .botanical-progress {
          animation: loadingProgress 1.7s
            cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .botanical-appear {
          animation: fadeUp 0.7s ease-out both;
        }

        .botanical-dot {
          animation: dotPulse 1.4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .botanical-orbit,
          .botanical-orbit-reverse,
          .botanical-logo,
          .botanical-glow,
          .botanical-progress,
          .botanical-dot {
            animation: none !important;
          }

          .botanical-appear {
            animation: none !important;
          }
        }
      `}</style>

      {/* Subtle background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24
          h-64 w-64 rounded-full bg-[#E7F0E8]/60 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28
          -right-20 h-72 w-72 rounded-full
          bg-[#E8D5A8]/30 blur-3xl"
      />

      {/* Botanical orbit loader */}
      <div className="botanical-appear relative flex h-40 w-40
        items-center justify-center sm:h-44 sm:w-44">

        {/* Outer static ring */}
        <div
          aria-hidden="true"
          className="absolute inset-1 rounded-full
            border border-[#D8C9A7]/60"
        />

        {/* Main rotating orbit */}
        <div
          aria-hidden="true"
          className="botanical-orbit absolute inset-0
            rounded-full border-[2px] border-transparent
            border-t-[#285C3A] border-r-[#285C3A]/30"
        >
          {/* Golden orbit point */}
          <span
            className="absolute -right-[5px] top-1/2
              h-[10px] w-[10px] -translate-y-1/2
              rounded-full border-2 border-[#FAF8F2]
              bg-[#C79A3B] shadow-sm"
          />
        </div>

        {/* Inner counter-rotating orbit */}
        <div
          aria-hidden="true"
          className="botanical-orbit-reverse absolute
            inset-[13px] rounded-full border
            border-dashed border-[#B89552]/55"
        >
          <span
            className="absolute left-[9px] top-[9px]
              h-2 w-2 rounded-full bg-[#78956F]"
          />
        </div>

        {/* Soft glow behind logo */}
        <div
          aria-hidden="true"
          className="botanical-glow absolute
            h-[100px] w-[100px] rounded-full
            bg-[#C79A3B]/20 blur-xl"
        />

        {/* Logo container */}
        <div
          className="relative z-10 flex h-[94px] w-[94px]
            items-center justify-center overflow-hidden
            rounded-full border border-white/90
            bg-white shadow-[0_8px_30px_rgba(36,75,54,0.12)]"
        >
          <img
            src={logo}
            alt="Chithu's Natural Products"
            className="botanical-logo h-full w-full
              object-contain p-2.5"
          />
        </div>

        {/* Four small botanical accents */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[-5px]
            h-2 w-2 -translate-x-1/2 rounded-full
            bg-[#78956F]"
        />

        <span
          aria-hidden="true"
          className="absolute bottom-[-5px] left-1/2
            h-2 w-2 -translate-x-1/2 rounded-full
            bg-[#C79A3B]"
        />
      </div>

      {/* Brand and loading message */}
      <div className="botanical-appear relative z-10 mt-7
        flex flex-col items-center">
        <p className="mb-2 text-[10px] font-semibold
          uppercase tracking-[0.32em] text-[#78956F]">
          Naturally yours
        </p>

        <h2 className="text-center text-lg font-bold
          tracking-wide text-[#244B36] sm:text-xl">
          Chithu's Natural Products
        </h2>

        <p className="mt-2 max-w-xs text-center text-sm
          leading-6 text-[#77796F]">
          {message}
        </p>

        {/* Animated loading indicator */}
        <div
          className="mt-6 h-[3px] w-36 overflow-hidden
            rounded-full bg-[#E5D9BE]"
          aria-hidden="true"
        >
          <div className="botanical-progress h-full w-1/3
            rounded-full bg-gradient-to-r from-[#78956F]
            via-[#285C3A] to-[#C79A3B]"
          />
        </div>

        {/* Animated dots */}
        <div
          aria-hidden="true"
          className="mt-4 flex items-center gap-2"
        >
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="botanical-dot h-1.5 w-1.5
                rounded-full bg-[#78956F]"
              style={{
                animationDelay: `${dot * 180}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom brand detail */}
      <p className="botanical-appear absolute bottom-5
        text-[9px] font-medium uppercase tracking-[0.24em]
        text-[#A49A83]">
        Made with nature in mind
      </p>
    </div>
  );
}
