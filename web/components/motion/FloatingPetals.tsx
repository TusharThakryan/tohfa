"use client";

/**
 * Decorative petals drifting down the hero. Values are deterministic
 * (no Math.random) so server and client markup always match.
 */
const PETALS = [
  { left: "2%", size: 13, delay: -7, duration: 19, opacity: 0.4, color: "#E3C4E5" },
  { left: "6%", size: 18, delay: 0, duration: 16, opacity: 0.5, color: "#C996CC" },
  { left: "11%", size: 10, delay: -13, duration: 22, opacity: 0.35, color: "#ECD9A0" },
  { left: "16%", size: 12, delay: 4, duration: 20, opacity: 0.4, color: "#F7E2E2" },
  { left: "22%", size: 16, delay: -3, duration: 17, opacity: 0.5, color: "#C996CC" },
  { left: "28%", size: 15, delay: 9, duration: 18, opacity: 0.45, color: "#E3C4E5" },
  { left: "34%", size: 11, delay: -10, duration: 21, opacity: 0.35, color: "#F7E2E2" },
  { left: "39%", size: 17, delay: -5, duration: 15, opacity: 0.5, color: "#E3C4E5" },
  { left: "44%", size: 10, delay: 2, duration: 22, opacity: 0.35, color: "#C996CC" },
  { left: "50%", size: 14, delay: -15, duration: 18, opacity: 0.45, color: "#ECD9A0" },
  { left: "58%", size: 16, delay: 12, duration: 17, opacity: 0.5, color: "#F7E2E2" },
  { left: "63%", size: 12, delay: -8, duration: 20, opacity: 0.4, color: "#C996CC" },
  { left: "68%", size: 18, delay: -1, duration: 16, opacity: 0.5, color: "#E3C4E5" },
  { left: "72%", size: 12, delay: 6, duration: 21, opacity: 0.4, color: "#ECD9A0" },
  { left: "78%", size: 14, delay: -12, duration: 19, opacity: 0.45, color: "#F7E2E2" },
  { left: "84%", size: 19, delay: 10, duration: 15, opacity: 0.55, color: "#C996CC" },
  { left: "89%", size: 10, delay: -6, duration: 23, opacity: 0.35, color: "#E3C4E5" },
  { left: "93%", size: 11, delay: 3, duration: 19, opacity: 0.35, color: "#E3C4E5" },
  { left: "97%", size: 15, delay: -9, duration: 17, opacity: 0.45, color: "#C996CC" },
];

export function FloatingPetals() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PETALS.map((p, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute -top-8 animate-petal-fall"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--petal-opacity" as string]: p.opacity,
          }}
        >
          <path
            d="M12 2 C18 6 20 13 12 22 C4 13 6 6 12 2Z"
            fill={p.color}
          />
        </svg>
      ))}
    </div>
  );
}
