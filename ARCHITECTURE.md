# Veilbound Architecture Notes

Current build: `v3.4-clean-core`

This project is intentionally kept simple while the foundation is being proven on iPhone. The code should stay clean enough to expand into more levels, traps, scenes, skills, and real art without becoming a patch pile.

## File layout

```text
index.html   Static app shell and screen markup
styles.css   Layout, mobile controls, HUD, and visual styling
game.js      Game state, input, movement, combat, boss logic, and drawing
```

## Core rules

- Fix causes directly instead of stacking wrappers around bugs.
- Keep one source of truth for each system.
- Remove obsolete logic instead of leaving dead fallback paths.
- Keep hitboxes and art separate.
- Keep HUD layout fixed so gameplay messages cannot move controls.
- Keep browser/iPhone handling centralized instead of scattered.

## Gameplay state

`game.js` owns the active gameplay state:

- screen routing
- level player
- boss player
- enemies
- boss
- projectiles
- level input
- boss input

The DOM is only used for display and controls. Game rules should not depend on CSS layout behavior.

## Dash and hazard logic

Dash is governed by one main rule:

```text
canHazardHit(actor)
```

Hazards should ask this function before damaging the player. Dash, invulnerability, and intangibility are all actor-state timers. A projectile that overlaps during intangibility sets `ignorePlayerUntilClear`, so it cannot hit on the tail end of the same pass.

## HUD logic

HUD layout is fixed in CSS. `game.js` only updates text, bars, dots, and button state.

Dash button state comes directly from energy:

```text
energy >= DASH_COST  => purple / usable
energy < DASH_COST   => grey / unavailable
```

## Art pipeline expectation

Future art should be drawn from state, not used as collision. Collision boxes stay simple and readable; sprites and animation can be larger or more expressive without changing fairness.

Expected future structure:

```text
assets/
  player/
  boss_01/
  enemies/
  ui/
```

## Expansion order

Before adding major Phase 4 systems, keep the clean core stable:

1. Confirm Phase 3 boss flow remains stable after the cleanup.
2. Add a basic sprite/animation loader in Phase 3.5.
3. Add traps/elite encounter logic in Phase 4 using the same hazard and state rules.
