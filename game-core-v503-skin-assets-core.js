(() => {
  "use strict";

  const BUILD = "v5.0.3-skin-assets-core";

  const MODE = {
    MENU: "MENU",
    FIELD: "FIELD",
    HOLD: "HOLD",
    BOSS: "BOSS",
    FIELD_DEFEAT: "FIELD_DEFEAT",
    RESULT: "RESULT",
  };

  const ASSET_SRC = Object.assign({
    player_armor0_underwear_idle: "./assets/player/player_armor0_underwear_idle.png",
    player_armor0_underwear_walk: "./assets/player/player_armor0_underwear_walk.png",
    player_armor0_underwear_attack: "./assets/player/player_armor0_underwear_attack.png",
    player_armor0_underwear_crawl: "./assets/player/player_armor0_underwear_crawl.png",
    player_armor0_underwear_jump: "./assets/player/player_armor0_underwear_jump.png",
    player_armor0_underwear_fall: "./assets/player/player_armor0_underwear_fall.png",
    player_armor1_stockings_idle: "./assets/player/player_armor1_stockings_idle.png",
    player_armor1_stockings_walk: "./assets/player/player_armor1_stockings_walk.png",
    player_armor1_stockings_attack: "./assets/player/player_armor1_stockings_attack.png",
    player_armor1_stockings_crawl: "./assets/player/player_armor1_stockings_crawl.png",
    player_armor1_stockings_jump: "./assets/player/player_armor1_stockings_jump.png",
    player_armor1_stockings_fall: "./assets/player/player_armor1_stockings_fall.png",
    player_armor2_witch_idle: "./assets/player/player_armor2_witch_idle.png",
    player_armor2_witch_walk: "./assets/player/player_armor2_witch_walk.png",
    player_armor2_witch_attack: "./assets/player/player_armor2_witch_attack.png",
    player_armor2_witch_crawl: "./assets/player/player_armor2_witch_crawl.png",
    player_armor2_witch_jump: "./assets/player/player_armor2_witch_jump.png",
    player_armor2_witch_fall: "./assets/player/player_armor2_witch_fall.png",
  }, window.VEILBOUND_PLAYER_ASSETS || {});

  const CFG = {
    canvasW: 960,
    canvasH: 540,
    worldW: 1800,
    groundY: 430,
    gateX: 1690,
    gravity: 1500,
    walkSpeed: 230,
    crawlSpeed: 115,
    dashSpeed: 360,
    jumpSpeed: -620,
    dashCost: 8,
    postEscapeGrace: 1.05,
    playerAttackCooldown: 0.42,
    playerBossAttackCooldown: 0.85,
    playerBossDamage: 15,
    bossHealth: 100,
    bossHitCooldown: 1.05,
    bossAttackCooldownMin: 1.25,
    bossAttackCooldownMax: 1.75,
    bossHealthDamage: 25,
    attackReach: 58,
    bossReach: 64,
    trapEscapeRequired: 5,
    trapLateEscapeRequired: 9,
    trapFirstLayerDelay: 3.0,
    trapLayerInterval: 2.0,
    trapDrain: 5,
    enemyHoldEscapeRequired: 6,
    enemyHoldDrain: 7,
    enemyRecoveryAfterEscape: 0.75,
    spawnCap: 4,
    spawnStartX: 260,
    spawnStopBeforeGate: 260,
    spawnMin: 4.0,
    spawnMax: 6.5,
    spawnRightBufferMin: 180,
    spawnRightBufferMax: 420,
    defeatCycle: 2.8,
    spriteFrameW: 260,
    spriteFrameH: 346,
    playerVisualH: 160,
    playerCrawlVisualH: 116,
  };

  const C = {
    sky1: "#171332", sky2: "#0f172a", back: "#1e1b4b", mid: "#312e81", near: "#111827",
    ground: "#2b1f24", groundTop: "#4b2e28", skin: "#f1bda3", hair: "#f472b6",
    outfit: "#f9a8d4", outfitDark: "#831843", cape: "#111827", trim: "#fbbf24",
    magic: "#c084fc", slime: "#34d399", slimeDark: "#065f46", boss: "#7c3aed",
    bossDark: "#312e81", goblin: "#84cc16", goblinDark: "#365314", bat: "#7c2d12",
    danger: "#fb7185", white: "#e5e7eb", panel: "rgba(15,23,42,.75)",
  };

  const SKINS = [
    { id: "pink_witch", name: "Pink Witch", filter: "none", swatch: "#f472b6", fallbackHair: "#f472b6", fallbackOutfit: "#f9a8d4" },
    { id: "blue_star", name: "Blue Star", filter: "hue-rotate(85deg) saturate(1.25) brightness(1.08)", swatch: "#60a5fa", fallbackHair: "#dbeafe", fallbackOutfit: "#7dd3fc" },
    { id: "sun_twin", name: "Sun Twin", filter: "hue-rotate(315deg) saturate(1.35) brightness(1.06)", swatch: "#fb923c", fallbackHair: "#fb923c", fallbackOutfit: "#fdba74" },
    { id: "academy_blonde", name: "Academy", filter: "hue-rotate(285deg) saturate(.65) brightness(1.10)", swatch: "#facc15", fallbackHair: "#fde68a", fallbackOutfit: "#cbd5e1" },
    { id: "dark_hoodie", name: "Dark Hoodie", filter: "grayscale(.45) sepia(.15) saturate(.8) brightness(.88)", swatch: "#374151", fallbackHair: "#f8fafc", fallbackOutfit: "#1f2937" },
    { id: "crimson_pilot", name: "Crimson", filter: "hue-rotate(25deg) saturate(1.55) brightness(1.02)", swatch: "#ef4444", fallbackHair: "#f97316", fallbackOutfit: "#ef4444" },
    { id: "moon_guardian", name: "Moon Guard", filter: "hue-rotate(135deg) saturate(1.65) brightness(1.12)", swatch: "#2563eb", fallbackHair: "#fef3c7", fallbackOutfit: "#2563eb" },
    { id: "forest_casual", name: "Forest Casual", filter: "hue-rotate(205deg) saturate(1.05) brightness(.98)", swatch: "#22c55e", fallbackHair: "#fde68a", fallbackOutfit: "#22c55e" },
  ];

  const Dom = {};
  let State;

  const StateFactory = {
    createGameState() {
      return {
        mode: MODE.MENU,
        previousMode: null,
        dt: 0,
        time: 0,
        run: this.createRunState(),
        level: this.createLevelState(),
        player: this.createPlayerState({ x: 70, y: CFG.groundY - 82 }),
        bossPlayer: null,
        boss: null,
        camera: { x: 0, y: 0, zoom: 1, shake: 0, shakeTimer: 0 },
        field: this.createFieldState(),
        hold: null,
        input: null,
        settings: { skinId: SkinManager.loadSkinId() },
        debug: { enabled: false },
      };
    },
    createRunState() {
      return {
        levelId: "forest_01",
        kills: 0,
        optionalKills: 0,
        bossesStartedByContact: 0,
        bossesStartedByAttack: 0,
        deepEncountersSeen: new Set(),
        scenesTriggered: 0,
        xpEarned: 0,
      };
    },
    createLevelState() {
      return { id: "forest_01", name: "Forest Edge", width: CFG.worldW, groundY: CFG.groundY };
    },
    createFieldState() {
      return {
        enemies: [], traps: [], pickups: [], spawnTimer: 3.0, spawnCount: 0,
        defeated: false, defeatLoop: { timer: CFG.defeatCycle, cycle: 1, source: null },
      };
    },
    createPlayerState(overrides = {}) {
      return {
        x: 70, y: CFG.groundY - 82, w: 38, h: 82, vx: 0, vy: 0,
        facing: 1, visualFacing: 1, visualFacingLock: 0, grounded: false,
        armor: 3, health: 100, stamina: 100, mana: 0, energy: 0,
        invulnTimer: 0, recoveryTimer: 0, hurtCooldown: 0,
        attackCooldown: 0, dashCooldown: 0, dashTimer: 0, attackFlash: 0, attackAnimTimer: 0,
        crouching: false,
        animation: Animation.createController("idle"),
        ...overrides,
      };
    },
  };

  const Assets = {
    images: {},
    sheets: {},
    pending: 0,
    init() {
      const defs = {
        idle: { frames: 10, fps: 3.2, loop: true },
        walk: { frames: 12, fps: 8, loop: true },
        attack: { frames: 9, fps: 12, loop: false },
        crawl: { frames: 6, fps: 6, loop: true },
        jump: { frames: 1, fps: 1, loop: false },
        fall: { frames: 1, fps: 1, loop: false },
      };
      ["armor0_underwear", "armor1_stockings", "armor2_witch"].forEach((armorKey) => {
        Object.entries(defs).forEach(([anim, def]) => {
          const key = `player_${armorKey}_${anim}`;
          this.defineSpriteSheet(key, { imageKey: key, frameW: CFG.spriteFrameW, frameH: CFG.spriteFrameH, ...def });
          this.loadImage(key, ASSET_SRC[key]);
        });
      });
    },
    loadImage(key, src) {
      const img = new Image();
      this.pending += 1;
      img.onload = () => { this.pending = Math.max(0, this.pending - 1); };
      img.onerror = () => { console.warn("Asset failed", key); this.pending = Math.max(0, this.pending - 1); };
      img.src = src;
      this.images[key] = img;
    },
    getImage(key) { return this.images[key] || null; },
    defineSpriteSheet(key, config) { this.sheets[key] = config; },
    getSpriteSheet(key) { return this.sheets[key] || null; },
    isReady() { return this.pending <= 0; },
  };

  const SkinManager = {
    get(id) { return SKINS.find(skin => skin.id === id) || SKINS[0]; },
    current() { return this.get(State?.settings?.skinId); },
    loadSkinId() {
      try {
        const saved = localStorage.getItem("veilbound_skin");
        return SKINS.some(skin => skin.id === saved) ? saved : SKINS[0].id;
      } catch (_) {
        return SKINS[0].id;
      }
    },
    set(id) {
      const skin = this.get(id);
      if (!State.settings) State.settings = {};
      State.settings.skinId = skin.id;
      try { localStorage.setItem("veilbound_skin", skin.id); } catch (_) {}
      UI.updateSkinSelector();
      UI.levelMessage(`Skin: ${skin.name}`);
      UI.bossMessage(`Skin: ${skin.name}`);
    },
  };

  const Animation = {
    createController(name = "idle") {
      return { name, frame: 0, timer: 0, fps: 2.5, finished: false };
    },
    set(entity, name, options = {}) {
      if (!entity.animation) entity.animation = this.createController(name);
      if (entity.animation.name !== name || options.restart) {
        entity.animation.name = name;
        entity.animation.frame = 0;
        entity.animation.timer = 0;
        entity.animation.finished = false;
      }
      if (options.fps) entity.animation.fps = options.fps;
    },
    update(entity, dt) {
      if (!entity || !entity.animation) return;
      const sheet = this.getSheetForEntity(entity);
      if (!sheet) return;
      const fps = sheet.fps || entity.animation.fps || 6;
      entity.animation.timer += dt;
      const frameTime = 1 / fps;
      while (entity.animation.timer >= frameTime) {
        entity.animation.timer -= frameTime;
        entity.animation.frame += 1;
        if (entity.animation.frame >= sheet.frames) {
          if (sheet.loop !== false) entity.animation.frame = 0;
          else { entity.animation.frame = sheet.frames - 1; entity.animation.finished = true; }
        }
      }
    },
    choosePlayerAnimation(player, axis) {
      if (player.attackAnimTimer > 0) { this.set(player, "attack"); return; }
      if (!player.grounded) { this.set(player, player.vy < 0 ? "jump" : "fall"); return; }
      if (player.crouching) { this.set(player, "crawl"); return; }
      const moving = Math.abs(axis) > 0 && player.grounded && Math.abs(player.vx) > 25;
      this.set(player, moving ? "walk" : "idle");
    },
    stabilizeFacing(entity, axis, dt) {
      entity.visualFacingLock = Math.max(0, entity.visualFacingLock - dt);
      if (axis !== 0) entity.facing = axis;
      if (axis !== 0 && entity.visualFacingLock <= 0) entity.visualFacing = axis;
    },
    lockFacing(entity, duration) { entity.visualFacingLock = Math.max(entity.visualFacingLock || 0, duration); },
    getArmorKey(entity) {
      if (!entity) return "armor2_witch";
      if (entity.armor >= 2) return "armor2_witch";
      if (entity.armor >= 1) return "armor1_stockings";
      return "armor0_underwear";
    },
    getSheetForEntity(entity) {
      if (!entity.animation) return null;
      const anim = entity.animation.name || "idle";
      const key = `player_${this.getArmorKey(entity)}_${anim}`;
      return Assets.getSpriteSheet(key) || Assets.getSpriteSheet(`player_${this.getArmorKey(entity)}_idle`);
    },
    getFrame(entity) {
      const sheet = this.getSheetForEntity(entity);
      if (!sheet) return null;
      const frame = Math.max(0, Math.min(sheet.frames - 1, entity.animation.frame || 0));
      return { sheet, sx: frame * sheet.frameW, sy: 0, sw: sheet.frameW, sh: sheet.frameH };
    },
  };

  const Input = {
    held: {}, pressed: {}, released: {},
    init() {
      const binds = [
        ["levelLeft", "left"], ["levelRight", "right"], ["levelJump", "jump"], ["levelAttack", "attack"], ["levelDash", "dash"], ["levelCrouch", "crouch"],
        ["bossLeft", "left"], ["bossRight", "right"], ["bossJump", "jump"], ["bossAttack", "attack"], ["bossDash", "dash"], ["bossCrouch", "crouch"],
      ];
      binds.forEach(([id, action]) => this.bindButton(id, action));
      window.addEventListener("keydown", (e) => {
        const action = this.keyToAction(e.key);
        if (!action) return;
        if (!this.held[action]) this.pressed[action] = true;
        this.held[action] = true;
      });
      window.addEventListener("keyup", (e) => {
        const action = this.keyToAction(e.key);
        if (!action) return;
        this.held[action] = false;
        this.released[action] = true;
      });
    },
    keyToAction(key) {
      return { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowDown: "crouch", s: "crouch", S: "crouch", c: "crouch", C: "crouch", " ": "jump", w: "jump", W: "jump", j: "attack", J: "attack", k: "dash", K: "dash", r: "restart", R: "restart" }[key];
    },
    bindButton(id, action) {
      const el = Dom[id];
      if (!el) return;
      let active = false;
      const down = (event) => {
        event.preventDefault();
        if (!active) this.pressed[action] = true;
        active = true;
        this.held[action] = true;
        el.blur();
      };
      const up = (event) => {
        event.preventDefault();
        if (active) this.released[action] = true;
        active = false;
        this.held[action] = false;
        el.blur();
      };
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
      el.addEventListener("pointerleave", up);
    },
    isHeld(action) { return !!this.held[action]; },
    wasPressed(action) { return !!this.pressed[action]; },
    wasReleased(action) { return !!this.released[action]; },
    update() { this.pressed = {}; this.released = {}; },
    clearAll() { this.held = {}; this.pressed = {}; this.released = {}; },
  };

  const Camera = {
    followPlayer(dt) {
      const target = clamp(State.player.x - 330, 0, State.level.width - CFG.canvasW);
      State.camera.x += (target - State.camera.x) * Math.min(1, dt * 8);
    },
    snapToBoss() { State.camera.x = 0; },
    worldToScreen(x, y) { return { x: x - State.camera.x, y }; },
    update(dt) {
      State.camera.shakeTimer = Math.max(0, State.camera.shakeTimer - dt);
      if (State.camera.shakeTimer <= 0) State.camera.shake = 0;
    },
    shake(amount, duration) { State.camera.shake = amount; State.camera.shakeTimer = duration; },
  };

  const Player = {
    resetForLevel() { State.player = StateFactory.createPlayerState({ x: 70, y: CFG.groundY - 82 }); },
    updateTimers(p, dt) {
      p.invulnTimer = Math.max(0, p.invulnTimer - dt);
      p.recoveryTimer = Math.max(0, p.recoveryTimer - dt);
      p.hurtCooldown = Math.max(0, p.hurtCooldown - dt);
      p.attackCooldown = Math.max(0, p.attackCooldown - dt);
      p.dashCooldown = Math.max(0, p.dashCooldown - dt);
      p.dashTimer = Math.max(0, p.dashTimer - dt);
      p.attackFlash = Math.max(0, p.attackFlash - dt);
      p.attackAnimTimer = Math.max(0, (p.attackAnimTimer || 0) - dt);
    },
    updateField(dt) {
      const p = State.player;
      this.updateTimers(p, dt);
      if (!this.canAct(p)) { p.crouching = false; Animation.update(p, dt); return; }
      const axis = Number(Input.isHeld("right")) - Number(Input.isHeld("left"));
      const wantsCrouch = Input.isHeld("crouch") && p.grounded && p.attackAnimTimer <= 0 && p.dashTimer <= 0;
      p.crouching = !!wantsCrouch;
      Animation.stabilizeFacing(p, axis, dt);
      if (axis) p.vx = axis * (p.crouching ? CFG.crawlSpeed : (p.dashTimer > 0 ? CFG.dashSpeed : CFG.walkSpeed));
      else if (p.dashTimer <= 0) p.vx *= 0.82;
      if (!p.crouching && Input.wasPressed("jump")) this.tryJump(p);
      if (!p.crouching && Input.wasPressed("dash")) this.tryDash(p);
      if (!p.crouching && Input.wasPressed("attack")) Combat.playerFieldAttack();
      this.applyPhysics(p, dt, State.level.width - 80);
      if (!p.grounded) p.crouching = false;
      Animation.choosePlayerAnimation(p, axis);
      Animation.update(p, dt);
    },
    updateBoss(dt) {
      const p = State.bossPlayer;
      this.updateTimers(p, dt);
      const axis = Number(Input.isHeld("right")) - Number(Input.isHeld("left"));
      const wantsCrouch = Input.isHeld("crouch") && p.grounded && p.attackAnimTimer <= 0 && p.dashTimer <= 0;
      p.crouching = !!wantsCrouch;
      Animation.stabilizeFacing(p, axis, dt);
      if (axis) p.vx = axis * (p.crouching ? CFG.crawlSpeed : (p.dashTimer > 0 ? CFG.dashSpeed : CFG.walkSpeed));
      else if (p.dashTimer <= 0) p.vx *= 0.82;
      if (!p.crouching && Input.wasPressed("jump")) this.tryJump(p);
      if (!p.crouching && Input.wasPressed("dash")) this.tryDash(p);
      if (!p.crouching && Input.wasPressed("attack")) Combat.playerBossAttack();
      this.applyPhysics(p, dt, 820);
      if (!p.grounded) p.crouching = false;
      Animation.choosePlayerAnimation(p, axis);
      Animation.update(p, dt);
    },
    applyPhysics(p, dt, maxX) {
      p.vy += CFG.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.y + p.h >= CFG.groundY) {
        p.y = CFG.groundY - p.h;
        p.vy = 0;
        p.grounded = true;
      } else p.grounded = false;
      p.x = clamp(p.x, 20, maxX);
    },
    tryJump(p) { if (!p.grounded || p.crouching || !this.canAct(p)) return; p.vy = CFG.jumpSpeed; p.grounded = false; },
    tryDash(p) {
      if (!this.canAct(p) || p.crouching || p.energy < CFG.dashCost || p.dashCooldown > 0) return;
      p.energy -= CFG.dashCost;
      p.dashTimer = 0.38;
      p.dashCooldown = 0.18;
      p.invulnTimer = 0.65;
      p.vx = CFG.dashSpeed * p.facing;
    },
    canAct(p) { return p && p.recoveryTimer <= 0 && State.mode !== MODE.HOLD && State.mode !== MODE.FIELD_DEFEAT; },
    applyArmorHit(p, amount = 1) { p.armor = Math.max(0, p.armor - amount); },
    applyHealthDamage(p, amount) { p.health = Math.max(0, p.health - amount); },
    enterRecovery(p, duration) { p.crouching = false; p.recoveryTimer = Math.max(p.recoveryTimer, duration); Animation.lockFacing(p, duration); },
  };

  const Combat = {
    attackBox(actor, reach) {
      return { x: actor.facing > 0 ? actor.x + actor.w : actor.x - reach, y: actor.y + 10, w: reach, h: 46 };
    },
    canAttack(actor) { return actor && actor.attackCooldown <= 0 && Player.canAct(actor); },
    startAttack(actor, cooldown) {
      actor.attackCooldown = cooldown;
      actor.attackFlash = 0.18;
      actor.attackAnimTimer = Math.max(actor.attackAnimTimer || 0, 0.42);
      actor.crouching = false;
      actor.energy = Math.min(100, (actor.energy || 0) + 4);
      Animation.set(actor, "attack", { restart: true });
    },
    playerFieldAttack() {
      const p = State.player;
      if (!this.canAttack(p)) return;
      this.startAttack(p, CFG.playerAttackCooldown);
      const hitbox = this.attackBox(p, CFG.attackReach);
      const target = nearest(State.field.enemies.filter(e => e.hp > 0 && !e.dormant), hitbox, p);
      if (target) {
        Enemy.applyDamage(target, { damage: 1 });
        p.energy = Math.min(100, p.energy + 16);
        UI.levelMessage(target.hp <= 0 ? "Enemy down" : `${target.kind} HP ${target.hp}/${target.maxHp}`);
      } else UI.levelMessage("Miss");
    },
    playerBossAttack() {
      const p = State.bossPlayer;
      const b = State.boss;
      if (!this.canAttack(p) || !b || b.defeated) return;
      // Cooldown starts immediately on the input, before hit resolution. No delayed spam window.
      this.startAttack(p, CFG.playerBossAttackCooldown);
      const hitbox = this.attackBox(p, CFG.bossReach);
      if (rectsOverlap(hitbox, b)) {
        b.hp = Math.max(0, b.hp - CFG.playerBossDamage);
        b.hitFlash = 0.18;
        p.energy = Math.min(100, p.energy + 14);
        UI.bossMessage(b.hp > 0 ? `King Slime: ${Math.ceil(b.hp / CFG.playerBossDamage)} clean hits left` : "King Slime defeated");
        Camera.shake(4, 0.12);
        if (b.hp <= 0) Boss.finish();
      } else UI.bossMessage("Miss");
      UI.updateBossHud();
    },
  };

  const Field = {
    enter() {
      State.mode = MODE.FIELD;
      State.level = StateFactory.createLevelState();
      State.field = StateFactory.createFieldState();
      Player.resetForLevel();
      Camera.followPlayer(1);
      Level.spawnInitialEntities();
      UI.levelMessage(`Build ${BUILD} — clean field core`);
      UI.updateLevelHud();
      Screens.show("game");
    },
    update(dt) {
      Player.updateField(dt);
      Camera.followPlayer(dt);
      Trap.updateAll(dt);
      Enemy.updateAll(dt);
      Population.update(dt);
      this.checkCollisions();
      if (State.player.health <= 0) this.enterDefeatLoop();
      if (State.player.x >= CFG.gateX) {
        UI.levelMessage("Boss gate reached");
        Game.setMode(MODE.BOSS);
      }
    },
    checkCollisions() {
      const p = State.player;
      for (const trap of State.field.traps) {
        if (!trap.used && rectsOverlap(p, trap)) { Trap.startHold(trap); return; }
      }
      for (const enemy of State.field.enemies) {
        if (enemy.hp <= 0 || enemy.dormant || enemy.recoveryTimer > 0) continue;
        if (rectsOverlap(p, enemy) && p.invulnTimer <= 0 && p.dashTimer <= 0) { Enemy.onPlayerContact(enemy); return; }
      }
      for (const pickup of State.field.pickups) {
        if (pickup.collected) continue;
        if (distance(p.x + p.w / 2, p.y + p.h / 2, pickup.x, pickup.y) < 42) {
          pickup.collected = true;
          p.energy = Math.min(100, p.energy + 25);
          UI.levelMessage("Pickup");
        }
      }
    },
    enterDefeatLoop() {
      State.mode = MODE.FIELD_DEFEAT;
      State.field.defeated = true;
      State.player.health = 0;
      State.player.vx = 0;
      State.player.vy = 0;
      State.field.defeatLoop = { timer: CFG.defeatCycle, cycle: 1, source: Enemy.chooseNearestActive() };
      UI.levelMessage("Defeat loop placeholder — Restart or Hub");
    },
    updateDefeatLoop(dt) {
      const p = State.player;
      p.vx = 0; p.vy = 0; p.y = CFG.groundY - p.h;
      State.field.enemies.forEach(e => { if (e.hp > 0 && !e.dormant) Enemy.update(e, dt); });
      State.field.defeatLoop.timer -= dt;
      if (State.field.defeatLoop.timer <= 0) {
        State.field.defeatLoop.timer = CFG.defeatCycle;
        State.field.defeatLoop.cycle += 1;
        State.field.defeatLoop.source = Enemy.chooseNearestActive();
        UI.levelMessage(`Defeat loop placeholder ${State.field.defeatLoop.cycle} — Restart or Hub`);
      }
      Camera.followPlayer(dt);
      Animation.update(p, dt);
    },
  };

  const Level = {
    spawnInitialEntities() {
      State.field.enemies = [
        Enemy.create("slime", 500, 396, { jumpy: true }),
        Enemy.create("goblin", 930, 382),
        Enemy.create("bat", 1240, 250, { flying: true }),
        Enemy.create("slime", 790, 396, { jumpy: true, dormant: true, zoneMin: 585, zoneMax: 885, patrolMin: 700, patrolMax: 910 }),
        Enemy.create("goblin", 1370, 382, { dormant: true, zoneMin: 1120, zoneMax: 1460, patrolMin: 1260, patrolMax: 1500 }),
      ];
      State.field.traps = [Trap.create("root", 690, 405), Trap.create("root", 1120, 405)];
      State.field.pickups = [{ x: 720, y: 330, collected: false }, { x: 1420, y: 320, collected: false }];
    },
  };

  const Enemy = {
    create(kind, x, y, opt = {}) {
      const dims = kind === "goblin" ? [50, 48, 2] : kind === "bat" ? [46, 34, 2] : [38, 34, 1];
      return {
        kind, x, y, w: dims[0], h: dims[1], hp: dims[2], maxHp: dims[2],
        dir: opt.dir || -1, flying: !!opt.flying, jumpy: !!opt.jumpy, spawned: !!opt.spawned,
        dormant: !!opt.dormant, zoneMin: opt.zoneMin, zoneMax: opt.zoneMax,
        patrolMin: opt.patrolMin, patrolMax: opt.patrolMax, recoveryTimer: 0, holdCooldown: 0, t: 0,
      };
    },
    updateAll(dt) {
      const p = State.player;
      for (const e of State.field.enemies) {
        if (e.dormant && p.x >= e.zoneMin && p.x <= e.zoneMax) { e.dormant = false; UI.levelMessage("Nearby enemies stir"); }
        if (e.hp > 0 && !e.dormant) this.update(e, dt);
      }
    },
    update(e, dt) {
      e.t += dt;
      e.recoveryTimer = Math.max(0, e.recoveryTimer - dt);
      e.holdCooldown = Math.max(0, e.holdCooldown - dt);
      if (e.recoveryTimer > 0) {
        e.x += e.dir * 25 * dt;
        return;
      }
      if (e.flying) {
        const min = e.patrolMin ?? 1150, max = e.patrolMax ?? 1440;
        e.x += e.dir * 82 * dt; e.y = 245 + Math.sin(e.t * 3) * 38;
        if (e.x < min || e.x > max) e.dir *= -1;
        return;
      }
      if (e.jumpy) {
        const min = e.patrolMin ?? 390, max = e.patrolMax ?? 760;
        e.x += e.dir * 58 * dt; e.y = CFG.groundY - e.h - Math.abs(Math.sin(e.t * 4.8)) * 42;
        if (e.x < min || e.x > max) e.dir *= -1;
        return;
      }
      const min = e.patrolMin ?? 840, max = e.patrolMax ?? 1080;
      e.x += e.dir * 65 * dt; e.y = CFG.groundY - e.h;
      if (e.x < min || e.x > max) e.dir *= -1;
    },
    onPlayerContact(e) {
      const p = State.player;
      if (e.flying && p.crouching) {
        UI.levelMessage("Crouched under flying enemy");
        return;
      }
      if (p.armor > 0) {
        Player.applyArmorHit(p, 1);
        p.invulnTimer = 0.9;
        p.energy = Math.min(100, p.energy + 12);
        e.holdCooldown = 1.8;
        UI.levelMessage("Layer hit — stay mobile");
      } else if (e.holdCooldown <= 0) {
        Hold.startHold({ type: "enemy", source: e, escapeRequired: CFG.enemyHoldEscapeRequired, healthDrain: CFG.enemyHoldDrain, sceneId: `${e.kind}_minor_hold_placeholder` });
      }
      UI.updateLevelHud();
    },
    applyDamage(e, hit) {
      e.hp = Math.max(0, e.hp - hit.damage);
      if (e.hp <= 0) { State.run.kills += 1; e.recoveryTimer = 999; }
    },
    enterRecovery(e, duration) { e.recoveryTimer = duration; e.dir = State.player.x < e.x ? 1 : -1; },
    chooseNearestActive() {
      const p = State.player;
      const active = State.field.enemies.filter(e => e.hp > 0 && !e.dormant);
      active.sort((a, b) => Math.abs(centerX(a) - centerX(p)) - Math.abs(centerX(b) - centerX(p)));
      return active[0] || null;
    },
  };

  const Population = {
    update(dt) {
      const p = State.player;
      if (!p || State.mode !== MODE.FIELD) return;
      if (p.x < CFG.spawnStartX || p.x > CFG.gateX - CFG.spawnStopBeforeGate) return;
      const active = State.field.enemies.filter(e => e.hp > 0 && !e.dormant).length;
      if (active >= CFG.spawnCap) return;
      State.field.spawnTimer -= dt;
      if (State.field.spawnTimer > 0) return;
      this.spawnOffscreen();
      State.field.spawnTimer = randomRange(CFG.spawnMin, CFG.spawnMax);
    },
    spawnOffscreen() {
      const camRight = State.camera.x + CFG.canvasW;
      const x = clamp(camRight + randomRange(CFG.spawnRightBufferMin, CFG.spawnRightBufferMax), State.player.x + 300, CFG.gateX - 180);
      const patrolMin = Math.max(260, x - 170), patrolMax = Math.min(CFG.gateX - 120, x + 160);
      const roll = Math.random();
      const e = roll < 0.45 ? Enemy.create("slime", x, 396, { jumpy: true, spawned: true, patrolMin, patrolMax }) :
        roll < 0.78 ? Enemy.create("goblin", x, 382, { spawned: true, patrolMin, patrolMax }) :
        Enemy.create("bat", x, 250, { flying: true, spawned: true, patrolMin, patrolMax });
      State.field.enemies.push(e);
      State.field.spawnCount += 1;
      UI.levelMessage(`Enemy pressure ${State.field.spawnCount}`);
    },
  };

  const Trap = {
    create(type, x, y) { return { type, x, y, w: 92, h: 25, active: false, used: false, t: 0 }; },
    updateAll(dt) { State.field.traps.forEach(t => t.t += dt); },
    startHold(trap) {
      Hold.startHold({ type: "trap", source: trap, escapeRequired: CFG.trapEscapeRequired, lateEscapeRequired: CFG.trapLateEscapeRequired, layerDelay: CFG.trapFirstLayerDelay, layerInterval: CFG.trapLayerInterval, healthDrain: CFG.trapDrain, sceneId: "forest_root_hold_placeholder" });
    },
    disable(trap) { trap.used = true; trap.active = false; },
  };

  const Hold = {
    startHold(config) {
      const p = State.player;
      State.hold = { ...config, phase: "escape", progress: 0, required: config.escapeRequired, layerTimer: config.layerDelay || 0 };
      State.mode = MODE.HOLD;
      if (config.source) config.source.active = true;
      p.vx = 0; p.vy = 0; p.dashTimer = 0; p.invulnTimer = 0;
      if (config.type === "trap") { p.x = clamp(config.source.x + config.source.w / 2 - p.w / 2, 20, CFG.worldW - 80); }
      UI.levelMessage(config.type === "trap" ? "Root snare — tap buttons to escape" : "Enemy hold — mash to recover");
    },
    update(dt) {
      const h = State.hold, p = State.player;
      if (!h) return;
      Player.updateTimers(p, dt);
      p.vx = 0; p.vy = 0; p.y = CFG.groundY - p.h;
      if (Input.wasPressed("jump") || Input.wasPressed("attack") || Input.wasPressed("dash") || Input.wasPressed("crouch") || Input.wasPressed("left") || Input.wasPressed("right")) this.addEscapeProgress(1);
      if (h.type === "trap") this.updateTrapHold(h, p, dt);
      else this.updateEnemyHold(h, p, dt);
      Animation.update(p, dt);
      Camera.followPlayer(dt);
    },
    updateTrapHold(h, p, dt) {
      if (h.phase === "escape") {
        h.layerTimer -= dt;
        if (h.layerTimer <= 0) {
          if (p.armor > 0) Player.applyArmorHit(p, 1);
          if (p.armor <= 0) { h.phase = "late"; h.progress = 0; h.required = h.lateEscapeRequired; UI.levelMessage("Late hold placeholder — keep mashing"); }
          h.layerTimer += h.layerInterval;
        }
      }
      if (h.phase === "late") { Player.applyHealthDamage(p, h.healthDrain * dt); if (p.health <= 0) this.fail(); }
      UI.updateLevelHud();
    },
    updateEnemyHold(h, p, dt) {
      const e = h.source;
      if (e) { e.x = p.x + (p.facing > 0 ? p.w - 6 : -e.w + 6); e.y = e.flying ? p.y + 16 : CFG.groundY - e.h; }
      Player.applyHealthDamage(p, h.healthDrain * dt);
      if (p.health <= 0) this.fail();
      UI.updateLevelHud();
    },
    addEscapeProgress(amount) {
      const h = State.hold;
      if (!h) return;
      h.progress = Math.min(h.required, h.progress + amount);
      UI.levelMessage(`Escaping: ${h.progress}/${h.required}`);
      if (h.progress >= h.required) this.escape();
    },
    escape() {
      const h = State.hold, p = State.player;
      if (!h) return;
      if (h.type === "trap") { Trap.disable(h.source); p.x = clamp(h.source.x + h.source.w + 30, 20, CFG.worldW - 80); }
      else if (h.source) { Enemy.enterRecovery(h.source, CFG.enemyRecoveryAfterEscape); p.x = clamp(p.x - p.facing * 26, 20, CFG.worldW - 80); }
      p.invulnTimer = CFG.postEscapeGrace;
      Player.enterRecovery(p, 0.25);
      p.energy = Math.min(100, p.energy + 10);
      State.hold = null;
      State.mode = MODE.FIELD;
      UI.levelMessage("Escaped — move");
    },
    fail() {
      State.hold = null;
      Field.enterDefeatLoop();
    },
  };

  const Boss = {
    enter() {
      const src = State.player;
      State.mode = MODE.BOSS;
      Screens.show("boss");
      State.bossPlayer = StateFactory.createPlayerState({ x: 110, y: CFG.groundY - 82, armor: src.armor, health: src.health, energy: Math.max(20, src.energy), stamina: src.stamina });
      State.boss = { x: 670, y: 326, w: 120, h: 104, hp: CFG.bossHealth, maxHp: CFG.bossHealth, hitFlash: 0, cooldown: 0.8, telegraph: 0, telegraphType: "", windup: 0, projectiles: [], defeated: false };
      Camera.snapToBoss();
      UI.bossMessage(`Build ${BUILD} — cooldown starts on press`);
      UI.updateBossHud();
    },
    update(dt) {
      if (!State.boss || !State.bossPlayer) return;
      const b = State.boss, p = State.bossPlayer;
      Player.updateBoss(dt);
      b.hitFlash = Math.max(0, b.hitFlash - dt);
      if (b.defeated) return;
      b.cooldown -= dt;
      b.windup = Math.max(0, b.windup - dt);
      if (b.telegraph > 0) { b.telegraph -= dt; if (b.telegraph <= 0) this.releaseAttack(); }
      b.x += Math.sign(centerX(p) - centerX(b)) * 24 * dt;
      b.x = clamp(b.x, 520, 820);
      if (b.cooldown <= 0 && b.telegraph <= 0 && b.windup <= 0) this.beginAttack();
      if (b.windup > 0 && rectsOverlap(p, this.slamZone())) this.hitPlayer();
      b.projectiles.forEach(proj => this.updateProjectile(proj, dt));
      b.projectiles = b.projectiles.filter(proj => proj.life > 0 && proj.x > -80 && proj.x < 1040);
      if (rectsOverlap(p, b)) this.hitPlayer();
      UI.updateBossHud();
    },
    beginAttack() {
      const p = State.bossPlayer, b = State.boss;
      const glob = Math.abs(centerX(p) - centerX(b)) > 215 || b.telegraphType === "slam";
      b.telegraphType = glob ? "glob" : "slam";
      b.telegraph = glob ? 0.42 : 0.34;
      b.cooldown = randomRange(CFG.bossAttackCooldownMin, CFG.bossAttackCooldownMax);
      UI.bossMessage(glob ? "King Slime forms a glob" : "King Slime swells up");
    },
    releaseAttack() {
      const p = State.bossPlayer, b = State.boss;
      if (b.telegraphType === "slam") b.windup = 0.24;
      if (b.telegraphType === "glob") {
        const dir = centerX(p) < centerX(b) ? -1 : 1;
        b.projectiles.push({ x: b.x + b.w / 2, y: b.y + 50, w: 28, h: 28, vx: dir * 255, life: 2.8, ignoreUntilClear: false });
      }
      b.telegraphType = "";
    },
    updateProjectile(proj, dt) {
      const p = State.bossPlayer;
      proj.x += proj.vx * dt; proj.life -= dt;
      const touching = rectsOverlap(p, proj);
      if (!touching) { proj.ignoreUntilClear = false; return; }
      if (p.invulnTimer > 0 || p.dashTimer > 0) { proj.ignoreUntilClear = true; return; }
      if (proj.ignoreUntilClear) return;
      proj.life = 0;
      this.hitPlayer();
    },
    hitPlayer() {
      const p = State.bossPlayer;
      if (p.hurtCooldown > 0 || p.invulnTimer > 0 || p.dashTimer > 0 || State.boss.defeated) return;
      p.hurtCooldown = CFG.bossHitCooldown;
      p.invulnTimer = 0.35;
      p.energy = Math.min(100, p.energy + 12);
      if (p.armor > 0) { Player.applyArmorHit(p, 1); UI.bossMessage("Armor layer hit"); }
      else { Player.applyHealthDamage(p, CFG.bossHealthDamage); UI.bossMessage("Health hit — dodge the rhythm"); }
      Camera.shake(5, 0.15);
      if (p.health <= 0) { p.health = 0; State.boss.defeated = true; State.boss.projectiles = []; UI.bossMessage("Boss defeat placeholder — Restart Boss or Hub"); }
    },
    slamZone() { const b = State.boss; return { x: b.x - 70, y: b.y + 18, w: b.w + 140, h: 82 }; },
    finish() {
      State.boss.defeated = true;
      UI.bossMessage("King Slime defeated");
      if (Dom.hubText) Dom.hubText.textContent = "Level 1 clear: King Slime defeated.";
      if (Dom.resultText) Dom.resultText.textContent = "King Slime defeated. Forest route cleared.";
      if (Dom.resultStats) Dom.resultStats.textContent = `Remaining health: ${Math.ceil(State.bossPlayer.health)} | Armor: ${State.bossPlayer.armor} | Energy: ${Math.floor(State.bossPlayer.energy)}`;
      setTimeout(() => Game.setMode(MODE.RESULT), 800);
    },
  };

  const UI = {
    ensureCrouchButtons() {
      this.createCrouchButton("levelCrouch", "levelDash");
      this.createCrouchButton("bossCrouch", "bossDash");
    },
    ensureSkinSelector() {
      const host = Dom.customize || Dom.hub || Dom.menu;
      if (!host || document.getElementById("veilboundSkinSelector")) return;
      const panel = document.createElement("section");
      panel.id = "veilboundSkinSelector";
      panel.style.cssText = "margin:16px 0;padding:14px;border:1px solid rgba(255,255,255,.16);border-radius:18px;background:rgba(15,23,42,.72);color:#e5e7eb;";
      const title = document.createElement("div");
      title.textContent = "Player Skin";
      title.style.cssText = "font-weight:800;font-size:18px;margin-bottom:10px;";
      const grid = document.createElement("div");
      grid.id = "veilboundSkinGrid";
      grid.style.cssText = "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;";
      SKINS.forEach((skin) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.skinId = skin.id;
        button.textContent = skin.name;
        button.style.cssText = "min-height:48px;border-radius:14px;border:1px solid rgba(255,255,255,.18);font-weight:800;color:white;background:#374151;touch-action:none;";
        button.addEventListener("click", () => SkinManager.set(skin.id));
        const swatch = document.createElement("span");
        swatch.style.cssText = `display:inline-block;width:14px;height:14px;border-radius:50%;background:${skin.swatch};margin-right:8px;vertical-align:-2px;box-shadow:0 0 0 2px rgba(255,255,255,.18);`;
        button.prepend(swatch);
        grid.appendChild(button);
      });
      panel.appendChild(title);
      panel.appendChild(grid);
      host.appendChild(panel);
      this.updateSkinSelector();
    },
    updateSkinSelector() {
      const current = SkinManager.current();
      document.querySelectorAll("[data-skin-id]").forEach((button) => {
        const active = button.dataset.skinId === current.id;
        button.style.outline = active ? "3px solid #a855f7" : "none";
        button.style.background = active ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "#374151";
      });
    },
    createCrouchButton(id, afterId) {
      if (Dom[id]) return;
      const after = Dom[afterId];
      if (!after || !after.parentNode) return;
      const button = document.createElement("button");
      button.id = id;
      button.type = "button";
      button.textContent = "Crouch";
      button.className = after.className;
      button.style.touchAction = "none";
      after.parentNode.insertBefore(button, after.nextSibling);
      Dom[id] = button;
    },
    levelMessage(text) { if (Dom.levelMessage) Dom.levelMessage.textContent = text; },
    bossMessage(text) { if (Dom.bossMessage) Dom.bossMessage.textContent = text; },
    dots(count) { return [1,2,3].map(i => `<i class="dot ${i <= count ? "" : "is-empty"}"></i>`).join(""); },
    updateLevelHud() {
      const p = State.player;
      if (Dom.armorDots) Dom.armorDots.innerHTML = this.dots(p.armor);
      if (Dom.levelHealth) Dom.levelHealth.textContent = Math.ceil(p.health);
      if (Dom.levelHealthFill) Dom.levelHealthFill.style.width = `${clamp(p.health,0,100)}%`;
      if (Dom.levelEnergy) Dom.levelEnergy.textContent = Math.floor(p.energy);
      if (Dom.levelDash) Dom.levelDash.classList.toggle("is-locked", p.energy < CFG.dashCost);
    },
    updateBossHud() {
      const p = State.bossPlayer, b = State.boss;
      if (!p || !b) return;
      if (Dom.bossArmorDots) Dom.bossArmorDots.innerHTML = this.dots(p.armor);
      if (Dom.bossPlayerHealth) Dom.bossPlayerHealth.textContent = Math.ceil(p.health);
      if (Dom.bossPlayerHealthFill) Dom.bossPlayerHealthFill.style.width = `${clamp(p.health,0,100)}%`;
      if (Dom.bossEnergy) Dom.bossEnergy.textContent = Math.floor(p.energy);
      if (Dom.bossHitsLeft) Dom.bossHitsLeft.textContent = Math.max(0, Math.ceil(b.hp / CFG.playerBossDamage));
      if (Dom.bossHealthFill) Dom.bossHealthFill.style.width = `${clamp(b.hp,0,b.maxHp) / b.maxHp * 100}%`;
      if (Dom.bossDash) Dom.bossDash.classList.toggle("is-locked", p.energy < CFG.dashCost);
    },
  };

  const Screens = {
    show(id) {
      document.querySelectorAll(".screen").forEach(s => s.classList.remove("is-active"));
      const el = Dom[id] || Dom.game || Dom.hub || Dom.menu;
      if (el) el.classList.add("is-active");
      window.scrollTo(0, 0);
    },
  };

  const Renderer = {
    init() { this.levelCtx = Dom.levelCanvas?.getContext("2d"); this.bossCtx = Dom.bossCanvas?.getContext("2d"); },
    render() {
      if (State.mode === MODE.BOSS) this.renderBoss();
      else this.renderField();
    },
    ctxForField() { return this.levelCtx; },
    clear(ctx) {
      if (!ctx) return;
      const g = ctx.createLinearGradient(0,0,0,430);
      g.addColorStop(0, C.sky1); g.addColorStop(1, C.sky2);
      ctx.clearRect(0,0,CFG.canvasW,CFG.canvasH);
      ctx.fillStyle = g; ctx.fillRect(0,0,CFG.canvasW,CFG.canvasH);
    },
    renderField() {
      const ctx = this.levelCtx; if (!ctx) return;
      this.clear(ctx); this.drawForest(ctx, State.camera.x, State.time); this.drawGround(ctx, -State.camera.x, CFG.worldW);
      State.field.traps.forEach(t => this.drawTrap(ctx, t, State.camera.x));
      this.drawGate(ctx, State.camera.x);
      State.field.pickups.forEach(p => this.drawPickup(ctx, p, State.camera.x));
      State.field.enemies.forEach(e => { if (e.hp > 0 && !e.dormant) this.drawEnemy(ctx, e, State.camera.x); });
      this.drawAttackFlash(ctx, State.player, CFG.attackReach, State.camera.x);
      this.drawPlayer(ctx, State.player, State.camera.x, State.field.defeated);
      if (State.mode === MODE.HOLD) this.drawHoldOverlay(ctx);
      if (State.mode === MODE.FIELD_DEFEAT) this.drawDefeatOverlay(ctx);
      this.drawDebugHitbox(ctx, State.player, State.camera.x);
      UI.updateLevelHud();
    },
    renderBoss() {
      const ctx = this.bossCtx; if (!ctx) return;
      const b = State.boss, p = State.bossPlayer;
      this.clear(ctx); this.drawForest(ctx, 0, State.time); this.drawGround(ctx, 0, CFG.canvasW);
      if (b) {
        if (!b.defeated) {
          if (b.telegraphType === "slam" && b.telegraph > 0) this.drawSlamWarning(ctx, Boss.slamZone());
          if (b.windup > 0) this.drawSlamActive(ctx, Boss.slamZone());
          if (b.telegraphType === "glob" && b.telegraph > 0) this.drawGlobCharge(ctx, b);
          b.projectiles.forEach(proj => this.drawProjectile(ctx, proj));
        }
        this.drawKingSlime(ctx, b);
      }
      if (p) { this.drawAttackFlash(ctx, p, CFG.bossReach, 0); this.drawPlayer(ctx, p, 0, b?.defeated && p.health <= 0); this.drawDebugHitbox(ctx, p, 0); }
      if (b?.defeated && p?.health <= 0) this.drawBossDefeatOverlay(ctx);
      UI.updateBossHud();
    },
    drawForest(ctx, cam, time) {
      this.drawTreeLayer(ctx, cam*0.16,72,C.back,.8); this.drawTreeLayer(ctx, cam*.32,132,C.mid,.58); this.drawTreeLayer(ctx, cam*.52,196,C.near,.74);
      ctx.fillStyle = "rgba(251,191,36,.18)";
      for (let i=0;i<12;i++) { const x=((i*93-cam*.22+Math.sin(time+i)*8)%1040)-40; const y=120+((i*41)%210); ctx.fillRect(x,y,3,3); }
    },
    drawTreeLayer(ctx, cam, baseY, color, alpha) {
      ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle=color;
      for (let x=-120;x<1100;x+=96) { const dx=x-(cam%96), h=210+((x*7)%70); ctx.fillRect(dx+38,baseY+160-h,20,h); ctx.beginPath(); ctx.moveTo(dx-12,baseY+160-h+65); ctx.lineTo(dx+48,baseY+160-h-30); ctx.lineTo(dx+110,baseY+160-h+65); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    },
    drawGround(ctx, offsetX, width) { ctx.fillStyle=C.ground; ctx.fillRect(offsetX,CFG.groundY,width,110); ctx.fillStyle=C.groundTop; ctx.fillRect(offsetX,CFG.groundY,width,10); },
    drawPlayer(ctx, p, cam, fallen=false) {
      if (!p) return;
      const frame = Animation.getFrame(p);
      const sheet = frame ? Assets.getImage(frame.sheet.imageKey) : null;
      if (!sheet || !sheet.complete || sheet.naturalWidth === 0) return this.drawFallbackPlayer(ctx, p, cam, fallen);
      const visualH = p.crouching ? CFG.playerCrawlVisualH : CFG.playerVisualH;
      const visualW = visualH * (CFG.spriteFrameW / CFG.spriteFrameH);
      const x = p.x - cam + p.w/2;
      const y = p.y + p.h + 7;
      const drawScaleX = p.visualFacing; // current cleaned source art faces right; mirror only when the player faces left.
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(drawScaleX, 1);
      if (fallen) ctx.rotate(-0.45);
      if ((p.invulnTimer > 0 || p.dashTimer > 0) && Math.floor(Date.now()/80)%2) ctx.globalAlpha = .62;
      const skin = SkinManager.current();
      ctx.filter = skin.filter || "none";
      ctx.drawImage(sheet, frame.sx, frame.sy, frame.sw, frame.sh, -visualW/2, -visualH, visualW, visualH);
      ctx.filter = "none";
      ctx.restore();
    },
    drawFallbackPlayer(ctx, p, cam, fallen=false) {
      const x=p.x-cam+p.w/2, y=p.y+p.h;
      ctx.save(); ctx.translate(x,y); ctx.scale(p.visualFacing,1); if(fallen)ctx.rotate(-.45);
      const skin = SkinManager.current(); ctx.fillStyle=C.cape; ctx.fillRect(-18,-78,36,58); ctx.fillStyle=skin.fallbackOutfit || C.outfit; ctx.fillRect(-16,-72,32,46); ctx.fillStyle=C.skin; ctx.beginPath(); ctx.arc(0,-90,15,0,Math.PI*2); ctx.fill(); ctx.fillStyle=skin.fallbackHair || C.hair; ctx.beginPath(); ctx.ellipse(-2,-96,20,16,-.2,0,Math.PI*2); ctx.fill(); ctx.restore();
    },
    drawAttackFlash(ctx, actor, reach, cam) { if(!actor||actor.attackFlash<=0)return; const box=Combat.attackBox(actor,reach); ctx.save(); ctx.globalAlpha=.65; ctx.fillStyle=C.trim; ctx.beginPath(); ctx.ellipse(box.x-cam+reach/2,box.y+18,reach*.58,26,actor.facing>0?-.25:.25,0,Math.PI*2); ctx.fill(); ctx.restore(); },
    drawTrap(ctx,t,cam) { const x=t.x-cam; ctx.save(); ctx.globalAlpha=t.used?.22:1; ctx.fillStyle=t.active?"rgba(244,114,182,.45)":"rgba(52,211,153,.28)"; ctx.beginPath(); ctx.ellipse(x+t.w/2,t.y+t.h/2,t.w/2,t.h/2,0,0,Math.PI*2); ctx.fill(); ctx.strokeStyle="rgba(209,250,229,.65)"; ctx.lineWidth=3; for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x+12+i*20,t.y+18);ctx.quadraticCurveTo(x+8+i*24,t.y-12-Math.sin(State.time*6+i)*8,x+22+i*20,t.y+8);ctx.stroke();} ctx.restore(); },
    drawGate(ctx,cam) { const x=CFG.gateX-cam; ctx.save(); ctx.translate(x+24,378); ctx.fillStyle="rgba(192,132,252,.15)"; ctx.beginPath(); ctx.ellipse(0,4,48,78,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle="#6b21a8"; ctx.fillRect(-22,-50,44,100); ctx.fillStyle="#f9a8d4"; ctx.fillRect(-13,-39,26,78); ctx.restore(); },
    drawPickup(ctx,p,cam) { if(p.collected)return; ctx.save(); ctx.translate(p.x-cam,p.y+Math.sin(State.time*5)*4); ctx.fillStyle="rgba(192,132,252,.20)"; ctx.beginPath(); ctx.arc(0,0,24,0,Math.PI*2); ctx.fill(); ctx.fillStyle=C.magic; ctx.beginPath(); ctx.moveTo(0,-16); ctx.lineTo(13,0); ctx.lineTo(0,16); ctx.lineTo(-13,0); ctx.closePath(); ctx.fill(); ctx.restore(); },
    drawEnemy(ctx,e,cam) { if(e.kind==="slime")this.drawSlime(ctx,e,cam); else if(e.kind==="goblin")this.drawGoblin(ctx,e,cam); else this.drawBat(ctx,e,cam); ctx.fillStyle="#fff"; ctx.font="12px system-ui"; ctx.fillText(String(e.hp),e.x-cam+e.w/2-3,e.y-7); },
    drawSlime(ctx,e,cam) { const x=e.x-cam+e.w/2,y=e.y+e.h,s=1+Math.abs(Math.sin(e.t*4.8))*.18; ctx.save();ctx.translate(x,y);ctx.scale(1.12/s,s);ctx.fillStyle=C.slimeDark;ctx.beginPath();ctx.ellipse(0,-16,21,18,0,Math.PI,0);ctx.lineTo(21,0);ctx.quadraticCurveTo(0,12,-21,0);ctx.closePath();ctx.fill();ctx.fillStyle=C.slime;ctx.beginPath();ctx.ellipse(0,-17,16,12,0,0,Math.PI*2);ctx.fill();ctx.restore(); },
    drawGoblin(ctx,e,cam) { const x=e.x-cam+e.w/2,y=e.y+e.h; ctx.save();ctx.translate(x,y);ctx.scale(e.dir>0?1:-1,1);ctx.fillStyle=C.goblinDark;ctx.fillRect(-12,-28,8,28);ctx.fillRect(5,-28,8,28);ctx.fillStyle=C.goblin;ctx.fillRect(-18,-58,36,32);ctx.fillStyle="#a3e635";ctx.beginPath();ctx.ellipse(0,-70,17,14,0,0,Math.PI*2);ctx.fill();ctx.restore(); },
    drawBat(ctx,e,cam) { const x=e.x-cam+e.w/2,y=e.y+e.h/2,flap=Math.sin(State.time*15)*13;ctx.save();ctx.translate(x,y);ctx.scale(e.dir>0?1:-1,1);ctx.fillStyle="rgba(124,45,18,.6)";ctx.beginPath();ctx.moveTo(-8,1);ctx.quadraticCurveTo(-42,-24-flap,-38,20);ctx.lineTo(-9,13);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(8,1);ctx.quadraticCurveTo(42,-24+flap,38,20);ctx.lineTo(9,13);ctx.closePath();ctx.fill();ctx.fillStyle=C.bat;ctx.beginPath();ctx.ellipse(0,0,15,12,0,0,Math.PI*2);ctx.fill();ctx.restore(); },
    drawKingSlime(ctx,b) { const hit=b.hitFlash>0,wob=Math.sin(State.time*5)*6;ctx.save();ctx.translate(b.x+b.w/2,b.y+b.h);const g=ctx.createRadialGradient(-20,-64,16,0,-42,96);g.addColorStop(0,hit?"#fef3c7":"#f0abfc");g.addColorStop(.4,hit?"#fbbf24":C.boss);g.addColorStop(1,C.bossDark);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-66,0);ctx.quadraticCurveTo(-70,-64+wob,-8,-92);ctx.quadraticCurveTo(54,-72-wob,66,0);ctx.quadraticCurveTo(22,15,-66,0);ctx.closePath();ctx.fill();ctx.fillStyle=C.white;ctx.fillRect(-24,-54,8,8);ctx.fillRect(18,-54,8,8);ctx.fillStyle=C.trim;ctx.beginPath();ctx.moveTo(-24,-82);ctx.lineTo(-10,-106);ctx.lineTo(2,-86);ctx.lineTo(18,-108);ctx.lineTo(28,-79);ctx.closePath();ctx.fill();ctx.restore(); },
    drawSlamWarning(ctx,z) { ctx.fillStyle="rgba(251,113,133,.16)";ctx.fillRect(z.x,z.y,z.w,z.h);ctx.strokeStyle="rgba(251,113,133,.65)";ctx.lineWidth=3;ctx.strokeRect(z.x,z.y,z.w,z.h); },
    drawSlamActive(ctx,z) { ctx.fillStyle="rgba(251,113,133,.32)";ctx.fillRect(z.x,z.y,z.w,z.h); },
    drawGlobCharge(ctx,b) { ctx.fillStyle="rgba(52,211,153,.72)";ctx.beginPath();ctx.arc(b.x+b.w/2,b.y+50,18+Math.sin(State.time*18)*4,0,Math.PI*2);ctx.fill(); },
    drawProjectile(ctx,p) { ctx.fillStyle="rgba(52,211,153,.18)";ctx.beginPath();ctx.arc(p.x,p.y,25,0,Math.PI*2);ctx.fill();ctx.fillStyle=C.slime;ctx.beginPath();ctx.arc(p.x,p.y,12,0,Math.PI*2);ctx.fill(); },
    drawHoldOverlay(ctx) { const h=State.hold;if(!h)return;ctx.save();ctx.fillStyle=C.panel;ctx.fillRect(150,22,660,112);ctx.strokeStyle="rgba(255,255,255,.18)";ctx.strokeRect(150,22,660,112);ctx.fillStyle="#fff";ctx.font="18px system-ui";ctx.fillText(h.type==="trap"?"TRAP HOLD — mash buttons to escape":"MINOR HOLD — mash buttons to recover",175,52);this.drawProgress(ctx,h.progress,h.required,175,68);ctx.fillStyle="#cbd5e1";ctx.font="14px system-ui";ctx.fillText(`Escape ${h.progress}/${h.required}`,175,105);ctx.restore(); },
    drawDefeatOverlay(ctx) { ctx.save();ctx.fillStyle=C.panel;ctx.fillRect(150,22,660,110);ctx.strokeStyle="rgba(255,255,255,.18)";ctx.strokeRect(150,22,660,110);ctx.fillStyle="#fff";ctx.font="18px system-ui";ctx.fillText("DEFEAT LOOP PLACEHOLDER",175,54);ctx.fillStyle="#cbd5e1";ctx.font="14px system-ui";ctx.fillText("Field remains active. Use Restart or Hub when ready.",175,84);ctx.fillText(`Loop cycle: ${State.field.defeatLoop.cycle}`,175,108);ctx.restore(); },
    drawBossDefeatOverlay(ctx) { ctx.save();ctx.fillStyle=C.panel;ctx.fillRect(150,22,660,92);ctx.strokeStyle="rgba(255,255,255,.18)";ctx.strokeRect(150,22,660,92);ctx.fillStyle="#fff";ctx.font="18px system-ui";ctx.fillText("BOSS DEFEAT PLACEHOLDER",175,54);ctx.fillStyle="#cbd5e1";ctx.font="14px system-ui";ctx.fillText("Restart Boss or return to Hub.",175,84);ctx.restore(); },
    drawProgress(ctx,v,max,x,y) { ctx.fillStyle="#374151";ctx.fillRect(x,y,420,18);ctx.fillStyle=C.slime;ctx.fillRect(x,y,420*(v/max),18);ctx.strokeStyle="rgba(255,255,255,.28)";ctx.strokeRect(x,y,420,18); },
    drawDebugHitbox(ctx,a,cam) { if(!State.debug.enabled||!a)return;ctx.save();ctx.strokeStyle="rgba(56,189,248,.45)";ctx.strokeRect(a.x-cam,a.y,a.w,a.h);ctx.restore(); },
  };

  const Game = {
    init() {
      ["safeHub","menu","hub","customize","gallery","game","boss","result","hubText","resultText","resultStats","levelCanvas","bossCanvas","armorDots","levelHealth","levelHealthFill","levelEnergy","levelMessage","levelLeft","levelRight","levelJump","levelAttack","levelDash","levelRestart","bossArmorDots","bossPlayerHealth","bossPlayerHealthFill","bossEnergy","bossHitsLeft","bossHealthFill","bossMessage","bossLeft","bossRight","bossJump","bossAttack","bossDash","bossRestart","levelCrouch","bossCrouch"].forEach(id => Dom[id] = document.getElementById(id));
      State = StateFactory.createGameState();
      Assets.init(); Renderer.init(); UI.ensureCrouchButtons(); UI.ensureSkinSelector(); Input.init();
      document.querySelectorAll("[data-build-tag]").forEach(tag => tag.textContent = BUILD);
      document.addEventListener("click", e => { const go=e.target?.dataset?.go; if(go) this.handleGo(go); });
      Dom.safeHub?.addEventListener("click", () => this.setMode(MODE.MENU));
      Dom.levelRestart?.addEventListener("click", () => Field.enter());
      Dom.bossRestart?.addEventListener("click", () => this.setMode(MODE.BOSS));
      document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
      ["contextmenu","selectstart","dragstart","gesturestart"].forEach(t => document.addEventListener(t, e => e.preventDefault()));
      this.setMode(MODE.MENU);
      this.start();
      window.VeilboundDebug = Debug;
    },
    handleGo(go) { if(go==="game") this.setMode(MODE.FIELD); else if(go==="boss") this.setMode(MODE.BOSS); else { Screens.show(go); State.mode = MODE.MENU; } },
    start() { State.last = performance.now(); requestAnimationFrame(this.loop.bind(this)); },
    loop(now) {
      const dt = Math.min(0.033, (now - State.last) / 1000 || 0);
      State.last = now; State.dt = dt; State.time += dt;
      this.update(dt); Renderer.render(); Input.update(); requestAnimationFrame(this.loop.bind(this));
    },
    update(dt) {
      Camera.update(dt);
      if (State.mode === MODE.FIELD) Field.update(dt);
      else if (State.mode === MODE.HOLD) Hold.update(dt);
      else if (State.mode === MODE.FIELD_DEFEAT) Field.updateDefeatLoop(dt);
      else if (State.mode === MODE.BOSS) Boss.update(dt);
      if (Input.wasPressed("restart")) { if(State.mode===MODE.BOSS)this.setMode(MODE.BOSS); else Field.enter(); }
    },
    setMode(mode, payload) {
      State.previousMode = State.mode;
      Input.clearAll();
      if (mode === MODE.FIELD) Field.enter();
      else if (mode === MODE.BOSS) Boss.enter();
      else if (mode === MODE.RESULT) { State.mode = MODE.RESULT; Screens.show("result"); }
      else { State.mode = mode; Screens.show("menu"); }
    },
  };

  const Debug = {
    toggle() { State.debug.enabled = !State.debug.enabled; },
    restorePlayer() { const p = State.mode===MODE.BOSS ? State.bossPlayer : State.player; if(p){ p.health=100;p.armor=3;p.energy=100;p.stamina=100;p.attackCooldown=0;p.hurtCooldown=0;p.attackAnimTimer=0;p.crouching=false; } },
    startBoss() { Game.setMode(MODE.BOSS); },
    startField() { Game.setMode(MODE.FIELD); },
    forceTrapHold() { Hold.startHold({ type:"trap", source: State.field.traps[0] || Trap.create("root", State.player.x, 405), escapeRequired: CFG.trapEscapeRequired, lateEscapeRequired: CFG.trapLateEscapeRequired, layerDelay: CFG.trapFirstLayerDelay, layerInterval: CFG.trapLayerInterval, healthDrain: CFG.trapDrain }); },
    forceEnemyHold() { const e = State.field.enemies.find(x=>x.hp>0&&!x.dormant) || Enemy.create("goblin", State.player.x+40, 382); Hold.startHold({ type:"enemy", source:e, escapeRequired: CFG.enemyHoldEscapeRequired, healthDrain: CFG.enemyHoldDrain }); },
    state() { console.log(State); return State; },
  };

  function rectsOverlap(a,b) { return a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function centerX(r) { return r.x + r.w / 2; }
  function distance(x1,y1,x2,y2) { return Math.hypot(x1-x2,y1-y2); }
  function clamp(v,min,max) { return Math.max(min, Math.min(max, v)); }
  function randomRange(min,max) { return min + Math.random() * (max-min); }
  function nearest(list, hitbox, origin) { let best=null, bestD=Infinity; for(const item of list){ if(!rectsOverlap(hitbox,item))continue; const d=Math.abs(centerX(origin)-centerX(item)); if(d<bestD){best=item;bestD=d;} } return best; }

  document.addEventListener("DOMContentLoaded", () => Game.init());
})();
