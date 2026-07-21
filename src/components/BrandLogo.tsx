import React from "react";

/**
 * Shadow Root brand mark — the "SR" monogram inside a shield with circuit-roots,
 * drawn as inline SVG so it stays crisp at any size (retina / mobile) with zero
 * network weight. Colours come straight from the brand guide: green #22C55E,
 * white, on the near-black shield #0B0F14.
 */
export default function BrandLogo({
  className = "w-9 h-9",
  title = "Shadow Root"
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg viewBox="0 0 64 76" className={className} role="img" aria-label={`${title} logo`} fill="none">
      {/* Shield body */}
      <path
        d="M32 3 L57 14 V39 C57 55 45.5 66.5 32 73 C18.5 66.5 7 55 7 39 V14 Z"
        fill="#0b0f14"
        stroke="#22c55e"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Inner shield accent */}
      <path
        d="M32 9 L51.5 17.5 V38.5 C51.5 51.5 42.5 61 32 66.5 C21.5 61 12.5 51.5 12.5 38.5 V17.5 Z"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.12"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* SR monogram */}
      <text
        x="32"
        y="37"
        textAnchor="middle"
        fontFamily="'Space Grotesk', 'Inter', system-ui, sans-serif"
        fontWeight="800"
        fontSize="24"
        letterSpacing="-1.5"
      >
        <tspan fill="#ffffff">S</tspan>
        <tspan fill="#22c55e">R</tspan>
      </text>
      {/* Circuit roots */}
      <g stroke="#22c55e" strokeWidth="2" strokeLinecap="round" fill="#22c55e">
        {/* trunk */}
        <line x1="32" y1="42" x2="32" y2="55" />
        <circle cx="32" cy="57" r="2.4" stroke="none" />
        {/* left branch */}
        <path d="M32 46 L24 52 L24 57" fill="none" />
        <circle cx="24" cy="59" r="2" stroke="none" />
        {/* right branch */}
        <path d="M32 46 L40 52 L40 57" fill="none" />
        <circle cx="40" cy="59" r="2" stroke="none" />
      </g>
    </svg>
  );
}
