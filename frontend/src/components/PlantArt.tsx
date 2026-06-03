import React from 'react';

type PlantKind = 'monstera' | 'fig' | 'pothos' | 'snake' | 'succulent';

interface PlantArtProps {
  kind?: PlantKind;
  size?: number;
  style?: React.CSSProperties;
}

export function PlantArt({ kind = 'monstera', size = 64, style }: PlantArtProps) {
  const pot = (
    <g>
      <path d="M19 45 H45 L42 60 Q41.6 62 39.5 62 H24.5 Q22.4 62 22 60 Z" fill="#C98A5E"/>
      <path d="M17.5 43.5 H46.5 Q47.6 43.5 47.4 45 L47 47 Q46.8 48 45.5 48 H18.5 Q17.2 48 17 47 L16.6 45 Q16.4 43.5 17.5 43.5 Z" fill="#B97A4F"/>
    </g>
  );

  const arts: Record<PlantKind, React.ReactNode> = {
    monstera: (
      <g>
        <path d="M32 46 V26" stroke="#3A7D55" strokeWidth="2.4" strokeLinecap="round"/>
        <path d="M32 30 C20 30 13 22 13 12 C25 12 31 19 32 30 Z" fill="#256B45"/>
        <path d="M19 16 L24 21 M16 22 L22 24" stroke="#E9F1E4" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M32 30 C44 30 51 22 51 12 C39 12 33 19 32 30 Z" fill="#3A7D55"/>
        <path d="M45 16 L40 21 M48 22 L42 24" stroke="#E9F1E4" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M32 28 C32 16 36 7 32 3 C28 7 32 16 32 28 Z" fill="#2E7A4D"/>
      </g>
    ),
    fig: (
      <g>
        <path d="M32 46 V20" stroke="#3A7D55" strokeWidth="2.4" strokeLinecap="round"/>
        <ellipse cx="22" cy="16" rx="8" ry="11" fill="#2E7A4D" transform="rotate(-18 22 16)"/>
        <ellipse cx="43" cy="18" rx="7.5" ry="10" fill="#3A7D55" transform="rotate(16 43 18)"/>
        <ellipse cx="32" cy="9" rx="7.5" ry="10.5" fill="#256B45"/>
      </g>
    ),
    pothos: (
      <g>
        <path d="M32 46 C32 38 30 33 33 28" stroke="#3A7D55" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
        <path d="M32 40 C22 40 16 46 14 56 C24 56 31 50 32 40 Z" fill="#3A7D55"/>
        <path d="M33 34 C44 33 51 38 53 48 C43 49 35 44 33 34 Z" fill="#2E7A4D"/>
        <path d="M32 30 C24 28 19 22 19 14 C29 15 33 22 32 30 Z" fill="#256B45"/>
        <path d="M33 30 C41 27 47 21 47 13 C37 15 33 22 33 30 Z" fill="#479063"/>
      </g>
    ),
    snake: (
      <g>
        <path d="M28 47 C25 34 24 20 27 6 C30 19 31 33 31 47 Z" fill="#2E7A4D"/>
        <path d="M34 47 C33 33 34 19 38 7 C40 21 39 35 37 47 Z" fill="#3A7D55"/>
        <path d="M22 47 C20 37 19 27 21 16 C24 27 25 37 25 47 Z" fill="#479063"/>
        <path d="M27 8 C27 8 27.5 6 27 6 M38 9 C38 9 38.3 7 38 7" stroke="#E0A050" strokeWidth="1.6" strokeLinecap="round"/>
      </g>
    ),
    succulent: (
      <g>
        <path d="M32 44 L26 30 Q32 33 32 44 Z" fill="#3A7D55"/>
        <path d="M32 44 L38 30 Q32 33 32 44 Z" fill="#2E7A4D"/>
        <path d="M32 44 L20 34 Q28 33 32 44 Z" fill="#479063"/>
        <path d="M32 44 L44 34 Q36 33 32 44 Z" fill="#256B45"/>
        <path d="M32 44 L29 26 Q34 30 32 44 Z" fill="#5AA277"/>
        <circle cx="32" cy="40" r="3" fill="#2E7A4D"/>
      </g>
    ),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ display: 'block', ...style }}>
      {arts[kind] ?? arts.monstera}
      {pot}
    </svg>
  );
}
