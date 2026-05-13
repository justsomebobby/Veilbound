# Veilbound Project Manifest

Current documented phase: Phase 4A encounter framework repair
Current stable playable build before visual prototype: `v3.4-clean-core`
Current visual prototype build: `v3.5-visual-proto`
Current active build: `v4.0.1-root-fix`

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
index.html        Static app shell and screen markup. Currently loads game-fix.js.
styles.css        Layout, mobile controls, HUD, and visual styling
game-fix.js       Current active Phase 4A root-hold repair script
game-core.js      Previous Phase 4A encounter prototype script kept temporarily for rollback/reference
game.js           Previous Phase 3.5 visual prototype script kept temporarily for rollback/reference
ARCHITECTURE.md   Clean-code rules and technical structure notes
PROJECT_MANIFEST.md  Project status, goals, and continuation notes
VISUAL_BRIEF.md      Art direction and Phase 3.5 visual target
```

Cleanup note: after Phase 4A is confirmed stable, the active script should be consolidated back into a single main game script and old prototype files should be removed or archived so the repo does not accumulate dead paths.

## Completed phases

### Phase 0 — Planning baseline

Established the intended game flow:

```text
Menu -> customization -> side-scroller gameplay -> boss fight -> result/menu return
```

The long-term game includes replayable routes, unlocks, customization, scene/gallery areas, and progression systems.

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
- boss close attack
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

### Phase 4A — Encounter framework and first root-hold repair

Current active build: `v4.0.1-root-fix`

Purpose:

```text
Create and tune the reusable encounter foundation for traps/grabs/escape loops before adding enemy finishers, spawn waves, or final animations.
```

The first Phase 4A attempt proved the framework but failed user testing because the trap behaved too much like guaranteed death. The repair build directly addresses that issue.

Implemented in the active repair build:

- active script changed to `game-fix.js`
- build marker updated to `v4.0.1-root-fix`
- root holds now release the player when the escape meter completes
- first escape window is more forgiving
- completing escape moves the player out of the root hold
- completed root hold becomes disabled instead of instantly re-grabbing
- post-release grace period prevents immediate re-capture/damage
- late hold state can still be broken out of by tapping
- health drain is slower in the late hold state
- Restart and Hub remain the hard exits after full failure

This remains placeholder-safe and not final animation content. The goal is system behavior.

Testing focus for Phase 4A repair:

- Does filling the escape meter always release the player?
- Does the disabled root stay disabled after release?
- Does post-release movement resume normally?
- Is the first layer timer readable and fair?
- Can the late hold state still be escaped before health reaches 0?
- Does normal level flow to boss still work after escaping roots?
- Does the boss still function after the repair script swap?

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
