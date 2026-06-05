#!/usr/bin/env python3
"""Generate Rootly's PWA / home-screen icons.

Renders the Rootly sprout mark in soft sprout-white on a rich forest-green
badge, rasterised crisply from vector source at every size the app references.

Run from the frontend/ directory:  python3 scripts/generate_icons.py
"""
import os

import cairosvg

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "public", "icons"))

# Forest-green badge gradient (centred on brand canopy #20503B) and the
# soft sprout-white used for the mark.
GREEN_TOP = "#265A43"
GREEN_BOTTOM = "#1A4634"
MARK = "#EFF6EA"

# The sprout mark in its native 48-unit coordinate space.
STEMS = [
    "M24 19 V30.5",
    "M24 30.5 C19.5 34 16.5 38 15 43.5",
    "M24 30.5 V44",
    "M24 30.5 C28.5 34 31.5 38 33 43.5",
]
LEAF_MAIN = "M24.2 21 C24.2 12.5 18.5 6 9.5 5 C8.6 14.2 14.8 20.6 24.2 21 Z"
LEAF_SOFT = "M24.2 21 C24.2 13.5 29 8 36.6 7.2 C37.2 14.8 32.4 20.4 24.2 21 Z"

# Mark bounding box in the 48-unit space (used to centre it on the badge).
MARK_CX, MARK_CY, MARK_H = 23.05, 24.5, 39.0


def build_svg(size: int, radius_frac: float, mark_scale: float) -> str:
    """Return an SVG string for a single icon at the given pixel size."""
    k = (size * mark_scale) / MARK_H
    tx = size / 2 - MARK_CX * k
    ty = size / 2 - MARK_CY * k
    radius = size * radius_frac

    stems = "\n".join(f'      <path d="{d}" />' for d in STEMS)
    rect = (
        f'<rect x="0" y="0" width="{size}" height="{size}" '
        f'rx="{radius:.2f}" ry="{radius:.2f}" fill="url(#bg)" />'
    )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{GREEN_TOP}" />
      <stop offset="1" stop-color="{GREEN_BOTTOM}" />
    </linearGradient>
  </defs>
  {rect}
  <g transform="translate({tx:.3f} {ty:.3f}) scale({k:.5f})">
    <g stroke="{MARK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none">
{stems}
    </g>
    <path d="{LEAF_MAIN}" fill="{MARK}" />
    <path d="{LEAF_SOFT}" fill="{MARK}" opacity="0.6" />
  </g>
</svg>'''


# size, filename, corner-radius fraction, mark-scale fraction
ICONS = [
    (32, "icon-32x32.png", 0.24, 0.66),
    (120, "icon-120x120.png", 0.0, 0.50),   # apple-touch: iOS rounds for us
    (152, "icon-152x152.png", 0.0, 0.50),
    (167, "icon-167x167.png", 0.0, 0.50),
    (180, "icon-180x180.png", 0.0, 0.50),
    (192, "icon-192x192.png", 0.23, 0.52),
    (512, "icon-512x512.png", 0.23, 0.52),
    (512, "icon-512x512-maskable.png", 0.0, 0.40),  # full-bleed safe zone
]


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    for size, name, radius_frac, mark_scale in ICONS:
        svg = build_svg(size, radius_frac, mark_scale)
        cairosvg.svg2png(
            bytestring=svg.encode("utf-8"),
            write_to=os.path.join(OUT, name),
            output_width=size,
            output_height=size,
        )
        print(f"wrote {name} ({size}x{size})")

    # Crisp branded SVG for the browser tab (scales to any density).
    svg_badge = build_svg(64, 0.23, 0.52)
    with open(os.path.join(OUT, "icon.svg"), "w") as fh:
        fh.write(svg_badge + "\n")
    print("wrote icon.svg")


if __name__ == "__main__":
    main()
