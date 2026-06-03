# Rootly — Plant Icon System (Claude Code Handoff)

> **Use this doc to build the Rootly plant-icon system.** It is the single source of truth
> for how every plant icon is constructed: the slot model, color tokens, the base-shape and
> bloom-head libraries, variegation, the bloom palette, proportions, and the per-plant data
> recipe. Pair it with **`icons/Plant Icon System.html`** — that file holds the **exact SVG
> path geometry** for all 14 bases and 10 heads. Copy those `<svg>` bodies verbatim; this doc
> defines the rules they obey. Tokens come from `colors_and_type.css`.

---

## 0. The idea in one line

**A plant icon = one base silhouette + a skin (a set of CSS-variable slots).** Geometry is
drawn once; a specific plant is *pure data* — override the slots, the paths never change.
Draw ~14 base shapes + 10 flower heads once; reach 50+ plants by reskinning. The recipe is a
tiny record, so it feeds straight into the app.

There are three layers a recipe can touch, in order:

1. **Base** — the green silhouette + pot (required).
2. **Variegation** — an optional leaf marking, clip-masked to the base's own leaves.
3. **Bloom** — an optional flower: either the legacy single accent dot, or a **bloom-head**
   (a recognizable flower silhouette) seated on the base.

---

## 1. Canvas & construction conventions

Every icon is authored in the **same coordinate space** so bases, heads, variegation overlays,
and pots are interchangeable.

- **viewBox:** `0 0 64 64`. Always `overflow: visible` on the `<svg>` (some leaves/heads bleed
  slightly past the box by design).
- **The pot is shared and identical across every icon.** Same two paths, every time:
  ```html
  <path class="pot-body" d="M19 45 H45 L42 60 Q41.6 62 39.5 62 H24.5 Q22.4 62 22 60 Z"/>
  <path class="pot-rim"  d="M17.5 43.5 H46.5 Q47.6 43.5 47.4 45 L47 47 Q46.8 48 45.5 48 H18.5 Q17.2 48 17 47 L16.6 45 Q16.4 43.5 17.5 43.5 Z"/>
  ```
- **Soil line ≈ y45–48** (the pot rim). Plants rise from the soil (~y46) upward; foliage tops
  out around **y3–12**. Nothing floats — a bloom always sits on a stem or out of the leaf clump.
- **Center axis is x32.** Symmetric silhouettes balance on it; asymmetric ones (trailing vine,
  arching orchid) lean off it deliberately.
- **Strokes:** round caps and joins everywhere (`stroke-linecap: round`). Typical weights —
  stems **1.3–2.4**, veins **0.8–1.6**, bloom accent strokes **1.0–1.3**. Scale weight with the
  feature's prominence, not the icon size.
- **Layer order within an icon:** back leaves → pot (for vines, the pot sits *behind* the
  trailing foliage — see Trailing vine) → mid/front leaves → variegation overlay → stem → bloom
  head → (pot in front for upright plants). Match the ordering in the HTML per shape.

---

## 2. The slot system

Each fillable region points at a **CSS custom property** instead of a baked-in hex. The icon
markup uses **class names** that bind to those variables; a skin is just variable values set on
the `.ic` wrapper (inline style, or `data-*` + a stylesheet).

### Slot variables (defaults)

```css
:root {
  /* structure */
  --leaf-1: #256B45;   /* deep / back leaves        */
  --leaf-2: #3A7D55;   /* mid leaves                */
  --leaf-3: #5AA277;   /* light / front leaves      */
  --stem:   #3A7D55;   /* stems & petioles          */
  --vein:   #E9F1E4;   /* structural highlights     */

  /* optional overlays — invisible until set */
  --variegation: transparent;   /* leaf marking      */
  --bloom:       transparent;   /* flower / petals    */
  --bloom-center: #E8A23C;      /* disc / throat / eye */
  --bloom-2:      #C9852F;      /* beard / stamen / tips */

  /* pot (shared) */
  --pot-body: #C98A5E;
  --pot-rim:  #B97A4F;
}
```

### Class → slot bindings

| Class | Property bound | Notes |
|---|---|---|
| `.leaf-1` `.leaf-2` `.leaf-3` | `fill: var(--leaf-N)` | three depth tones |
| `.stem` | `stroke: var(--stem); fill:none` | petioles, stalks |
| `.vein` | `stroke: var(--vein); fill:none` | midribs / structural highlights |
| `.variegation` | `fill: var(--variegation)` | marking fills (clip-masked) |
| `.vein-veg` | `stroke: var(--variegation); fill:none` | marking as strokes |
| `.bloom` | `fill: var(--bloom)` | **legacy** single-accent flower |
| `.bloom-stroke` | `stroke: var(--bloom); fill:none` | legacy flower stems |
| `.petal` | `fill: var(--bloom)` | **bloom-head** petals |
| `.center` | `fill: var(--bloom-center)` | bloom-head disc / throat |
| `.accent` | `fill: var(--bloom-2)` | bloom-head beard / stamen / tips |
| `.accent-stroke` | `stroke: var(--bloom-2); fill:none` | linear accents (seams, filaments) |
| `.pot-body` `.pot-rim` | `fill: var(--pot-*)` | shared pot |

```css
.ic svg { display:block; width:100%; height:100%; overflow:visible; }
.ic .leaf-1{fill:var(--leaf-1)} .ic .leaf-2{fill:var(--leaf-2)} .ic .leaf-3{fill:var(--leaf-3)}
.ic .stem{stroke:var(--stem);fill:none;stroke-linecap:round}
.ic .vein{stroke:var(--vein);fill:none;stroke-linecap:round}
.ic .variegation{fill:var(--variegation)} .ic .vein-veg{stroke:var(--variegation);fill:none;stroke-linecap:round}
.ic .bloom{fill:var(--bloom)} .ic .bloom-stroke{stroke:var(--bloom);fill:none;stroke-linecap:round}
.ic .petal{fill:var(--bloom)} .ic .center{fill:var(--bloom-center)} .ic .accent{fill:var(--bloom-2)}
.ic .accent-stroke{stroke:var(--bloom-2);fill:none;stroke-linecap:round}
.ic .pot-body{fill:var(--pot-body)} .ic .pot-rim{fill:var(--pot-rim)}
```

> **Rule:** leaves stay **green-locked** (only the leaf/stem/vein tokens, kept in the Rootly
> green family). Only the **bloom slots** may draw from the bloom palette (§6). Pot color is
> shared; don't recolor it per plant.

---

## 3. Default green palette

These are the resting greens every base ships with. Per-cultivar palettes shift them within the
green family (warmer/cooler/brighter) — never out of green.

```
--leaf-1  #256B45   deep / back
--leaf-2  #3A7D55   mid
--leaf-3  #5AA277   light / front
--stem    #3A7D55   stems
--vein    #E9F1E4   highlights
--pot-body #C98A5E  / --pot-rim #B97A4F   shared clay pot
```

Example cultivar palettes (from the trailing-vine reskin proof):

| Cultivar | leaf-1 | leaf-2 | leaf-3 | variegation |
|---|---|---|---|---|
| Golden pothos | `#3E7D2E` | `#5C9A33` | `#7DB23E` | `#E7C463` (speckle) |
| Marble queen | `#2E6B43` | `#3F8557` | `#5AA277` | `#EEF3E6` (marble) |
| Neon pothos | `#5BA12E` | `#79C13C` | `#9AD64F` | none |

---

## 4. Base shape library (14 silhouettes)

At icon scale most houseplants collapse into a handful of shapes. **14 bases cover the field.**
Each is the parent of several real plants; pick the base, then reskin. **Exact paths for each
live in `icons/Plant Icon System.html` (§02 "Base shape library" + the hero).**

| # | Base key | Name | Covers | Structure notes |
|---|---|---|---|---|
| 1 | `fenestrated-tropical` | Fenestrated tropical | Monstera · split-leaf philodendron · alocasia | Two big lobed leaves + central spear on a short stem |
| 2 | `single-trunk-tree` | Single-trunk tree | Fiddle-leaf fig · rubber plant · money tree | Trunk + 3 large oval leaves (rotated ellipses) |
| 3 | `upright-sword` | Upright sword | Snake plant · ZZ · dracaena | 3 tall blades; optional Sun tip ticks |
| 4 | `trailing-vine` | Trailing vine | Pothos · heartleaf philo · ivy | 4 heart leaves on an arching stem; **pot sits behind foliage**; variegation pre-clipped to the 4 leaves |
| 5 | `rosette-succulent` | Rosette succulent | Echeveria · aloe · haworthia | Radiating pointed pads; ships with a legacy `--bloom` flower spray |
| 6 | `strappy-arching` | Strappy arching | Spider plant · airplane plant | Arching strap leaves both sides + center stripe (vein-veg) |
| 7 | `palm-frond` | Palm / frond | Parlor palm · areca · kentia | Fan of fronds from a base point + radial veins |
| 8 | `feathery-fern` | Feathery fern | Boston fern · maidenhair | Layered fronds + fine pinnae veins |
| 9 | `cactus` | Cactus | Barrel · saguaro · prickly pear | Ribbed barrel + a small arm; ships with a legacy `--bloom` topper |
| 10 | `big-paddle` | Big paddle | Bird of paradise · banana | 3 huge upright paddle leaves on tall stalks |
| 11 | `patterned-broadleaf` | Patterned broadleaf | Calathea · prayer plant · maranta | 3 broad leaves + herringbone veins (carries center/markings well) |
| 12 | `paddle-succulent` | Paddle succulent | Jade · kalanchoe · portulacaria | Branching stems with many small oval pads |
| 13 | `cactus-pad` | Cactus pad | Prickly pear · bunny ear | Stacked oval pads + areole dots; ships with a legacy `--bloom` topper |
| 14 | `beaded-strand` | Beaded strand | String of pearls · string of hearts | Strands of small beads spilling over the pot rim |

> Bases 1–5 are the original set; 6–14 were added to span every archetype. Several bases
> (`rosette-succulent`, `cactus`, `cactus-pad`) ship with the **legacy single-dot bloom**
> already drawn but invisible (`--bloom: transparent`) — flip the slot to light it up.

---

## 5. Variegation — four marking styles, one slot

Variegation isn't one effect; it's a small **named set**. A recipe carries a `pattern` + the
`--variegation` color. **Every base ships all four overlays pre-clipped to its own leaves**
(via a `<clipPath>` of the leaf paths), so naming one pattern is all it takes — no extra
drawing per cultivar.

| Pattern key | Look | Real plants |
|---|---|---|
| `speckle` | Fine flecks scattered across the blade (small ellipses/circles) | Golden pothos, dieffenbachia |
| `marble` | Bold sectoral patches over ~half the leaf | Marble queen, snow queen |
| `margin` | A pale band tracing the leaf edge (leaf paths stroked, clipped) | Marginata, variegated hoya |
| `center` | A stripe down the midrib | Calathea, stromanthe, aglaonema |

Mechanism: overlay shapes (or stroked leaf outlines) wrapped in `<g class="variegation"
clip-path="url(#…)">`; the clip is the base's leaf silhouette so markings never spill past a
leaf. Default `--variegation: transparent` ⇒ pattern is invisible until a color is set.

---

## 6. The bloom system (flowering plants — switched on)

Flowering plants ship **live**. Two ways a base can flower:

### 6a. Legacy single dot (simplest)
Flip `--bloom` from `transparent` to **Sun** (`#E0A050`) and a base's pre-drawn `.bloom`
flower spray appears. Perfect for a succulent or cactus **sending up a spike** — shape doesn't
need to do much, so one accent reads fine. This is the whole minimal flowering case: a green
base + one slot.

### 6b. Bloom-heads (for flowers that carry identity in their shape)
A daisy, an iris and an orchid would all collapse to that same dot. So flowers get the same
treatment as leaves: a **library of recognizable bloom-heads**, each a slot-driven silhouette
seated on a green base. **Shape carries the identity; color is the second cue.**

**Three bloom slots** make up the whole flowering vocabulary:

| Slot | Class | Role | Default |
|---|---|---|---|
| `--bloom` | `.petal` | Petals — the main flower color | (palette token) |
| `--bloom-center` | `.center` | Disc / throat / eye | `#E8A23C` |
| `--bloom-2` | `.accent` / `.accent-stroke` | Beard, stamens, petal tips, seams — optional | `#C9852F` |

Leaf/stem/pot slots are **reused as-is**, so any head rides any base.

### The 10 bloom-heads

**Exact paths live in `icons/Plant Icon System.html` (§05 "Ten heads cover the flowering
field").** Each is shown there in a neutral bloom so the *form* reads, not the color.

| # | Head key | Name | Covers | Slots used |
|---|---|---|---|---|
| 1 | `daisy` | Daisy / radial | Daisy · gerbera · sunflower · cosmos · chamomile | petal + center |
| 2 | `iris` | Iris / fleur | Iris · dutch iris · fleur-form | petal + accent (gold beard) |
| 3 | `orchid` | Orchid face | Phalaenopsis · moth orchid | petal + center + accent (column dots) |
| 4 | `lily` | Lily / trumpet | Lily · amaryllis · hibiscus · tulip | petal + center + accent (stamens) |
| 5 | `cluster` | Cluster / umbel | Hydrangea · geranium · kalanchoe · lantana | petal + center (per-floret) |
| 6 | `spike` | Spike / raceme | Lavender · snapdragon · hyacinth · salvia | petal (+ stem) |
| 7 | `poppy` | Poppy / open cup | Poppy · anemone · open tulip | petal + center + accent (dot ring) |
| 8 | `rose` | Rose / rosette | Rose · ranunculus · camellia · peony | petal (nested) + accent (spiral) |
| 9 | `tulip` | Tulip / bulb cup | Tulip · crocus · closed lily · gentian | petal + accent-stroke (seams) |
| 10 | `bell` | Nodding bell | Campanula · bluebell · snowdrop · fuchsia | petal (hanging bells) + accent-stroke (rim) + stem |

### The bloom palette (Option B — the locked decision)

Leaves stay green; flowers are the one place real plants demand hue. To keep it on-brand,
flower hues are a **curated set pinned to the same lightness & chroma band as Sun** (just
rotated in hue) — they feel like one family, yet let a flower read true. **Discipline lives in
the constraint** (one L/C band, named tokens), not in flattening every flower to amber.

| Token | Value | Use |
|---|---|---|
| `amber` | `#E0A050` (= `--sun`) | marigold, sunflower center, daisy eye |
| `coral` | `oklch(0.66 0.16 28)` | poppy, tulip, geranium |
| `rose` | `oklch(0.66 0.16 358)` | rose, camellia, orchid |
| `magenta` | `oklch(0.66 0.14 330)` | cosmos, fuchsia, cyclamen |
| `lilac` | `oklch(0.62 0.13 300)` | iris, lavender, campanula |
| `sky` | `oklch(0.64 0.11 250)` | bluebell, plumbago, forget-me-not |
| `cream` | `#F4ECDA` | white flowers (daisy, snowdrop, peace lily) |

Centers/accents may use deeper companions (e.g. gold `#EAD24E`, bark `#8A5A1E`, near-black
`#2A2118` for poppy eyes). **Validate every bloom token against this set** so no off-brand hue
slips in.

### Proportion rules (assembled flowers)

When a head is seated on a base, all flowering plants should read at a **consistent visual
mass** — the bloom shouldn't look tiny on one plant and oversized on the next.

- Seat the head so its **bottom overlaps the stem top** (no floating); head visual center lands
  around **y18–22**, foliage/pot below.
- Target head envelope **≈ 24–27px** across at icon scale. Normalize outliers with a transform
  about the head's center, e.g. a compact daisy is scaled up ~`1.16` and a wide orchid/large
  iris down ~`0.92`:
  ```html
  <g transform="translate(32 20.5) scale(1.16) translate(-32 -19)"> … head … </g>
  ```
- Color is the *second* cue — never rely on hue alone to tell two heads apart.

---

## 7. Data model — a plant icon is just a record

A skin is only variable values, so each plant carries one tiny `icon` field. It slots into the
existing `Plant` model (see `BRAND.md` §6); the renderer maps it to slot overrides at runtime.

```ts
type BloomToken = 'amber' | 'coral' | 'rose' | 'magenta' | 'lilac' | 'sky' | 'cream';

type IconRecipe = {
  base: BaseKey;                 // e.g. "trailing-vine" (see §4)
  palette?: {                    // optional green-family slot overrides
    leaf1?: string; leaf2?: string; leaf3?: string;
    stem?: string;  vein?: string;
    potBody?: string; potRim?: string;
  };
  variegation?: {                // optional leaf marking (§5)
    pattern: 'speckle' | 'marble' | 'margin' | 'center';
    color: string;               // → --variegation
  } | null;
  bloom?:                        // optional flower (§6)
    | { dot: 'sun' }             // legacy single-accent bloom
    | {                          // bloom-head
        head: HeadKey;           // e.g. "iris" (see §6)
        petal:  BloomToken;      // → --bloom        (validated against palette)
        center?: BloomToken | null; // → --bloom-center
        accent?: BloomToken | null; // → --bloom-2
      }
    | null;
};
```

Example — a blue-bearded iris:

```json
{
  "base": "upright-sword",
  "bloom": { "head": "iris", "petal": "lilac", "accent": "amber" }
}
```

Renderer → CSS variable slots on a wrapper that `<use>`s the base (and head) sprite symbols:

```html
<div class="ic" data-veg="speckle"
     style="--leaf-2:#5C9A33; --variegation:#E7C463;
            --bloom:oklch(0.62 0.13 300); --bloom-2:#EAD24E;">
  <use href="#base-upright-sword" />
  <use href="#head-iris" />
</div>
```

---

## 8. Implementation notes

- **Sprite, not copies.** Author each base and each head once as `<symbol>` in a shared SVG
  sprite; reference with `<use>`. One base SVG in the sprite, one record per plant. New
  cultivar = a new row, never a new drawing.
- **Heads are separate symbols** layered onto `base + connecting stem`. The bloom always rises
  on a stem or out of the leaf clump (single stem, sword clump, arching stalk, or bulb) — see
  the four assembled examples in the HTML for how the head attaches in each case.
- **Token-validate blooms** against the palette (§6) at write time; reject off-brand hues.
- **Recolor only via slots.** Never edit path fills directly — the whole point is that geometry
  is frozen and color is data.
- **Accessibility:** the `.ic` wrapper should carry an `aria-label` of the plant name (or be
  `aria-hidden` when the name is already adjacent). Decorative-only otherwise.
- **Default state is green & resting:** `--variegation` and `--bloom` default `transparent`, so
  a base with no overlay recipe renders as a plain green potted plant.
- **Match the HTML exactly.** `icons/Plant Icon System.html` encodes the tuned path geometry,
  layer order, stroke weights, and proportion transforms. Copy SVG bodies verbatim; this doc is
  the rulebook, that file is the parts bin.

---

## 9. File map

| Path | What |
|---|---|
| `icons/Plant Icon System.html` | **Geometry source of truth** — all 14 bases, the reskin/variegation proofs, the 10 bloom-heads, the bloom palette, and 4 assembled flowering plants. Copy `<svg>` bodies from here. |
| `icons/Flower Options.html` | The flower study that argued the bloom-head system + Option B palette (rationale / decision record). |
| `icons/colors_and_type.css` | Brand tokens used by the icon docs (same as root `colors_and_type.css`). |
| `colors_and_type.css` | Root drop-in tokens (Sun, greens, neutrals). |
| `BRAND.md` | App build handoff — where the `icon` field lives on the `Plant` model (§6). |

---

*Rootly plant icon system · base + variegation + bloom via CSS-variable slots · geometry frozen,
color is data.*
