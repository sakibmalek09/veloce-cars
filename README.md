# VELOCE — Electric Hypercars

> **🔴 Live site: [https://sakibmalek09.github.io/veloce-cars/](https://sakibmalek09.github.io/veloce-cars/)**

A fully responsive, zero-dependency landing page for a (fictional) electric
hypercars brand. Pure HTML + CSS + vanilla JS — no build step, no frameworks.

![Tech](https://img.shields.io/badge/stack-HTML%20%2B%20CSS%20%2B%20JS-e10600)
![Deps](https://img.shields.io/badge/dependencies-0-brightgreen)
![Live](https://img.shields.io/badge/▶_live_site-veloce--cars-e10600?logo=githubpages&logoColor=white)](https://sakibmalek09.github.io/veloce-cars/)

## ✨ Features

- **Animated video hero** — staggered title reveal, Ken Burns zoom, parallax fade on scroll
- **Live paint configurator** — six finishes repaint the car via color-blend layering
- **Scroll-triggered reveals** and animated stat counters (1,200 hp / 1.9 s / 402 km/h)
- **3D tilt model cards**, infinite specs marquee, auto-rotating testimonial slider
- **Custom cursor** (desktop), animated mobile menu, fully responsive to 360px
- Respects `prefers-reduced-motion`; Open Graph + Twitter card tags; SVG favicon

## 🗂 Project structure

```
├── index.html      # Full landing page
├── styles.css      # Dark theme, animations, responsive breakpoints
├── main.js         # All interactions (vanilla JS)
└── favicon.svg     # Brand mark
```

## 🖥 Run locally

Any static server works:

```bash
python -m http.server 8901
# → http://localhost:8901
```

…or just open `index.html` directly in a browser.

## 🚀 Deploy

### Netlify (drag & drop or CLI)

**Option A — drag & drop:** go to [app.netlify.com/drop](https://app.netlify.com/drop)
and drop this folder. Done.

**Option B — CLI:**

```bash
npm i -g netlify-cli
netlify deploy --prod --dir .
```

No build command, publish directory = project root (`.`).

### GitHub Pages

1. Push this folder to a GitHub repository (see below).
2. In the repo: **Settings → Pages → Build and deployment → Source:
   "Deploy from a branch"** → branch `main`, folder `/ (root)` → Save.
3. Your site goes live at `https://<user>.github.io/<repo>/` in ~1 minute.

**Optional — auto-deploy with Actions:** the included
`.github/workflows/deploy-pages.yml` deploys on every push to `main`.
Enable it under **Settings → Pages → Source: "GitHub Actions"**.

## ⬆ Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: VELOCE hypercar landing page"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

## 📝 Notes

- All imagery is hot-linked from Unsplash and the hero video from Mixkit;
  swap in your own assets for production use.
- The reserve form is a front-end demo — wire it to Formspree/Netlify Forms
  to collect real submissions.
