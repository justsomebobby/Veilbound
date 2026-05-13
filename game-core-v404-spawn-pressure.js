(() => {
  "use strict";

  const BUILD = "v4.0.4-spawn-pressure-proto";
  const CFG = {
    dashCost: 8,
    worldW: 1800,
    gateX: 1690,
    groundY: 430,
    gravity: 1500,
    walkSpeed: 230,
    dashSpeed: 360,
    jumpSpeed: -620,
    levelReach: 54,
    bossReach: 62,
    trapFirstLayerDelay: 3.0,
    trapLayerInterval: 2.0,
    trapEscapeRequired: 5,
    trapLoopEscapeRequired: 9,
    trapLoopHealthDrain: 5,
    postEscapeGrace: 1.2,
    spawnEnabled: true,
    spawnStartX: 360,
    spawnStopBeforeGate: 260,
    spawnIntervalMin: 3.2,
    spawnIntervalMax: 5.5,
    spawnActiveCap: 5,
    spawnAheadMin: 520,
    spawnAheadMax: 820,
  };

  const C = {
    sky1: "#171332",
    sky2: "#0f172a",
    treeBack: "#1e1b4b",
    treeMid: "#312e81",
    treeNear: "#111827",
    ground: "#2b1f24",
    groundTop: "#4b2e28",
    skin: "#f1bda3",
    hair: "#f472b6",
    hairDark: "#be185d",
    outfit: "#f9a8d4",
    outfitDark: "#831843",
    cape: "#111827",
    boot: "#0f172a",
    trim: "#fbbf24",
    magic: "#c084fc",
    slime: "#34d399",
    slimeDark: "#065f46",
    boss: "#7c3aed",
    bossDark: "#312e81",
    goblin: "#84cc16",
    goblinDark: "#365314",
    bat: "#7c2d12",
    danger: "#fb7185",
    white: "#e5e7eb",
  };

  const dom = {};
  const state = {
    screen: "menu",
    levelRun: false,
    bossRun: false,
    levelLast: 0,
    bossLast: 0,
    cam: 0,
    p: null,
    bp: null,
    boss: null,
    enemies: [],
    traps: [],
    pickups: [],
    encounter: null,
    levelInput: { left: false, right: false },
    bossInput: { left: false, right: false },
    levelAtkLock: false,
    bossAtkLock: false,
    spawnTimer: 0,
    spawnCount: 0,
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheDom();
    dom.levelCtx = dom.levelCanvas.getContext("2d");
    dom.bossCtx = dom.bossCanvas.getContext("2d");
    document.querySelectorAll("[data-build-tag]").forEach((tag) => {
      tag.textContent = BUILD;
    });
    wireNavigation();
    wireControls();
    preventBrowserGestures();
    restartLevel();
    showScreen("menu");
  }

  function cacheDom() {
    [
      "safeHub", "menu", "hub", "customize", "gallery", "game", "boss", "result",
      "hubText", "resultText", "resultStats", "levelCanvas", "bossCanvas",
      "armorDots", "levelHealth", "levelHealthFill", "levelEnergy", "levelMessage",
      "levelLeft", "levelRight", "levelJump", "levelAttack", "levelDash", "levelRestart",
      "bossArmorDots", "bossPlayerHealth", "bossPlayerHealthFill", "bossEnergy", "bossHitsLeft",
      "bossHealthFill", "bossMessage", "bossLeft", "bossRight", "bossJump", "bossAttack",
      "bossDash", "bossRestart",
    ].forEach((id) => {
      dom[id] = document.getElementById(id);
    });
  }

  function wireNavigation() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      const go = target && target.dataset ? target.dataset.go : null;
      if (go) showScreen(go);
    });
    dom.safeHub.addEventListener("click", () => showScreen("hub"));
    dom.levelRestart.addEventListener("click", restartLevel);
    dom.bossRestart.addEventListener("click", startBoss);
  }

  function wireControls() {
    bindHold(dom.levelLeft, () => levelHold("left", true), () => levelHold("left", false));
    bindHold(dom.levelRight, () => levelHold("right", true), () => levelHold("right", false));
    bindPress(dom.levelJump, () => levelAction("jump"));
    bindPress(dom.levelAttack, () => levelAction("attack"));
    bindPress(dom.levelDash, () => levelAction("dash"));

    bindHold(dom.bossLeft, () => { state.bossInput.left = true; }, () => { state.bossInput.left = false; });
    bindHold(dom.bossRight, () => { state.bossInput.right = true; }, () => { state.bossInput.right = false; });
    bindPress(dom.bossJump, () => jump(state.bp));
    bindPress(dom.bossAttack, bossAttack);
    bindPress(dom.bossDash, () => dash(state.bp, setBossMessage, updateBossHud));
  }

  function bindPress(button, callback) {
    let active = false;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (active) return;
      active = true;
      callback();
      button.blur();
    });
    const release = (event) => {
      event.preventDefault();
      active = false;
      button.blur();
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  }

  function bindHold(button, down, up) {
    let active = false;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (active) return;
      active = true;
      down();
      button.blur();
    });
    const release = (event) => {
      event.preventDefault();
      if (!active) return;
      active = false;
      up();
      button.blur();
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  }

  function preventBrowserGestures() {
    document.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
    ["contextmenu", "selectstart", "dragstart", "gesturestart"].forEach((type) => {
      document.addEventListener(type, (event) => event.preventDefault());
    });
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("is-active"));
    const screen = dom[id] || dom.hub;
    screen.classList.add("is-active");
    state.screen = id;
    state.levelRun = false;
    state.bossRun = false;
    state.levelInput.left = false;
    state.levelInput.right = false;
    state.bossInput.left = false;
    state.bossInput.right = false;
    if (id === "game") startLevel();
    if (id === "boss") startBoss();
    window.scrollTo(0, 0);
  }

  function makePlayer(overrides = {}) {
    return {
      x: 70,
      y: 360,
      w: 34,
      h: 66,
      vx: 0,
      vy: 0,
      face: 1,
      onGround: false,
      armor: 3,
      health: 100,
      energy: 0,
      attackFlash: 0,
      invulnerable: 0,
      dashing: 0,
      intangible: 0,
      gateReached: false,
      ...overrides,
    };
  }

  function makeEnemy(kind, x, y, w, h, hp, options = {}) {
    return {
      kind,
      x,
      y,
      w,
      h,
      hp,
      maxHp: hp,
      dir: options.dir || -1,
      flying: !!options.flying,
      jumpy: !!options.jumpy,
      spawned: !!options.spawned,
      homeX: options.homeX ?? x,
      patrolMin: options.patrolMin,
      patrolMax: options.patrolMax,
      t: 0,
    };
  }

  function makeTrap(x, y) {
    return { x, y, w: 92, h: 25, active: false, used: false, t: 0 };
  }

  function restartLevel() {
    state.levelAtkLock = false;
    state.encounter = null;
    state.cam = 0;
    state.spawnTimer = 2.8;
    state.spawnCount = 0;
    state.p = makePlayer();
    state.enemies = [
      makeEnemy("slime", 500, 396, 38, 34, 1, { jumpy: true }),
      makeEnemy("goblin", 930, 382, 50, 48, 2),
      makeEnemy("bat", 1240, 250, 46, 34, 2, { flying: true }),
    ];
    state.traps = [makeTrap(690, 405), makeTrap(1120, 405)];
    state.pickups = [
      { x: 720, y: 330, collected: false },
      { x: 1420, y: 320, collected: false },
    ];
    setLevelMessage("Spawn pressure build: advance toward the gate");
    updateLevelHud();
    drawLevel(0);
  }

  function startLevel() {
    restartLevel();
    state.levelRun = true;
    state.levelLast = performance.now();
    requestAnimationFrame(levelLoop);
  }

  function startBoss() {
    const source = state.p || makePlayer({ energy: 20 });
    state.bossAtkLock = false;
    state.bp = makePlayer({ x: 110, armor: source.armor, health: source.health, energy: Math.max(20, source.energy) });
    state.boss = {
      x: 670,
      y: 326,
      w: 120,
      h: 104,
      hp: 100,
      maxHp: 100,
      hitFlash: 0,
      cooldown: 0.65,
      windup: 0,
      telegraph: 0,
      telegraphType: "",
      lastAttackType: "glob",
      projectiles: [],
    };
    setBossMessage(`Build ${BUILD}`);
    updateBossHud();
    drawBoss(0);
    state.bossRun = true;
    state.bossLast = performance.now();
    requestAnimationFrame(bossLoop);
  }

  function setLevelMessage(text) { dom.levelMessage.textContent = text; }
  function setBossMessage(text) { dom.bossMessage.textContent = text; }

  function armorDots(count) {
    return [1, 2, 3].map((i) => `<i class="dot ${i <= count ? "" : "is-empty"}"></i>`).join("");
  }

  function updateLevelHud() {
    const p = state.p;
    dom.armorDots.innerHTML = armorDots(p.armor);
    dom.levelHealth.textContent = Math.max(0, Math.ceil(p.health));
    dom.levelHealthFill.style.width = `${clamp(p.health, 0, 100)}%`;
    dom.levelEnergy.textContent = Math.floor(p.energy);
    updateDashButton(dom.levelDash, p.energy);
  }

  function updateBossHud() {
    const p = state.bp;
    const b = state.boss;
    dom.bossArmorDots.innerHTML = armorDots(p.armor);
    dom.bossPlayerHealth.textContent = Math.max(0, Math.ceil(p.health));
    dom.bossPlayerHealthFill.style.width = `${clamp(p.health, 0, 100)}%`;
    dom.bossEnergy.textContent = Math.floor(p.energy);
    dom.bossHitsLeft.textContent = Math.max(0, Math.ceil(b.hp / 10));
    dom.bossHealthFill.style.width = `${clamp(b.hp, 0, 100)}%`;
    updateDashButton(dom.bossDash, p.energy);
  }

  function updateDashButton(button, energy) {
    button.classList.toggle("is-locked", energy < CFG.dashCost);
    button.disabled = false;
  }

  function levelHold(direction, value) {
    if (state.encounter && value) {
      struggle();
      return;
    }
    state.levelInput[direction] = value;
  }

  function levelAction(action) {
    if (state.encounter) {
      struggle();
      return;
    }
    if (action === "jump") jump(state.p);
    if (action === "attack") levelAttack();
    if (action === "dash") dash(state.p, setLevelMessage, updateLevelHud);
  }

  function jump(p) {
    if (!p || !p.onGround) return;
    p.vy = CFG.jumpSpeed;
    p.onGround = false;
  }

  function dash(p, messageSetter, hudUpdater) {
    if (!p || p.energy < CFG.dashCost) return;
    p.energy -= CFG.dashCost;
    p.dashing = 0.42;
    p.invulnerable = 0.8;
    p.intangible = 0.95;
    p.vx = CFG.dashSpeed * p.face;
    messageSetter("Intangible");
    hudUpdater();
  }

  function levelAttack() {
    const p = state.p;
    if (!p || state.levelAtkLock) return;
    state.levelAtkLock = true;
    setTimeout(() => { state.levelAtkLock = false; }, 120);
    p.attackFlash = 0.14;
    p.energy = Math.min(100, p.energy + 4);
    const target = nearestEnemy(attackBox(p, CFG.levelReach), state.enemies, p);
    if (target) {
      target.hp -= 1;
      p.energy = Math.min(100, p.energy + 16);
      setLevelMessage(target.hp <= 0 ? "Enemy down" : `${target.kind} HP ${target.hp}/${target.maxHp}`);
    } else {
      setLevelMessage("Miss");
    }
    updateLevelHud();
  }

  function bossAttack() {
    const p = state.bp;
    const b = state.boss;
    if (!p || !b || state.bossAtkLock || b.hp <= 0) return;
    state.bossAtkLock = true;
    setTimeout(() => { state.bossAtkLock = false; }, 150);
    p.attackFlash = 0.14;
    p.energy = Math.min(100, p.energy + 4);
    if (rectsOverlap(attackBox(p, CFG.bossReach), b)) {
      b.hp -= 10;
      b.hitFlash = 0.18;
      p.energy = Math.min(100, p.energy + 14);
      setBossMessage(b.hp > 0 ? `King Slime: ${Math.ceil(b.hp / 10)} hits left` : "King Slime defeated");
      updateBossHud();
      if (b.hp <= 0) finishBoss();
    } else {
      setBossMessage("Miss");
      updateBossHud();
    }
  }

  function finishBoss() {
    const p = state.bp;
    state.boss.hp = 0;
    state.bossRun = false;
    updateBossHud();
    setBossMessage("King Slime defeated");
    dom.hubText.textContent = "Level 1 clear: King Slime defeated.";
    dom.resultText.textContent = "King Slime defeated. Forest route cleared.";
    dom.resultStats.textContent = `Remaining health: ${Math.max(0, Math.ceil(p.health))} | Armor layers: ${p.armor} | Energy: ${Math.floor(p.energy)}`;
    setTimeout(() => showScreen("result"), 800);
  }

  function attackBox(actor, reach) {
    return {
      x: actor.face > 0 ? actor.x + actor.w : actor.x - reach,
      y: actor.y + 10,
      w: reach,
      h: 38,
    };
  }

  function nearestEnemy(hitbox, enemies, p) {
    let best = null;
    let bestDist = Infinity;
    enemies.forEach((enemy) => {
      if (enemy.hp <= 0 || !rectsOverlap(hitbox, enemy)) return;
      const distX = Math.abs(centerX(p) - centerX(enemy));
      if (distX < bestDist) {
        bestDist = distX;
        best = enemy;
      }
    });
    return best;
  }

  function canHazardHit(actor) {
    return actor && actor.invulnerable <= 0 && actor.dashing <= 0 && actor.intangible <= 0 && !state.encounter;
  }

  function canBossHazardHit(actor) {
    return actor && actor.invulnerable <= 0 && actor.dashing <= 0 && actor.intangible <= 0;
  }

  function hurtLevelPlayer(ignoreArmor) {
    const p = state.p;
    if (!canHazardHit(p)) return;
    p.invulnerable = 1;
    p.energy = Math.min(100, p.energy + 12);
    if (p.armor > 0 && !ignoreArmor) {
      p.armor -= 1;
      setLevelMessage("Armor layer hit");
    } else {
      p.health -= 25;
      setLevelMessage("Health damage");
    }
    updateLevelHud();
    if (p.health <= 0) setTimeout(restartLevel, 700);
  }

  function hurtBossPlayer(ignoreArmor) {
    const p = state.bp;
    if (!canBossHazardHit(p)) return;
    p.invulnerable = 1;
    p.energy = Math.min(100, p.energy + 12);
    if (p.armor > 0 && !ignoreArmor) {
      p.armor -= 1;
      setBossMessage("Armor layer hit");
    } else {
      p.health -= 18;
      setBossMessage("Health damage");
    }
    updateBossHud();
    if (p.health <= 0) setTimeout(startBoss, 700);
  }

  function updateActor(actor, input, dt, maxX) {
    actor.attackFlash = Math.max(0, actor.attackFlash - dt);
    actor.invulnerable = Math.max(0, actor.invulnerable - dt);
    actor.dashing = Math.max(0, actor.dashing - dt);
    actor.intangible = Math.max(0, actor.intangible - dt);
    const axis = Number(input.right) - Number(input.left);
    if (axis) {
      actor.face = axis;
      actor.vx = axis * (actor.dashing > 0 ? CFG.dashSpeed : CFG.walkSpeed);
    } else if (actor.dashing <= 0) {
      actor.vx *= 0.82;
    }
    actor.vy += CFG.gravity * dt;
    actor.x += actor.vx * dt;
    actor.y += actor.vy * dt;
    if (actor.y + actor.h >= CFG.groundY) {
      actor.y = CFG.groundY - actor.h;
      actor.vy = 0;
      actor.onGround = true;
    } else {
      actor.onGround = false;
    }
    actor.x = clamp(actor.x, 20, maxX);
  }

  function updateLevel(dt) {
    const p = state.p;
    if (state.encounter) {
      updateEncounter(dt);
      state.cam = clamp(p.x - 330, 0, CFG.worldW - 960);
      return;
    }
    updateActor(p, state.levelInput, dt, CFG.worldW - 80);
    state.cam = clamp(p.x - 330, 0, CFG.worldW - 960);
    state.traps.forEach((trap) => {
      trap.t += dt;
      if (!trap.used && rectsOverlap(p, trap) && canHazardHit(p)) startTrapEncounter(trap);
    });
    state.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      updateEnemy(enemy, dt);
      if (rectsOverlap(p, enemy)) hurtLevelPlayer(enemy.flying);
    });
    state.pickups.forEach((pickup) => {
      if (pickup.collected) return;
      if (distance(p.x + 17, p.y + 33, pickup.x, pickup.y) < 42) {
        pickup.collected = true;
        p.energy = Math.min(100, p.energy + 25);
        setLevelMessage("Pickup");
        updateLevelHud();
      }
    });
    updateSpawnDirector(dt);
    if (p.x > CFG.gateX && !p.gateReached) {
      p.gateReached = true;
      setLevelMessage("Boss gate reached");
      setTimeout(() => showScreen("boss"), 450);
    }
  }

  function updateSpawnDirector(dt) {
    const p = state.p;
    if (!CFG.spawnEnabled || !p || state.encounter) return;
    if (p.x < CFG.spawnStartX) return;
    if (p.x > CFG.gateX - CFG.spawnStopBeforeGate) return;
    const active = state.enemies.filter((enemy) => enemy.hp > 0).length;
    if (active >= CFG.spawnActiveCap) return;
    state.spawnTimer -= dt;
    if (state.spawnTimer > 0) return;
    spawnEnemyAhead();
    state.spawnTimer = randomRange(CFG.spawnIntervalMin, CFG.spawnIntervalMax);
  }

  function spawnEnemyAhead() {
    const p = state.p;
    const spawnX = clamp(
      p.x + randomRange(CFG.spawnAheadMin, CFG.spawnAheadMax),
      p.x + 280,
      CFG.gateX - 180
    );
    const roll = Math.random();
    let enemy;
    const patrolMin = Math.max(260, spawnX - 170);
    const patrolMax = Math.min(CFG.gateX - 120, spawnX + 160);
    if (roll < 0.45) {
      enemy = makeEnemy("slime", spawnX, 396, 38, 34, 1, { jumpy: true, spawned: true, homeX: spawnX, patrolMin, patrolMax });
    } else if (roll < 0.78) {
      enemy = makeEnemy("goblin", spawnX, 382, 50, 48, 2, { spawned: true, homeX: spawnX, patrolMin, patrolMax });
    } else {
      enemy = makeEnemy("bat", spawnX, 250, 46, 34, 2, { flying: true, spawned: true, homeX: spawnX, patrolMin, patrolMax });
    }
    state.spawnCount += 1;
    state.enemies.push(enemy);
    setLevelMessage(`Enemy pressure ${state.spawnCount}`);
  }

  function updateEnemy(enemy, dt) {
    enemy.t += dt;
    if (enemy.flying) {
      const minX = enemy.patrolMin ?? 1150;
      const maxX = enemy.patrolMax ?? 1440;
      enemy.x += enemy.dir * 82 * dt;
      enemy.y = 245 + Math.sin(enemy.t * 3) * 38;
      if (enemy.x < minX || enemy.x > maxX) enemy.dir *= -1;
      return;
    }
    if (enemy.jumpy) {
      const minX = enemy.patrolMin ?? 390;
      const maxX = enemy.patrolMax ?? 760;
      enemy.x += enemy.dir * 58 * dt;
      enemy.y = CFG.groundY - enemy.h - Math.abs(Math.sin(enemy.t * 4.8)) * 42;
      if (enemy.x < minX || enemy.x > maxX) enemy.dir *= -1;
      return;
    }
    const minX = enemy.patrolMin ?? 840;
    const maxX = enemy.patrolMax ?? 1080;
    enemy.x += enemy.dir * 65 * dt;
    if (enemy.x < minX || enemy.x > maxX) enemy.dir *= -1;
    enemy.y = CFG.groundY - enemy.h;
  }

  function startTrapEncounter(trap) {
    const p = state.p;
    trap.active = true;
    p.vx = 0;
    p.vy = 0;
    p.dashing = 0;
    p.intangible = 0;
    p.invulnerable = 0;
    p.x = clamp(trap.x + trap.w / 2 - p.w / 2, 20, CFG.worldW - 80);
    p.y = CFG.groundY - p.h;
    state.levelInput.left = false;
    state.levelInput.right = false;
    state.encounter = {
      phase: "escape",
      source: trap,
      progress: 0,
      required: CFG.trapEscapeRequired,
      layerTimer: CFG.trapFirstLayerDelay,
      layerInterval: CFG.trapLayerInterval,
      healthDrain: CFG.trapLoopHealthDrain,
    };
    setLevelMessage("Snared! Tap Jump / Atk / Dash to escape");
    updateLevelHud();
  }

  function struggle() {
    const e = state.encounter;
    if (!e || e.phase === "failed") return;
    e.progress = Math.min(e.required, e.progress + 1);
    if (e.phase === "escape") {
      setLevelMessage(`Escaping trap: ${e.progress}/${e.required}`);
    } else if (e.phase === "captureLoop") {
      setLevelMessage(`Breaking trap hold: ${e.progress}/${e.required}`);
    }
    if (e.progress >= e.required) escapeEncounter();
  }

  function updateEncounter(dt) {
    const e = state.encounter;
    const p = state.p;
    if (!e) return;
    p.vx = 0;
    p.vy = 0;
    p.dashing = 0;
    p.intangible = 0;
    p.invulnerable = 0;
    p.y = CFG.groundY - p.h;
    if (e.phase === "escape") {
      e.layerTimer -= dt;
      if (e.layerTimer <= 0) {
        if (p.armor > 0) {
          p.armor -= 1;
          updateLevelHud();
          setLevelMessage(p.armor > 0 ? "Trap removed one layer — keep tapping" : "Late hold triggered — still mash to break out");
        }
        if (p.armor <= 0) {
          e.phase = "captureLoop";
          e.progress = 0;
          e.required = CFG.trapLoopEscapeRequired;
          setLevelMessage("Late hold placeholder — mash to break out");
          updateLevelHud();
          return;
        }
        e.layerTimer += e.layerInterval;
      }
    }
    if (e.phase === "captureLoop") {
      p.health = Math.max(0, p.health - e.healthDrain * dt);
      updateLevelHud();
      if (p.health <= 0) {
        e.phase = "failed";
        setLevelMessage("Failure loop - Restart or Hub");
      }
    }
  }

  function escapeEncounter() {
    const e = state.encounter;
    if (!e) return;
    const p = state.p;
    const trap = e.source;
    trap.used = true;
    trap.active = false;
    state.encounter = null;
    p.invulnerable = CFG.postEscapeGrace;
    p.intangible = CFG.postEscapeGrace;
    p.dashing = 0;
    p.vx = 0;
    p.vy = 0;
    p.y = CFG.groundY - p.h;
    p.x = clamp(trap.x + trap.w + 30, 20, CFG.worldW - 80);
    p.energy = Math.min(100, p.energy + 10);
    setLevelMessage("Escaped — trap disabled");
    updateLevelHud();
  }

  function updateBoss(dt) {
    const p = state.bp;
    const b = state.boss;
    updateActor(p, state.bossInput, dt, 820);
    b.hitFlash = Math.max(0, b.hitFlash - dt);
    b.cooldown -= dt;
    b.windup = Math.max(0, b.windup - dt);
    if (b.telegraph > 0) {
      b.telegraph -= dt;
      if (b.telegraph <= 0) releaseBossAttack();
    }
    b.x += Math.sign(centerX(p) - centerX(b)) * 36 * dt;
    b.x = clamp(b.x, 520, 820);
    if (b.cooldown <= 0 && b.telegraph <= 0 && b.windup <= 0) {
      b.cooldown = 1.05;
      beginBossAttack();
    }
    if (b.windup > 0 && canBossHazardHit(p) && rectsOverlap(p, bossSlamZone())) hurtBossPlayer(false);
    b.projectiles.forEach((projectile) => updateProjectile(projectile, p, dt));
    b.projectiles = b.projectiles.filter((projectile) => projectile.life > 0 && projectile.x > -80 && projectile.x < 1040);
    if (canBossHazardHit(p) && rectsOverlap(p, b)) hurtBossPlayer(false);
  }

  function beginBossAttack() {
    const p = state.bp;
    const b = state.boss;
    const glob = Math.abs(centerX(p) - centerX(b)) > 215 || b.lastAttackType === "slam";
    b.telegraph = glob ? 0.38 : 0.3;
    b.telegraphType = glob ? "glob" : "slam";
    b.lastAttackType = b.telegraphType;
    setBossMessage(glob ? "King Slime forms a glob" : "King Slime swells up");
  }

  function releaseBossAttack() {
    const p = state.bp;
    const b = state.boss;
    if (b.telegraphType === "slam") b.windup = 0.22;
    if (b.telegraphType === "glob") {
      const dir = centerX(p) < centerX(b) ? -1 : 1;
      b.projectiles.push({ x: b.x + b.w / 2, y: b.y + 50, w: 28, h: 28, vx: dir * 290, life: 2.8, ignoreUntilClear: false });
    }
    b.telegraphType = "";
  }

  function updateProjectile(projectile, p, dt) {
    projectile.x += projectile.vx * dt;
    projectile.life -= dt;
    const touching = rectsOverlap(p, projectile);
    if (!touching) {
      projectile.ignoreUntilClear = false;
      return;
    }
    if (!canBossHazardHit(p)) {
      projectile.ignoreUntilClear = true;
      return;
    }
    if (projectile.ignoreUntilClear) return;
    projectile.life = 0;
    hurtBossPlayer(false);
  }

  function bossSlamZone() {
    const b = state.boss;
    return { x: b.x - 74, y: b.y + 18, w: b.w + 148, h: 82 };
  }

  function levelLoop(now) {
    if (!state.levelRun) return;
    const dt = Math.min(0.033, (now - state.levelLast) / 1000);
    state.levelLast = now;
    updateLevel(dt);
    drawLevel(now / 1000);
    requestAnimationFrame(levelLoop);
  }

  function bossLoop(now) {
    if (!state.bossRun) return;
    const dt = Math.min(0.033, (now - state.bossLast) / 1000);
    state.bossLast = now;
    updateBoss(dt);
    drawBoss(now / 1000);
    requestAnimationFrame(bossLoop);
  }

  function drawLevel(time) {
    const ctx = dom.levelCtx;
    const cam = state.cam;
    clearArena(ctx);
    drawForest(ctx, cam, time);
    drawGround(ctx, -cam, CFG.worldW);
    drawTraps(ctx, cam, time);
    drawGate(ctx, cam, time);
    drawPickups(ctx, cam, time);
    drawEnemies(ctx, cam, time);
    drawAttackFlash(ctx, state.p, CFG.levelReach, cam);
    drawWitch(ctx, state.p, cam, time);
    drawTrapWrap(ctx, state.p, cam, time);
    drawHitbox(ctx, state.p, cam);
    drawEncounterOverlay(ctx);
  }

  function drawBoss(time) {
    const ctx = dom.bossCtx;
    const b = state.boss;
    clearArena(ctx);
    drawForest(ctx, 0, time);
    drawGround(ctx, 0, 960);
    if (b.telegraph > 0 && b.telegraphType === "slam") drawSlamWarning(ctx, bossSlamZone(), time);
    if (b.windup > 0) drawSlamActive(ctx, bossSlamZone(), time);
    if (b.telegraph > 0 && b.telegraphType === "glob") drawGlobCharge(ctx, b, time);
    b.projectiles.forEach((projectile) => drawProjectile(ctx, projectile, time));
    drawKingSlime(ctx, b, time);
    drawAttackFlash(ctx, state.bp, CFG.bossReach, 0);
    drawWitch(ctx, state.bp, 0, time);
    drawHitbox(ctx, state.bp, 0);
    ctx.fillStyle = C.white;
    ctx.font = "16px system-ui";
    ctx.fillText(`King Slime hits left: ${Math.max(0, Math.ceil(b.hp / 10))}`, 20, 34);
  }

  function clearArena(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 430);
    gradient.addColorStop(0, C.sky1);
    gradient.addColorStop(1, C.sky2);
    ctx.clearRect(0, 0, 960, 540);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 960, 540);
  }

  function drawForest(ctx, cam, time) {
    drawTreeLayer(ctx, cam * 0.16, 72, C.treeBack, 0.8);
    drawTreeLayer(ctx, cam * 0.32, 132, C.treeMid, 0.58);
    drawTreeLayer(ctx, cam * 0.52, 196, C.treeNear, 0.74);
    ctx.fillStyle = "rgba(251,191,36,.18)";
    for (let i = 0; i < 12; i += 1) {
      const x = ((i * 93 - cam * 0.22 + Math.sin(time + i) * 8) % 1040) - 40;
      const y = 120 + ((i * 41) % 210);
      ctx.fillRect(x, y, 3, 3);
    }
  }

  function drawTreeLayer(ctx, cam, baseY, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    for (let x = -120; x < 1100; x += 96) {
      const dx = x - (cam % 96);
      const h = 210 + ((x * 7) % 70);
      ctx.fillRect(dx + 38, baseY + 160 - h, 20, h);
      ctx.beginPath();
      ctx.moveTo(dx - 12, baseY + 160 - h + 65);
      ctx.lineTo(dx + 48, baseY + 160 - h - 30);
      ctx.lineTo(dx + 110, baseY + 160 - h + 65);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGround(ctx, offsetX, width) {
    ctx.fillStyle = C.ground;
    ctx.fillRect(offsetX, CFG.groundY, width, 110);
    ctx.fillStyle = C.groundTop;
    ctx.fillRect(offsetX, CFG.groundY, width, 10);
    ctx.fillStyle = "rgba(34,197,94,.18)";
    for (let x = 0; x < width; x += 50) ctx.fillRect(offsetX + x, CFG.groundY - 2, 26, 3);
  }

  function drawTraps(ctx, cam, time) {
    state.traps.forEach((trap) => {
      const x = trap.x - cam;
      ctx.save();
      ctx.globalAlpha = trap.used ? 0.22 : 1;
      ctx.fillStyle = trap.active ? "rgba(244,114,182,.45)" : "rgba(52,211,153,.28)";
      ctx.beginPath();
      ctx.ellipse(x + trap.w / 2, trap.y + trap.h / 2, trap.w / 2, trap.h / 2 + Math.sin(time * 5 + trap.x) * 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = trap.used ? "rgba(148,163,184,.55)" : "rgba(209,250,229,.65)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x + 12 + i * 20, trap.y + 18);
        ctx.quadraticCurveTo(x + 8 + i * 24, trap.y - 12 - Math.sin(time * 6 + i) * 8, x + 22 + i * 20, trap.y + 8);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawGate(ctx, cam, time) {
    const x = CFG.gateX - cam;
    ctx.save();
    ctx.translate(x + 24, 378);
    ctx.fillStyle = "rgba(192,132,252,.15)";
    ctx.beginPath();
    ctx.ellipse(0, 4, 48 + Math.sin(time * 4) * 3, 78, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6b21a8";
    ctx.fillRect(-22, -50, 44, 100);
    ctx.fillStyle = "#f9a8d4";
    ctx.fillRect(-13, -39, 26, 78);
    ctx.restore();
  }

  function drawPickups(ctx, cam, time) {
    state.pickups.forEach((pickup) => {
      if (pickup.collected) return;
      ctx.save();
      ctx.translate(pickup.x - cam, pickup.y + Math.sin(time * 5) * 4);
      ctx.fillStyle = "rgba(192,132,252,.20)";
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.magic;
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(13, 0);
      ctx.lineTo(0, 16);
      ctx.lineTo(-13, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  function drawEnemies(ctx, cam, time) {
    state.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      if (enemy.kind === "slime") drawSlime(ctx, enemy, cam);
      if (enemy.kind === "goblin") drawGoblin(ctx, enemy, cam, time);
      if (enemy.kind === "bat") drawBat(ctx, enemy, cam, time);
      ctx.fillStyle = "#fff";
      ctx.font = "12px system-ui";
      ctx.fillText(String(enemy.hp), enemy.x - cam + enemy.w / 2 - 3, enemy.y - 7);
    });
  }

  function drawSlime(ctx, enemy, cam) {
    const x = enemy.x - cam + enemy.w / 2;
    const y = enemy.y + enemy.h;
    const squash = 1 + Math.abs(Math.sin(enemy.t * 4.8)) * 0.18;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.12 / squash, squash);
    ctx.fillStyle = C.slimeDark;
    ctx.beginPath();
    ctx.ellipse(0, -16, 21, 18, 0, Math.PI, 0);
    ctx.lineTo(21, 0);
    ctx.quadraticCurveTo(0, 12, -21, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.slime;
    ctx.beginPath();
    ctx.ellipse(0, -17, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d1fae5";
    ctx.fillRect(-7, -20, 4, 4);
    ctx.fillRect(5, -20, 4, 4);
    ctx.restore();
  }

  function drawGoblin(ctx, enemy, cam, time) {
    const x = enemy.x - cam + enemy.w / 2;
    const y = enemy.y + enemy.h;
    const stride = Math.sin(time * 10) * 4;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(enemy.dir > 0 ? 1 : -1, 1);
    ctx.fillStyle = C.goblinDark;
    ctx.fillRect(-12, -28, 8, 28 + stride);
    ctx.fillRect(5, -28, 8, 28 - stride);
    ctx.fillStyle = C.goblin;
    ctx.fillRect(-18, -58, 36, 32);
    ctx.fillStyle = "#a3e635";
    ctx.beginPath();
    ctx.ellipse(0, -70, 17, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(4, -73, 4, 4);
    ctx.fillStyle = "#78350f";
    ctx.fillRect(14, -44, 28, 8);
    ctx.restore();
  }

  function drawBat(ctx, enemy, cam, time) {
    const x = enemy.x - cam + enemy.w / 2;
    const y = enemy.y + enemy.h / 2;
    const flap = Math.sin(time * 15) * 13;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(enemy.dir > 0 ? 1 : -1, 1);
    ctx.fillStyle = "rgba(124,45,18,.6)";
    ctx.beginPath();
    ctx.moveTo(-8, 1);
    ctx.quadraticCurveTo(-42, -24 - flap, -38, 20);
    ctx.lineTo(-9, 13);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, 1);
    ctx.quadraticCurveTo(42, -24 + flap, 38, 20);
    ctx.lineTo(9, 13);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.bat;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.white;
    ctx.fillRect(-5, -3, 4, 4);
    ctx.fillRect(4, -3, 4, 4);
    ctx.restore();
  }

  function drawAttackFlash(ctx, actor, reach, cam) {
    if (!actor || actor.attackFlash <= 0) return;
    const box = attackBox(actor, reach);
    ctx.save();
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = C.trim;
    ctx.beginPath();
    ctx.ellipse(box.x - cam + reach / 2, box.y + 18, reach * 0.58, 26, actor.face > 0 ? -0.25 : 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawWitch(ctx, p, cam, time) {
    if (!p) return;
    const cx = p.x - cam + p.w / 2;
    const footY = p.y + p.h;
    const flicker = (p.invulnerable > 0 || p.dashing > 0 || p.intangible > 0) && Math.floor(Date.now() / 70) % 2;
    const bob = p.onGround ? Math.sin(time * 10) * Math.min(1, Math.abs(p.vx) / CFG.walkSpeed) * 2 : -2;
    ctx.save();
    ctx.translate(cx, footY + bob);
    ctx.scale(p.face, 1);
    if (p.dashing > 0) {
      ctx.fillStyle = "rgba(244,114,182,.18)";
      for (let i = 1; i <= 3; i += 1) ctx.fillRect(-21 - i * 13, -70 + i * 5, 22, 55 - i * 7);
    }
    ctx.globalAlpha = flicker ? 0.62 : 1;
    drawCape(ctx, p, time);
    drawLegs(ctx, p, time);
    drawBody(ctx, p);
    drawArms(ctx, p);
    drawHead(ctx, time);
    drawHat(ctx, time);
    ctx.restore();
  }

  function drawCape(ctx, p, time) {
    const flutter = Math.sin(time * 6) * 3;
    ctx.fillStyle = C.cape;
    ctx.beginPath();
    ctx.moveTo(-18, -58);
    ctx.quadraticCurveTo(-31, -38, -24, -12 + flutter);
    ctx.lineTo(18, -14);
    ctx.lineTo(16, -58);
    ctx.closePath();
    ctx.fill();
    if (p.armor >= 2) {
      ctx.fillStyle = C.hair;
      ctx.beginPath();
      ctx.moveTo(-14, -55);
      ctx.quadraticCurveTo(-23, -36, -19, -18 + flutter);
      ctx.lineTo(10, -17);
      ctx.lineTo(9, -55);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawLegs(ctx, p, time) {
    const stride = p.onGround ? Math.sin(time * 12) * Math.min(1, Math.abs(p.vx) / CFG.walkSpeed) * 5 : 2;
    ctx.fillStyle = C.skin;
    ctx.fillRect(-11, -31, 8, 20 + stride);
    ctx.fillRect(4, -31, 8, 20 - stride);
    ctx.fillStyle = C.boot;
    ctx.fillRect(-13, -15 + stride, 11, 17);
    ctx.fillRect(3, -15 - stride, 11, 17);
  }

  function drawBody(ctx, p) {
    ctx.fillStyle = p.armor > 0 ? C.outfit : "#d8b4fe";
    ctx.beginPath();
    ctx.moveTo(-14, -61);
    ctx.lineTo(14, -61);
    ctx.lineTo(18, -28);
    ctx.lineTo(8, -22);
    ctx.lineTo(-8, -22);
    ctx.lineTo(-18, -28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.outfitDark;
    ctx.fillRect(-14, -45, 28, 7);
    if (p.armor >= 3) {
      ctx.fillStyle = C.trim;
      ctx.fillRect(-15, -61, 30, 4);
      ctx.fillRect(-2, -58, 4, 30);
    }
  }

  function drawArms(ctx, p) {
    const lift = p.attackFlash > 0 ? -14 : 0;
    ctx.fillStyle = C.skin;
    ctx.fillRect(-23, -55, 8, 24);
    ctx.fillRect(15, -55 + lift, 8, 24);
    ctx.fillStyle = C.outfitDark;
    ctx.fillRect(18, -35 + lift, 13, 5);
  }

  function drawHead(ctx, time) {
    ctx.fillStyle = C.skin;
    ctx.beginPath();
    ctx.arc(0, -76, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.hair;
    ctx.beginPath();
    ctx.ellipse(-2, -82, 17, 14, -0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.hairDark;
    ctx.beginPath();
    ctx.ellipse(-12, -68 + Math.sin(time * 5) * 1.5, 7, 18, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(4, -78, 3, 3);
  }

  function drawHat(ctx, time) {
    ctx.fillStyle = C.cape;
    ctx.beginPath();
    ctx.ellipse(0, -88, 28, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-14, -89);
    ctx.quadraticCurveTo(-3, -126 + Math.sin(time * 2) * 1.5, 14, -91);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.hair;
    ctx.fillRect(-13, -92, 27, 4);
  }

  function drawTrapWrap(ctx, p, cam, time) {
    const e = state.encounter;
    if (!e || !p || e.phase === "failed") return;
    const x = p.x - cam + p.w / 2;
    const y = p.y + p.h;
    ctx.save();
    ctx.strokeStyle = e.phase === "captureLoop" ? "rgba(244,114,182,.9)" : "rgba(52,211,153,.9)";
    ctx.lineWidth = 5;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x - 36 + i * 18, y + 2);
      ctx.quadraticCurveTo(x - 28 + i * 12, y - 35 - Math.sin(time * 7 + i) * 8, x - 18 + i * 9, y - 18);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawEncounterOverlay(ctx) {
    const e = state.encounter;
    if (!e) return;
    const isLoop = e.phase === "captureLoop";
    const h = isLoop ? 112 : 94;
    ctx.save();
    ctx.fillStyle = "rgba(15,23,42,.72)";
    ctx.fillRect(150, 22, 660, h);
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.strokeRect(150, 22, 660, h);
    ctx.fillStyle = "#fff";
    ctx.font = "18px system-ui";
    if (e.phase === "escape") {
      ctx.fillText("TRAPPED — tap Jump / Atk / Dash to escape", 175, 52);
      drawProgress(ctx, e.progress, e.required, 175, 68);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "14px system-ui";
      ctx.fillText(`Escape ${e.progress}/${e.required}    Next layer: ${Math.max(0, e.layerTimer).toFixed(1)}s`, 175, 105);
    } else if (isLoop) {
      ctx.fillText("LATE HOLD PLACEHOLDER — keep tapping to break out", 175, 52);
      drawProgress(ctx, e.progress, e.required, 175, 68);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "14px system-ui";
      ctx.fillText(`Breakout ${e.progress}/${e.required}    Health drains slowly`, 175, 105);
    } else {
      ctx.fillText("FAILURE LOOP PLACEHOLDER", 175, 52);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "15px system-ui";
      ctx.fillText("Health reached 0. Use Restart or Hub.", 175, 82);
    }
    ctx.restore();
  }

  function drawProgress(ctx, value, max, x, y) {
    ctx.fillStyle = "#374151";
    ctx.fillRect(x, y, 420, 18);
    ctx.fillStyle = C.slime;
    ctx.fillRect(x, y, 420 * (value / max), 18);
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    ctx.strokeRect(x, y, 420, 18);
  }

  function drawKingSlime(ctx, b, time) {
    const hit = b.hitFlash > 0;
    const wobble = Math.sin(time * 5) * 6;
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h);
    const gradient = ctx.createRadialGradient(-20, -64, 16, 0, -42, 96);
    gradient.addColorStop(0, hit ? "#fef3c7" : "#f0abfc");
    gradient.addColorStop(0.4, hit ? "#fbbf24" : C.boss);
    gradient.addColorStop(1, C.bossDark);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(-66, 0);
    ctx.quadraticCurveTo(-70, -64 + wobble, -8, -92);
    ctx.quadraticCurveTo(54, -72 - wobble, 66, 0);
    ctx.quadraticCurveTo(22, 15, -66, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.white;
    ctx.fillRect(-24, -54, 8, 8);
    ctx.fillRect(18, -54, 8, 8);
    ctx.fillStyle = C.trim;
    ctx.beginPath();
    ctx.moveTo(-24, -82);
    ctx.lineTo(-10, -106);
    ctx.lineTo(2, -86);
    ctx.lineTo(18, -108);
    ctx.lineTo(28, -79);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawSlamWarning(ctx, zone, time) {
    ctx.fillStyle = "rgba(251,113,133,.16)";
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    ctx.strokeStyle = "rgba(251,113,133,.65)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(zone.x + zone.w / 2, zone.y + zone.h / 2, zone.w / 2, 24 + Math.sin(time * 18) * 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawSlamActive(ctx, zone, time) {
    ctx.fillStyle = "rgba(251,113,133,.32)";
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.beginPath();
    ctx.ellipse(zone.x + zone.w / 2, zone.y + zone.h / 2, zone.w / 2, 22 + Math.sin(time * 40) * 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGlobCharge(ctx, b, time) {
    const r = 18 + Math.sin(time * 18) * 4;
    ctx.fillStyle = "rgba(192,132,252,.2)";
    ctx.beginPath();
    ctx.arc(b.x + b.w / 2, b.y + 50, r + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(52,211,153,.72)";
    ctx.beginPath();
    ctx.arc(b.x + b.w / 2, b.y + 50, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawProjectile(ctx, projectile, time) {
    ctx.fillStyle = "rgba(52,211,153,.18)";
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.slime;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 12 + Math.sin(time * 12) * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHitbox(ctx, actor, cam) {
    if (!actor) return;
    ctx.save();
    ctx.strokeStyle = "rgba(56,189,248,.18)";
    ctx.lineWidth = 1;
    ctx.strokeRect(actor.x - cam, actor.y, actor.w, actor.h);
    ctx.restore();
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function centerX(rect) { return rect.x + rect.w / 2; }
  function distance(x1, y1, x2, y2) { return Math.hypot(x1 - x2, y1 - y2); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function randomRange(min, max) { return min + Math.random() * (max - min); }
})();