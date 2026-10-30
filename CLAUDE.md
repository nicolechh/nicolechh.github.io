# CLAUDE.md

Nicole Chou's portfolio site (https://nicolec.xyz), a static site with no build step, served by GitHub Pages.

## Before changing any page

Read [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) first and follow it. It holds the tokens, components, and rules for the whole site. The rules that matter most:

- All shared CSS lives in `styles.css`. Every page links it; never fork or copy part of it into a page's own `<style>`.
- Use an existing token. Never hardcode a color as a literal hex value in a selector. If no token fits, add one to `:root` (and its dark overrides) and document it.
- Solid blue fills with white text use `--tag-blue`, never `--select`. Check the contrast of any new text-on-color pairing in both themes.
- Stay in the Geist superfamily (Geist, Geist Mono, Geist Pixel); don't add a fourth font family.
- Follow the "Adding a new page or section" checklist in DESIGN-SYSTEM.md, including reduced motion and checks at 375px, 900px, and 1200px.
- If you add a genuinely new token or component, add it to DESIGN-SYSTEM.md and `style-guide.html`.

`pixie/` and `peapal/` are self-contained apps with their own styles. They don't use `styles.css`.

## Cache-busting

Local CSS/JS links carry a `?v=<first 8 chars of the file's md5>` stamp. When you change a stamped file, re-stamp its links on every page that uses it, so phones don't keep stale copies.

## Git

Commit or push only when Nicole asks. The repo often has unrelated uncommitted work (case-study assets); leave it alone.
