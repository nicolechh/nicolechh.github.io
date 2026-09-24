# Design System — nicolechh.github.io

The written reference for this site's design system. For a live, visual version of everything below — rendered with the site's actual CSS, not a description of it — see **[style-guide.html](style-guide.html)** (open it locally or at `/style-guide.html` once deployed; it's intentionally not linked from the public nav).

## Why this exists

The site started as one hand-tuned `index.html`. As more pages and sections get added, the thing that keeps them feeling like the same site — not a homepage bolted to a bunch of one-off pages — is a shared stylesheet and a small set of rules for reusing it. This document is that rule set.

**The one mechanical rule that makes everything else possible:** all CSS lives in `styles.css`. Every page links it. Nothing forks it, copies part of it into a page's own `<style>`, or redeclares a color as a literal hex value instead of a token. A token or component changed in `styles.css` changes everywhere at once — that's the whole point, and it's also why the style guide can never drift out of sync with the real site: it's linking the same file.

## Concept

The design language is a **design tool's own canvas**, not a page pretending to be one: a dot grid background that responds to the pointer, corner-ruler chrome with live tick marks, "marquee" selection boxes with corner handles around key elements, and a custom Figma-style cursor with live coordinates. Content sits *on* that canvas rather than inside a conventional page chrome.

Three fonts, one superfamily: **Geist** (body/display), **Geist Mono** (labels, nav, meta — always uppercase and letter-spaced), **Geist Pixel** (display only, single weight — the hero name and section headings). Geist Pixel is a Geist sibling, so it pairs by construction; don't introduce a fourth family.

## Tokens

All defined on `:root` in `styles.css`, redefined for dark mode both by `prefers-color-scheme` and by `[data-theme]` (for a manual override, e.g. from a future theme toggle).

### Color

| Token | Role |
|---|---|
| `--paper` | Page background |
| `--paper-2` | Recessed fills — thumbnails, the dot canvas |
| `--card` | Card / raised surfaces |
| `--chrome` | Translucent glass — nav bar, ruler frame (blurred) |
| `--menu-bg` | Opaque glass — the open mobile menu, and the bar while it's open |
| `--ink` / `--ink-2` / `--ink-3` | Primary / secondary / tertiary text |
| `--rule` / `--rule-soft` | Dividers (higher contrast) / quiet borders (cards, thumbs) |
| `--edge` | Ruler ticks, control borders — kept at ≥3:1 against its background (non-text contrast) |
| `--accent` | Links, focus rings, the "hot" dot color, the ruler's cursor marker |
| `--select` | Marquee borders, hover/select states |
| `--tag-blue` | **Fixed, not theme-swapped** — see below |
| `--dot` / `--dot-hot` | Dot-grid resting / near-cursor colors |
| `--on-select` | Text color on an `--select`-filled surface |

**`--tag-blue` is deliberately fixed at `#2E5BEA` in both themes**, unlike `--select`, which swaps to a lighter tint (`#7391FF`) in dark mode. White text on `--tag-blue` passes WCAG AA (~5.5:1) in both themes. `--select`'s dark value is a light accent meant to sit *on* a dark page — it does not have enough contrast to carry white text itself. **Any new component that fills a shape solid-blue with white text on top must use `--tag-blue`, never `--select`.** If you introduce a new filled-surface-plus-text color pairing that isn't this one, check its contrast ratio in both themes before shipping it — don't assume an existing token carries over to a use it wasn't checked for.

### Typography scale

| Use | Spec |
|---|---|
| Hero name | `15.1cqw` desktop, `28.8cqw` ≤560px — sized to a **container query**, not the viewport, so it fills its column at any width without a lookup table of breakpoints |
| h2 / section heads | `clamp(1.35rem, 2.8vw, 2rem)`, Geist Pixel |
| Lede / filled tag | `clamp(1.15rem, 2vw, 1.65rem)` — shared by `.lede` and `.sticker` deliberately; keep them matched if either changes |
| Card title (h3) | Geist, weight 600 (`font-variation-settings:"wght" 600`), `-0.015em` tracking |
| Body copy | 16px / 1.55 base; card copy at `0.9rem` |
| Mono labels (nav, meta, card labels) | 9–11px, `0.05–0.08em` tracking, always uppercase |

### Spacing & layout

| Token | Value | Notes |
|---|---|---|
| `--gutter` | 24px desktop, 0 ≤560px | Reserves room for the ruler frame; collapses once the ruler's hidden so mobile margins stay symmetric left/right |
| `--maxw` | 1180px | Caps `main`'s width |
| `--step` | 8px | Base unit for small fixed gaps |

Content padding inside `main` is `clamp(20px, 4vw, 56px)`. Section rhythm (padding between sections, gaps within them) is `clamp()`-based throughout — e.g. `clamp(80px, 12vh, 120px)` under `#work`. **Match the existing clamp ranges when adding a section rather than inventing a fixed pixel gap** — a hardcoded value won't scale the way its neighbors do.

### Breakpoints

| Width | What changes |
|---|---|
| ≥901px | Work grid is 3-column; cards share row tracks via CSS `subgrid` so thumbnail/title/description/meta line up across all three |
| ≤900px | Work grid and about-body drop to 1 column |
| ≤560px | "Mobile": hero name stacks and centers, ruler + gutter hidden, lede centers, hero padding becomes symmetric top/bottom |
| ≤500px | Nav collapses straight to the hamburger — deliberately the *same* threshold where a centered nav would start crowding the reduce-motion toggle, so there's no in-between state where links de-center into flow order while the toggle stays pinned right |

## Components

### Marquee (selection box) — `.sel-box` / `.tbox`

The core motif: a solid 1–1.5px `--select` border with four small corner-handle squares (see style guide for the live demo). Used on the hero name, the lede's frame, and card hover/focus states. **Always solid, never dashed** — an earlier version used dashed borders; it changed and should stay changed.

Card marquees also carry a `.sel-dim` label (mono, `--select` background, `--on-select` text) reporting the element's measured size, via a `ResizeObserver` — a nod to a design tool's own selection readout.

### Tag / filled marquee — `.sticker`

Same corner-handle idea, but with a solid `--tag-blue` fill and bold white text instead of a transparent frame (the "Product designer" tag). Border color matches the fill exactly — the border is structurally still there (and still reads as "marquee" via the handles) even though it's invisible against the same-color fill. **Any new filled tag reuses this class**, not a new pill/badge pattern.

### Card — `.card` → `.card-body` → `.thumb` / `h3` / description / `.meta`

White (`--card`) fill, `--rule-soft` border. `.thumb` is a 16:10 area (SVG illustrations in the current cards use the same color tokens as everything else — `fill="var(--rule)"` etc. — so a thumbnail SVG re-themes automatically with the rest of the page). `.meta` stacks date/role/studio rather than running them inline, so a longer role on one card doesn't wrap while the others don't and throw off the shared baseline.

On ≥901px the three cards use CSS `subgrid` to align rows across the whole set — **don't give one card extra wrapper markup the others don't have**, or the row alignment breaks.

Interaction states are deliberately split three ways:
- **Hover** (`@media (hover:hover)` only) — a tap on a touchscreen must never leave a card stuck in its hover state.
- **`:active`** — covers the touch/press case; browsers drop `:active` the instant a touch ends or turns into a scroll, so it can't get stuck the way `:hover` or `:focus-within` can.
- **`:focus-visible`** (via `:has(:focus-visible)` on the card) for keyboard users — never `:focus-within`, which a touch tap also triggers.

Any new interactive element that needs hover/press/keyboard states should follow this same three-way split.

### Section head — `.head`

Heading (Geist Pixel) + small mono meta note, space-between, bottom rule. Every top-level section opens with one (`Selected Work` / `Updated Sep 2026`, `About` / `Colophon`). A new top-level section should too, for the same reason every section has the same vertical rhythm.

### Nav / motion toggle

The nav bar (`.bar`) is a full-width, fixed, translucent glass strip (`--chrome` + blur) that turns opaque (`--menu-bg`) only while the mobile menu is open. Below ~500px it collapses straight to a hamburger — see Breakpoints above for why there's no intermediate state.

The reduce-motion switch (`.motion-track`) is the reference pattern for **any future toggle or button-sized control**: visually a 26×14 pill, but its real hit target is 44×44 (negative margin pulls the layout footprint back down to the pill's visual size so it doesn't widen the row). It meets WCAG 2.5.5 (AAA, 44×44) well past the 2.5.8 (AA) 24×24 minimum. Only the switch itself is clickable — the label is wired up for accessible naming via `aria-labelledby`, not by wrapping it in the control, so clicking the text does nothing. **Expand a control's hit area with margin, never by inflating the visible control.**

### Chrome & signature motifs (dot grid, ruler, cursor)

These are canvas- and JS-driven (see `index.html`'s inline script), not pure CSS, so a new page that wants them has to bring the corresponding markup + script along, not just link `styles.css`. Notes if you do:

- **Dot grid**: 26px pitch, reacts to a real pointer within a fixed radius; on touch it reacts *only* while the screen is actually held down (never on scroll or an idle finger) — this was a deliberate fix, don't regress it.
- **Ruler**: shows a live cursor-position marker for a mouse, but never for touch (a touch jumps rather than glides toward a target, so the marker would just be visual noise). Hidden entirely ≤560px.
- **Custom cursor**: a Figma-style arrowhead (`--tag-blue` fill, white outline) with live X/Y coordinates, replacing the OS cursor — gated to `(hover:hover) and (pointer:fine)` devices only. Touchscreens get neither `cursor:none` nor the chip. The `cursor:none` rule in `styles.css` is itself scoped to `body:has(.cursor-chip)`, so a page that doesn't include the chip markup + script (most new pages won't) simply keeps its native cursor rather than hiding it with nothing drawn in its place — don't remove that scoping when touching this rule.

## Accessibility rules

These aren't optional polish — treat them as part of the system:

1. **Contrast**: any solid-fill-plus-text pairing gets checked against WCAG AA in both themes (see `--tag-blue` above for why).
2. **Hit targets**: interactive controls meet at least 24×24 (WCAG 2.5.8); prefer 44×44 (2.5.5) via padding/margin, not by resizing the visible control.
3. **State gating**: hover behind `@media (hover:hover)`, press feedback via `:active`, keyboard focus via `:focus-visible` — never `:focus-within` for anything a touch tap can also trigger.
4. **Motion**: respect both `prefers-reduced-motion` and the site's own reduce-motion toggle (`[data-motion="reduced"]`) for any new animation.
5. **Text on mobile**: `text-size-adjust: 100%` is set globally to stop mobile browsers auto-boosting small text — don't rely on that boosting instead of picking a legible size.

## Adding a new page or section — checklist

1. Link `styles.css`. Don't paste or fork any part of it into the new page's own `<style>`.
2. Reach for an existing token first. If nothing fits, that's a signal the *system* needs a new token — add it to `:root` (and its dark-mode overrides) rather than hardcoding a one-off value in a selector.
3. New filled-color-plus-text pairing? Check contrast in both themes.
4. New interactive control? Follow the hover/`:active`/`:focus-visible` split and the 44×44-hit-target-on-a-smaller-visual pattern.
5. New repeating "selection" chrome reuses `.sel-box`'s pattern; a new filled tag reuses `.sticker`'s. Don't invent a third variant of the same idea.
6. Respect reduced-motion.
7. Check both themes and at least 375px / 900px / 1200px widths before calling it done.
8. If the work introduces a genuinely new token or component (not just a new *use* of an existing one), add it to this document and to `style-guide.html`.

## File map

| File | Role |
|---|---|
| `styles.css` | The entire design system — every token and component style |
| `index.html` | The homepage; links `styles.css`, adds its own canvas/cursor script |
| `style-guide.html` | Live visual reference for everything in this document |
| `404.html` | Links `styles.css`; a small page-specific layout on top |
| `case-study.css` | Article layout for case study pages — extends `styles.css`, doesn't duplicate it |
| `case-study.js` | Shared behavior for case study pages: image lightbox, TOC scroll-spy, light/dark + viewport image switches, carousels |
| `nav.js` | Shared nav bar behavior (menu + reduce-motion toggle) for pages without `index.html`'s dot-grid/cursor script |
| `case-studies/<slug>/` | One case study per project — `index.html` + its own `Assets/` (source content lives alongside the published page) |
| `DESIGN-SYSTEM.md` | This file |

### Case study pages

Each project under `#work` links to `case-studies/<slug>/index.html` (slug matches the card's `.card-label`, e.g. `masking-in-boards`). The Figma design system file is the source of truth for these pages: the "CS - *" frames (1440 desktop), "Mobile - CS *" frames (375), and the alternate-state frames beside them (light/dark, tablet/mobile viewport, before/after slides). Copy, captions, colours and type come from there; the source RTFs are regenerated from the published page, not edited separately. A case study page:

- Uses Figma's light-mode Color variables, which `case-study.css` restates on `:root` (`--paper`, `--paper-2`, `--ink`, `--ink-2`, `--ink-3`) — only these pages load that file, so the homepage keeps `styles.css`'s older values until it's updated to match. Dark values already matched Figma, and `styles.css`'s dark selectors outrank the plain `:root` override.
- Keeps the site's own nav background treatment (glass `.bar`, solid while the menu is open) — Figma can't express that, so only the nav's *content* follows Figma: 20px side padding, 12px links, and a Lucide `menu` icon with no "Menu" label (the three lines animate into an X while open). `.cs-toc-mobile` sits at `z-index:49`, one under `.bar`, so the open site menu drops over the section dropdown instead of behind it.

- Links `styles.css` + `case-study.css`, and `nav.js` + `case-study.js` (no dot-grid/ruler/cursor — that chrome is homepage-specific; see "Chrome & signature motifs" above). Because there's no ruler, `case-study.css` also sets `:root{--gutter:0px}` unconditionally — `body`'s own padding reserves `--gutter` on the left for the ruler frame on every page (only collapsing to 0 below 560px, see the table above), and left alone that bled a left-only 24px into these pages between 560–1100px even though they render nothing that needs the room. Zeroing it here keeps side margins symmetric and equal to the clamp-only margin every other page already gets below 560px.
- `.cs-page` is itself a `<main>`, so without a reset it would also pick up styles.css's bare `main{padding/max-width/margin}` rule meant for every other page's own `<main>` — stacked on top of `.cs-shell`'s own padding one level in, that doubled the side margins. `.cs-page{padding:0;max-width:none;margin:0}` clears it; `.cs-shell` (not `.cs-page`) is what actually carries the page's width and side padding now.
- `<main class="cs-page">` holds two children: `.cs-toc` (a jump-to-section nav, shown only at `min-width:1100px` — there's no room for it below that, so it's just not rendered) and `.cs-shell.cs-top` (the actual article column). `.cs-toc` is genuinely `position:fixed` (not sticky-in-a-grid, which it was originally) — it sits at `left:clamp(20px,4vw,56px)`, independent of `.cs-shell`'s own layout, and stays put at that spot regardless of scroll. `.cs-shell` in turn reserves `padding-left:calc(var(--cs-inset) + var(--cs-toc-w))` at that width to clear it (at 1440 that puts the content column at x=286, 1098px wide — exactly Figma's) — `--cs-toc-w` (230px) is shared between the two so they can't drift apart. The article column caps at `--cs-max` (1098px, Figma's width): past ~1440px, `--cs-inset` grows from `--cs-pad` to half the leftover space, so the sidebar, article, and footer centre together as one block instead of the text stretching. `.cs-toc`'s `left`, `.cs-shell`'s side padding, and `.cs-footer`'s margins all read `--cs-inset`, so change the cap there and nowhere else. Paragraphs and lists cap at 580px (Figma's widest text column) so running text doesn't stretch edge-to-edge; media and two-column rows use the rest. `.cs-toc`'s links are hand-written to match each page's section ids, at 12px mono type (same size as `.motion`'s "Reduce motion" label — keep those two in sync if either changes) in that 230px column (wide enough that "Ship & Collaboration" — the longest label — stays on one line; check new labels against that column before assuming they'll fit), with `max-height:calc(100vh - 46px - var(--cs-top) - 24px);overflow-y:auto` as a safety net so a long section list can't run off-screen on a short viewport. The indicator is a single `position:absolute` element with `top:0` (matching `.cs-toc`'s own top:0/bottom:0 line beneath it — neither needs a padding offset any more now that fixed positioning's own `top` does that job, unlike the old sticky+padding-top version) that `case-study.js` moves with `transform:translateY(link.offsetTop)` and sizes with `height:link.offsetHeight`. The per-item borders this replaced left visible gaps between each link because of the flex `gap`, which a shared line drawn once behind everything doesn't have.
- Below `min-width:1100px`, `.cs-toc-mobile` takes over: not a native `<select>` (its open state can't be styled to match anything) but a custom disclosure — `.cs-toc-trigger` (a `position:fixed` bar pinned under the site's own fixed nav, `top:46px`, its own `height:48px`) toggles `.cs-toc-panel`, styled to match `.menu-panel` deliberately (`--menu-bg` + `backdrop-filter:blur(8px)`, same max-height slide-open transition) so the two disclosures read as the same component. The trigger itself matches `.bar`'s own resting/open split too — `--chrome` + blur normally, `--menu-bg` (solid) while `[data-open="true"]` — so it reads as the same pane of glass as the site nav directly above it, not a separate control. `.cs-toc-mobile` lives as a sibling of `.bar` directly under `<body>`, not nested inside `<main class="cs-page">` (which is where it visually sits) — matching `.bar`'s own DOM position exactly. It was nested inside `main` originally; on a real phone that read as a flatter, less translucent bar than `.bar` even though the CSS (background/blur) was identical, which points at `backdrop-filter` compositing against an ancestor's layer rather than the true page behind it (the same class of bug the `.menu`/`.menu-panel` split above exists to avoid) — moving it out fixed it. If `.cs-toc-mobile` ever needs to move back inside `main` for some reason, budget time to re-check the blur on a real device, not just computed styles. `case-study.js`'s `setTocOpen()` mirrors `nav.js`'s `setMenu()` pattern (`data-open` attribute, close on outside-click/Escape/link-click) for the same reason — don't let this drift into a different interaction pattern than the hamburger menu.
- The scroll-spy's `activate(id)` runs once immediately for the first section (`sections[0].id`, i.e. Summary) before the `IntersectionObserver` ever fires, so the desktop sidebar and the mobile trigger/panel start already showing "Summary" as current — without that, both sit unhighlighted (sidebar) or stuck on a static placeholder (trigger) until the reader scrolls far enough to cross the observer's `-15%` rootMargin line, which reads as broken on first paint. Both the initial call and the observer route through the same `activate()`, so add any future TOC-state side effect there once, not in two places.
- One `IntersectionObserver` in `case-study.js` drives all of the current-section state at once: it looks up every element matching `.cs-toc a, .cs-toc-panel a` for a given section id (there are two per id, one desktop one mobile) and, on activation, adds `.is-active` to both, moves the desktop indicator, and sets `.cs-toc-trigger-label`'s text to the section's label — so opening the mobile panel always highlights the section you're actually on, and the trigger reads that section's name instead of a static "Jump to section" once you've scrolled past the first one. Clicking a `.cs-toc-panel` link closes the panel and calls `scrollIntoView` itself, `preventDefault`-ing the native jump (which would otherwise fire in the split second before the observer's own re-check catches up). `.cs-section{scroll-margin-top:...}` (a larger value below 1100px, to clear both fixed bars instead of just the nav) makes sure the jumped-to section doesn't land underneath either fixed bar, whether the jump came from the mobile panel or a desktop `.cs-toc` link.
- No back-to-work link at the top any more — jumping back to `#work` is what the fixed `.cs-toc` (desktop) and `.cs-toc-mobile` trigger (below 1100px) are for, plus the browser's own back button; a dedicated `.cs-back` link/icon was judged redundant with those and removed.
- Opens with `.cs-hero`: title, one-line outcome, and a `.cs-facts` row (Role, Timeline, Status, Agency — the last a hyperlink to `https://interlude.studio/`) — in that order, all *before* the cover image. When a `.cs-facts` value is more than one item (a multi-phase timeline, more than one role), put each item on its own line with `<br>` rather than joining them with a comma or `·`. Below 900px the facts become a 2×2 grid; add `.is-stacked` for one column when values are long (Guardrail, Workflow Tutorials), matching each Figma mobile frame. The cover is `Assets/00.png` (published as `Assets/web/00.webp`) — a different crop from the homepage card thumbnail, which stays `Assets/00.webp`.
- Sections (`.cs-section` + `.cs-section-head`) mirror each case study's own source outline (00 index card → the cover + card content; 01 Summary through 08 Reflection) but the site never shows the number — only the heading (e.g. "Summary", not "01 · Summary"). The number stays in the source RTF only; don't add a `.cs-section-num` element back into the HTML.
- **Markup order is the mobile (375) reading order.** `.cs-row` stacks below 900px and becomes Figma's two-column row above it: default columns `584fr 490fr` (media left); `.is-flip` sends the first child (the media) to the right; `.is-even` is `1fr 1fr`; one-off widths go in an inline `--cols` taken straight from the Figma frame widths. `.is-woven` (Guardrail's Problem) keeps text in the left column with the media spanning every row beside it, for rows where mobile drops the media partway through the text. `.cs-pair` puts two `.cs-sub` blocks side by side (Craft & System). `.cs-desk-last` moves an item to the end of its stack on desktop only.
- Media is a `.cs-figure`: the Figma **Asset** component as `.cs-asset` (8px radius, 1px `--rule-soft` border, `--paper-2` fill, soft shadow) plus a `<figcaption class="cs-caption">` (Mono/Caption) with the caption text from Figma. Portrait media keeps its Figma width via `.is-narrow` + `--w` (desktop) / `--wm` (mobile). Videos, and any media sitting beside other media, also take their Figma frame shape so side-by-side items line up: `style="--ar:584/326;--ar-m:335/216"` on the `.cs-asset` (desktop and mobile Asset frame sizes), filled with `object-fit:cover` like Figma's FILL. Where Figma uses a custom CROP, add `--pos` for the `object-position` (Guardrail's `05-1` shows its right side: `--pos:100% 50%`); read the frame's `imageTransform` to work out which edge.
- Light/dark and viewport toggles are live: a `[data-switch]` block holds a `.bgroup` (Figma's **Button Group** / **Button Group - Viewport**, Lucide sun/moon/monitor/tablet/smartphone icons) and figures tagged `data-when="mode=dark"` etc.; `case-study.js` shows only the figures whose conditions all match. A carousel (`.cs-carousel`, Figma's **Carousel Arrow** + **Carousel Dot**) is the same mechanism with a `slide` key, so mode and slide combine without extra code. Each state's image and caption come from the alternate-state frames beside the page in Figma.
- A pull quote is `.cs-quote-box` (Figma's **CS Quote Block**: 1.5px `--select` border, corner handles, −2.34° tilt) with the citer's name linked to their LinkedIn and a small avatar saved under that case study's `Assets/`.
- List bullets (`.cs-list li::before`) are the Figma **Bullet Point** component: an 8px `--accent` diamond aligned to the first line. Bold lead-ins are `<strong>` at 700, same colour as the text.
- Every `.cs-asset img` is clickable — `case-study.js` opens it in a full-screen `.cs-lightbox`; clicking the enlarged image toggles a 1.8x zoom, and Escape/backdrop-click/the close button all dismiss it. Videos are unaffected (their native controls already cover this).
- Source images stay full-size in `Assets/`; pages link web-sized WebP copies in `Assets/web/` (max 2200px wide — retina for the 1098px column — quality 82, alpha kept; Pillow: `Image.open(...)` → `.convert("RGBA" or "RGB")` → `.save(..., "WEBP", quality=82)`, since `sips` can't write WebP). Regenerate the copy whenever a source image changes. Figma stores images downscaled to 4096px, so its image hashes won't match the full-size files — compare aspect ratios, not hashes, when matching Figma assets to local ones.
- Ends with a rule, then `.cs-more` ("See more work"): two `.cs-card`s (Figma's **Work Card**: thumbnail, title, description, date/role row; hover shows the marquee `.sel-box`) for the *other* two case studies, never the current one. Update this block on every page whenever a case study is added, removed, or retitled. Then `.cs-footer` (Figma's **Footer**, Page=Case Study): name, email and LinkedIn, last-updated date, and "Made with…" — three columns on desktop, stacked on mobile, full page width outside `.cs-shell`.
- `case-study.css` and `case-study.js` are linked with a `?v=<md5 first 8>` query — GitHub Pages caches for 10 minutes and phones hold stale CSS/JS otherwise. Re-stamp it on all three pages whenever either file changes.

Adding a fourth case study: create `case-studies/<new-slug>/`, follow this structure, add its card to `#work` on the homepage (thumbnail + link to the new page) and to every other case study's `.cs-more` section, and add its URL to `sitemap.xml`.
