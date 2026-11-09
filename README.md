# Alexia Rucker — Web Design Portfolio

A standalone, interactive portfolio for Alexia Rucker's custom web-design work,
designed to be linked directly in outreach emails to prospective local-business clients.

**Live site:** https://webdesign.simplylexmarie.com/

## What's here

- **Homepage** (`index.html`) — editorial / scrapbook design: hero, featured work,
  services & pricing, the free-rough-draft offer, and a contact CTA.
- **Project case studies** (`projects/smokehouse/`, `projects/stonebrook/`) — an
  art-directed, tab-selectable gallery. Picking a feature swaps a single large stage
  that loads the **real, live interactive component** from each client's actual website
  (no video, no screenshots).

## How the interactive features work

Each feature is a small "fragment" page (`sh-*.html`, `sb-*.html`) that pulls the live
client site's own markup, CSS, JavaScript, images and fonts via a `<base href>` pointing
at that site. The gallery embeds the active fragment in a same-origin iframe, so the real
component runs exactly as it does on the live site. The client sites are **not modified**,
and their styling stays isolated from the portfolio by the iframe boundary.

- **The Smokehouse** → https://brilliantimpact-media.github.io/smokehouse-website/
- **Stonebrook Carpentry** → https://brilliantimpact-media.github.io/stonebrook-carpentry-website/

> The features depend on those live client sites staying up. They're Alexia's own builds,
> so that's expected; if a site is restructured, that project's fragments may need a refresh.

## Tech

Plain, dependency-free static HTML/CSS/JS — fast, easy to host and maintain. Deployed on
GitHub Pages. Accessible (skip links, keyboard-operable gallery, visible focus), responsive
(desktop + mobile), with `prefers-reduced-motion` honored, SEO metadata, social-share
previews and a favicon.

## Local preview

The galleries pull assets over https and use same-origin iframes, so they must be served
over http (not opened from the file system):

```bash
cd web-design-portfolio
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Contact

Free-draft requests go to **aalexiammarie@gmail.com** · Instagram **@simplylexmarie**.
