# Veilbound Visual Brief

Current visual phase: Phase 3.5 — Visual Direction Prototype

This document defines the intended visual direction so future implementation stays grounded in the user's references instead of inventing unrelated art direction.

## Purpose of Phase 3.5

Phase 3.5 is not a final art pass and not Phase 4 gameplay.

Its purpose is to make the current playable build visually point toward the intended game style:

```text
Pink-haired witch heroine
Dark fantasy pixel-art forest
Readable monster silhouettes
King Slime Level 1 boss direction
Hitboxes separate from visuals
```

Gameplay should remain mostly the same. This phase proves the visual direction and sprite/drawing pipeline before adding traps, elites, or special encounter systems.

## Core art style

The game should use a pixel-art anime dark fantasy style.

Key traits:

- large readable pixel sprites
- anime-influenced heroine design
- moody dark fantasy environments
- strong monster silhouettes
- bright magic/effect accents for readability
- forest-to-hell visual progression
- readable mobile-first gameplay composition

The style should not become generic retro platformer art, generic cartoon art, or random fantasy art. It should stay close to the provided reference style.

## Reference interpretation rules

### Player character references

The pink-haired witch girl references are identity references.

That means the player character should stay close to that design.

### Enemy/monster references

The monster and creature references are construction/style references.

That means enemies should be original designs built in the same visual language, not direct copies.

## Player character

The player character is the pink-haired witch girl.

Required identity traits:

- pink hair
- feminine anime pixel proportions
- pink outfit
- black thigh-high boots
- witch hat
- black cape/cloak with pink inner lining
- cute/confident witch identity
- readable side-scrolling silhouette

At gameplay scale, the player must still read as:

```text
pink-haired witch heroine
```

She should not look like:

- a generic adventurer
- a blue placeholder
- a knight
- a random fantasy mage unrelated to the references

Phase 3.5 player drawing can still be rough, but it should already suggest:

- head
- pink hair
- witch hat
- body/outfit
- boots
- cape/cloak

## Player scale and camera requirement

The player should not remain tiny on iPhone.

The current Phase 3.5 temporary canvas art is acceptable as filler, but the final direction requires the heroine to be large enough to be visually enjoyable on a phone screen. A character smaller than a finger on the display is not an acceptable end-state for a game that depends on visible character presentation, outfit states, and mature/adult scene payoff.

Future visual/camera work should plan for:

- a larger player sprite on screen
- clearer body, outfit, hat, cape, and hair readability
- camera framing that supports character visibility, not just platforming distance
- possible separation between exploration/combat scale and scene/gallery scale
- hitboxes remaining fair even when sprites become larger than the collision body

This scale concern is a core art-direction requirement, not just a polish note.

## Level progression visual path

The intended world progression is:

```text
Level 1: Forest
Level 2: Cave
Level 3: Deeper underground
Level 4: Entrance to Hell
Level 5+: Deeper Hell regions
```

Phase 3.5 only needs to focus on Level 1 visual direction.

## Level 1 — Forest visual direction

Level 1 is a dark forest.

Visual goals:

- dusk/purple forest atmosphere
- dark tree silhouettes
- brown/gray forest ground
- layered shadowy background
- slightly cursed mood
- surface-world danger, not Hell yet

The forest should feel like the start of the journey: dangerous and mysterious, but not fully infernal.

## Level 1 enemy direction

Planned Level 1 enemy families:

- slime
- wolf
- goblin
- snake
- bat or dark bird flying enemy

These are not all required as fully implemented gameplay systems in Phase 3.5, but the visual language should support them.

Suggested gameplay roles:

```text
Slime: small jumping enemy, annoying to dodge
Wolf: fast ground pressure
Goblin: basic humanoid forest enemy
Snake: low-profile ground threat
Bat/Bird: flying enemy
```

## Level 1 boss direction — King Slime

The first boss direction is King Slime.

The King Slime should not be a goofy cartoon slime. It should be a corrupted forest boss.

Visual traits:

- large slime body
- purple / blue-violet / dark green tones
- glowing core or glowing eyes
- crown-like gel crest or magical boss marking
- bouncy heavy body
- clearly distinct from small slimes
- readable on mobile

Why King Slime fits:

- unique from standard enemies
- fits Level 1 forest
- easy to read at current camera scale
- supports jump/slam/projectile-style attacks later
- can be threatening without being overly complex

Current boss mechanics can be visually reinterpreted as:

```text
Orb projectile -> slime magic glob / cursed bubble
Close slash -> body slam / splash hitbox / gel swipe
Contact danger -> boss body collision
```

## Visual effects direction

Phase 3.5 effects should match the pixel fantasy direction.

Suggested VFX:

- Dash: purple/pink afterimage or sparkle trail
- Attack: short magical swipe/arc
- Hit flash: brief bright outline or white flash
- Boss projectile: glowing slime orb / cursed glob
- Boss warning: pulsing danger tint or ground mark

Effects should be readable first and pretty second.

## Technical visual rules

These rules must remain intact:

- visuals do not define collision
- hitboxes stay simple and readable
- sprites can be larger than hitboxes
- animation should not make combat unfair
- HUD layout must not shift during gameplay
- dash/hazard logic stays centralized
- no dead fallback visual systems
- no patch clutter

## Phase 3.5 implementation target

When implementation begins, the goal should be directional fidelity, not final polish.

Phase 3.5 should attempt to make the current build visibly closer to the end goal by adding:

- a rough pink-haired witch player silhouette
- dark forest background treatment
- style-matching small enemy silhouettes
- King Slime boss placeholder direction
- matching attack/dash/projectile VFX

Phase 3.5 should not add:

- elite encounter systems
- trap systems
- full cutscene/gallery systems
- complete sprite sheets for every enemy
- complete cave/hell art production
- major new mechanics

## Long-term enemy/world expansion notes

After Phase 3.5, later areas can expand as follows:

### Level 2 — Cave

Possible enemies:

- stronger slimes
- cave bats
- spiders
- cave goblins
- cave snakes or burrowing creatures

Possible boss ideas:

- giant spider
- cave brute
- burrowing serpent

### Level 3 — Deeper underground

Possible enemies:

- corrupted cave monsters
- armored goblins
- tunnel beasts
- stranger magical or ghostlike threats

### Level 4 — Entrance to Hell

Possible enemies:

- weak demons
- sinners
- imp-like enemies
- corrupted beasts

### Level 5+ — Deeper Hell

Possible enemies:

- stronger demons
- infernal beasts
- cursed humanoids
- abyssal entities
- hell bosses

These are future notes only. They are not Phase 3.5 scope.
