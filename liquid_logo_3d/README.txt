LIQUID LOGO — 3D MODEL (animated flowing material)
====================================================

HOW TO VIEW
1. Unzip this folder.
2. Double‑click "index.html" — it opens in your web browser (Chrome/Edge/Firefox/Safari).
3. No install needed. It just needs an internet connection once, to load the
   three.js library from a CDN.

CONTROLS
- Drag with your mouse/finger to rotate the model.
- Scroll / pinch to zoom in and out.
- It also auto-rotates slowly on its own.

WHAT'S INSIDE
- A true 3D extruded shape (with beveled depth on all edges, so it reads as
  a solid object from every angle, not a flat cutout) built to match the
  outline of your logo — the rounded left lobe, the winged right lobe, the
  tapering tail, and the triangular negative-space gap between them.
- A custom liquid shader material that slowly flows:
    • in a lazy spiral inside the left (navy) lobe,
    • diagonally up‑and‑right through the magenta wing,
    • and pours slowly downward into the tail —
  matching the flow arrows you marked on the reference image.
- Colors are matched to the artwork: deep navy/black on the left, blending
  through violet and magenta into a bright pink-magenta core where the
  lobes meet and down through the tail.

CUSTOMIZING
Open index.html in a text editor:
- Search "uTime.value" section / fragmentShader to tweak flow speed — the
  multipliers on `t` (e.g. t*1.4, t*2.2, t*2.6) control how fast each
  region flows. Lower = slower/heavier liquid.
- The color vec3(...) values (navyDeep, navyMid, violet, magenta, hotPink,
  brightCore) can be edited to shift the palette.
- `autoSpin` near the bottom controls the idle rotation speed (set to 0 to
  stop auto-rotation).
