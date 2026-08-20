/**
 * Stylized luxury bouquet illustration. Pure SVG, server-safe.
 * The hero wraps it in a motion container for mouse parallax + float.
 */

const OUTER_PETAL = "M0 6 C -20 -6 -24 -40 0 -56 C 24 -40 20 -6 0 6 Z";
const RING_8 = [0, 45, 90, 135, 180, 225, 270, 315];

export function Bouquet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 500" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id="bq-wrap" x1="120" y1="280" x2="300" y2="500" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBEDEE" />
          <stop offset="1" stopColor="#F7E2E2" />
        </linearGradient>
        <linearGradient id="bq-wrap-inner" x1="210" y1="270" x2="210" y2="420" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9CFD3" />
          <stop offset="1" stopColor="#DFBFC6" />
        </linearGradient>
        <linearGradient id="bq-rose" x1="150" y1="90" x2="270" y2="220" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B6CD1" />
          <stop offset="1" stopColor="#6C4AB6" />
        </linearGradient>
        <linearGradient id="bq-gold" x1="170" y1="330" x2="250" y2="390" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECD9A0" />
          <stop offset="1" stopColor="#D4AF37" />
        </linearGradient>
        <radialGradient id="bq-peony" cx="0.5" cy="0.42" r="0.62">
          <stop stopColor="#E3C4E5" />
          <stop offset="1" stopColor="#C996CC" />
        </radialGradient>
        <radialGradient id="bq-glow" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft luminous halo behind the blooms */}
      <circle cx="210" cy="165" r="140" fill="url(#bq-glow)" opacity="0.7" />

      {/* Stems */}
      <g stroke="#7FAF92" strokeWidth="5.5" strokeLinecap="round" opacity="0.9">
        <path d="M210 300 L207 165" />
        <path d="M195 305 L136 172" />
        <path d="M225 305 L290 166" />
        <path d="M185 310 L98 218" />
        <path d="M235 310 L324 213" />
        <path d="M205 300 L170 115" />
        <path d="M218 300 L256 106" />
        <path d="M198 302 L172 216" />
        <path d="M222 302 L248 211" />
      </g>

      {/* Leaves */}
      <g fill="#8EC5A4">
        <path d="M158 235 Q128 210 130 178 Q162 190 166 224 Q163 233 158 235Z" />
        <path d="M262 230 Q294 208 292 176 Q259 188 255 222 Q257 228 262 230Z" opacity="0.9" />
        <path d="M196 250 Q176 218 184 190 Q208 208 206 244 Q201 250 196 250Z" opacity="0.8" />
        <path d="M148 268 Q112 254 100 226 Q136 228 152 256 Q152 264 148 268Z" opacity="0.85" />
        <path d="M272 264 Q308 250 320 222 Q284 226 268 252 Q268 260 272 264Z" opacity="0.85" />
      </g>

      {/* Eucalyptus dots along the outer stems */}
      <g fill="#A8D4B8" opacity="0.9">
        {[
          [118, 238], [104, 224], [92, 208], [84, 192],
          [304, 234], [318, 219], [328, 202], [336, 186],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="6.5" />
        ))}
      </g>

      {/* Lavender sprigs */}
      <g fill="#8B6CD1" opacity="0.85">
        {[
          [100, 220], [92, 204], [86, 188], [82, 172], [79, 156],
          [322, 215], [330, 199], [336, 183], [340, 167], [343, 151],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="7" ry="10" transform={`rotate(${i < 5 ? -32 : 32} ${x} ${y})`} />
        ))}
      </g>

      {/* Gypsophila - baby's breath dots */}
      <g fill="#FFFFFF" stroke="#F0E2EE" strokeWidth="1">
        {[
          [128, 132], [155, 108], [244, 96], [284, 128], [110, 176],
          [305, 168], [180, 88], [232, 74], [148, 152], [270, 100],
          [120, 108], [300, 92], [205, 62], [96, 148], [326, 140],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 6 : 4.5} />
        ))}
      </g>

      {/* Gold tulips */}
      <g fill="url(#bq-gold)">
        <path d="M170 115 q-16 -34 0 -52 q8 14 12 12 q4 2 12 -12 q16 18 0 52 q-12 8 -24 0Z" />
        <path d="M256 106 q-16 -34 0 -52 q8 14 12 12 q4 2 12 -12 q16 18 0 52 q-12 8 -24 0Z" opacity="0.95" />
      </g>

      {/* Side peonies - layered petal rings */}
      {[
        [134, 172],
        [292, 166],
      ].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          {RING_8.map((a) => (
            <path
              key={a}
              d={OUTER_PETAL}
              transform={`rotate(${a + 22.5}) scale(0.68)`}
              fill="url(#bq-peony)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
          ))}
          <circle r="18" fill="#D5A8D8" />
          <circle r="9" fill="#B27CB6" />
        </g>
      ))}

      {/* Blush mini roses filling the lower gaps */}
      {[
        [172, 216],
        [248, 211],
      ].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          <circle r="22" fill="#F0C9DD" />
          <circle r="14" fill="#DFA8CD" />
          <circle r="7" fill="#C583B8" />
        </g>
      ))}

      {/* Center rose - two petal rings around a spiral heart */}
      <g transform="translate(208 145)">
        <circle r="58" fill="url(#bq-rose)" opacity="0.35" />
        {RING_8.map((a) => (
          <path
            key={a}
            d={OUTER_PETAL}
            transform={`rotate(${a})`}
            fill="url(#bq-rose)"
            stroke="#EDE4FB"
            strokeWidth="1.5"
            strokeOpacity="0.55"
          />
        ))}
        {RING_8.map((a) => (
          <path
            key={a}
            d={OUTER_PETAL}
            transform={`rotate(${a + 22.5}) scale(0.6)`}
            fill="#7C58C4"
            stroke="#EDE4FB"
            strokeWidth="1.5"
            strokeOpacity="0.45"
          />
        ))}
        <circle r="16" fill="#5A3B9E" />
        <path
          d="M0 -13 a13 13 0 0 1 13 13 a10 10 0 0 1 -10 10 a8 8 0 0 1 -8 -8 a6 6 0 0 1 6 -6"
          stroke="#EDE4FB"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </g>

      {/* Gold sparkles */}
      <g fill="#D4AF37">
        {[
          [104, 118, 1], [318, 96, 0.9], [206, 46, 0.8],
          [78, 250, 0.7], [344, 244, 0.7], [156, 66, 0.6],
        ].map(([x, y, s], i) => (
          <path
            key={i}
            d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z"
            transform={`translate(${x} ${y}) scale(${s})`}
            opacity={0.55 + (i % 3) * 0.15}
          />
        ))}
      </g>

      {/* Wrapping - back cone, inner shadow, front fold */}
      <path d="M120 282 L210 470 L112 388 Z" fill="url(#bq-wrap)" />
      <path d="M300 282 L210 470 L308 388 Z" fill="url(#bq-wrap)" />
      <path d="M138 276 L282 276 L210 452 Z" fill="url(#bq-wrap-inner)" />
      <path d="M120 282 L210 470 L300 282 L282 300 L210 452 L138 300 Z" fill="#FBEDEE" opacity="0.6" />
      <path d="M120 282 L210 470 L300 282" stroke="#E4C2CA" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      <path d="M138 276 L210 452 L282 276" stroke="url(#bq-gold)" strokeWidth="1.8" fill="none" strokeLinejoin="round" opacity="0.8" />

      {/* Ribbon bow */}
      <g>
        <path d="M210 352 q-40 -26 -52 2 q-6 22 24 20 q22 -2 28 -22Z" fill="url(#bq-gold)" />
        <path d="M210 352 q40 -26 52 2 q6 22 -24 20 q-22 -2 -28 -22Z" fill="url(#bq-gold)" />
        <path d="M204 360 q-12 34 -26 46 l16 -2 q14 -18 18 -40Z" fill="#D4AF37" opacity="0.85" />
        <path d="M216 360 q12 34 26 46 l-16 -2 q-14 -18 -18 -40Z" fill="#D4AF37" opacity="0.85" />
        <ellipse cx="188" cy="352" rx="10" ry="5" fill="#F6E8BE" opacity="0.7" transform="rotate(-18 188 352)" />
        <ellipse cx="232" cy="352" rx="10" ry="5" fill="#F6E8BE" opacity="0.7" transform="rotate(18 232 352)" />
        <circle cx="210" cy="356" r="9" fill="#B8962E" />
        <circle cx="207" cy="353" r="3" fill="#F6E8BE" opacity="0.8" />
      </g>
    </svg>
  );
}
