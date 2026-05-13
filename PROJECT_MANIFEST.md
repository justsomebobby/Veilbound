# Veilbound Project Manifest

Current phase: Phase 4A encounter framework
Current tested build: `v4.0.2-trap-core-patch`
Current active loader: `index.html` loads `game-core-v402-trap.js`
Status: Phase 4A Build 1 trap release confirmed working by user testing.

This document exists so future chats can continue cleanly without relying only on conversation history.

## Project identity

Veilbound is an iPhone-friendly browser side-scroller hosted through GitHub Pages.

The player character is an adult pink-haired witch girl based on the user-provided visual references. The story route starts in a forest and gradually descends through caves, deeper underground areas, the entrance to Hell, and deeper Hell regions.

Normal play URL:

```text
https://justsomebobby.github.io/Veilbound/
```

## Current repository notes

Important active files:

```text
index.html                  App shell and screen markup. Currently loads game-core-v402-trap.js.
styles.css                  Layout, mobile controls, HUD, and styling.
game-core-v402-trap.js      Current active tested Phase 4A Build 1 script.
PROJECT_MANIFEST.md         Project status and continuation notes.
VISUAL_BRIEF.md             Art direction notes.
ARCHITECTURE.md             Technical rules and clean-code expectations.
```

Known repo clutter:

```text
game-core.js                Older Phase 4 rollback/core reference.
game-fix.js                 Broken temporary repair attempt; do not use as active script.
game-core-patch.js          Broken/unused temporary patch attempt; do not use as active script.
game-phase4a-fix.js         Temporary repair attempt; do not use as active script.
game.js                     Older Phase 3.5 visual prototype/reference.
```

Cleanup rule: when Phase 4A is stable enough, consolidate back to one active game script and remove/archive obsolete temporary paths. Until then, do not point `index.html` at any broken temporary file.

## Completed phases

### Phase 1 — GitHub Pages deployment

The game is playable through GitHub Pages.

### Phase 2 — Menu and navigation foundation

Implemented:

- Main Menu
- Hub
- Gameplay
- Boss Test
- Customize placeholder
- Gallery placeholder
- Result screen

### Phase 3 — Boss/combat foundation

User-tested and passed.

Working systems:

- iPhone-friendly controls
- movement, jump, attack, dash
- energy
- armor/clothing-layer placeholder system
- health after armor loss
- normal enemy HP differences
- boss with about 10 hits of health
- close boss attack
- ranged boss attack
- boss victory/result screen
- replay flow
- dash hazard intangibility
- boss anti-cheese pressure improvements

### Phase 3.5 — Temporary visual direction prototype

Implemented temporary visuals:

- dark forest backdrop
- pink-haired witch silhouette
- hat/cape/outfit/boots/hair cues
- slime/goblin/bat placeholder enemies
- King Slime boss direction
- slime glob projectile
- slam/splash boss attack direction

User feedback:

- temporary graphics are acceptable for now
- final graphics must be much higher quality
- final player scale needs to be larger/readable on iPhone for scene readability

## Current phase: Phase 4A — Encounter framework Build 1

Build 1 goal:

```text
Create the reusable trap/grab/escape-loop foundation before enemy finishers, spawn waves, or final animations.
```

Confirmed working in `v4.0.2-trap-core-patch`:

- trap/root grabs the player
- escape meter fills from button taps
- full meter releases the player
- trap no longer becomes a permanent health-drain lock
- released trap disables and does not instantly re-grab
- player can continue play after release

Current implementation remains placeholder-safe and not final scene animation content. The important part is the system behavior.

Testing result from user:

```text
Trap issue resolved successfully.
Phase 4A Build 1 passes its main requirement.
```

## Next recommended build

### Phase 4A Build 2 — Enemy stun / enemy encounter hook

Recommended next scope:

- Do not add final animations yet.
- Reuse the same encounter framework from traps.
- Add a simple enemy-side vulnerable/knockdown/grab placeholder.
- Standard enemy contact should still remove armor first.
- A specific state can trigger a temporary hold/recovery/escape interaction.
- Keep it readable and testable before adding spawn director or longer routes.

Avoid in Build 2:

- no final adult scene art
- no large level expansion yet
- no spawn-wave director yet unless Build 2 is already stable
- no alternate reduced scripts

## Future phase candidates

### Phase 4C — Enemy vulnerability / finisher logic

- standard enemy contact removes layers first
- vulnerable states allow enemy finisher/encounter behavior
- knockdown or stun recovery prototype
- enemy finisher hook using the same encounter framework

### Phase 4D — Spawn director

- enemies spawn from the right side
- limited active enemies
- spawn pressure discourages idle advancement
- objective-based level flow rather than pure endless survival

### Phase 4E — Longer Level 1 pacing

- longer forest route
- early enemy pressure
- first trap tutorial
- spawn-pressure stretch
- stronger enemy/elite placeholder
- second trap
- gate
- King Slime boss

## Art direction summary

Player:

- adult pink-haired witch girl
- close to the user-provided reference identity
- final version must be much larger/readable on iPhone than the current placeholder

Enemy construction references:

- enemies should use the provided monster images as construction/style references, not exact copies
- Level 1 possible set: slimes, wolves, goblins, snakes, bat/dark bird
- first boss direction currently: King Slime

World route:

```text
Forest -> Cave -> Underground -> Entrance to Hell -> Deeper Hell
```

## Technical rules to preserve

- Fix causes directly; do not stack wrapper patches.
- Do not create smaller replacement scripts pretending to be the full game.
- Full-file replacement is acceptable only if it is a complete active game file.
- Do not leave active dead paths in `index.html`.
- Keep gameplay logic in the active game script.
- Keep layout/styling in `styles.css`.
- Keep `index.html` as a clean app shell.
- Keep hitboxes separate from art.
- Visual sprites may be larger than collision boxes.
- Hazards should use centralized collision/encounter rules.
- HUD messages should not move controls.
- iPhone playability is a primary requirement.
- Plan changes in chat before GitHub edits.
- If GitHub connector blocks a direct edit, stop and explain instead of making workaround files without approval.

## Continuation prompt for future conversations

A future assistant should begin with:

```text
Read PROJECT_MANIFEST.md, VISUAL_BRIEF.md, and ARCHITECTURE.md from the Veilbound repository. Continue from `v4.0.2-trap-core-patch`. Phase 4A Build 1 trap release is confirmed working. Do not assume new art direction or change the repo unless explicitly asked.
```
