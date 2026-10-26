# TECHNICAL REPORT

**Project:** Shehan Nadeesha — personal portfolio
**Author:** Shehan Nadeesha
**Build type:** hand-written static site — no framework, no build step, no dependencies
**Stack:** HTML5, CSS3 (custom properties, 3D transforms), vanilla ES6 JavaScript, one sandboxed iframe
**Report date:** October 2026

---

## 1. Abstract

This report documents how the portfolio is built and, more importantly, *how it was verified*.
The site is a single-page, dependency-free application that presents four things: the work, the
person, the craft, and the interactions that show the craft. Every effect — the ASCII portrait,
the wooden achievement cabinet, the 3D award viewer, the morph player, the workbench, the
command palette — is implemented from scratch in plain HTML, CSS and JavaScript.

The engineering goal was not "add animations". It was: **produce unusual, memorable interactions
without a framework, without a network dependency, and without breaking accessibility, layout or
performance.** Sections 4–6 describe the techniques; §7 describes the verification harness used
to prove the claims in this document; §8 lists the constraints that were audited on every build.

---

## 2. Objectives and constraints

| # | Objective | How it is met |
|---|---|---|
| 1 | Instantly legible, job-ready portfolio | Hero → work → about → skills → contact, with a persistent nav and a command palette for everything else |
| 2 | Memorable, non-template interaction design | Nine signature systems (§5) that are hand-written, not library defaults |
| 3 | Zero runtime dependencies | No CDN, no bundler, no npm package ships to the browser |
| 4 | Strict two-colour identity | Red `#e11d2e` / white `#fff` / ink `#16161a`, **zero CSS gradients** |
| 5 | Honest content | Only real projects and real awards; no invented achievements, no placeholder metrics |
| 6 | Accessible by construction | Keyboard paths for every feature, focus return, `aria-modal` dialogs, reduced-motion support |
| 7 | Fast on a mid-range phone | ~393 KB total transfer, first contentful paint ≈ 236 ms locally (§7.3) |

**Hard constraints carried through the whole build**

- **No CSS gradients anywhere.** Highlights, glows and grid patterns are solid fills, box-shadows or inline-SVG data URIs.
- **No custom cursor.** The native OS pointer is used everywhere.
- **No status/pulse dots.** A pulsing point of colour reads as a stray cursor artefact in still layouts.
- **No invented content.** Two awards only (YouTube Play Button, SLIIT AI/ML Stage 1); one unnamed coming-soon card.
- **Every effect must degrade.** Reduced-motion, coarse-pointer and small-screen paths exist for all of them.

---

## 3. Architecture

### 3.1 File map

```
portfolio/
├── index.html                1174 lines — semantic markup, inline SVG sprite, dialogs
├── css/
│   ├── style.css             2268 lines — tokens, layout, components, morph engine, responsive
│   └── signature.css         1795 lines — the nine signature systems
├── js/
│   ├── main.js                915 lines — loader, reveals, nav, palette, terminal, torch, tilt
│   └── signature.js          1306 lines — portrait, cabinet, award viewer, player, trace, workbench, keys
├── assets/
│   ├── hero-cutout.png/.webp       transparent portrait (864 × 1100)
│   ├── awards/play-button.webp     studio render, 1500 × 818
│   ├── awards/certificate.webp     studio render, 1500 × 818
│   ├── fonts/                      Outfit + Inter variable woff2 (self-hosted)
│   └── Shehan-Nadeesha-CV.pdf      one-page CV
└── docs/                          18 preview screenshots used by the READMEs
```

**Two scripts, two stylesheets.** `main.js` owns the page-level shell (loader, reveal observer,
navigation, palette, terminal). `signature.js` owns the nine showcase systems and is written as a
list of IIFEs, each guarded by the presence of its root element:

```js
(function cabinet() {
  const rig = $('#cabRig'), cabinet = $('#cabinet'), shelf = $('#cabShelf');
  if (!rig || !cabinet || !shelf) return;   // feature-detect, never assume
  ...
})();
```

This pattern means any section can be removed from `index.html` without touching JavaScript — a
deliberate consequence of an earlier iteration where deleting one feature silently broke others.

### 3.2 Layering strategy

| Layer | Responsibility | Rule |
|---|---|---|
| **Tokens** | One `:root` block defines every colour, font, radius and easing curve | Never hard-code a hex outside tokens (wood/gold are the only scoped exception) |
| **Layout** | `.wrap`, grid templates, `clamp()` fluid type | Layout never depends on JavaScript |
| **Component** | `.pcard`, `.cab__*`, `.por__*`, `.award__*` | Each component is self-contained and prefixed |
| **Motion** | `main.js` shell + `signature.js` systems | Motion is always opt-out-able |

`clamp()` appears 109 times across the stylesheets — fluid type and spacing without media-query
steps. Thirty-three media queries cover the cases where layout must genuinely change (grid collapse,
mobile crop of the hero, stacked cabinet).

---

## 4. Core techniques

### 4.1 Icon system — one inline sprite, zero requests

45 `<symbol>` definitions sit in a single hidden `<svg>` at the top of the document. Any icon is
then `<svg class="ico"><use href="#i-arrow-right"/></svg>`. Benefits: no extra HTTP request, icons
inherit `currentColor` so they theme automatically, and they cost nothing on repeat use.

### 4.2 Fluid typography and spacing

```css
.section__title{ font-size: clamp(1.9rem, 4.6vw, 3.4rem); }
```

Every heading, gap and padding is expressed as a `clamp()` band rather than a breakpoint ladder.
The result is a layout that never "jumps" between arbitrary widths.

### 4.3 Reveal-on-scroll with `IntersectionObserver`

Elements marked `.reveal` start at `opacity:0; translateY(26px)` — but only when
`html.js` is present, so a JavaScript failure leaves the page fully readable. A single observer
adds `.is-in` with a staggered `transition-delay` derived from a `--d` custom property. Six
observers handle reveals, counters, the nav indicator, the lazy video and the scroll-scrubbed
statement.

### 4.4 State-driven CSS variables

Pointer position is written to the element as a CSS variable, never as a class:

```js
el.style.setProperty('--mx', `${e.clientX - r.left}px`);
el.style.setProperty('--my', `${e.clientY - r.top}px`);
```

`.spotlight` uses those variables to place a solid radial highlight; the torch reveal uses
`--tx/--ty` to move a `clip-path` circle. This keeps JavaScript to two writes per frame and leaves
all visual decisions in CSS.

### 4.5 The morph engine

A scroll driver (`data-morph="..."`) maps scroll progress to a small set of CSS variables. The hero
panel, its ring and the section-divider SVG all read the same progress value, so they morph in
lockstep without a timeline library. All morph transforms are zeroed under
`prefers-reduced-motion: reduce`.

---

## 5. The nine signature systems

Each entry states the *technique*, because that is the part worth documenting.

### 5.1 ASCII portrait — 2,440 characters that are not an image

- A luminance pass over a downscaled copy of the photo is baked into two **ASCII source strings**
  in `signature.js` (40 × 61 fine, 26 × 40 coarse), so the browser never needs canvas access to
  the photo at runtime.
- `porTiles()` builds 2,440 `<i>` tiles whose glyph is picked from the ramp
  `" .:-=+*#%@"` by the sampled brightness of each cell.
- Reveal is driven by a **scroll-linked lock percentage**: each tile interpolates from a random
  depth position to its grid slot with a per-tile stagger, so the portrait "flies together" and
  locks.
- A toggle (`F`) cross-fades the tile field with the real photograph.
- Cost: 2,440 DOM nodes, all `aria-hidden`, GPU-composited transforms only.

### 5.2 Achievement cabinet — CSS 3D case

- The case is a stack of absolutely-positioned flat planes (`--wood-1/2/3`, grain drawn as an
  inline-SVG data URI, not a gradient) inside a `preserve-3d` container.
- Scroll tilt is a single function of viewport position: `rotateX` runs **11° → 2°** as the case
  crosses the screen.
- Drag rotates the shelf `±22°` around Y, with a spring-back loop that **sleeps** (220 ms timer)
  whenever the shelf is at rest instead of burning a frame per tick.
- Pieces lift on hover/focus with `translateZ(52px) rotateY(-14deg) scale(1.06)`.
- **Layout stability is a hard requirement:** the hover detail line reserves its space with
  `min-height`, so the case's height never changes on hover (12 px of growth would re-project every
  child under `rotateX` and make the whole shelf twitch). Verified: 502 px → 502 px at 1440 px,
  418 px → 418 px at 768 px, 888 px → 888 px on mobile.

### 5.3 Award viewer — a "3D" plate over a blurred copy of itself

```
[click] → #award dialog
  .award__backdrop      same render, cover-cropped, blur(30px) + scrim
  .award__stage         perspective: 1200px, perspective-origin 50% 45%
    .award__card        solid plate, aspect-ratio from --rw/--rh
      .award__plate     flat #101014 fill, hairline bevel, hard drop shadow
      .award__img       object-fit: cover — the render fills the plate edge to edge
      .award__gloss     masked specular band (SVG mask, not a gradient)
      .award__floor     blurred ellipse standing in for contact shadow
```

- **Proportion is data, not a guess.** `--rw/--rh` on the card: **3:4** for the play button,
  **4:3** for the certificate. Size is `min(86vw, 760px, 55vh × ratio)` so the plate never
  overflows the stage on any viewport.
- **One rAF loop drives all motion.** Pointer tilt is *eased* toward a target (damped, ~12 % per
  frame) instead of being set directly from the pointer; the pointer only has authority while it is
  genuinely over the stage (`pointerenter`/`pointerleave`); drag is a separate mode with pointer
  capture; after 900 ms of stillness the piece breathes back to its rest pose on a sine sweep.
- The transform string is written **only when it changes**, so idle frames cost nothing.
- Focus management: the dialog is `visibility:hidden` while it fades in, so focus is moved after
  the 520 ms transition (an earlier 140 ms attempt silently failed); `Tab` is trapped inside the
  viewer; `Esc`, `✕` and backdrop click all restore focus to the plinth that opened it.

### 5.4 Morph player — 30 seconds, six chapters, no video file

- A chapter table (`scatter → split → rise → wave → web → name`) maps the playhead to a geometry
  function; each of the 112–192 tiles (count is responsive: 16 × 7, 13 × 9, 10 × 12) reads its own
  position from the current chapter's maths.
- The playhead is `requestAnimationFrame` time, not a media element — so the whole "film" costs
  ~4 KB of code and can be scrubbed, paused and chapter-jumped.

### 5.5 Trace overlay — self-auditing design tooling

`Shift+T` outlines labelled regions of the live DOM in place and prints each element's measured
width × height. It also **walks every element in the document counting gradient backgrounds** and
prints the honest result (`0 CSS gradients`). This is the same audit that is run headlessly before
every delivery — it is shipped to the user as a feature rather than hidden in a script.

### 5.6 Live workbench — a code playground in an iframe

- Three files (HTML/CSS/JS) with a hand-written **single-pass tokenizer** for syntax highlighting
  (no Prism, no highlight.js).
- A live search with hit counts, and a running **sandboxed** preview:
  `<iframe sandbox="allow-scripts" referrerpolicy="no-referrer">` fed via `srcdoc`.
- The demo app forecasts bus routes — real arithmetic executed inside the sandbox, so the preview
  proves the editor works.

### 5.7 Command palette — keyboard-first navigation

`⌘K`/`Ctrl-K` opens a 19-command palette in four groups (Navigate / Links / Commands). Filtering is
substring over `label + group`, arrow keys move `aria-selected`, `Enter` runs, `Esc` closes and
returns focus. Feature actions call the same public API the shortcuts use (`window.__sig.player()`
etc.), so there is exactly one implementation of each action.

### 5.8 Keyboard map — `G`-prefixed jumps plus a `?` sheet

- A 15-row shortcut sheet (`?`) lists everything: `⌘K`, `P`, `⇧T`, `⇧W`, `T`, `/`, `?`, `Esc`, `F`,
  and the `G` + `W/A/S/C/E/P/B` jump map.
- Jump targets are resolved by id and offset by the nav height, so a jump always lands exactly
  84 px below the sticky nav.

### 5.9 Terminal — a real shell-shaped easter egg

`T` opens a terminal whose command table (`whoami`, `skills`, `projects`, `kasala`, `contact`, `cv`,
`ls`, `clear`, `exit`, `help`) writes into a `role="log"` region. Input is guarded so global
shortcuts never fire while typing.

---

## 6. Accessibility and motion

| Concern | Implementation |
|---|---|
| Reduced motion | `prefers-reduced-motion` is checked in both scripts and in 7 CSS blocks (each covering many selectors); transforms are disabled, not just shortened |
| Dialog semantics | `role="dialog"`, `aria-modal="true"`, labelled by their title, `hidden` when closed |
| Focus | Focus is moved into a dialog on open, trapped with `Tab`, and returned to the invoking control on close |
| Keyboard parity | Every mouse feature has a key path: cabinet (arrows), viewer (arrows/Esc), palette (`⌘K`), terminal (`T`), portrait orbit (arrows), workbench (`⇧W`) |
| Screen readers | Decorative art is `aria-hidden`; the 2,440 tiles are hidden and the section carries a text description; icon buttons carry `aria-label` |
| Contrast | Ink on white 15.9:1, white on red 4.9:1, red on white 4.9:1 — all above AA for their sizes |
| No-JS | Reveals default to visible; the page is readable and navigable with scripts blocked |
| Coarse pointer | Hover-only effects have `@media (hover:none)` fallbacks that show the same information statically |

---

## 7. Verification methodology

Everything below was measured, not assumed. The harness is headless Chromium (Playwright) driving
the real page over a local server, at **1440 × 950, 768 × 1024 and 390 × 844** (the phone profile
with `is_mobile` and a touch screen so tap paths are exercised, not just mouse paths).

### 7.1 Functional checks per build

| Check | Method | Expected |
|---|---|---|
| Console health | Collect `pageerror` + `console` error events on load and through every interaction | zero |
| Network | Record every response ≥ 400 | zero |
| Overflow | `documentElement.scrollWidth − innerWidth` at every breakpoint | 0 |
| Gradients | Walk all elements, test `backgroundImage` and `maskImage` against `/gradient/` | 0 |
| Pulse dots | Walk all elements, inspect `animationName` for `/pulse/` | 0 |
| Feature clicks | Real pointer and real tap on the plinths, not `element.click()` | dialog opens with the right `src` and `data-kind` |
| Drag vs click | Press → move 70 px → release, then a plain click | drag turns the shelf and does **not** open the viewer; click opens it |
| Layout stability | Measure cabinet height at rest and on hover | identical |
| Viewer proportions | `plate.width / plate.height` | 0.75 (3:4) and 1.33 (4:3) |
| Focus lifecycle | Focus the plinth → open → `Esc` | `document.activeElement` is that plinth again |

### 7.2 A worked example — the hover bug

The cabinet "jittered" on hover. Rather than guessing, the height was measured before and after:

```
cabinet height rest/hover1/hover2: 497 502 502
```

The 5–12 px growth came from an animated `height` on the hover detail line. Because the case is a
`rotateX` 3D container, every child is re-projected when the case changes height — so the shelf
appeared to move under a stationary pointer. Fix: reserve the space (`min-height`), animate only
opacity and transform. Re-measured: `502 502 502`. The same technique found a second bug — the
piece art sat **above** the invisible hit button in paint order and was swallowing real clicks
(scripted `click()` still worked, which is why the earlier test passed). Fix: `pointer-events:none`
on the art layers, so the button is the only target.

### 7.3 Measured performance (desktop, local server, cold cache)

| Metric | Value |
|---|---|
| DOMContentLoaded | 270 ms |
| Load | 292 ms |
| First contentful paint | 236 ms |
| Resources | 9 requests |
| Total transfer | ≈ 393 KB |
| Largest asset | `hero-cutout.webp` 64 KB |
| CSS | `style.css` 64 KB / `signature.css` 52 KB (≈ 15 KB / 12 KB gzipped) |
| JS | `main.js` 36 KB / `signature.js` 50 KB (≈ 10 KB / 15 KB gzipped) |
| Fonts | 2 × variable woff2, preloaded, 80 KB total |

### 7.4 Regression protocol

When a feature is deleted, its *neighbours* are the risk. Removing the insight deck also removed
the `G`+letter jumps and the `?` sheet, because they lived in the retired script — so the checklist
now explicitly re-tests navigation, the palette (19 rows), the shortcut sheet (15 rows) and `Esc`
handling after **any** structural change. Container balance (`<div>` open/close counts per section)
is asserted before markup is inserted, after an unclosed `</div>` once pushed later sections into
the wrong container.

---

## 8. Known limits and deliberate choices

| Limitation | Why it is acceptable |
|---|---|
| The "3D" award is a lit 2D plate, not a mesh | The object is a flat plaque and a flat certificate; a real mesh would add hundreds of KB for no visual gain. Depth is carried by perspective, a solid back, a specular band and a contact shadow |
| 2,440 DOM nodes for the portrait | They are inert, `aria-hidden`, transform-only; the alternative (a canvas) would lose text selectability, crispness and the "these are real characters" idea |
| No image for the award cabinet | CSS/SVG art keeps the section weightless and makes the hover/tilt transforms free |
| Hero portrait is cropped, not full-body | At small sizes a face-forward crop communicates far better, and the alpha cut-out lets the red panel and chips sit around it |
| The coming-soon card names nothing | A real unannounced project must stay private; redaction is honest where a fake name would not be |
| Screenshots may lag the live build | `docs/*.png` are regenerated on every structural change; the code is the source of truth |

---

## 9. References

- MDN Web Docs — *CSS Transforms, `perspective`, `transform-style: preserve-3d`*; *IntersectionObserver*; *`pointer` events*; *`prefers-reduced-motion`*.
- W3C — *Web Content Accessibility Guidelines 2.1* (2.1 keyboard, 2.4.7 focus visible, 4.1.2 name/role/value).
- WHATWG — *HTML Living Standard*: `dialog`, `iframe sandbox`, `hidden` attribute.
- WebAIM — *Contrast Checker* (values in §6).

---

*Companion documents: `README.md` (what the site contains, in plain language) and this report
(how it is built and how it was proven).*
