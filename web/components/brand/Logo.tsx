import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Tohfa mark: a gift box whose gold ribbon forms a "T", with a flower
 * blooming out of the opening lid. Petals spread and the lid tilts on hover.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 52"
      fill="none"
      aria-hidden
      className={cn("h-9 w-9", className)}
    >
      <defs>
        <linearGradient id="tohfa-box" x1="0" y1="24" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C4AB6" />
          <stop offset="1" stopColor="#8B6CD1" />
        </linearGradient>
        <linearGradient id="tohfa-ribbon" x1="24" y1="16" x2="24" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECD9A0" />
          <stop offset="1" stopColor="#D4AF37" />
        </linearGradient>
      </defs>

      {/* Blooming flower */}
      <g className="origin-[24px_14px] transition-transform duration-500 ease-spring group-hover:-translate-y-1 group-hover:scale-110 [transform-box:fill-box] [transform-origin:center_bottom]">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="24"
            cy="9"
            rx="3.4"
            ry="6"
            fill="#C996CC"
            opacity="0.92"
            transform={`rotate(${angle} 24 14)`}
            className="transition-transform duration-500 ease-spring"
          />
        ))}
        <circle cx="24" cy="14" r="3.2" fill="#D4AF37" />
      </g>

      {/* Box body */}
      <rect x="8" y="24" width="32" height="24" rx="6" fill="url(#tohfa-box)" />

      {/* Lid - tilts open on hover */}
      <rect
        x="5.5"
        y="19"
        width="37"
        height="7.5"
        rx="3.75"
        fill="#533694"
        className="transition-transform duration-500 ease-spring [transform-box:fill-box] [transform-origin:12%_80%] group-hover:-rotate-6 group-hover:-translate-y-0.5"
      />

      {/* Gold ribbon forming a T */}
      <rect x="10" y="21" width="28" height="3.4" rx="1.7" fill="url(#tohfa-ribbon)" />
      <rect x="21.6" y="21" width="4.8" height="27" rx="2.4" fill="url(#tohfa-ribbon)" />
    </svg>
  );
}

export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Tohfa - home"
      className="group flex items-center gap-2.5"
    >
      <LogoMark />
      {withWordmark && (
        // The flower sits above the box, so true flex-centering rides high;
        // nudge the wordmark down to align with the box's visual center.
        <span className="translate-y-[0.22em] font-display text-[1.375rem] font-semibold tracking-tight text-ink">
          TOHFA
        </span>
      )}
    </Link>
  );
}
