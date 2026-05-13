# Veilbound — Phase 1 Scaffold

Mobile-first Phaser/Vite browser game scaffold.

This build is placeholder-safe. It contains no final adult art or explicit assets.

## Current phase

Phase 1 — Menu, Save, and Hub Skeleton

Included:

- Age/content gate placeholder
- Main menu
- Hub menu
- Customization placeholder with saved choices
- Options placeholder with saved settings
- Gallery placeholder
- Scene viewer placeholder with phase controls
- Level select placeholder
- Skill screen placeholder
- Mobile touch test scene
- Local save/load through `localStorage`
- iPhone-first metadata and web-app manifest
- GitHub Pages deployment workflow

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal.

## Build locally

```bash
npm run build
npm run preview
```

## GitHub Pages deployment

This project includes `.github/workflows/deploy-pages.yml`.

After the project is pushed to GitHub:

1. Open the repository on GitHub.
2. Go to **Settings**.
3. Go to **Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Push to the `main` branch.
6. Open the **Actions** tab and wait for the deploy workflow to finish.
7. The Pages URL will appear in the workflow/deployment summary.

## iPhone testing

Open the GitHub Pages URL in Safari on iPhone.

Recommended first test:

1. Pass the age/content gate.
2. Open the hub.
3. Open customization and change values.
4. Open options and change settings.
5. Open gallery and view the placeholder scene.
6. Use the scene viewer controls.
7. Reload the page and confirm choices are saved.
8. Use Safari's **Add to Home Screen** if desired.

## Notes

- Gameplay is not implemented yet. That begins in Phase 2.
- The scene viewer is a placeholder system to prove touch-friendly scene controls.
- Art is placeholder-only. Final art should follow the layered art pipeline from the roadmap.
