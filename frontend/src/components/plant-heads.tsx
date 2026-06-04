/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import type { HeadKey } from '../types/plant';

/* Each head renders its geometry in the 64×64 viewBox. PlantIcon wraps the
   head in an assembly transform so its visual centre lands at y≈20. */

function Daisy() {
  return (
    <g>
      <g className="petal">
        <ellipse cx="32" cy="12.5" rx="2.4" ry="6.5"/>
        <ellipse cx="36.75" cy="13.77" rx="2.4" ry="6.5" transform="rotate(30 36.75 13.77)"/>
        <ellipse cx="40.23" cy="17.25" rx="2.4" ry="6.5" transform="rotate(60 40.23 17.25)"/>
        <ellipse cx="41.5"  cy="22"    rx="2.4" ry="6.5" transform="rotate(90 41.5 22)"/>
        <ellipse cx="40.23" cy="26.75" rx="2.4" ry="6.5" transform="rotate(120 40.23 26.75)"/>
        <ellipse cx="36.75" cy="30.23" rx="2.4" ry="6.5" transform="rotate(150 36.75 30.23)"/>
        <ellipse cx="32"    cy="31.5"  rx="2.4" ry="6.5"/>
        <ellipse cx="27.25" cy="30.23" rx="2.4" ry="6.5" transform="rotate(30 27.25 30.23)"/>
        <ellipse cx="23.77" cy="26.75" rx="2.4" ry="6.5" transform="rotate(60 23.77 26.75)"/>
        <ellipse cx="22.5"  cy="22"    rx="2.4" ry="6.5" transform="rotate(90 22.5 22)"/>
        <ellipse cx="23.77" cy="17.25" rx="2.4" ry="6.5" transform="rotate(120 23.77 17.25)"/>
        <ellipse cx="27.25" cy="13.77" rx="2.4" ry="6.5" transform="rotate(150 27.25 13.77)"/>
      </g>
      <circle className="center" cx="32" cy="22" r="5.2"/>
    </g>
  );
}

function Iris() {
  return (
    <g>
      <g className="petal">
        <ellipse cx="32"   cy="13" rx="2.7" ry="6.2"/>
        <ellipse cx="26.3" cy="15" rx="2.6" ry="6"   transform="rotate(-24 26.3 15)"/>
        <ellipse cx="37.7" cy="15" rx="2.6" ry="6"   transform="rotate(24 37.7 15)"/>
        <ellipse cx="32"   cy="30" rx="3.3" ry="6.6"/>
        <ellipse cx="24"   cy="27" rx="3.2" ry="6.4" transform="rotate(-48 24 27)"/>
        <ellipse cx="40"   cy="27" rx="3.2" ry="6.4" transform="rotate(48 40 27)"/>
      </g>
      <g className="accent">
        <ellipse cx="32"   cy="27" rx="1.1" ry="3.2"/>
        <ellipse cx="26.5" cy="26" rx="1"   ry="2.8" transform="rotate(-40 26.5 26)"/>
        <ellipse cx="37.5" cy="26" rx="1"   ry="2.8" transform="rotate(40 37.5 26)"/>
      </g>
    </g>
  );
}

function Orchid() {
  return (
    <g>
      <g className="petal">
        <ellipse cx="32"   cy="13"   rx="3"   ry="5"/>
        <ellipse cx="22.5" cy="17.5" rx="2.9" ry="5" transform="rotate(-36 22.5 17.5)"/>
        <ellipse cx="41.5" cy="17.5" rx="2.9" ry="5" transform="rotate(36 41.5 17.5)"/>
        <ellipse cx="24"   cy="26.5" rx="6.4" ry="5.4"/>
        <ellipse cx="40"   cy="26.5" rx="6.4" ry="5.4"/>
      </g>
      <ellipse className="center" cx="32" cy="25" rx="3.2" ry="3.8"/>
      <g className="accent">
        <circle cx="30.4" cy="22.6" r="1"/>
        <circle cx="33.6" cy="22.6" r="1"/>
      </g>
    </g>
  );
}

function Lily() {
  return (
    <g>
      <g className="petal">
        <path d="M32 24 C27.5 14 29.5 6 32 5 C34.5 6 36.5 14 32 24 Z"/>
        <path d="M32 24 C27.5 14 29.5 6 32 5 C34.5 6 36.5 14 32 24 Z" transform="rotate(60 32 24)"/>
        <path d="M32 24 C27.5 14 29.5 6 32 5 C34.5 6 36.5 14 32 24 Z" transform="rotate(120 32 24)"/>
        <path d="M32 24 C27.5 14 29.5 6 32 5 C34.5 6 36.5 14 32 24 Z" transform="rotate(180 32 24)"/>
        <path d="M32 24 C27.5 14 29.5 6 32 5 C34.5 6 36.5 14 32 24 Z" transform="rotate(240 32 24)"/>
        <path d="M32 24 C27.5 14 29.5 6 32 5 C34.5 6 36.5 14 32 24 Z" transform="rotate(300 32 24)"/>
      </g>
      <circle className="center" cx="32" cy="24" r="3.4"/>
      <g className="accent-stroke" strokeWidth={1.3}>
        <path d="M32 24 L28.5 19"/>
        <path d="M32 24 L32 17.5"/>
        <path d="M32 24 L35.5 19"/>
      </g>
      <g className="accent">
        <circle cx="28.2" cy="18.4" r="1.2"/>
        <circle cx="32"   cy="16.8" r="1.2"/>
        <circle cx="35.8" cy="18.4" r="1.2"/>
      </g>
    </g>
  );
}

function Cluster() {
  return (
    <g>
      <g className="petal">
        <circle cx="32"   cy="12.5" r="2.7"/>
        <circle cx="27.5" cy="14"   r="2.7"/>
        <circle cx="36.5" cy="14"   r="2.7"/>
        <circle cx="23.5" cy="18.5" r="2.7"/>
        <circle cx="28.5" cy="18.5" r="2.7"/>
        <circle cx="35.5" cy="18.5" r="2.7"/>
        <circle cx="40.5" cy="18.5" r="2.7"/>
        <circle cx="32"   cy="18.5" r="2.7"/>
        <circle cx="26"   cy="23"   r="2.7"/>
        <circle cx="31"   cy="23"   r="2.7"/>
        <circle cx="37"   cy="23"   r="2.7"/>
        <circle cx="29"   cy="27"   r="2.6"/>
        <circle cx="34.5" cy="27"   r="2.6"/>
      </g>
      <g className="center">
        <circle cx="32"   cy="12.5" r="0.95"/>
        <circle cx="27.5" cy="14"   r="0.95"/>
        <circle cx="36.5" cy="14"   r="0.95"/>
        <circle cx="23.5" cy="18.5" r="0.95"/>
        <circle cx="28.5" cy="18.5" r="0.95"/>
        <circle cx="35.5" cy="18.5" r="0.95"/>
        <circle cx="40.5" cy="18.5" r="0.95"/>
        <circle cx="32"   cy="18.5" r="0.95"/>
        <circle cx="26"   cy="23"   r="0.95"/>
        <circle cx="31"   cy="23"   r="0.95"/>
        <circle cx="37"   cy="23"   r="0.95"/>
        <circle cx="29"   cy="27"   r="0.9"/>
        <circle cx="34.5" cy="27"   r="0.9"/>
      </g>
    </g>
  );
}

function Spike() {
  return (
    <g>
      <path className="stem" d="M32 33 V9" strokeWidth={1.6}/>
      <g className="petal">
        <ellipse cx="32" cy="9.5"  rx="2"   ry="2.6"/>
        <ellipse cx="29" cy="14"   rx="2.3"  ry="2.9"/>
        <ellipse cx="35" cy="14"   rx="2.3"  ry="2.9"/>
        <ellipse cx="28" cy="19"   rx="2.6"  ry="3.1"/>
        <ellipse cx="36" cy="19"   rx="2.6"  ry="3.1"/>
        <ellipse cx="28" cy="24"   rx="2.7"  ry="3.2"/>
        <ellipse cx="36" cy="24"   rx="2.7"  ry="3.2"/>
        <ellipse cx="29" cy="29"   rx="2.6"  ry="3.1"/>
        <ellipse cx="35" cy="29"   rx="2.6"  ry="3.1"/>
      </g>
    </g>
  );
}

function Poppy() {
  return (
    <g>
      <g className="petal">
        <ellipse cx="32"   cy="16.8" rx="5.4" ry="5"/>
        <ellipse cx="38.2" cy="20.9" rx="5.4" ry="5"/>
        <ellipse cx="35.6" cy="28.2" rx="5.4" ry="5"/>
        <ellipse cx="28.4" cy="28.2" rx="5.4" ry="5"/>
        <ellipse cx="25.8" cy="20.9" rx="5.4" ry="5"/>
      </g>
      <circle className="center" cx="32" cy="23" r="3.4"/>
      <g className="accent">
        <circle cx="32"   cy="19.4" r="0.85"/>
        <circle cx="35.4" cy="22"   r="0.85"/>
        <circle cx="34.1" cy="25.8" r="0.85"/>
        <circle cx="29.9" cy="25.8" r="0.85"/>
        <circle cx="28.6" cy="22"   r="0.85"/>
      </g>
    </g>
  );
}

function Rose() {
  return (
    <g>
      <g className="petal">
        <ellipse cx="32"   cy="13.5" rx="3.2" ry="4"/>
        <ellipse cx="38"   cy="15.7" rx="3.2" ry="4" transform="rotate(45 38 15.7)"/>
        <ellipse cx="40.5" cy="22"   rx="3.2" ry="4" transform="rotate(90 40.5 22)"/>
        <ellipse cx="38"   cy="28.3" rx="3.2" ry="4" transform="rotate(135 38 28.3)"/>
        <ellipse cx="32"   cy="30.5" rx="3.2" ry="4"/>
        <ellipse cx="26"   cy="28.3" rx="3.2" ry="4" transform="rotate(45 26 28.3)"/>
        <ellipse cx="23.5" cy="22"   rx="3.2" ry="4" transform="rotate(90 23.5 22)"/>
        <ellipse cx="26"   cy="15.7" rx="3.2" ry="4" transform="rotate(135 26 15.7)"/>
      </g>
      <g className="petal">
        <ellipse cx="32"   cy="18.4" rx="2.5" ry="3.1"/>
        <ellipse cx="35.5" cy="20.8" rx="2.5" ry="3.1" transform="rotate(55 35.5 20.8)"/>
        <ellipse cx="34.4" cy="25"   rx="2.5" ry="3.1" transform="rotate(120 34.4 25)"/>
        <ellipse cx="29.6" cy="25"   rx="2.5" ry="3.1" transform="rotate(60 29.6 25)"/>
        <ellipse cx="28.5" cy="20.8" rx="2.5" ry="3.1" transform="rotate(125 28.5 20.8)"/>
      </g>
      <circle className="petal" cx="32" cy="22" r="2.6"/>
      <path className="accent-stroke" strokeWidth={1} d="M30.6 22 a1.4 1.4 0 1 0 2.8 0"/>
    </g>
  );
}

function Tulip() {
  return (
    <g>
      <g className="petal">
        <path d="M24 22 C24 31 27 35 32 35 C37 35 40 31 40 22 Z"/>
        <path d="M28 22 C28 11 31 8 32 8 C33 8 36 11 36 22 Z"/>
        <path d="M24 22 C23 14 25 11 28 13 C28 16 27 19 27 22 Z"/>
        <path d="M40 22 C41 14 39 11 36 13 C36 16 37 19 37 22 Z"/>
      </g>
      <path className="accent-stroke" strokeWidth={1.1} d="M29.5 13 C28.5 20 28.5 28 30.5 34"/>
      <path className="accent-stroke" strokeWidth={1.1} d="M34.5 13 C35.5 20 35.5 28 33.5 34"/>
    </g>
  );
}

function Bell() {
  return (
    <g>
      <path className="stem" d="M30 35 C28 27 29 17 37 11" strokeWidth={1.6}/>
      <ellipse className="petal" cx="37.6" cy="10.6" rx="1.5" ry="2.3" transform="rotate(30 37.6 10.6)"/>
      <g className="petal">
        <path d="M34 13 C32.2 16 32 20 32.6 21.2 C34.5 22.8 37.5 22.8 39.4 21.2 C40 20 39.8 16 38 13 Z" transform="rotate(18 36 13)"/>
        <path d="M29 18 C27.2 21 27 25 27.6 26.2 C29.5 27.8 32.5 27.8 34.4 26.2 C35 25 34.8 21 33 18 Z" transform="rotate(-10 31 18)"/>
      </g>
      <g className="accent-stroke" strokeWidth={1}>
        <path d="M33.2 21.6 C35 23 37 23 38.8 21.6" transform="rotate(18 36 13)"/>
        <path d="M28.2 26.6 C30 28 32 28 33.8 26.6" transform="rotate(-10 31 18)"/>
      </g>
    </g>
  );
}

export const PLANT_HEADS: Record<HeadKey, React.FC> = {
  daisy:   Daisy,
  iris:    Iris,
  orchid:  Orchid,
  lily:    Lily,
  cluster: Cluster,
  spike:   Spike,
  poppy:   Poppy,
  rose:    Rose,
  tulip:   Tulip,
  bell:    Bell,
};

/* Assembly transforms — scale / position each head to seat at y≈20 on a base */
export const HEAD_ASSEMBLY: Partial<Record<HeadKey, string>> = {
  daisy:  'translate(32 20.5) scale(1.16) translate(-32 -19)',
  iris:   'translate(32 21) scale(0.92) translate(-32 -21)',
  orchid: 'translate(32 22) scale(0.92) translate(-32 -22)',
};

/* Connecting stem (+ optional side leaves) rendered before the pot for each head */
export const HEAD_STEM: Partial<Record<HeadKey, React.ReactNode>> = {
  daisy: (
    <>
      <path className="stem" d="M32 46 C31 39 31 31 32 26" strokeWidth={2.2}/>
      <path className="leaf-2" d="M31 38 C26 36 22 37 20 40 C24 40 28 39 31 39 Z"/>
      <path className="leaf-3" d="M33 34 C38 32 42 33 44 36 C40 36 36 35 33 35 Z"/>
    </>
  ),
  orchid: (
    <path className="stem" d="M30 46 C27 37 29 28 32 24" strokeWidth={1.8}/>
  ),
  tulip: (
    <path className="stem" d="M32 46 V34" strokeWidth={2.2}/>
  ),
  spike: (
    /* spike includes its own internal stem; just bridge from the base */
    <path className="stem" d="M32 46 V33" strokeWidth={1.8}/>
  ),
};

export const DEFAULT_BLOOM_STEM = (
  <path className="stem" d="M32 46 V28" strokeWidth={2}/>
);

export const HEAD_LABELS: Record<HeadKey, string> = {
  daisy:   'Daisy',
  iris:    'Iris',
  orchid:  'Orchid',
  lily:    'Lily',
  cluster: 'Cluster',
  spike:   'Spike',
  poppy:   'Poppy',
  rose:    'Rose',
  tulip:   'Tulip',
  bell:    'Bell',
};
