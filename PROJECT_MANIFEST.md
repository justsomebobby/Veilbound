# Veilbound Project Manifest

Current documented phase: Phase 3.5 visual prototype
Current stable playable build before visual prototype: `v3.4-clean-core`
Current visual prototype build: `v3.5-visual-proto`

This document exists so the project can continue cleanly across future conversations without relying only on chat history.

## Project identity

Veilbound is a browser-playable, iPhone-friendly, 2D side-scrolling dark fantasy game.

The game follows a female pink-haired witch protagonist through a progression from the surface world into increasingly infernal areas.

Core intended world path:

1. Forest
2. Cave
3. Deeper underground
4. Entrance to Hell
5. Deeper Hell regions

The project is being built to run through GitHub Pages.

## Current repository structure

```text
index.html        Static app shell and screen markup
styles.css        Layout, mobile controls, HUD, and visual styling
game.js           Game state, input, movement, combat, boss logic, collision, and drawing
ARCHITECTURE.md   Clean-code rules and technical structure notes
PROJECT_MANIFEST.md  Project status, goals, and continuation notes
VISUAL_BRIEF.md      Art direction and Phase 3.5 visual target
```

## Completed phases

### Phase 0 — Planning baseline

Established the intended game flow:

```text
Menu -> customization -> side-scroller gameplay -> boss fight -> result/menu return
```

The long-term game includes replayable routes, unlocks, customization, cutscene/gallery areas, and progression systems.

### Phase 1 — GitHub Pages deployment

The game was moved into GitHub and made playable through GitHub Pages.

Current normal play URL:

```text
https://justsomebobby.github.io/Veilbound/
```

Cache-busting URLs may be used only for debugging, but the intended play path is the saved Home Screen shortcut / normal Pages URL.

### Phase 2 — Menu and navigation foundation

Basic screens were created:

- Main Menu
- Hub
- Gameplay
- Boss Test
- Customize placeholder
- Gallery placeholder
- Result screen

### Phase 3 — Boss/combat foundation

Phase 3 is complete and has passed user testing.

Working systems:

- iPhone-friendly controls
- side-scroller movement
- jump
- attack
- energy
- dash
- armor/clothing-layer placeholder system
- health after armor loss
- normal enemy HP differences
- boss HP around 10 hits
- boss slash-style close attack
- boss ranged projectile attack
- boss result screen after victory
- replay buttons
- dash-based hazard intangibility
- boss anti-cheese pressure improvements

### Phase 3.25 — Clean core refactor

The project was cleaned up from a single-file prototype into a more maintainable structure.

Important cleanup goals:

- Avoid wrapper-over-wrapper bug fixes.
- Fix core causes directly.
- Keep one source of truth per system.
- Remove obsolete/dead workaround paths.
- Keep visual drawing separate from hitboxes.
- Keep HUD layout fixed so gameplay text cannot move controls.

The clean-core gameplay was user-tested and confirmed working.

## Current phase

### Phase 3.5 — Visual direction prototype

Phase 3.5 is now being implemented.

Purpose:

```text
Make the current playable build visually point toward the intended final art style without adding Phase 4 gameplay systems yet.
```

Phase 3.5 should not become Phase 4.

Phase 3.5 focuses on:

- pink-haired witch player visual direction
- Level 1 forest visual direction
- forest enemy silhouettes / style targets
- King Slime boss direction
- basic VFX direction
- maintaining hitbox/visual separation

Phase 3.5 should not add:

- elite encounter systems
- trap systems
- full gallery/cutscene systems
- cave/hell full production assets
- new major gameplay mechanics

## Phase 3.5 implementation notes

Current visual prototype build: `v3.5-visual-proto`

Implemented in the prototype:

- dark forest backdrop and forest ground treatment
- pink-haired witch canvas-drawn player silhouette
- hat, cape, pink outfit, boots, and hair visual cues
- slime, goblin, and bat-style enemy silhouettes for Level 1 direction
- King Slime boss visual direction
- boss projectile reinterpreted as slime glob
- boss close attack reinterpreted as body slam / splash zone
- pink/purple dash and magic-style visual effects
- faint debug hitbox hint to show visuals remain separate from collision

This remains a prototype visual pass, not final art.

## Future phases

### Phase 4 — Traps, elites, and special encounters

Expected Phase 4 scope:

- traps along the path
- elite encounters
- special escape/tap mechanics
- direct encounter state handling
- better non-standard enemy behaviors

Phase 4 should be built after the Phase 3.5 visual direction/pipeline is stable.

## Current art direction summary

The player character is the pink-haired witch girl from the user-provided references.

The player character is an identity reference and should stay close to that design.

Enemies and monsters are style/construction references, not exact-copy targets.

Level 1 likely direction:

- dark forest
- slimes
- wolves
- goblins
- snakes
- bat or dark bird flying enemy
- King Slime boss

Long-term location direction:

```text
Forest -> Cave -> Underground -> Entrance to Hell -> Deeper Hell
```

See `VISUAL_BRIEF.md` for details.

## Technical rules to preserve

These are project standards:

- Fix causes directly, not with layered patches.
- Do not leave dead code paths just in case.
- Keep gameplay state in `game.js`.
- Keep layout/styling in `styles.css`.
- Keep `index.html` as a clean app shell.
- Keep hitboxes separate from art.
- Visual sprites may be larger than collision boxes.
- Hazards should use centralized collision rules.
- HUD messages should never cause layout movement.
- iPhone playability is a primary requirement.

## Continuation prompt for future conversations

A future assistant should begin with:

```text
Read PROJECT_MANIFEST.md, VISUAL_BRIEF.md, and ARCHITECTURE.md from the Veilbound repository. Continue from the current phase without assuming new art direction or changing the repo unless explicitly asked.
```
