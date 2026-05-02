# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A static HTML/CSS/JS tool for generating Instagram carousel images (1080×1350 px) for a barbershop. Each carousel is a set of slides where each slide has two phrases rendered over a photo: one in the top half (grayscale, italic, low-contrast tone) and one in the bottom half (full-color, bold, positive tone).

No build system, no package manager, no dependencies. Open any HTML file directly in a browser.

## Running locally

Open `index.html` in a browser. Each `c*.html` file is a standalone carousel viewer. `editor.html` is the slide editor. They are all self-contained (fonts and images embedded as base64).

## File roles

| File | Role |
|------|------|
| `data.js` | `CARRUSELES` array (slide text data) + `IMGS` object (base64 image strings) — very large file (~8MB) |
| `canvas.js` | All Canvas 2D rendering: image caching, grayscale conversion, text wrapping/sizing, JPG export |
| `ui.js` | UI state (`_carrusel`, `_currentSlide`, `_canvas`) and DOM event wiring; calls into `canvas.js` |
| `styles.css` | Shared dark-theme styles; Josefin Sans variable font loaded from `fonts/` |
| `index.html` | Navigation hub |
| `c1_selfie.html` … `c5_barberia.html` | Self-contained carousel viewers (embed fonts + data inline) |
| `editor.html` | Carousel editor (also self-contained) |

## Architecture

Each carousel object looks like:
```js
{ id: 'c1_selfie', img: 'selfie', slides: [['phrase top', 'phrase bottom'], ...] }
```

`canvas.js:renderCanvas` splits the canvas into two equal halves and calls `drawHalf` for each:
- Top half: grayscale image + italic light text (`isNeg: true, isColor: false`)
- Bottom half: color image + bold white text (`isNeg: false, isColor: true`)

Export target is always 1080×1350 px; the preview canvas is smaller and shares the same rendering path.

`data.js` is the only place images live (base64). Adding a new carousel means adding an entry to `CARRUSELES` and a key to `IMGS`.

## Key details

- Font size is dynamic — `getFontSize` in `canvas.js` scales down as text length grows, then multiplied by `W/405` to scale to canvas width.
- The `c*.html` and `editor.html` files inline both the font TTFs and all image data as base64 so they work offline and without a server.
- Downloading slides triggers a programmatic `<a>` click; browsers may block multiple rapid downloads — `downloadAll` spaces them 300 ms apart.
