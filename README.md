# Portfolio — Tóth Avar

Personal portfolio for Tóth Avar, Computer Science Engineering student at BME.

Sleek, editorial design in a warm beige / off-white palette with high-contrast
near-black text, italic serif display headers, and a geometric sans body.

## Stack

Plain **HTML + CSS + JavaScript** — no build step, no dependencies.
Hostable as-is on GitHub Pages, Netlify, Vercel, or any static host.

## Fonts

- **Newsreader** — italic serif used for display headers (a free, open-license
  stand-in for Claude's Tiempos serif).
- **Inter** — geometric sans used for body and UI (close in spirit to Styrene).

Both are loaded from Google Fonts in `index.html`.

## Structure

```
portfolio/
├── index.html        # all page content / sections
├── css/
│   └── styles.css     # design system + layout
├── js/
│   └── main.js        # scroll-reveal + footer year
└── assets/            # images, resume PDF, favicon (add your own)
```

## Running locally

Just open `index.html` in a browser. For a local server (recommended so fonts
and relative paths behave):

```powershell
# Python 3
python -m http.server 8000
# then visit http://localhost:8000
```

## Things to fill in

Search the HTML for `PLACEHOLDER` comments. You'll want to replace:

- About section — second paragraph (your own words)
- Projects 02 and 03 — currently placeholder cards
- The **Chess TUI** project — add your real repo / demo link
- Toolkit items marked `— placeholder`
- Education & Experience — dates, GPA, coursework, roles
- Contact — email, GitHub, LinkedIn URLs
