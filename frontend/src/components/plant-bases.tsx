/* eslint-disable react-refresh/only-export-components */
import React, { useId } from 'react';
import type { BaseKey } from '../types/plant';

/* Each base receives the pot element and places it at the correct layer position.
   Variegation: all 4 overlay groups are always in the DOM; CSS + data-veg controls
   which one is visible. The clip-path contains the leaf silhouettes so markings
   never spill past a leaf edge. */

interface BaseProps {
  pot: React.ReactNode;
}

type BaseRecord = Record<BaseKey, React.FC<BaseProps>>;

// ─── Shared helpers ──────────────────────────────────────────────────────────

function uid(base: string) {
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  return useId().replace(/[^a-zA-Z0-9]/g, '') + base;
}

// ─── 1. Fenestrated tropical (Monstera) ──────────────────────────────────────

function FenestratedTropical({ pot }: BaseProps) {
  const cid = uid('ft');
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <path d="M32 30 C20 30 13 22 13 12 C25 12 31 19 32 30 Z"/>
          <path d="M32 30 C44 30 51 22 51 12 C39 12 33 19 32 30 Z"/>
          <path d="M32 28 C32 16 36 7 32 3 C28 7 32 16 32 28 Z"/>
        </clipPath>
      </defs>
      <path className="stem" d="M32 46 V26" strokeWidth={2.4}/>
      <path className="leaf-1" d="M32 30 C20 30 13 22 13 12 C25 12 31 19 32 30 Z"/>
      <path className="vein" d="M19 16 L24 21 M16 22 L22 24" strokeWidth={1.6}/>
      <path className="leaf-2" d="M32 30 C44 30 51 22 51 12 C39 12 33 19 32 30 Z"/>
      <path className="vein" d="M45 16 L40 21 M48 22 L42 24" strokeWidth={1.6}/>
      <path className="leaf-3" d="M32 28 C32 16 36 7 32 3 C28 7 32 16 32 28 Z"/>

      {/* speckle */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <ellipse cx="20" cy="18" rx="2.2" ry="2.6"/>
        <circle  cx="26" cy="24" r="1.3"/>
        <ellipse cx="18" cy="24" rx="1.5" ry="1.9"/>
        <circle  cx="23" cy="27" r="1.1"/>
        <ellipse cx="44" cy="18" rx="2.0" ry="2.4"/>
        <circle  cx="40" cy="24" r="1.3"/>
        <ellipse cx="46" cy="24" rx="1.5" ry="1.9"/>
        <circle  cx="38" cy="27" r="1.1"/>
        <circle  cx="32" cy="10" r="1.2"/>
        <circle  cx="31" cy="17" r="1.0"/>
      </g>
      {/* marble */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <path d="M32 30 C25 28 20 23 19 15 C24 16 27 19 27 30 Z"/>
        <ellipse cx="46" cy="19" rx="5.5" ry="5.0"/>
        <ellipse cx="32" cy="9"  rx="2.8" ry="6.5"/>
      </g>
      {/* margin */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={3.4}>
        <path d="M32 30 C20 30 13 22 13 12 C25 12 31 19 32 30 Z"/>
        <path d="M32 30 C44 30 51 22 51 12 C39 12 33 19 32 30 Z"/>
        <path d="M32 28 C32 16 36 7 32 3 C28 7 32 16 32 28 Z"/>
      </g>
      {/* center */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`} strokeWidth={1.9}>
        <path d="M32 30 L14 13"/>
        <path d="M32 30 L50 13"/>
        <path d="M32 28 L32 3"/>
      </g>

      {pot}
    </>
  );
}

// ─── 2. Single-trunk tree (Fiddle-leaf / Rubber / Money) ─────────────────────

function SingleTrunkTree({ pot }: BaseProps) {
  const cid = uid('st');
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <ellipse cx="22" cy="16" rx="8"   ry="11"   transform="rotate(-18 22 16)"/>
          <ellipse cx="43" cy="18" rx="7.5" ry="10"   transform="rotate(16 43 18)"/>
          <ellipse cx="32" cy="9"  rx="7.5" ry="10.5"/>
        </clipPath>
      </defs>
      <path className="stem" d="M32 46 V20" strokeWidth={2.4}/>
      <ellipse className="leaf-2" cx="22" cy="16" rx="8"   ry="11"   transform="rotate(-18 22 16)"/>
      <ellipse className="leaf-3" cx="43" cy="18" rx="7.5" ry="10"   transform="rotate(16 43 18)"/>
      <ellipse className="leaf-1" cx="32" cy="9"  rx="7.5" ry="10.5"/>

      {/* speckle */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <circle cx="19" cy="13" r="1.4"/>
        <circle cx="23" cy="18" r="1.2"/>
        <circle cx="17" cy="19" r="1.0"/>
        <circle cx="42" cy="14" r="1.3"/>
        <circle cx="46" cy="19" r="1.2"/>
        <circle cx="40" cy="21" r="1.1"/>
        <circle cx="30" cy="6"  r="1.3"/>
        <circle cx="33" cy="12" r="1.1"/>
      </g>
      {/* marble */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <ellipse cx="20" cy="12" rx="5" ry="7" transform="rotate(-18 20 12)"/>
        <ellipse cx="44" cy="14" rx="4.5" ry="6.5" transform="rotate(16 44 14)"/>
        <ellipse cx="32" cy="5"  rx="4"  ry="7"/>
      </g>
      {/* margin */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={3.4}>
        <ellipse cx="22" cy="16" rx="8"   ry="11"   transform="rotate(-18 22 16)"/>
        <ellipse cx="43" cy="18" rx="7.5" ry="10"   transform="rotate(16 43 18)"/>
        <ellipse cx="32" cy="9"  rx="7.5" ry="10.5"/>
      </g>
      {/* center */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`} strokeWidth={2}>
        <path d="M22 5 L22 27"   transform="rotate(-18 22 16)"/>
        <path d="M43 8 L43 28"   transform="rotate(16 43 18)"/>
        <path d="M32 -1.5 L32 20"/>
      </g>

      {pot}
    </>
  );
}

// ─── 3. Upright sword (Snake plant / ZZ / Dracaena) ─────────────────────────

function UprightSword({ pot }: BaseProps) {
  const cid = uid('us');
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <path d="M22 47 C20 37 19 27 21 16 C24 27 25 37 25 47 Z"/>
          <path d="M28 47 C25 34 24 20 27 6 C30 19 31 33 31 47 Z"/>
          <path d="M34 47 C33 33 34 19 38 7 C40 21 39 35 37 47 Z"/>
        </clipPath>
      </defs>
      <path className="leaf-3" d="M22 47 C20 37 19 27 21 16 C24 27 25 37 25 47 Z"/>
      <path className="leaf-1" d="M28 47 C25 34 24 20 27 6 C30 19 31 33 31 47 Z"/>
      <path className="leaf-2" d="M34 47 C33 33 34 19 38 7 C40 21 39 35 37 47 Z"/>
      {/* sun tips — hardcoded amber, not slot-driven */}
      <path d="M27 7 L27 11 M38 8 L38 12" stroke="#E0A050" strokeWidth={1.4} strokeLinecap="round" fill="none"/>

      {/* speckle — horizontal flecks like real snake-plant cross-banding */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <ellipse cx="23" cy="20" rx="1.5" ry="0.7"/>
        <ellipse cx="23" cy="27" rx="1.6" ry="0.7"/>
        <ellipse cx="23" cy="34" rx="1.5" ry="0.7"/>
        <ellipse cx="29" cy="14" rx="1.6" ry="0.7"/>
        <ellipse cx="29" cy="21" rx="1.6" ry="0.7"/>
        <ellipse cx="29" cy="29" rx="1.6" ry="0.7"/>
        <ellipse cx="29" cy="38" rx="1.5" ry="0.7"/>
        <ellipse cx="36" cy="15" rx="1.6" ry="0.7"/>
        <ellipse cx="36" cy="23" rx="1.6" ry="0.7"/>
        <ellipse cx="36" cy="31" rx="1.5" ry="0.7"/>
        <ellipse cx="36" cy="40" rx="1.4" ry="0.7"/>
      </g>
      {/* marble */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <path d="M22 47 C20 37 19 27 21 16 C22.5 27 22.5 37 23.5 47 Z"/>
        <path d="M28 47 C25 34 24 20 27 6 C28.5 19 28.5 34 29.5 47 Z"/>
        <path d="M34 47 C33 33 34 19 38 7 C36.5 21 36 35 35 47 Z"/>
      </g>
      {/* margin */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={3}>
        <path d="M22 47 C20 37 19 27 21 16 C24 27 25 37 25 47 Z"/>
        <path d="M28 47 C25 34 24 20 27 6 C30 19 31 33 31 47 Z"/>
        <path d="M34 47 C33 33 34 19 38 7 C40 21 39 35 37 47 Z"/>
      </g>
      {/* center — vertical midrib of each blade */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`} strokeWidth={1.8}>
        <path d="M23.5 16 L23.5 47"/>
        <path d="M29 6 L29 47"/>
        <path d="M36 7 L36 47"/>
      </g>

      {pot}
    </>
  );
}

// ─── 4. Trailing vine (Pothos / Heartleaf philo / Ivy) ───────────────────────
// Pot sits BEHIND the trailing foliage — placed before the leaves.

function TrailingVine({ pot }: BaseProps) {
  const cid = uid('tv');
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <path d="M32 40 C22 40 16 46 14 56 C24 56 31 50 32 40 Z"/>
          <path d="M33 34 C44 33 51 38 53 48 C43 49 35 44 33 34 Z"/>
          <path d="M32 30 C24 28 19 22 19 14 C29 15 33 22 32 30 Z"/>
          <path d="M33 30 C41 27 47 21 47 13 C37 15 33 22 33 30 Z"/>
        </clipPath>
      </defs>
      <path className="stem" d="M32 46 C32 38 30 33 33 28" strokeWidth={2.2}/>
      {pot}
      <path className="leaf-2" d="M32 40 C22 40 16 46 14 56 C24 56 31 50 32 40 Z"/>
      <path className="leaf-1" d="M33 34 C44 33 51 38 53 48 C43 49 35 44 33 34 Z"/>
      <path className="leaf-1" d="M32 30 C24 28 19 22 19 14 C29 15 33 22 32 30 Z"/>
      <path className="leaf-3" d="M33 30 C41 27 47 21 47 13 C37 15 33 22 33 30 Z"/>

      {/* speckle */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <ellipse cx="24" cy="20" rx="2.3" ry="2.7"/>
        <circle  cx="28.5" cy="24" r="1.3"/>
        <ellipse cx="41" cy="20" rx="2.1" ry="2.5"/>
        <circle  cx="36.5" cy="24" r="1.2"/>
        <ellipse cx="47" cy="42" rx="2.3" ry="2.7"/>
        <circle  cx="42" cy="45" r="1.3"/>
        <ellipse cx="21" cy="49" rx="2.3" ry="2.7"/>
        <circle  cx="25.5" cy="52" r="1.2"/>
        <circle  cx="32" cy="18" r="1.1"/>
        <circle  cx="32" cy="46" r="1.1"/>
      </g>
      {/* marble */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <path d="M32 30 C25 28 20 23 19 15 C24 16 27 19 27 30 Z"/>
        <ellipse cx="48" cy="44" rx="5.5" ry="5"/>
        <ellipse cx="18" cy="52" rx="5"   ry="5.5"/>
        <ellipse cx="43" cy="18" rx="3.6" ry="4.6"/>
      </g>
      {/* margin */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={3.4}>
        <path d="M32 40 C22 40 16 46 14 56 C24 56 31 50 32 40 Z"/>
        <path d="M33 34 C44 33 51 38 53 48 C43 49 35 44 33 34 Z"/>
        <path d="M32 30 C24 28 19 22 19 14 C29 15 33 22 32 30 Z"/>
        <path d="M33 30 C41 27 47 21 47 13 C37 15 33 22 33 30 Z"/>
      </g>
      {/* center */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`} strokeWidth={1.9}>
        <path d="M31 41 L18 52"/>
        <path d="M34 36 L49 45"/>
        <path d="M31 29 L21 17"/>
        <path d="M34 29 L44 16"/>
      </g>
    </>
  );
}

// ─── 5. Rosette succulent (Echeveria / Aloe / Haworthia) ─────────────────────

function RosetteSucculent({ pot }: BaseProps) {
  const cid = uid('rs');
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <path d="M32 44 L20 34 Q28 33 32 44 Z"/>
          <path d="M32 44 L44 34 Q36 33 32 44 Z"/>
          <path d="M32 44 L26 30 Q32 33 32 44 Z"/>
          <path d="M32 44 L38 30 Q32 33 32 44 Z"/>
          <path d="M32 44 L29 26 Q34 30 32 44 Z"/>
          <path d="M32 44 L35 26 Q30 30 32 44 Z"/>
        </clipPath>
      </defs>
      <path className="leaf-1" d="M32 44 L20 34 Q28 33 32 44 Z"/>
      <path className="leaf-1" d="M32 44 L44 34 Q36 33 32 44 Z"/>
      <path className="leaf-2" d="M32 44 L26 30 Q32 33 32 44 Z"/>
      <path className="leaf-2" d="M32 44 L38 30 Q32 33 32 44 Z"/>
      <path className="leaf-3" d="M32 44 L29 26 Q34 30 32 44 Z"/>
      <path className="leaf-3" d="M32 44 L35 26 Q30 30 32 44 Z"/>
      <circle className="leaf-2" cx="32" cy="41" r="2.4"/>
      {/* legacy dot bloom — visible when --bloom is set */}
      <path className="bloom-stroke" d="M31 31 C24 27 20 22 18 16" strokeWidth={1.6}/>
      <path className="bloom-stroke" d="M33 31 C40 27 44 22 46 16" strokeWidth={1.6}/>
      <circle className="bloom" cx="18" cy="15" r="2.2"/>
      <circle className="bloom" cx="46" cy="15" r="2.2"/>
      <circle className="bloom" cx="21" cy="19" r="1.5"/>
      <circle className="bloom" cx="43" cy="19" r="1.5"/>

      {/* speckle */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <circle cx="24" cy="37" r="1.2"/>
        <circle cx="22" cy="39" r="0.9"/>
        <circle cx="42" cy="37" r="1.2"/>
        <circle cx="44" cy="39" r="0.9"/>
        <circle cx="28" cy="34" r="1.0"/>
        <circle cx="36" cy="34" r="1.0"/>
        <circle cx="30" cy="30" r="0.9"/>
        <circle cx="34" cy="30" r="0.9"/>
      </g>
      {/* marble */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <path d="M32 44 L20 34 Q24 34 27 40 Z"/>
        <path d="M32 44 L44 34 Q40 34 37 40 Z"/>
        <path d="M32 44 L26 30 Q29 32 30 39 Z"/>
        <path d="M32 44 L38 30 Q35 32 34 39 Z"/>
        <path d="M32 44 L29 26 Q31 29 31.5 38 Z"/>
        <path d="M32 44 L35 26 Q33 29 32.5 38 Z"/>
      </g>
      {/* margin */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={3}>
        <path d="M32 44 L20 34 Q28 33 32 44 Z"/>
        <path d="M32 44 L44 34 Q36 33 32 44 Z"/>
        <path d="M32 44 L26 30 Q32 33 32 44 Z"/>
        <path d="M32 44 L38 30 Q32 33 32 44 Z"/>
        <path d="M32 44 L29 26 Q34 30 32 44 Z"/>
        <path d="M32 44 L35 26 Q30 30 32 44 Z"/>
      </g>
      {/* center — lines from petal base to tip */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`} strokeWidth={1.6}>
        <path d="M32 44 L20 34"/>
        <path d="M32 44 L44 34"/>
        <path d="M32 44 L26 30"/>
        <path d="M32 44 L38 30"/>
        <path d="M32 44 L29 26"/>
        <path d="M32 44 L35 26"/>
      </g>

      {pot}
    </>
  );
}

// ─── 6. Strappy arching (Spider plant / Airplane plant) ──────────────────────
// vein-veg paths provide the natural center stripe; always visible when
// --variegation is set (intentional — spider plants have a white centre streak).

function StrappyArching({ pot }: BaseProps) {
  const cid = uid('sa');
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <path d="M31 44 C23 36 15 32 8 32 C15 30 24 34 31 43 Z"/>
          <path d="M33 44 C41 36 49 32 56 32 C49 30 40 34 33 43 Z"/>
          <path d="M31 44 C22 42 13 43 7 49 C14 43 23 43 31 45 Z"/>
          <path d="M33 44 C42 42 51 43 57 49 C50 43 41 43 33 45 Z"/>
          <path d="M31 44 C30 33 30 24 31 17 C32 25 32 33 32 44 Z"/>
          <path d="M33 44 C34 34 35 26 36 20 C36 28 35 35 33 44 Z"/>
          <path d="M32 44 C30.5 34 31 24 32 18 C33 25 33.5 34 32.5 44 Z"/>
        </clipPath>
      </defs>
      <path className="leaf-1" d="M31 44 C23 36 15 32 8 32 C15 30 24 34 31 43 Z"/>
      <path className="leaf-1" d="M33 44 C41 36 49 32 56 32 C49 30 40 34 33 43 Z"/>
      <path className="leaf-2" d="M31 44 C22 42 13 43 7 49 C14 43 23 43 31 45 Z"/>
      <path className="leaf-2" d="M33 44 C42 42 51 43 57 49 C50 43 41 43 33 45 Z"/>
      <path className="leaf-2" d="M31 44 C30 33 30 24 31 17 C32 25 32 33 32 44 Z"/>
      <path className="leaf-3" d="M33 44 C34 34 35 26 36 20 C36 28 35 35 33 44 Z"/>
      <path className="leaf-3" d="M32 44 C30.5 34 31 24 32 18 C33 25 33.5 34 32.5 44 Z"/>
      {/* natural centre stripe — shown for any variegation color */}
      <path className="vein-veg" d="M31.5 43 C31 33 31 24 31.5 18" strokeWidth={1.3}/>
      <path className="vein-veg" d="M33.5 43 C34.5 34 35 27 35.6 21" strokeWidth={1.1}/>
      <path className="vein-veg" d="M30.5 43 C29 34 29.5 26 30.5 20" strokeWidth={1.1}/>

      {/* speckle */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <ellipse cx="14" cy="32" rx="1.5" ry="1.8"/>
        <circle  cx="20" cy="35" r="1.2"/>
        <ellipse cx="52" cy="32" rx="1.5" ry="1.8"/>
        <circle  cx="46" cy="35" r="1.2"/>
        <circle  cx="10" cy="40" r="1.0"/>
        <circle  cx="53" cy="40" r="1.0"/>
        <circle  cx="32" cy="22" r="1.1"/>
        <circle  cx="32" cy="32" r="1.0"/>
      </g>
      {/* marble */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <path d="M31 44 C20 38 12 34 8 33 C12 32 20 35 29 44 Z"/>
        <path d="M33 44 C44 38 52 34 56 33 C52 32 44 35 35 44 Z"/>
        <ellipse cx="32" cy="26" rx="1.5" ry="8"/>
      </g>
      {/* margin */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={3}>
        <path d="M31 44 C23 36 15 32 8 32 C15 30 24 34 31 43 Z"/>
        <path d="M33 44 C41 36 49 32 56 32 C49 30 40 34 33 43 Z"/>
        <path d="M31 44 C22 42 13 43 7 49 C14 43 23 43 31 45 Z"/>
        <path d="M33 44 C42 42 51 43 57 49 C50 43 41 43 33 45 Z"/>
        <path d="M31 44 C30 33 30 24 31 17 C32 25 32 33 32 44 Z"/>
      </g>
      {/* center — outer strap tips (complements the natural vein-veg centre) */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`} strokeWidth={1.5}>
        <path d="M19.5 31.5 L31 44"/>
        <path d="M44.5 31.5 L33 44"/>
        <path d="M10.5 40.5 L31 45"/>
        <path d="M53.5 40.5 L33 45"/>
      </g>

      {pot}
    </>
  );
}

// ─── 7. Palm / frond (Parlor palm / Areca / Kentia) ──────────────────────────

function PalmFrond({ pot }: BaseProps) {
  const cid = uid('pf');
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <path d="M32 46 C24 36 16 27 12 17 C19 25 28 35 33 45 Z"/>
          <path d="M32 46 C40 36 48 27 52 17 C45 25 36 35 31 45 Z"/>
          <path d="M32 46 C27 35 23 24 22 13 C27 24 31 35 33 46 Z"/>
          <path d="M32 46 C37 35 41 24 42 13 C37 24 33 35 31 46 Z"/>
          <path d="M32 46 C30 34 30 20 32 9 C34 20 34 34 33 46 Z"/>
        </clipPath>
      </defs>
      <path className="leaf-1" d="M32 46 C24 36 16 27 12 17 C19 25 28 35 33 45 Z"/>
      <path className="leaf-3" d="M32 46 C40 36 48 27 52 17 C45 25 36 35 31 45 Z"/>
      <path className="leaf-2" d="M32 46 C27 35 23 24 22 13 C27 24 31 35 33 46 Z"/>
      <path className="leaf-2" d="M32 46 C37 35 41 24 42 13 C37 24 33 35 31 46 Z"/>
      <path className="leaf-3" d="M32 46 C30 34 30 20 32 9 C34 20 34 34 33 46 Z"/>
      <path className="vein"   d="M32 45 C28 35 21 26 14 18" strokeWidth={1.1}/>
      <path className="vein"   d="M32 45 C36 35 43 26 50 18" strokeWidth={1.1}/>
      <path className="vein"   d="M32 45 L32 11"              strokeWidth={1.1}/>

      {/* speckle */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <circle cx="16" cy="22" r="1.3"/>
        <circle cx="20" cy="28" r="1.1"/>
        <circle cx="48" cy="22" r="1.3"/>
        <circle cx="44" cy="28" r="1.1"/>
        <circle cx="24" cy="18" r="1.2"/>
        <circle cx="40" cy="18" r="1.2"/>
        <circle cx="32" cy="14" r="1.0"/>
        <circle cx="32" cy="25" r="1.0"/>
      </g>
      {/* marble */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <path d="M32 46 C24 36 16 27 12 17 C16 22 22 30 30 45 Z"/>
        <path d="M32 46 C40 36 48 27 52 17 C48 22 42 30 34 45 Z"/>
        <ellipse cx="32" cy="20" rx="2" ry="12"/>
      </g>
      {/* margin */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={3}>
        <path d="M32 46 C24 36 16 27 12 17 C19 25 28 35 33 45 Z"/>
        <path d="M32 46 C40 36 48 27 52 17 C45 25 36 35 31 45 Z"/>
        <path d="M32 46 C27 35 23 24 22 13 C27 24 31 35 33 46 Z"/>
        <path d="M32 46 C37 35 41 24 42 13 C37 24 33 35 31 46 Z"/>
        <path d="M32 46 C30 34 30 20 32 9 C34 20 34 34 33 46 Z"/>
      </g>
      {/* center — midrib of each frond */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`} strokeWidth={1.8}>
        <path d="M32 45 C28 35 21 26 14 18"/>
        <path d="M32 45 C36 35 43 26 50 18"/>
        <path d="M32 45 L32 11"/>
        <path d="M32 45 C30 36 26 27 23 14"/>
        <path d="M32 45 C34 36 38 27 41 14"/>
      </g>

      {pot}
    </>
  );
}

// ─── 8. Feathery fern (Boston fern / Maidenhair) ─────────────────────────────

function FeatheryFern({ pot }: BaseProps) {
  const cid = uid('ff');
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <path d="M31 44 C20 41 10 43 5 50 C12 43 22 42 31 43 Z"/>
          <path d="M33 44 C44 41 54 43 59 50 C52 43 42 42 33 43 Z"/>
          <path d="M31 44 C22 38 13 35 7 35 C14 36 24 40 31 44 Z"/>
          <path d="M33 44 C42 38 51 35 57 35 C50 36 40 40 33 44 Z"/>
          <path d="M31 44 C27 35 24 27 24 19 C28 27 31 35 32 44 Z"/>
          <path d="M33 44 C37 35 40 27 40 19 C36 27 33 35 32 44 Z"/>
          <path d="M32 44 C30 33 31 22 32 14 C33 22 34 33 33 44 Z"/>
        </clipPath>
      </defs>
      <path className="leaf-1" d="M31 44 C20 41 10 43 5 50 C12 43 22 42 31 43 Z"/>
      <path className="leaf-1" d="M33 44 C44 41 54 43 59 50 C52 43 42 42 33 43 Z"/>
      <path className="leaf-2" d="M31 44 C22 38 13 35 7 35 C14 36 24 40 31 44 Z"/>
      <path className="leaf-2" d="M33 44 C42 38 51 35 57 35 C50 36 40 40 33 44 Z"/>
      <path className="leaf-2" d="M31 44 C27 35 24 27 24 19 C28 27 31 35 32 44 Z"/>
      <path className="leaf-3" d="M33 44 C37 35 40 27 40 19 C36 27 33 35 32 44 Z"/>
      <path className="leaf-3" d="M32 44 C30 33 31 22 32 14 C33 22 34 33 33 44 Z"/>
      <path className="vein"
        d="M32 42 L32 16 M31 38 C28 36 25 35 22 35 M33 38 C36 36 39 35 42 35 M30 33 C27 32 24 32 22 30 M34 33 C37 32 40 32 42 30"
        strokeWidth={0.8}/>

      {/* speckle */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <circle cx="10" cy="44" r="1.2"/>
        <circle cx="14" cy="40" r="1.0"/>
        <circle cx="54" cy="44" r="1.2"/>
        <circle cx="50" cy="40" r="1.0"/>
        <circle cx="26" cy="26" r="1.1"/>
        <circle cx="38" cy="26" r="1.1"/>
        <circle cx="32" cy="20" r="1.0"/>
        <circle cx="32" cy="32" r="1.0"/>
      </g>
      {/* marble */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <path d="M31 44 C18 40 8 43 5 50 C10 43 20 42 30 44 Z"/>
        <path d="M33 44 C46 40 56 43 59 50 C54 43 44 42 34 44 Z"/>
        <ellipse cx="32" cy="24" rx="2" ry="10"/>
      </g>
      {/* margin */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={3}>
        <path d="M31 44 C20 41 10 43 5 50 C12 43 22 42 31 43 Z"/>
        <path d="M33 44 C44 41 54 43 59 50 C52 43 42 42 33 43 Z"/>
        <path d="M31 44 C22 38 13 35 7 35 C14 36 24 40 31 44 Z"/>
        <path d="M33 44 C42 38 51 35 57 35 C50 36 40 40 33 44 Z"/>
        <path d="M32 44 C30 33 31 22 32 14 C33 22 34 33 33 44 Z"/>
      </g>
      {/* center */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`} strokeWidth={1.6}>
        <path d="M32 42 L32 16"/>
        <path d="M32 38 C28 36 22 35 8 36"/>
        <path d="M32 38 C36 36 42 35 56 36"/>
        <path d="M32 34 C28 32 24 32 12 31"/>
        <path d="M32 34 C36 32 40 32 52 31"/>
      </g>

      {pot}
    </>
  );
}

// ─── 9. Cactus (Barrel / Saguaro) ────────────────────────────────────────────

function Cactus({ pot }: BaseProps) {
  const cid = uid('ca');
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <path d="M24 40 C17 40 16 35 16 30 C16 27.5 19 27.5 19 30 C19 34 21 35 24 36 Z"/>
          <path d="M24 47 C23 26 26 14 32 13 C38 14 41 26 40 47 Z"/>
        </clipPath>
      </defs>
      {/* arm */}
      <path className="leaf-1" d="M24 40 C17 40 16 35 16 30 C16 27.5 19 27.5 19 30 C19 34 21 35 24 36 Z"/>
      {/* body */}
      <path className="leaf-2" d="M24 47 C23 26 26 14 32 13 C38 14 41 26 40 47 Z"/>
      <path className="vein" d="M28 18 V44 M32 15 V45 M36 18 V44" strokeWidth={1.2}/>
      {/* legacy dot bloom */}
      <g className="bloom">
        <ellipse cx="32"   cy="10.5" rx="2"   ry="3.2"/>
        <ellipse cx="28.8" cy="12"   rx="3"   ry="1.7" transform="rotate(-38 28.8 12)"/>
        <ellipse cx="35.2" cy="12"   rx="3"   ry="1.7" transform="rotate(38 35.2 12)"/>
      </g>

      {/* speckle — areole dots */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <circle cx="28" cy="20" r="1.1"/>
        <circle cx="32" cy="18" r="1.1"/>
        <circle cx="36" cy="20" r="1.1"/>
        <circle cx="28" cy="28" r="1.1"/>
        <circle cx="32" cy="26" r="1.1"/>
        <circle cx="36" cy="28" r="1.1"/>
        <circle cx="28" cy="36" r="1.1"/>
        <circle cx="32" cy="34" r="1.1"/>
        <circle cx="36" cy="36" r="1.1"/>
        <circle cx="19" cy="32" r="0.9"/>
        <circle cx="20" cy="36" r="0.9"/>
      </g>
      {/* marble */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <path d="M24 47 C23 26 26 14 32 13 C29 20 28 35 28 47 Z"/>
        <path d="M20 32 C17 32 16 31 16 30 C17 30 18.5 31 20 34 Z"/>
      </g>
      {/* margin */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={3}>
        <path d="M24 40 C17 40 16 35 16 30 C16 27.5 19 27.5 19 30 C19 34 21 35 24 36 Z"/>
        <path d="M24 47 C23 26 26 14 32 13 C38 14 41 26 40 47 Z"/>
      </g>
      {/* center — ribs of the barrel */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`} strokeWidth={1.6}>
        <path d="M28 47 L28 16"/>
        <path d="M32 47 L32 13"/>
        <path d="M36 47 L36 16"/>
      </g>

      {pot}
    </>
  );
}

// ─── 10. Big paddle (Bird of paradise / Banana) ──────────────────────────────

function BigPaddle({ pot }: BaseProps) {
  const cid = uid('bp');
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <ellipse cx="21" cy="17" rx="7.5" ry="12.5" transform="rotate(-24 21 17)"/>
          <ellipse cx="43" cy="17" rx="7.5" ry="12.5" transform="rotate(24 43 17)"/>
          <ellipse cx="32" cy="12" rx="7"   ry="13"/>
        </clipPath>
      </defs>
      <path className="stem"  d="M32 46 C31 38 27 30 23 22" strokeWidth={2.2}/>
      <path className="stem"  d="M32 46 C33 38 37 30 41 22" strokeWidth={2.2}/>
      <path className="stem"  d="M32 46 L32 16"             strokeWidth={2.2}/>
      <ellipse className="leaf-1" cx="21" cy="17" rx="7.5" ry="12.5" transform="rotate(-24 21 17)"/>
      <ellipse className="leaf-3" cx="43" cy="17" rx="7.5" ry="12.5" transform="rotate(24 43 17)"/>
      <ellipse className="leaf-2" cx="32" cy="12" rx="7"   ry="13"/>
      <path className="vein" d="M21 5 L21 29" transform="rotate(-24 21 17)" strokeWidth={1.1}/>
      <path className="vein" d="M43 5 L43 29" transform="rotate(24 43 17)"  strokeWidth={1.1}/>
      <path className="vein" d="M32 -1 L32 25"                               strokeWidth={1.1}/>

      {/* speckle */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <circle cx="18" cy="13" r="1.4"/>
        <circle cx="22" cy="20" r="1.2"/>
        <circle cx="15" cy="18" r="1.0"/>
        <circle cx="44" cy="13" r="1.4"/>
        <circle cx="40" cy="20" r="1.2"/>
        <circle cx="47" cy="18" r="1.0"/>
        <circle cx="30" cy="7"  r="1.3"/>
        <circle cx="33" cy="15" r="1.1"/>
      </g>
      {/* marble */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <ellipse cx="19" cy="11" rx="5" ry="8" transform="rotate(-24 19 11)"/>
        <ellipse cx="45" cy="11" rx="5" ry="8" transform="rotate(24 45 11)"/>
        <ellipse cx="32" cy="6"  rx="4" ry="8"/>
      </g>
      {/* margin */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={3.4}>
        <ellipse cx="21" cy="17" rx="7.5" ry="12.5" transform="rotate(-24 21 17)"/>
        <ellipse cx="43" cy="17" rx="7.5" ry="12.5" transform="rotate(24 43 17)"/>
        <ellipse cx="32" cy="12" rx="7"   ry="13"/>
      </g>
      {/* center */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`} strokeWidth={2}>
        <path d="M21 5 L21 29"  transform="rotate(-24 21 17)"/>
        <path d="M43 5 L43 29"  transform="rotate(24 43 17)"/>
        <path d="M32 -1 L32 25"/>
      </g>

      {pot}
    </>
  );
}

// ─── 11. Patterned broadleaf (Calathea / Prayer plant / Maranta) ─────────────

function PatternedBroadleaf({ pot }: BaseProps) {
  const cid = uid('pb');
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <path d="M30 46 C20 39 17 27 22 15 C27 21 30 33 31 46 Z"/>
          <path d="M34 46 C44 39 47 27 42 15 C37 21 34 33 33 46 Z"/>
          <path d="M32 46 C27 35 28 20 32 10 C36 20 37 35 32 46 Z"/>
        </clipPath>
      </defs>
      <path className="leaf-1" d="M30 46 C20 39 17 27 22 15 C27 21 30 33 31 46 Z"/>
      <path className="leaf-3" d="M34 46 C44 39 47 27 42 15 C37 21 34 33 33 46 Z"/>
      <path className="leaf-2" d="M32 46 C27 35 28 20 32 10 C36 20 37 35 32 46 Z"/>
      <path className="vein"   d="M30 44 C24 37 21 27 24 18"  strokeWidth={1}/>
      <path className="vein"   d="M34 44 C40 37 43 27 40 18"  strokeWidth={1}/>
      <path className="vein"   d="M32 44 C31 33 31 21 32 12"  strokeWidth={1.2}/>
      <path className="vein"
        d="M32 20 l-3.5 1.5 M32 26 l-4 1.5 M32 32 l-4 1.6 M32 20 l3.5 1.5 M32 26 l4 1.5 M32 32 l4 1.6"
        strokeWidth={1}/>

      {/* speckle */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <circle cx="22" cy="20" r="1.3"/>
        <circle cx="20" cy="28" r="1.2"/>
        <circle cx="21" cy="36" r="1.1"/>
        <circle cx="42" cy="20" r="1.3"/>
        <circle cx="44" cy="28" r="1.2"/>
        <circle cx="43" cy="36" r="1.1"/>
        <circle cx="32" cy="16" r="1.2"/>
        <circle cx="32" cy="28" r="1.0"/>
      </g>
      {/* marble — calathea-style herringbone patches */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <path d="M32 20 l-6 3 l1 4 l5-2 Z"/>
        <path d="M32 26 l-7 3 l1 4 l6-2 Z"/>
        <path d="M32 32 l-7 3 l1 4 l6-2 Z"/>
        <path d="M32 20 l6 3 l-1 4 l-5-2 Z"/>
        <path d="M32 26 l7 3 l-1 4 l-6-2 Z"/>
        <path d="M32 32 l7 3 l-1 4 l-6-2 Z"/>
      </g>
      {/* margin */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={3.4}>
        <path d="M30 46 C20 39 17 27 22 15 C27 21 30 33 31 46 Z"/>
        <path d="M34 46 C44 39 47 27 42 15 C37 21 34 33 33 46 Z"/>
        <path d="M32 46 C27 35 28 20 32 10 C36 20 37 35 32 46 Z"/>
      </g>
      {/* center — midrib + herringbone */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`} strokeWidth={1.8}>
        <path d="M32 44 C31 33 31 21 32 12"/>
        <path d="M32 20 l-3.5 1.5 M32 26 l-4 1.5 M32 32 l-4 1.6"/>
        <path d="M32 20 l3.5 1.5 M32 26 l4 1.5 M32 32 l4 1.6"/>
      </g>

      {pot}
    </>
  );
}

// ─── 12. Paddle succulent (Jade / Kalanchoe / Portulacaria) ──────────────────

function PaddleSucculent({ pot }: BaseProps) {
  const cid = uid('ps');
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <ellipse cx="22" cy="29" rx="4"   ry="5.2" transform="rotate(-18 22 29)"/>
          <ellipse cx="27" cy="26" rx="3.8" ry="5"   transform="rotate(-8 27 26)"/>
          <ellipse cx="40" cy="29" rx="4"   ry="5.2" transform="rotate(18 40 29)"/>
          <ellipse cx="35" cy="26" rx="3.8" ry="5"   transform="rotate(8 35 26)"/>
          <ellipse cx="27" cy="20" rx="3.8" ry="5"   transform="rotate(-10 27 20)"/>
          <ellipse cx="35" cy="19" rx="3.8" ry="5"   transform="rotate(10 35 19)"/>
          <ellipse cx="31" cy="15" rx="3.8" ry="5"/>
        </clipPath>
      </defs>
      <path className="stem" d="M32 46 L31 34"                     strokeWidth={3}/>
      <path className="stem" d="M31 37 C28 35 25 35 23 32"         strokeWidth={2.4}/>
      <path className="stem" d="M31 37 C34 35 37 35 39 32"         strokeWidth={2.4}/>
      <path className="stem" d="M31 34 C31 31 31 29 31 26"         strokeWidth={2.4}/>
      <ellipse className="leaf-1" cx="22" cy="29" rx="4"   ry="5.2" transform="rotate(-18 22 29)"/>
      <ellipse className="leaf-2" cx="27" cy="26" rx="3.8" ry="5"   transform="rotate(-8 27 26)"/>
      <ellipse className="leaf-3" cx="40" cy="29" rx="4"   ry="5.2" transform="rotate(18 40 29)"/>
      <ellipse className="leaf-2" cx="35" cy="26" rx="3.8" ry="5"   transform="rotate(8 35 26)"/>
      <ellipse className="leaf-1" cx="27" cy="20" rx="3.8" ry="5"   transform="rotate(-10 27 20)"/>
      <ellipse className="leaf-3" cx="35" cy="19" rx="3.8" ry="5"   transform="rotate(10 35 19)"/>
      <ellipse className="leaf-2" cx="31" cy="15" rx="3.8" ry="5"/>

      {/* speckle */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <circle cx="21" cy="27" r="0.9"/>
        <circle cx="23" cy="31" r="0.8"/>
        <circle cx="27" cy="24" r="0.9"/>
        <circle cx="40" cy="27" r="0.9"/>
        <circle cx="38" cy="31" r="0.8"/>
        <circle cx="35" cy="24" r="0.9"/>
        <circle cx="27" cy="18" r="0.9"/>
        <circle cx="35" cy="17" r="0.9"/>
        <circle cx="31" cy="13" r="0.9"/>
      </g>
      {/* marble */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <ellipse cx="21" cy="26" rx="3" ry="3.8" transform="rotate(-18 21 26)"/>
        <ellipse cx="40" cy="26" rx="3" ry="3.8" transform="rotate(18 40 26)"/>
        <ellipse cx="29" cy="16" rx="2.8" ry="3.5" transform="rotate(-10 29 16)"/>
        <ellipse cx="31" cy="12" rx="2.8" ry="3.5"/>
      </g>
      {/* margin */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={3}>
        <ellipse cx="22" cy="29" rx="4"   ry="5.2" transform="rotate(-18 22 29)"/>
        <ellipse cx="27" cy="26" rx="3.8" ry="5"   transform="rotate(-8 27 26)"/>
        <ellipse cx="40" cy="29" rx="4"   ry="5.2" transform="rotate(18 40 29)"/>
        <ellipse cx="35" cy="26" rx="3.8" ry="5"   transform="rotate(8 35 26)"/>
        <ellipse cx="27" cy="20" rx="3.8" ry="5"   transform="rotate(-10 27 20)"/>
        <ellipse cx="35" cy="19" rx="3.8" ry="5"   transform="rotate(10 35 19)"/>
        <ellipse cx="31" cy="15" rx="3.8" ry="5"/>
      </g>
      {/* center — dot in each pad */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`} strokeWidth={1.4}>
        <path d="M22 29 v0" strokeLinecap="round" strokeWidth={2.4}/>
        <path d="M27 26 v0" strokeLinecap="round" strokeWidth={2.4}/>
        <path d="M40 29 v0" strokeLinecap="round" strokeWidth={2.4}/>
        <path d="M35 26 v0" strokeLinecap="round" strokeWidth={2.4}/>
        <path d="M27 20 v0" strokeLinecap="round" strokeWidth={2.4}/>
        <path d="M35 19 v0" strokeLinecap="round" strokeWidth={2.4}/>
        <path d="M31 15 v0" strokeLinecap="round" strokeWidth={2.4}/>
      </g>

      {pot}
    </>
  );
}

// ─── 13. Cactus pad (Prickly pear / Bunny ear) ───────────────────────────────

function CactusPad({ pot }: BaseProps) {
  const cid = uid('cp');
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <ellipse cx="31" cy="35" rx="9"   ry="11"/>
          <ellipse cx="22" cy="23" rx="6"   ry="7.5" transform="rotate(-22 22 23)"/>
          <ellipse cx="40" cy="22" rx="5.5" ry="7"   transform="rotate(24 40 22)"/>
        </clipPath>
      </defs>
      <ellipse className="leaf-2" cx="31" cy="35" rx="9"   ry="11"/>
      <ellipse className="leaf-1" cx="22" cy="23" rx="6"   ry="7.5" transform="rotate(-22 22 23)"/>
      <ellipse className="leaf-3" cx="40" cy="22" rx="5.5" ry="7"   transform="rotate(24 40 22)"/>
      {/* areole dots */}
      <path className="vein"
        d="M31 28 v0 M28 33 v0 M35 33 v0 M31 41 v0 M20 24 v0 M24 21 v0 M41 24 v0 M39 19 v0"
        strokeWidth={1.8} strokeLinecap="round"/>
      {/* legacy dot bloom */}
      <g className="bloom">
        <ellipse cx="22"   cy="14.5" rx="1.6" ry="2.6"/>
        <ellipse cx="19.6" cy="16"   rx="2.4" ry="1.4" transform="rotate(-35 19.6 16)"/>
        <ellipse cx="24.4" cy="16"   rx="2.4" ry="1.4" transform="rotate(35 24.4 16)"/>
      </g>

      {/* speckle */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <circle cx="31" cy="28" r="1.0"/>
        <circle cx="27" cy="32" r="0.9"/>
        <circle cx="35" cy="32" r="0.9"/>
        <circle cx="31" cy="40" r="0.9"/>
        <circle cx="20" cy="24" r="0.9"/>
        <circle cx="24" cy="21" r="0.8"/>
        <circle cx="41" cy="24" r="0.9"/>
        <circle cx="39" cy="19" r="0.8"/>
      </g>
      {/* marble */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <ellipse cx="31" cy="30" rx="6"  ry="7"/>
        <ellipse cx="19" cy="20" rx="4"  ry="5"  transform="rotate(-22 19 20)"/>
        <ellipse cx="41" cy="19" rx="3.5" ry="4.5" transform="rotate(24 41 19)"/>
      </g>
      {/* margin */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={3.4}>
        <ellipse cx="31" cy="35" rx="9"   ry="11"/>
        <ellipse cx="22" cy="23" rx="6"   ry="7.5" transform="rotate(-22 22 23)"/>
        <ellipse cx="40" cy="22" rx="5.5" ry="7"   transform="rotate(24 40 22)"/>
      </g>
      {/* center — short horizontal lines across each pad */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`} strokeWidth={1.6}>
        <path d="M26 35 H36"/>
        <path d="M27 30 H35"/>
        <path d="M19 23 L25 23" transform="rotate(-22 22 23)"/>
        <path d="M37 22 L43 22" transform="rotate(24 40 22)"/>
      </g>

      {pot}
    </>
  );
}

// ─── 14. Beaded strand (String of pearls / String of hearts) ─────────────────
// Pot sits in the MIDDLE — stems and beads trail both above and below.

function BeadedStrand({ pot }: BaseProps) {
  const cid = uid('bs');
  /* The clipPath must include ALL bead circles (above + below pot) */
  return (
    <>
      <defs>
        <clipPath id={cid}>
          <circle cx="22" cy="28" r="2.5"/>
          <circle cx="25" cy="33" r="2.5"/>
          <circle cx="22" cy="38" r="2.5"/>
          <circle cx="32" cy="26" r="2.5"/>
          <circle cx="32" cy="31" r="2.5"/>
          <circle cx="32" cy="36" r="2.5"/>
          <circle cx="42" cy="28" r="2.5"/>
          <circle cx="39" cy="33" r="2.5"/>
          <circle cx="42" cy="38" r="2.5"/>
          <circle cx="16" cy="50" r="2.3"/>
          <circle cx="16" cy="55" r="2.3"/>
          <circle cx="48" cy="50" r="2.3"/>
          <circle cx="48" cy="55" r="2.3"/>
        </clipPath>
      </defs>
      {/* above-pot stems & beads */}
      <path className="stem" d="M30 42 C26 38 23 34 22 29"  strokeWidth={1.3}/>
      <path className="stem" d="M34 42 C38 38 41 34 42 29"  strokeWidth={1.3}/>
      <path className="stem" d="M32 42 C32 36 32 31 32 27"  strokeWidth={1.3}/>
      <circle className="leaf-2" cx="22" cy="28" r="2.5"/>
      <circle className="leaf-1" cx="25" cy="33" r="2.5"/>
      <circle className="leaf-3" cx="22" cy="38" r="2.5"/>
      <circle className="leaf-2" cx="32" cy="26" r="2.5"/>
      <circle className="leaf-3" cx="32" cy="31" r="2.5"/>
      <circle className="leaf-1" cx="32" cy="36" r="2.5"/>
      <circle className="leaf-2" cx="42" cy="28" r="2.5"/>
      <circle className="leaf-1" cx="39" cy="33" r="2.5"/>
      <circle className="leaf-3" cx="42" cy="38" r="2.5"/>

      {pot}

      {/* trailing stems & beads below the pot */}
      <path className="stem" d="M23 43 C19 47 16 51 16 56"  strokeWidth={1.3}/>
      <path className="stem" d="M41 43 C45 47 48 51 48 56"  strokeWidth={1.3}/>
      <circle className="leaf-3" cx="16" cy="50" r="2.3"/>
      <circle className="leaf-1" cx="16" cy="55" r="2.3"/>
      <circle className="leaf-2" cx="48" cy="50" r="2.3"/>
      <circle className="leaf-3" cx="48" cy="55" r="2.3"/>

      {/* speckle */}
      <g className="veg-speckle variegation" clipPath={`url(#${cid})`}>
        <circle cx="22" cy="28" r="1.0"/>
        <circle cx="25" cy="33" r="1.0"/>
        <circle cx="22" cy="38" r="1.0"/>
        <circle cx="32" cy="26" r="1.0"/>
        <circle cx="32" cy="31" r="1.0"/>
        <circle cx="32" cy="36" r="1.0"/>
        <circle cx="42" cy="28" r="1.0"/>
        <circle cx="39" cy="33" r="1.0"/>
        <circle cx="42" cy="38" r="1.0"/>
        <circle cx="16" cy="50" r="0.9"/>
        <circle cx="16" cy="55" r="0.9"/>
        <circle cx="48" cy="50" r="0.9"/>
        <circle cx="48" cy="55" r="0.9"/>
      </g>
      {/* marble — alternate every other bead */}
      <g className="veg-marble variegation" clipPath={`url(#${cid})`}>
        <circle cx="22" cy="28" r="2.5"/>
        <circle cx="22" cy="38" r="2.5"/>
        <circle cx="32" cy="31" r="2.5"/>
        <circle cx="42" cy="28" r="2.5"/>
        <circle cx="42" cy="38" r="2.5"/>
        <circle cx="16" cy="55" r="2.3"/>
        <circle cx="48" cy="50" r="2.3"/>
      </g>
      {/* margin — outline each bead */}
      <g className="veg-margin veg-stroke" clipPath={`url(#${cid})`} strokeWidth={2.8}>
        <circle cx="22" cy="28" r="2.5"/>
        <circle cx="25" cy="33" r="2.5"/>
        <circle cx="22" cy="38" r="2.5"/>
        <circle cx="32" cy="26" r="2.5"/>
        <circle cx="32" cy="31" r="2.5"/>
        <circle cx="32" cy="36" r="2.5"/>
        <circle cx="42" cy="28" r="2.5"/>
        <circle cx="39" cy="33" r="2.5"/>
        <circle cx="42" cy="38" r="2.5"/>
        <circle cx="16" cy="50" r="2.3"/>
        <circle cx="16" cy="55" r="2.3"/>
        <circle cx="48" cy="50" r="2.3"/>
        <circle cx="48" cy="55" r="2.3"/>
      </g>
      {/* center — dot in centre of each bead */}
      <g className="veg-center veg-stroke" clipPath={`url(#${cid})`}>
        <circle cx="22" cy="28" r="0" strokeWidth={2.2} strokeLinecap="round"/>
        <circle cx="25" cy="33" r="0" strokeWidth={2.2} strokeLinecap="round"/>
        <circle cx="22" cy="38" r="0" strokeWidth={2.2} strokeLinecap="round"/>
        <circle cx="32" cy="26" r="0" strokeWidth={2.2} strokeLinecap="round"/>
        <circle cx="32" cy="31" r="0" strokeWidth={2.2} strokeLinecap="round"/>
        <circle cx="32" cy="36" r="0" strokeWidth={2.2} strokeLinecap="round"/>
        <circle cx="42" cy="28" r="0" strokeWidth={2.2} strokeLinecap="round"/>
        <circle cx="39" cy="33" r="0" strokeWidth={2.2} strokeLinecap="round"/>
        <circle cx="42" cy="38" r="0" strokeWidth={2.2} strokeLinecap="round"/>
        <circle cx="16" cy="50" r="0" strokeWidth={2.0} strokeLinecap="round"/>
        <circle cx="16" cy="55" r="0" strokeWidth={2.0} strokeLinecap="round"/>
        <circle cx="48" cy="50" r="0" strokeWidth={2.0} strokeLinecap="round"/>
        <circle cx="48" cy="55" r="0" strokeWidth={2.0} strokeLinecap="round"/>
      </g>
    </>
  );
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const PLANT_BASES: BaseRecord = {
  'fenestrated-tropical': FenestratedTropical,
  'single-trunk-tree':    SingleTrunkTree,
  'upright-sword':        UprightSword,
  'trailing-vine':        TrailingVine,
  'rosette-succulent':    RosetteSucculent,
  'strappy-arching':      StrappyArching,
  'palm-frond':           PalmFrond,
  'feathery-fern':        FeatheryFern,
  'cactus':               Cactus,
  'big-paddle':           BigPaddle,
  'patterned-broadleaf':  PatternedBroadleaf,
  'paddle-succulent':     PaddleSucculent,
  'cactus-pad':           CactusPad,
  'beaded-strand':        BeadedStrand,
};

export const BASE_LABELS: Record<BaseKey, string> = {
  'fenestrated-tropical': 'Fenestrated Tropical',
  'single-trunk-tree':    'Single Trunk Tree',
  'upright-sword':        'Upright Sword',
  'trailing-vine':        'Trailing Vine',
  'rosette-succulent':    'Rosette Succulent',
  'strappy-arching':      'Strappy Arching',
  'palm-frond':           'Palm Frond',
  'feathery-fern':        'Feathery Fern',
  'cactus':               'Cactus',
  'big-paddle':           'Big Paddle',
  'patterned-broadleaf':  'Patterned Broadleaf',
  'paddle-succulent':     'Paddle Succulent',
  'cactus-pad':           'Cactus Pad',
  'beaded-strand':        'Beaded Strand',
};
