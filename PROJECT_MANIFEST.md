# Veilbound Project Manifest

Current documented phase: Phase 4A/4B encounter framework prototype
Current stable playable build before visual prototype: `v3.4-clean-core`
Current visual prototype build: `v3.5-visual-proto`
Current active build: `v4.0-encounter-proto`

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
index.html        Static app shell and screen markup. Currently loads game-core.js.
styles.css        Layout, mobile controls, HUD, and visual styling
game-core.js      Current active Phase 4 encounter prototype script
game.js           Previous Phase 3.5 visual prototype script kept temporarily for rollback/reference
ARCHITECTURE.md   Clean-code rules and technical structure notes
PROJECT_MANIFEST.md  Project status, goals, and continuation notes
VISUAL_BRIEF.md      Art direction and Phase 3.5 visual target
```

Cleanup note: `game-core.js` is now the active script. The older `game.js` should be removed or archived after Phase 4A is confirmed stable, so the repo does not keep unnecessary legacy code.

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

### Phase 3.5 — Visual direction prototype

Phase 3.5 implemented a temporary visual direction pass.

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

Important user feedback from Phase 3.5:

- Temporary graphics are acceptable for now.
- Final graphics must be much higher quality.
- The player cannot remain tiny on iPhone in the final direction.
- Future camera/sprite scale should support visible character presentation, outfit states, and scene readability.

## Current phase

### Phase 4A/4B — Encounter framework and first trap prototype

Current active build: `v4.0-encounter-proto`

Purpose:

```text
Create the reusable encounter foundation for traps/grabs/escape loops before adding elites, spawn waves, or final animations.
```

Implemented in the first Phase 4 build:

- active script moved to `game-core.js`
- build marker updated to `v4.0-encounter-proto`
- Level 1 now has two root/snare trap prototypes
- trap contact locks the player in place
- player taps Jump / Atk / Dash to build escape progress
- trap removes clothing/armor layers on a timer while trapped
- if layers run out, a placeholder capture loop begins
- capture loop drains health over time
- Restart and Hub are the current exits from failed/capture loop states
- trap visuals wrap around the player as placeholder feedback
- HUD remains stable during encounter state

This is still placeholder-safe and not final adult animation content. The goal is system behavior.

Testing focus for Phase 4A/4B:

- Can the player trigger a trap reliably?
- Does tapping escape feel responsive?
- Does the layer timer remove layers at a readable pace?
- Does the capture loop begin when armor reaches 0?
- Does health drain during the capture loop?
- Do Restart and Hub still work?
- Does the normal level and boss flow still work after escaping traps?

## Future phases

### Phase 4C — Enemy vulnerability / finisher logic

Expected scope:

- standard enemy contact removes layers first
- vulnerable states allow enemy finisher/encounter behavior
- knockdown or stun recovery prototype
- enemy finisher hook that uses the same encounter framework

### Phase 4D — Spawn director

Expected scope:

- enemies spawn from the right side
- limited number of active enemies
- spawn pressure discourages idle advancement
- level remains objective-based rather than pure endless survival

### Phase 4E — Longer Level 1 route / pacing

Expected scope:

- longer forest route
- early enemy pressure
- first trap tutorial
- spawn-pressure stretch
- stronger enemy/elite placeholder
- second trap
- gate
- King Slime boss

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
- Keep gameplay state in the active game script.
- Keep layout/styling in `styles.css`.
- Keep `index.html` as a clean app shell.
- Keep hitboxes separate from art.
- Visual sprites may be larger than collision boxes.
- Hazards should use centralized collision rules.
- HUD messages should never cause layout movement.
- iPhone playability is a primary requirement.
- Update this manifest whenever a phase or major system changes.

## Continuation prompt for future conversations

A future assistant should begin with:

```text
Read PROJECT_MANIFEST.md, VISUAL_BRIEF.md, and ARCHITECTURE.md from the Veilbound repository. Continue from the current phase without assuming new art direction or changing the repo unless explicitly asked.
```
