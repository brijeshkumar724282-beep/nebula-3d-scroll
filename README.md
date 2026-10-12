# Nebula Scroll

Immersive scroll journey site. A fixed Three.js starfield sits behind the content and speeds up with scroll velocity, with floating low poly shapes. Lenis smooth scroll plus GSAP ScrollTrigger pinned chapters (Launch, Orbit, Landing) with progress dots.

## Features

1. Fixed starfield canvas plus nav with hamburger under 820px plus chapter dots that update on scroll
2. Hero with GSAP staggered intro plus scroll cue plus CTA buttons
3. Three pinned chapters with text plus solid color cards, star speed reacts to scroll via Lenis callback
4. Gallery grid with 6 solid art cards with tilt on hover plus stats counters
5. Contact form with validation plus footer

## Libraries and CDN

- Three.js 0.160.0: https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js
- GSAP 3.12.5: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
- ScrollTrigger 3.12.5: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js
- Lenis 1.1.14: https://unpkg.com/lenis@1.1.14/dist/lenis.min.js
- Font: Sora (Google Fonts, single family)

Fallbacks: if Three.js fails, a 2D canvas starfield renders. If GSAP or Lenis fail, native scroll plus IntersectionObserver handle reveals and dots. Pins only run above 820px.

## Run

```bash
python3 -m http.server 8000
```

Open http://localhost:8000 in a browser. No build step. GitHub Pages ready: upload this folder contents to a repo and enable Pages.

## Customize

- Colors: edit CSS vars in `styles.css` (`--navy`, `--coral`, `--panel`)
- Star density: change `N` and `M` in `initThree()` in `script.js`
- Scroll feel: change `lerp` in the Lenis init and `baseSpeed`
- Chapters: edit the three `section.chapter` blocks in `index.html`
- Gallery: edit `article.art` cards and `.swatch` styles

## Structure

- `index.html` markup for nav, hero, chapters, gallery, contact, footer
- `styles.css` all styling, solid colors only, responsive 360 / 768 / 1200
- `script.js` starfield, smooth scroll, pins, dots, tilt, validation
- `README.md` this file
