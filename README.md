# Veilbound — Phase 1

Mobile-first browser game scaffold for iPhone and GitHub Pages.

This repository currently contains the Phase 1 skeleton:

- Vite + Phaser project setup
- iPhone-first viewport and web app metadata
- Age/content gate placeholder
- Main menu
- Hub menu
- Customization placeholder
- Options placeholder
- Gallery placeholder
- Scene viewer placeholder
- Mobile touch test scene
- Local save data through `localStorage`
- GitHub Pages deployment workflow

This build is placeholder-safe. It contains no final adult art and no explicit assets.

## Run locally

```bash
npm install
npm run dev
```

## Build locally

```bash
npm run build
npm run preview
```

## GitHub Pages

This repo includes `.github/workflows/deploy-pages.yml`.

To publish:

1. Open repository Settings.
2. Go to Pages.
3. Set Source to GitHub Actions.
4. Push to `main`.
5. Wait for the Deploy to GitHub Pages action to finish.

Expected public URL:

```text
https://justsomebobby.github.io/Veilbound/
```

## Current roadmap position

Phase 1 is the menu/save/hub skeleton. Phase 2 will add the side-scroller gameplay core.

## Deployment note

This line was added to trigger the first GitHub Pages workflow run after repository setup.
