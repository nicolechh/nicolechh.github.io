# nicolechou.github.io

Personal portfolio site for Nicole Chou — a single, hand-tuned static page
(`index.html`) with a design-canvas aesthetic. No build step, no dependencies.
Fonts load from Google Fonts; everything else is inline.

- **Live (GitHub Pages):** https://nicolechou.github.io/
- **Custom domain:** _not connected yet_ — see [Connecting a domain](#connecting-a-domain)

---

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole site — markup, CSS, and the canvas/ruler script, in one file |
| `404.html` | Custom not-found page (GitHub Pages serves this automatically) |
| `assets/favicon.png` | Favicon (the seal mark) |
| `assets/seal.png` | Same mark, kept separately for reuse |
| `assets/social-card.png` | **You need to add this** — 1200×630 PNG for link previews |
| `robots.txt`, `sitemap.xml` | Basic SEO |
| `.nojekyll` | Tells GitHub Pages to serve files as-is (no Jekyll processing) |
| `CNAME` | Created later, when you attach a custom domain |

---

## Editing locally in VS Code

1. **Install the shell command** (one time): open VS Code → Command Palette
   (`Cmd+Shift+P`) → **Shell Command: Install 'code' command in PATH**.
2. Open the folder:
   ```bash
   code /Users/nicolechou/Desktop/claude/nicolechou.github.io
   ```
3. When VS Code prompts, install the **recommended extensions**
   (Live Server + Prettier — listed in `.vscode/extensions.json`).
4. Right-click `index.html` → **Open with Live Server** for a live-reloading
   preview at `http://127.0.0.1:5500/`.

Everything is in `index.html`:
- `:root { ... }` near the top holds the colour + spacing tokens (light and dark).
- `<style>` ends around the middle of the file; markup follows; the `<script>`
  at the bottom draws the dot grid and rulers.

---

## Publishing to GitHub Pages

This repo is named `nicolechou.github.io`, so GitHub publishes it as your
**user site** at `https://nicolechou.github.io/` with no extra path.

### First-time setup

1. Create the repo on GitHub named exactly **`nicolechou.github.io`** (public).
   Don't add a README/license from the GitHub UI — this folder already has one.
2. From this folder:
   ```bash
   git remote add origin https://github.com/nicolechou/nicolechou.github.io.git
   git branch -M main
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment**
   → Source: **Deploy from a branch** → Branch: **`main`** / **`/ (root)`** → Save.
4. Wait ~1 minute, then visit https://nicolechou.github.io/.

### Every update after that

```bash
git add -A
git commit -m "Describe the change"
git push
```

Pages redeploys automatically within a minute or two.

---

## Connecting a domain

Do this once you own a domain (e.g. from Namecheap, Cloudflare, Porkbun).

### 1. Tell GitHub about the domain

- **Settings → Pages → Custom domain** → enter e.g. `nicolechou.com` → Save.
- This creates a `CNAME` file in the repo automatically. `git pull` afterwards
  so your local copy has it. (You can also add the file yourself: a single line
  containing just the domain.)

### 2. Point DNS at GitHub

At your DNS provider, add these records:

| Type | Name | Value |
| --- | --- | --- |
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `AAAA` | `@` | `2606:50c0:8000::153` |
| `AAAA` | `@` | `2606:50c0:8001::153` |
| `AAAA` | `@` | `2606:50c0:8002::153` |
| `AAAA` | `@` | `2606:50c0:8003::153` |
| `CNAME` | `www` | `nicolechou.github.io.` |

### 3. Wait, then lock it down

- DNS can take anywhere from minutes to a day to propagate.
- Back in **Settings → Pages**, once the check passes, tick
  **Enforce HTTPS**.
- Update the absolute URLs in `index.html` (the `<link rel="canonical">` and the
  `og:` / `twitter:` tags) and in `robots.txt` / `sitemap.xml` to the new domain.

---

## Notes

- The site is intentionally a single file — keep it that way unless there's a
  real reason to split. It renders identically offline.
- A matching **Claude design canvas** exists for visual edits; changes there
  don't sync automatically — treat it as the design reference and mirror
  intentional changes into `index.html`.
